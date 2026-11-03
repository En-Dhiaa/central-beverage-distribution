using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Beverage.Domain.Entities.Finance;
using Beverage.Domain.Enums;
using Beverage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Beverage.Infrastructure.Services;

public class FinanceService : IFinanceService
{
    private readonly BeverageDbContext _context;
    private readonly IInventoryService _inventoryService;

    public FinanceService(BeverageDbContext context, IInventoryService inventoryService)
    {
        _context = context;
        _inventoryService = inventoryService;
    }

    public async Task<List<CashboxDto>> GetCashboxesAsync()
    {
        return await _context.Cashboxes
            .OrderBy(c => c.Name)
            .Select(c => new CashboxDto(
                c.Id,
                c.Name,
                c.CurrentBalance,
                c.IsActive
            ))
            .ToListAsync();
    }

    public async Task<Guid> CreatePaymentVoucherAsync(PaymentVoucherRequest request, Guid userId)
    {
        var cashbox = await _context.Cashboxes.FindAsync(request.CashboxId)
            ?? throw new InvalidOperationException("الصندوق غير موجود.");

        if (request.Amount <= 0)
            throw new InvalidOperationException("مبلغ السند يجب أن يكون أكبر من الصفر.");

        var voucherType = Enum.TryParse<VoucherType>(request.VoucherType, true, out var vt) ? vt : VoucherType.Receipt;
        var partyType = Enum.TryParse<PartyType>(request.PartyType, true, out var pt) ? pt : PartyType.Customer;

        using var dbTransaction = await _context.Database.BeginTransactionAsync();

        var voucherNumber = $"VCH-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var voucher = new PaymentVoucher
        {
            VoucherNumber = voucherNumber,
            VoucherType = voucherType,
            PartyType = partyType,
            PartyId = request.PartyId,
            Amount = request.Amount,
            CashboxId = request.CashboxId,
            PaymentDate = DateTime.UtcNow,
            Description = request.Description,
            Status = DocumentStatus.Approved,
            CreatedBy = userId
        };

        await _context.PaymentVouchers.AddAsync(voucher);

        // 1. Update Cashbox
        if (voucherType == VoucherType.Receipt)
        {
            cashbox.CurrentBalance += request.Amount;
        }
        else
        {
            if (cashbox.CurrentBalance < request.Amount)
                throw new InvalidOperationException($"رصيد الصندوق غير كافٍ. المتاح: {cashbox.CurrentBalance:N0}.");

            cashbox.CurrentBalance -= request.Amount;
        }

        // 2. Record Cash Transaction
        await _context.CashTransactions.AddAsync(new CashTransaction
        {
            TransactionNumber = $"{voucherNumber}-CSH",
            CashboxId = cashbox.Id,
            TransactionType = voucherType,
            Amount = request.Amount,
            TransactionDate = DateTime.UtcNow,
            ReferenceType = "PaymentVoucher",
            ReferenceId = voucher.Id,
            Description = request.Description ?? $"سند {voucherType}",
            CreatedBy = userId
        });

        // 3. Update Subledger Party Balance & Post Journal Entry
        var cashAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "10101")
            ?? await _context.Accounts.FirstAsync(a => a.AccountType == AccountType.Asset);

