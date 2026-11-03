using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Beverage.Domain.Entities.Customers;
using Beverage.Domain.Entities.Finance;
using Beverage.Domain.Entities.Sales;
using Beverage.Domain.Entities.Warehouses;
using Beverage.Domain.Enums;
using Beverage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Beverage.Infrastructure.Services;

public class SalesService : ISalesService
{
    private readonly BeverageDbContext _context;

    public SalesService(BeverageDbContext context)
    {
        _context = context;
    }

    public async Task<List<CustomerDto>> GetCustomersAsync()
    {
        return await _context.Customers
            .Include(c => c.AssignedDistributor)
            .OrderBy(c => c.Name)
            .Select(c => new CustomerDto(
                c.Id,
                c.CustomerCode,
                c.Name,
                c.OwnerName,
                c.Phone,
                c.Address,
                c.Area,
                c.CreditLimit,
                c.CurrentBalance,
                c.AssignedDistributorId,
                c.AssignedDistributor != null ? c.AssignedDistributor.Name : null,
                c.IsActive
            ))
            .ToListAsync();
    }

    public async Task<CustomerDto> CreateCustomerAsync(CreateCustomerRequest request, Guid userId)
    {
        var customer = new Customer
        {
            CustomerCode = request.CustomerCode.Trim().ToUpperInvariant(),
            Name = request.Name.Trim(),
            OwnerName = request.OwnerName?.Trim(),
            Phone = request.Phone?.Trim(),
            Address = request.Address?.Trim(),
            Area = request.Area?.Trim(),
            CreditLimit = request.CreditLimit,
            OpeningBalance = request.OpeningBalance,
            CurrentBalance = request.OpeningBalance,
            AssignedDistributorId = request.AssignedDistributorId,
            IsActive = true,
            CreatedBy = userId
        };

        await _context.Customers.AddAsync(customer);
        await _context.SaveChangesAsync();

        var distName = request.AssignedDistributorId.HasValue
            ? (await _context.Distributors.FindAsync(request.AssignedDistributorId.Value))?.Name
            : null;

        return new CustomerDto(
            customer.Id,
            customer.CustomerCode,
            customer.Name,
            customer.OwnerName,
            customer.Phone,
            customer.Address,
            customer.Area,
            customer.CreditLimit,
            customer.CurrentBalance,
            customer.AssignedDistributorId,
            distName,
            customer.IsActive
        );
    }

    public async Task<Guid> CreateSalesInvoiceAsync(CreateSalesInvoiceRequest request, Guid userId)
    {
        var customer = await _context.Customers.FindAsync(request.CustomerId)
            ?? throw new InvalidOperationException("العميل غير موجود.");

        if (request.Items == null || !request.Items.Any())
            throw new InvalidOperationException("يجب أن تحتوي فاتورة البيع على صنف واحد على الأقل.");

        using var dbTransaction = await _context.Database.BeginTransactionAsync();

        var invoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
        decimal invoiceTotal = 0;
        decimal totalCost = 0;

        var invoice = new SalesInvoice
        {
            InvoiceNumber = invoiceNumber,
            CustomerId = request.CustomerId,
            DistributorId = request.DistributorId,
            WarehouseId = request.WarehouseId,
            InvoiceDate = request.InvoiceDate,
            PaymentMethod = Enum.TryParse<PaymentMethod>(request.PaymentMethod, true, out var pm) ? pm : PaymentMethod.Cash,
            DueDate = request.DueDate,
            Status = DocumentStatus.Approved,
            ApprovedBy = userId,
            ApprovedAt = DateTime.UtcNow,
            Notes = request.Notes,
            CreatedBy = userId
        };

        foreach (var itemReq in request.Items)
        {
            var product = await _context.Products.FindAsync(itemReq.ProductId)
                ?? throw new InvalidOperationException("المنتج غير موجود.");

            var unitsPerCarton = product.UnitsPerCarton > 0 ? product.UnitsPerCarton : 12;
            var totalPieces = (itemReq.QuantityCartons * unitsPerCarton) + itemReq.QuantityPieces;
            var itemTotal = (itemReq.QuantityCartons * itemReq.UnitPricePerCarton)
                          + (itemReq.QuantityPieces * (itemReq.UnitPricePerCarton / unitsPerCarton))
                          - itemReq.Discount;

            var pieceCost = product.DefaultPurchasePriceCarton / unitsPerCarton;
            var itemCost = totalPieces * pieceCost;

            invoiceTotal += itemTotal;
            totalCost += itemCost;

            invoice.Items.Add(new SalesInvoiceItem
            {
                ProductId = itemReq.ProductId,
                QuantityCartons = itemReq.QuantityCartons,
                QuantityPieces = itemReq.QuantityPieces,
                TotalPieces = totalPieces,
                UnitPricePerCarton = itemReq.UnitPricePerCarton,
                UnitCost = pieceCost,
                Discount = itemReq.Discount,
                Total = itemTotal
            });

            // If sold directly from warehouse, deduct stock
            if (request.WarehouseId.HasValue)
            {
                var balance = await _context.InventoryBalances
                    .FirstOrDefaultAsync(b => b.WarehouseId == request.WarehouseId.Value && b.ProductId == itemReq.ProductId);

                if (balance == null || balance.AvailableQuantityPieces < totalPieces)
                {
                    throw new InvalidOperationException($"الكمية المطلوبة للبيع غير متوفرة في المستودع. المتوفر: {(balance?.AvailableQuantityPieces ?? 0)} حبة.");
                }

                balance.QuantityInPieces -= totalPieces;

                await _context.InventoryTransactions.AddAsync(new InventoryTransaction
                {
                    TransactionNumber = $"{invoiceNumber}-{product.Sku}",
                    ProductId = itemReq.ProductId,
                    WarehouseId = request.WarehouseId.Value,
                    TransactionType = InventoryTransactionType.Sale,
                    QuantityOutPieces = totalPieces,
                    UnitCost = pieceCost,
                    SourceType = "SalesInvoice",
                    SourceId = invoice.Id,
                    UserId = userId,
                    TransactionDate = request.InvoiceDate,
                    Notes = $"فاتورة بيع رقم {invoiceNumber} للعميل {customer.Name}"
                });
            }
        }

        invoice.Subtotal = invoiceTotal;
        invoice.Total = invoiceTotal;
        invoice.PaidAmount = Math.Min(request.PaidAmount, invoiceTotal);

        await _context.SalesInvoices.AddAsync(invoice);

        // 1. Update Customer Balance (Credit debt)
        var remainingCreditDebt = invoice.Total - invoice.PaidAmount;
        if (remainingCreditDebt > 0)
        {
            if (customer.CreditLimit > 0 && (customer.CurrentBalance + remainingCreditDebt) > customer.CreditLimit)
            {
                // Note warning in notes or audit log
                invoice.Notes = $"{invoice.Notes} [تنبيه: تجاوز السقف الائتماني البالغ {customer.CreditLimit:N0}]";
            }
            customer.CurrentBalance += remainingCreditDebt;
        }

        // 2. Accounting: Strictly balanced double-entry
        var cashAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "10101")
            ?? await _context.Accounts.FirstAsync(a => a.AccountType == AccountType.Asset);

        var arAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "10201")
            ?? await _context.Accounts.FirstAsync(a => a.AccountType == AccountType.Asset);

        var salesRevenueAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "40101")
            ?? await _context.Accounts.FirstAsync(a => a.AccountType == AccountType.Revenue);

        var cogsAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "50101")
            ?? await _context.Accounts.FirstAsync(a => a.AccountType == AccountType.Expense);

        var inventoryAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "10301")
            ?? await _context.Accounts.FirstAsync(a => a.AccountType == AccountType.Asset);

        var je = new JournalEntry
        {
            EntryNumber = $"JE-SAL-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
            EntryDate = request.InvoiceDate,
            Description = $"قيد فاتورة بيع {invoiceNumber} للعميل {customer.Name}",
            SourceType = "SalesInvoice",
            SourceId = invoice.Id,
            Status = DocumentStatus.Approved,
            ApprovedBy = userId,
            ApprovedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        // Debit: Cashbox for paid amount
        if (invoice.PaidAmount > 0)
        {
            je.Lines.Add(new JournalEntryLine
            {
                AccountId = cashAccount.Id,
                Debit = invoice.PaidAmount,
                Credit = 0,
                Description = $"تحصيل نقدي مبيعات {invoiceNumber}",
                CustomerId = customer.Id
            });

            // Update cashbox
            var cashbox = await _context.Cashboxes.FirstOrDefaultAsync(c => c.IsActive);
            if (cashbox != null)
            {
                cashbox.CurrentBalance += invoice.PaidAmount;
                await _context.CashTransactions.AddAsync(new CashTransaction
                {
                    TransactionNumber = $"CSH-IN-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
                    CashboxId = cashbox.Id,
                    TransactionType = VoucherType.Receipt,
                    Amount = invoice.PaidAmount,
                    TransactionDate = request.InvoiceDate,
                    ReferenceType = "SalesInvoice",
                    ReferenceId = invoice.Id,
                    Description = $"تحصيل فاتورة بيع {invoiceNumber} من العميل {customer.Name}",
                    CreatedBy = userId
                });
            }
        }

        // Debit: Accounts Receivable for remaining credit
        if (remainingCreditDebt > 0)
        {
            je.Lines.Add(new JournalEntryLine
            {
                AccountId = arAccount.Id,
                Debit = remainingCreditDebt,
                Credit = 0,
                Description = $"مديونية آجلة مبيعات {invoiceNumber} على {customer.Name}",
                CustomerId = customer.Id
            });
        }

        // Credit: Sales Revenue for Total
        je.Lines.Add(new JournalEntryLine
        {
            AccountId = salesRevenueAccount.Id,
            Debit = 0,
            Credit = invoice.Total,
            Description = $"إيراد فاتورة بيع {invoiceNumber}",
            CustomerId = customer.Id
        });

        // Entry 2: Cost of Goods Sold & Inventory relief
        if (totalCost > 0)
        {
            je.Lines.Add(new JournalEntryLine
            {
                AccountId = cogsAccount.Id,
                Debit = totalCost,
                Credit = 0,
                Description = $"تكلفة البضاعة المباعة فاتورة {invoiceNumber}"
            });

            je.Lines.Add(new JournalEntryLine
            {
                AccountId = inventoryAccount.Id,
                Debit = 0,
                Credit = totalCost,
                Description = $"تخفيض المخزون بتكلفة البضاعة المباعة {invoiceNumber}"
            });
        }

        await _context.JournalEntries.AddAsync(je);
        await _context.SaveChangesAsync();
        await dbTransaction.CommitAsync();

        return invoice.Id;
    }

    public async Task<List<CustomerLedgerEntryDto>> GetCustomerLedgerAsync(Guid customerId)
    {
        var customer = await _context.Customers.FindAsync(customerId)
            ?? throw new InvalidOperationException("العميل غير موجود.");

        var list = new List<CustomerLedgerEntryDto>();
        decimal runningBalance = customer.OpeningBalance;

        // Opening balance row
        list.Add(new CustomerLedgerEntryDto(
            customer.CreatedAt,
            "OpeningBalance",
            "OB-001",
            "رصيد افتتاحي",
            customer.OpeningBalance > 0 ? customer.OpeningBalance : 0,
            customer.OpeningBalance < 0 ? -customer.OpeningBalance : 0,
            runningBalance
        ));

        // Sales Invoices
        var invoices = await _context.SalesInvoices
            .Where(s => s.CustomerId == customerId && s.Status == DocumentStatus.Approved)
            .OrderBy(s => s.InvoiceDate)
            .ToListAsync();

        foreach (var inv in invoices)
        {
            var creditAmount = inv.Total - inv.PaidAmount;
            if (creditAmount > 0)
            {
                runningBalance += creditAmount;
                list.Add(new CustomerLedgerEntryDto(
                    inv.InvoiceDate,
                    "SalesInvoice",
                    inv.InvoiceNumber,
                    $"فاتورة بيع آجل (إجمالي {inv.Total:N0}، مدفوع {inv.PaidAmount:N0})",
                    creditAmount,
                    0,
                    runningBalance
                ));
            }
        }

        // Payments from Customer
        var payments = await _context.PaymentVouchers
            .Where(p => p.PartyType == PartyType.Customer && p.PartyId == customerId && p.Status == DocumentStatus.Approved)
            .OrderBy(p => p.PaymentDate)
            .ToListAsync();

        foreach (var p in payments)
        {
            if (p.VoucherType == VoucherType.Receipt)
            {
                runningBalance -= p.Amount;
                list.Add(new CustomerLedgerEntryDto(
                    p.PaymentDate,
                    "PaymentVoucher",
                    p.VoucherNumber,
                    $"سند قبض نقدي: {p.Description}",
                    0,
                    p.Amount,
                    runningBalance
                ));
            }
        }

        return list.OrderBy(e => e.Date).ToList();
    }

    public async Task<SalesInvoicePrintDto?> GetInvoiceForPrintAsync(Guid invoiceId)
    {
        var inv = await _context.SalesInvoices
            .Include(i => i.Customer)
            .Include(i => i.Distributor)
            .Include(i => i.Items)
                .ThenInclude(it => it.Product)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (inv == null) return null;

        return new SalesInvoicePrintDto(
            inv.Id,
            inv.InvoiceNumber,
            inv.InvoiceDate,
            inv.Customer?.Name ?? "عميل نقدي",
            inv.Customer?.Phone,
            inv.Customer?.Area,
            inv.Distributor?.Name,
            inv.PaymentMethod.ToString(),
            inv.Total,
            inv.PaidAmount,
            inv.Total - inv.PaidAmount,
            inv.Notes ?? "",
            inv.Items.Select(it => new SalesInvoicePrintItemDto(
                it.Product?.Name ?? "صنف",
                it.QuantityCartons,
                it.QuantityPieces,
                it.UnitPricePerCarton,
                it.Total
            )).ToList()
        );
    }

    public async Task<List<SalesInvoicePrintDto>> GetRecentInvoicesAsync(int limit = 20)
    {
        var invoices = await _context.SalesInvoices
            .Include(i => i.Customer)
            .Include(i => i.Distributor)
            .Include(i => i.Items)
                .ThenInclude(it => it.Product)
            .OrderByDescending(i => i.InvoiceDate)
            .Take(limit)
            .ToListAsync();

        return invoices.Select(inv => new SalesInvoicePrintDto(
            inv.Id,
            inv.InvoiceNumber,
            inv.InvoiceDate,
            inv.Customer?.Name ?? "عميل نقدي",
            inv.Customer?.Phone,
            inv.Customer?.Area,
            inv.Distributor?.Name,
            inv.PaymentMethod.ToString(),
            inv.Total,
            inv.PaidAmount,
            inv.Total - inv.PaidAmount,
            inv.Notes ?? "",
            inv.Items.Select(it => new SalesInvoicePrintItemDto(
                it.Product?.Name ?? "صنف",
                it.QuantityCartons,
                it.QuantityPieces,
                it.UnitPricePerCarton,
                it.Total
            )).ToList()
        )).ToList();
    }
}