        var arAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "10201")
            ?? await _context.Accounts.FirstAsync(a => a.AccountType == AccountType.Asset);

        var apAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "20101")
            ?? await _context.Accounts.FirstAsync(a => a.AccountType == AccountType.Liability);

        var je = new JournalEntry
        {
            EntryNumber = $"JE-{voucherNumber}",
            EntryDate = DateTime.UtcNow,
            Description = $"قيد سند {(voucherType == VoucherType.Receipt ? "قبض" : "صرف")} رقم {voucherNumber}",
            SourceType = "PaymentVoucher",
            SourceId = voucher.Id,
            Status = DocumentStatus.Approved,
            ApprovedBy = userId,
            ApprovedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        if (voucherType == VoucherType.Receipt)
        {
            // Receipt: Debit Cashbox, Credit Party
            je.Lines.Add(new JournalEntryLine
            {
                AccountId = cashAccount.Id,
                Debit = request.Amount,
                Credit = 0,
                Description = $"تحصيل نقدي في {cashbox.Name}"
            });

            if (partyType == PartyType.Customer)
            {
                var customer = await _context.Customers.FindAsync(request.PartyId);
                if (customer != null) customer.CurrentBalance -= request.Amount;

                je.Lines.Add(new JournalEntryLine
                {
                    AccountId = arAccount.Id,
                    Debit = 0,
                    Credit = request.Amount,
                    Description = $"تخفيض مديونية العميل {customer?.Name}",
                    CustomerId = customer?.Id
                });
            }
            else if (partyType == PartyType.Distributor)
            {
                var distributor = await _context.Distributors.FindAsync(request.PartyId);
                if (distributor != null) distributor.CurrentBalance -= request.Amount;

                je.Lines.Add(new JournalEntryLine
                {
                    AccountId = arAccount.Id,
                    Debit = 0,
                    Credit = request.Amount,
                    Description = $"توريد نقدي من الموزع {distributor?.Name}",
                    DistributorId = distributor?.Id
                });
            }
        }
        else // Payment Voucher (سند صرف)
        {
            // Payment: Debit Party, Credit Cashbox
            if (partyType == PartyType.Supplier)
            {
                var supplier = await _context.Suppliers.FindAsync(request.PartyId);
                if (supplier != null) supplier.CurrentBalance -= request.Amount;

                je.Lines.Add(new JournalEntryLine
                {
                    AccountId = apAccount.Id,
                    Debit = request.Amount,
                    Credit = 0,
                    Description = $"سداد مستحقات المورد {supplier?.Name}",
                    SupplierId = supplier?.Id
                });
            }

            je.Lines.Add(new JournalEntryLine
            {
                AccountId = cashAccount.Id,
                Debit = 0,
                Credit = request.Amount,
                Description = $"صرف نقدي من {cashbox.Name}"
            });
        }

        await _context.JournalEntries.AddAsync(je);
        await _context.SaveChangesAsync();
        await dbTransaction.CommitAsync();

        return voucher.Id;
    }

    public async Task<Guid> CreateExpenseAsync(ExpenseRequest request, Guid userId)
    {
        var cashbox = await _context.Cashboxes.FindAsync(request.CashboxId)
            ?? throw new InvalidOperationException("الصندوق غير موجود.");

        var category = await _context.ExpenseCategories.FindAsync(request.CategoryId)
            ?? throw new InvalidOperationException("تصنيف المصروف غير موجود.");

        if (cashbox.CurrentBalance < request.Amount)
            throw new InvalidOperationException($"رصيد الصندوق غير كافٍ لصرف هذا المصروف. المتاح: {cashbox.CurrentBalance:N0}.");

        using var dbTransaction = await _context.Database.BeginTransactionAsync();

        var expenseNumber = $"EXP-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var expense = new Expense
        {
            ExpenseNumber = expenseNumber,
            CategoryId = request.CategoryId,
            CashboxId = request.CashboxId,
            Amount = request.Amount,
            ExpenseDate = request.ExpenseDate,
            Description = request.Description,
            Beneficiary = request.Beneficiary,
            CreatedBy = userId
        };

        await _context.Expenses.AddAsync(expense);

        // Deduct from cashbox
        cashbox.CurrentBalance -= request.Amount;

        // Cash transaction
        await _context.CashTransactions.AddAsync(new CashTransaction
        {
            TransactionNumber = $"{expenseNumber}-CSH",
            CashboxId = cashbox.Id,
            TransactionType = VoucherType.Payment,
            Amount = request.Amount,
            TransactionDate = request.ExpenseDate,
            ReferenceType = "Expense",
            ReferenceId = expense.Id,
            Description = $"مصروف {category.Name}: {request.Description}",
            CreatedBy = userId
        });

        // Accounting entry: Debit Expense Account, Credit Cash Account
        var cashAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "10101")
            ?? await _context.Accounts.FirstAsync(a => a.AccountType == AccountType.Asset);

        var expenseAccount = category.AccountId.HasValue
            ? await _context.Accounts.FindAsync(category.AccountId.Value)
            : await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "50201");

        expenseAccount ??= await _context.Accounts.FirstAsync(a => a.AccountType == AccountType.Expense);

        var je = new JournalEntry
        {
            EntryNumber = $"JE-{expenseNumber}",
            EntryDate = request.ExpenseDate,
            Description = $"قيد مصروف {category.Name} رقم {expenseNumber}",
            SourceType = "Expense",
            SourceId = expense.Id,
            Status = DocumentStatus.Approved,
            ApprovedBy = userId,
            ApprovedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        je.Lines.Add(new JournalEntryLine
        {
            AccountId = expenseAccount.Id,
            Debit = request.Amount,
            Credit = 0,
            Description = $"إثبات مصروف {category.Name}: {request.Description}"
        });

        je.Lines.Add(new JournalEntryLine
        {
            AccountId = cashAccount.Id,
            Debit = 0,
            Credit = request.Amount,
            Description = $"صرف نقدي من {cashbox.Name}"
        });

        await _context.JournalEntries.AddAsync(je);
        await _context.SaveChangesAsync();
        await dbTransaction.CommitAsync();

        return expense.Id;
    }

    public async Task<List<JournalEntryDto>> GetJournalEntriesAsync()
    {
        var entries = await _context.JournalEntries
            .Include(j => j.Lines)
                .ThenInclude(l => l.Account)
            .OrderByDescending(j => j.EntryDate)
            .Take(50)
            .ToListAsync();

        return entries.Select(j => new JournalEntryDto(
            j.Id,
            j.EntryNumber,
            j.EntryDate,
            j.Description,
            j.SourceType,
            j.TotalDebit,
            j.TotalCredit,
            j.IsBalanced,
            j.Lines.Select(l => new JournalLineDto(
                l.Account?.AccountCode ?? "",
                l.Account?.AccountName ?? "",
                l.Debit,
                l.Credit,
                l.Description
            )).ToList()
        )).ToList();
    }

    public async Task<DailyClosingSummaryDto> GetDailyClosingSummaryAsync(DateTime businessDate)
    {
        var startOfDay = businessDate.Date;
        var endOfDay = startOfDay.AddDays(1);

        // Previous closing cash or initial cashboxes opening
        var prevClosing = await _context.DailyClosings
            .Where(c => c.BusinessDate < startOfDay && c.Status == DocumentStatus.Approved)
            .OrderByDescending(c => c.BusinessDate)
            .FirstOrDefaultAsync();

        var cashboxesList = await _context.Cashboxes.Where(c => c.IsActive).Select(c => c.OpeningBalance).ToListAsync();
        var openingCash = prevClosing != null 
            ? prevClosing.ActualCash 
            : cashboxesList.Sum();

        var cashSalesList = await _context.SalesInvoices
            .Where(s => s.InvoiceDate >= startOfDay && s.InvoiceDate < endOfDay && s.Status == DocumentStatus.Approved)
            .Select(s => s.PaidAmount)
            .ToListAsync();
        var totalSalesCash = cashSalesList.Sum();

        var creditSalesList = await _context.SalesInvoices
            .Where(s => s.InvoiceDate >= startOfDay && s.InvoiceDate < endOfDay && s.Status == DocumentStatus.Approved)
            .Select(s => s.RemainingAmount)
            .ToListAsync();
        var totalSalesCredit = creditSalesList.Sum();

        var cashPurchasesList = await _context.PurchaseInvoices
            .Where(p => p.InvoiceDate >= startOfDay && p.InvoiceDate < endOfDay && p.Status == DocumentStatus.Approved)
            .Select(p => p.PaidAmount)
            .ToListAsync();
        var totalPurchasesCash = cashPurchasesList.Sum();

        var receiptsList = await _context.PaymentVouchers
            .Where(v => v.PaymentDate >= startOfDay && v.PaymentDate < endOfDay && v.VoucherType == VoucherType.Receipt && v.Status == DocumentStatus.Approved)
            .Select(v => v.Amount)
            .ToListAsync();
        var totalReceipts = receiptsList.Sum();

        var expensesList = await _context.Expenses
            .Where(e => e.ExpenseDate >= startOfDay && e.ExpenseDate < endOfDay)
            .Select(e => e.Amount)
            .ToListAsync();
        var totalExpenses = expensesList.Sum();

        var pendingSettlements = await _context.DistributorSettlements
            .CountAsync(s => s.BusinessDate >= startOfDay && s.BusinessDate < endOfDay && s.Status == DocumentStatus.Draft);

        var openCustody = await _inventoryService.GetDistributorCustodyPiecesAsync(Guid.Empty, Guid.Empty);

        var expectedCash = openingCash + totalSalesCash + totalReceipts - totalPurchasesCash - totalExpenses;

        return new DailyClosingSummaryDto(
            startOfDay,
            openingCash,
            totalSalesCash,
            totalSalesCredit,
            totalPurchasesCash,
            totalReceipts,
            totalExpenses,
            expectedCash,
            pendingSettlements,
            openCustody
        );
    }

    public async Task<Guid> SubmitDailyClosingAsync(CreateDailyClosingRequest request, Guid userId)
    {
        var targetDate = request.BusinessDate.Date;
        var existing = await _context.DailyClosings
            .FirstOrDefaultAsync(c => c.BusinessDate == targetDate && c.Status == DocumentStatus.Approved);

        if (existing != null)
            throw new InvalidOperationException($"تم إغلاق يوم {targetDate.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture)} مسبقاً برقم {existing.ClosingNumber}.");

        var summary = await GetDailyClosingSummaryAsync(targetDate);

        var closingNumber = $"CLS-{targetDate.ToString("yyyyMMdd", System.Globalization.CultureInfo.InvariantCulture)}-{Guid.NewGuid().ToString()[..4].ToUpper()}";

        var closing = new DailyClosing
        {
            ClosingNumber = closingNumber,
            BusinessDate = targetDate,
            OpeningCash = summary.OpeningCash,
            TotalSales = summary.TotalSalesCash + summary.TotalSalesCredit,
            TotalPurchases = summary.TotalPurchasesCash,
            TotalReceipts = summary.TotalReceipts,
            TotalExpenses = summary.TotalExpenses,
            ExpectedCash = summary.ExpectedClosingCash,
            ActualCash = request.ActualCash,
            Status = DocumentStatus.Approved,
            ClosedBy = userId,
            ApprovedBy = userId,
            Notes = request.Notes,
            CreatedBy = userId
        };

        await _context.DailyClosings.AddAsync(closing);
        await _context.SaveChangesAsync();

        return closing.Id;
    }

    public async Task<List<DailyClosingDto>> GetDailyClosingsAsync()
    {
        var closings = await _context.DailyClosings
            .OrderByDescending(c => c.BusinessDate)
            .Take(30)
            .ToListAsync();

        return closings.Select(c => new DailyClosingDto(
            c.Id,
            c.ClosingNumber,
            c.BusinessDate,
            c.OpeningCash,
            c.TotalSales,
            c.TotalPurchases,
            c.TotalReceipts,
            c.TotalExpenses,
            c.ExpectedCash,
            c.ActualCash,
            c.CashDifference,
            c.Status.ToString(),
            c.Notes,
            c.CreatedAt
        )).ToList();
    }

    public async Task<List<CustomerDebtAgingDto>> GetCustomerDebtAgingAsync()
    {
        var customers = await _context.Customers
            .OrderByDescending(c => c.CurrentBalance)
            .ToListAsync();

        var allUnpaidInvoices = await _context.SalesInvoices
            .Where(i => i.PaidAmount < i.Total && i.Status == DocumentStatus.Approved)
            .ToListAsync();

        var now = DateTime.UtcNow;
        var result = new List<CustomerDebtAgingDto>();

        foreach (var c in customers)
        {
            var unpaidInvoices = allUnpaidInvoices
                .Where(i => i.CustomerId == c.Id)
                .ToList();

            decimal d0_30 = 0, d31_60 = 0, d61_90 = 0, d90plus = 0;

            foreach (var inv in unpaidInvoices)
            {
                var unpaidAmount = inv.Total - inv.PaidAmount;
                var days = (now - inv.InvoiceDate).TotalDays;

                if (days <= 30) d0_30 += unpaidAmount;
                else if (days <= 60) d31_60 += unpaidAmount;
                else if (days <= 90) d61_90 += unpaidAmount;
                else d90plus += unpaidAmount;
            }

            var categorizedTotal = d0_30 + d31_60 + d61_90 + d90plus;
            if (c.CurrentBalance > categorizedTotal)
            {
                d0_30 += (c.CurrentBalance - categorizedTotal);
            }

            var lastPayment = await _context.PaymentVouchers
                .Where(p => p.PartyType == PartyType.Customer && p.PartyId == c.Id)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => (DateTime?)p.PaymentDate)
                .FirstOrDefaultAsync();

            string status = c.CurrentBalance <= 0 ? "متزن" :
                            d90plus > 0 ? "متعثر حرِج" :
                            d61_90 > 0 ? "متأخر" :
                            c.CurrentBalance > c.CreditLimit ? "تجاوز السقف" : "جاري منتظم";

            result.Add(new CustomerDebtAgingDto(
                c.Id,
                c.CustomerCode,
                c.Name,
                c.Phone,
                c.Area,
                c.CreditLimit,
                c.CurrentBalance,
                d0_30,
                d31_60,
                d61_90,
                d90plus,
                lastPayment,
                status
            ));
        }

        return result;
    }

    public async Task<List<PeriodClosingDto>> GetPeriodClosingsAsync()
    {
        var list = await _context.PeriodClosings
            .OrderByDescending(p => p.FiscalYear)
            .ThenByDescending(p => p.Month)
            .ToListAsync();

        return list.Select(p => new PeriodClosingDto(
            p.Id,
            p.ClosingNumber,
            p.ClosingType,
            p.FiscalYear,
            p.Month,
            p.ClosingDate,
            p.TotalSales,
            p.TotalCostOfGoodsSold,
            p.GrossProfit,
            p.TotalExpenses,
            p.TotalSalaries,
            p.NetProfit,
            p.IsLocked,
            p.Notes
        )).ToList();
    }

    public async Task<Guid> CreatePeriodClosingAsync(CreatePeriodClosingRequest request, Guid userId)
    {
        DateTime startPeriod, endPeriod;
        if (request.ClosingType == "Monthly" && request.Month.HasValue)
        {
            startPeriod = new DateTime(request.FiscalYear, request.Month.Value, 1, 0, 0, 0, DateTimeKind.Utc);
            endPeriod = startPeriod.AddMonths(1).AddTicks(-1);
        }
        else
        {
            startPeriod = new DateTime(request.FiscalYear, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            endPeriod = new DateTime(request.FiscalYear, 12, 31, 23, 59, 59, DateTimeKind.Utc);
        }

        var totalSales = await _context.SalesInvoices
            .Where(i => i.InvoiceDate >= startPeriod && i.InvoiceDate <= endPeriod && i.Status == DocumentStatus.Approved)
            .SumAsync(i => (decimal?)i.Total) ?? 0m;

        var totalCogs = await _context.InventoryTransactions
            .Where(t => t.TransactionDate >= startPeriod && t.TransactionDate <= endPeriod && t.QuantityOutPieces > 0)
            .SumAsync(t => (decimal?)(t.QuantityOutPieces * t.UnitCost)) ?? (totalSales * 0.75m);

        var totalExpenses = await _context.Expenses
            .Where(e => e.ExpenseDate >= startPeriod && e.ExpenseDate <= endPeriod)
            .SumAsync(e => (decimal?)e.Amount) ?? 0m;

        var totalSalaries = await _context.WorkerSalaryVouchers
            .Where(s => s.Year == request.FiscalYear && (!request.Month.HasValue || s.Month == request.Month.Value))
            .SumAsync(s => (decimal?)s.NetPaid) ?? 0m;

        var count = await _context.PeriodClosings.CountAsync();
        var closingNumber = $"CLS-{request.FiscalYear}-{(request.Month.HasValue ? request.Month.Value.ToString("D2") : "YR")}-{count + 1:D3}";

        var closing = new PeriodClosing
        {
            ClosingNumber = closingNumber,
            ClosingType = request.ClosingType,
            FiscalYear = request.FiscalYear,
            Month = request.Month,
            ClosingDate = DateTime.UtcNow,
            TotalSales = totalSales,
            TotalCostOfGoodsSold = totalCogs,
            TotalExpenses = totalExpenses,
            TotalSalaries = totalSalaries,
            IsLocked = true,
            Notes = request.Notes,
            CreatedBy = userId
        };

        await _context.PeriodClosings.AddAsync(closing);
        await _context.SaveChangesAsync();

        return closing.Id;
    }
}

