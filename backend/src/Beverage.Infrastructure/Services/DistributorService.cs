using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Beverage.Domain.Entities.Distributors;
using Beverage.Domain.Entities.Finance;
using Beverage.Domain.Entities.Warehouses;
using Beverage.Domain.Enums;
using Beverage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Beverage.Infrastructure.Services;

public class DistributorService : IDistributorService
{
    private readonly BeverageDbContext _context;
    private readonly IInventoryService _inventoryService;

    public DistributorService(BeverageDbContext context, IInventoryService inventoryService)
    {
        _context = context;
        _inventoryService = inventoryService;
    }

    public async Task<List<DistributorDto>> GetDistributorsAsync()
    {
        var distributors = await _context.Distributors
            .OrderBy(d => d.Name)
            .ToListAsync();

        var list = new List<DistributorDto>();
        foreach (var d in distributors)
        {
            var custodyPieces = await _inventoryService.GetDistributorCustodyPiecesAsync(d.Id, Guid.Empty);
            list.Add(new DistributorDto(
                d.Id,
                d.DistributorCode,
                d.Name,
                d.Phone,
                d.Address,
                d.RouteArea,
                d.RelationshipType.ToString(),
                d.CreditLimit,
                d.CurrentBalance,
                custodyPieces,
                Math.Round(custodyPieces / 12, 2),
                d.IsActive
            ));
        }

        return list;
    }

    public async Task<DistributorDto> CreateDistributorAsync(CreateDistributorRequest request, Guid userId)
    {
        var distributor = new Distributor
        {
            DistributorCode = request.DistributorCode.Trim().ToUpperInvariant(),
            Name = request.Name.Trim(),
            Phone = request.Phone?.Trim(),
            Address = request.Address?.Trim(),
            RouteArea = request.RouteArea?.Trim(),
            RelationshipType = Enum.TryParse<DistributorRelationshipType>(request.RelationshipType, true, out var rel) ? rel : DistributorRelationshipType.Consignment,
            CreditLimit = request.CreditLimit,
            OpeningBalance = request.OpeningBalance,
            CurrentBalance = request.OpeningBalance,
            IsActive = true,
            CreatedBy = userId
        };

        await _context.Distributors.AddAsync(distributor);
        await _context.SaveChangesAsync();

        return new DistributorDto(
            distributor.Id,
            distributor.DistributorCode,
            distributor.Name,
            distributor.Phone,
            distributor.Address,
            distributor.RouteArea,
            distributor.RelationshipType.ToString(),
            distributor.CreditLimit,
            distributor.CurrentBalance,
            0,
            0,
            distributor.IsActive
        );
    }

    public async Task<Guid> DispatchToDistributorAsync(CreateDistributorDispatchRequest request, Guid userId)
    {
        var distributor = await _context.Distributors.FindAsync(request.DistributorId)
            ?? throw new InvalidOperationException("الموزع غير موجود.");

        var warehouse = await _context.Warehouses.FindAsync(request.WarehouseId)
            ?? throw new InvalidOperationException("المستودع المصدر غير موجود.");

        if (request.Items == null || !request.Items.Any())
            throw new InvalidOperationException("يجب أن يحتوي سند التسليم على صنف واحد على الأقل.");

        using var dbTransaction = await _context.Database.BeginTransactionAsync();

        var dispatchNumber = $"DISP-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
        decimal totalAgreedVal = 0;
        decimal totalCost = 0;

        var dispatch = new DistributorDispatch
        {
            DispatchNumber = dispatchNumber,
            DistributorId = request.DistributorId,
            WarehouseId = request.WarehouseId,
            DispatchDate = request.DispatchDate,
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

            // Verify stock availability in Source Warehouse (Cold Storage)
            var balance = await _context.InventoryBalances
                .FirstOrDefaultAsync(b => b.WarehouseId == request.WarehouseId && b.ProductId == itemReq.ProductId);

            if (balance == null || balance.AvailableQuantityPieces < totalPieces)
            {
                throw new InvalidOperationException($"الكمية المطلوبة لتسليم الموزع غير متوفرة في المستودع. المتوفر: {(balance?.AvailableQuantityPieces ?? 0)} حبة.");
            }

            // Deduct from Warehouse
            balance.QuantityInPieces -= totalPieces;

            var pieceCost = product.DefaultPurchasePriceCarton / unitsPerCarton;
            var itemCost = totalPieces * pieceCost;
            var agreedItemValue = totalPieces * (itemReq.AgreedSalePrice / unitsPerCarton);

            totalCost += itemCost;
            totalAgreedVal += agreedItemValue;

            dispatch.Items.Add(new DistributorDispatchItem
            {
                ProductId = itemReq.ProductId,
                QuantityCartons = itemReq.QuantityCartons,
                QuantityPieces = itemReq.QuantityPieces,
                TotalPieces = totalPieces,
                UnitCost = pieceCost,
                AgreedSalePrice = itemReq.AgreedSalePrice
            });

            // Stock Transaction: Dispatch (Deducts from warehouse, recorded as custody dispatch, NOT final sale!)
            await _context.InventoryTransactions.AddAsync(new InventoryTransaction
            {
                TransactionNumber = $"{dispatchNumber}-{product.Sku}",
                ProductId = itemReq.ProductId,
                WarehouseId = request.WarehouseId,
                TransactionType = InventoryTransactionType.DispatchToDistributor,
                QuantityOutPieces = totalPieces,
                UnitCost = pieceCost,
                SourceType = "DistributorDispatch",
                SourceId = dispatch.Id,
                UserId = userId,
                TransactionDate = request.DispatchDate,
                Notes = $"تسليم عهدة للموزع {distributor.Name} بموجب السند {dispatchNumber}"
            });
        }

        dispatch.TotalCost = totalCost;
        dispatch.TotalAgreedValue = totalAgreedVal;

        await _context.DistributorDispatches.AddAsync(dispatch);

        // Accounting Note: In consignment model, dispatching stock is not recognized as revenue yet.
        // It transfers value from General Inventory to Consignment Custody account in GL.
        var inventoryAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "10301")
            ?? await _context.Accounts.FirstAsync(a => a.AccountType == AccountType.Asset);

        var custodyAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "10302")
            ?? inventoryAccount;

        if (custodyAccount.Id != inventoryAccount.Id)
        {
            var je = new JournalEntry
            {
                EntryNumber = $"JE-DISP-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
                EntryDate = request.DispatchDate,
                Description = $"تحويل بضاعة لعهدة الموزع {distributor.Name} بموجب {dispatchNumber}",
                SourceType = "DistributorDispatch",
                SourceId = dispatch.Id,
                Status = DocumentStatus.Approved,
                ApprovedBy = userId,
                ApprovedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            je.Lines.Add(new JournalEntryLine
            {
                AccountId = custodyAccount.Id,
                Debit = totalCost,
                Credit = 0,
                Description = $"عهدة بضاعة لدى الموزع {distributor.Name}",
                DistributorId = distributor.Id
            });

            je.Lines.Add(new JournalEntryLine
            {
                AccountId = inventoryAccount.Id,
                Debit = 0,
                Credit = totalCost,
                Description = $"خصم من مخزون الثلاجة/المستودع",
                DistributorId = distributor.Id
            });

            await _context.JournalEntries.AddAsync(je);
        }

        await _context.SaveChangesAsync();
        await dbTransaction.CommitAsync();

        return dispatch.Id;
    }

    public async Task<Guid> SettleDistributorAsync(CreateDistributorSettlementRequest request, Guid userId)
    {
        var distributor = await _context.Distributors.FindAsync(request.DistributorId)
            ?? throw new InvalidOperationException("الموزع غير موجود.");

        // Strict Formula Verification for each item:
        // Opening + Received - Sold - Returned - Damaged - Shortage == Remaining
        foreach (var item in request.Items)
        {
            var calculatedRemaining = (item.OpeningQuantityPieces + item.ReceivedQuantityPieces) 
                                    - item.SoldQuantityPieces 
                                    - item.ReturnedQuantityPieces 
                                    - item.DamagedQuantityPieces 
                                    - item.ShortageQuantityPieces;

            if (calculatedRemaining != item.RemainingQuantityPieces)
            {
                throw new InvalidOperationException($"خطأ في تسوية المنتج: الكمية المتبقية ({item.RemainingQuantityPieces}) لا تطابق المعادلة المحاسبية ({calculatedRemaining}).");
            }
        }

        using var dbTransaction = await _context.Database.BeginTransactionAsync();

        var settlementNumber = $"SETL-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var settlement = new DistributorSettlement
        {
            SettlementNumber = settlementNumber,
            DistributorId = request.DistributorId,
            BusinessDate = request.BusinessDate,
            OpeningFinancialBalance = distributor.CurrentBalance,
            TotalSalesValue = request.TotalSalesValue,
            CashCollected = request.CashCollected,
            CreditSalesAmount = request.CreditSalesAmount,
            ApprovedExpenses = request.ApprovedExpenses,
            CashHandedOver = request.CashHandedOver,
            Status = DocumentStatus.Approved,
            ApprovedBy = userId,
            ApprovedAt = DateTime.UtcNow,
            Notes = request.Notes,
            CreatedBy = userId
        };

        // If returned items exist, return them back to Cold Storage
        var coldStorage = await _context.Warehouses.FirstOrDefaultAsync(w => w.WarehouseType == WarehouseType.ColdStorage)
            ?? await _context.Warehouses.FirstAsync();

        foreach (var itemReq in request.Items)
        {
            settlement.Items.Add(new DistributorSettlementItem
            {
                ProductId = itemReq.ProductId,
                OpeningQuantityPieces = itemReq.OpeningQuantityPieces,
                ReceivedQuantityPieces = itemReq.ReceivedQuantityPieces,
                SoldQuantityPieces = itemReq.SoldQuantityPieces,
                ReturnedQuantityPieces = itemReq.ReturnedQuantityPieces,
                DamagedQuantityPieces = itemReq.DamagedQuantityPieces,
                ShortageQuantityPieces = itemReq.ShortageQuantityPieces,
                RemainingQuantityPieces = itemReq.RemainingQuantityPieces
            });

            // If returned good stock, put it back into Cold Storage
            if (itemReq.ReturnedQuantityPieces > 0)
            {
                var balance = await _context.InventoryBalances
                    .FirstOrDefaultAsync(b => b.WarehouseId == coldStorage.Id && b.ProductId == itemReq.ProductId);

                if (balance != null)
                {
                    balance.QuantityInPieces += itemReq.ReturnedQuantityPieces;
                }
                else
                {
                    await _context.InventoryBalances.AddAsync(new InventoryBalance
                    {
                        WarehouseId = coldStorage.Id,
                        ProductId = itemReq.ProductId,
                        QuantityInPieces = itemReq.ReturnedQuantityPieces
                    });
                }

                // Inventory Transaction for Return
                await _context.InventoryTransactions.AddAsync(new InventoryTransaction
                {
                    TransactionNumber = $"{settlementNumber}-RET-{itemReq.ProductId}",
                    ProductId = itemReq.ProductId,
                    WarehouseId = coldStorage.Id,
                    TransactionType = InventoryTransactionType.ReturnFromDistributor,
                    QuantityInPieces = itemReq.ReturnedQuantityPieces,
                    SourceType = "DistributorSettlement",
                    SourceId = settlement.Id,
                    UserId = userId,
                    TransactionDate = request.BusinessDate,
                    Notes = $"مرتجع سليم من تسوية الموزع {distributor.Name}"
                });
            }
        }

        // Cash collection posted to default cashbox
        if (request.CashHandedOver > 0)
        {
            var cashbox = await _context.Cashboxes.FirstOrDefaultAsync(c => c.IsActive);
            if (cashbox != null)
            {
                cashbox.CurrentBalance += request.CashHandedOver;
                await _context.CashTransactions.AddAsync(new CashTransaction
                {
                    TransactionNumber = $"CSH-IN-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
                    CashboxId = cashbox.Id,
                    TransactionType = VoucherType.Receipt,
                    Amount = request.CashHandedOver,
                    TransactionDate = request.BusinessDate,
                    ReferenceType = "DistributorSettlement",
                    ReferenceId = settlement.Id,
                    Description = $"توريد نقدي من تسوية الموزع {distributor.Name} بموجب {settlementNumber}",
                    CreatedBy = userId
                });
            }
        }

        // Double-entry journal entry for Settlement Cash & Revenue recognition
        var cashAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "10101")
            ?? await _context.Accounts.FirstAsync(a => a.AccountType == AccountType.Asset);

        var salesRevenueAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "40101")
            ?? await _context.Accounts.FirstAsync(a => a.AccountType == AccountType.Revenue);

        var arAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "10201")
            ?? await _context.Accounts.FirstAsync(a => a.AccountType == AccountType.Asset);

        var expenseAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "50201")
            ?? await _context.Accounts.FirstAsync(a => a.AccountType == AccountType.Expense);

        var je = new JournalEntry
        {
            EntryNumber = $"JE-SETL-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
            EntryDate = request.BusinessDate,
            Description = $"قيد تسوية الموزع {distributor.Name} رقم {settlementNumber}",
            SourceType = "DistributorSettlement",
            SourceId = settlement.Id,
            Status = DocumentStatus.Approved,
            ApprovedBy = userId,
            ApprovedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        // Debits: Cash received + Credit Sales + Approved Expenses
        if (request.CashHandedOver > 0)
        {
            je.Lines.Add(new JournalEntryLine
            {
                AccountId = cashAccount.Id,
                Debit = request.CashHandedOver,
                Credit = 0,
                Description = $"نقدية موردة من الموزع {distributor.Name}",
                DistributorId = distributor.Id
            });
        }

        if (request.CreditSalesAmount > 0)
        {
            je.Lines.Add(new JournalEntryLine
            {
                AccountId = arAccount.Id,
                Debit = request.CreditSalesAmount,
                Credit = 0,
                Description = $"مبيعات آجلة للمحلات عبر الموزع {distributor.Name}",
                DistributorId = distributor.Id
            });
        }

        if (request.ApprovedExpenses > 0)
        {
            je.Lines.Add(new JournalEntryLine
            {
                AccountId = expenseAccount.Id,
                Debit = request.ApprovedExpenses,
                Credit = 0,
                Description = $"مصروفات توزيع معتمدة للموزع {distributor.Name}",
                DistributorId = distributor.Id
            });
        }

        // Credit: Total Sales Value
        if (request.TotalSalesValue > 0)
        {
            je.Lines.Add(new JournalEntryLine
            {
                AccountId = salesRevenueAccount.Id,
                Debit = 0,
                Credit = request.TotalSalesValue,
                Description = $"إيراد مبيعات الموزع {distributor.Name}",
                DistributorId = distributor.Id
            });
        }

        // Check if balanced, otherwise adjust difference against distributor balance
        if (je.Lines.Any() && je.TotalDebit != je.TotalCredit)
        {
            var diff = je.TotalCredit - je.TotalDebit;
            // Shortage is debtor on distributor
            je.Lines.Add(new JournalEntryLine
            {
                AccountId = arAccount.Id,
                Debit = diff > 0 ? diff : 0,
                Credit = diff < 0 ? -diff : 0,
                Description = $"فارق تسوية موزع {distributor.Name}",
                DistributorId = distributor.Id
            });
            distributor.CurrentBalance += diff;
        }

        settlement.ClosingFinancialBalance = distributor.CurrentBalance;

        if (je.Lines.Any())
        {
            await _context.JournalEntries.AddAsync(je);
        }

        await _context.DistributorSettlements.AddAsync(settlement);
        await _context.SaveChangesAsync();
        await dbTransaction.CommitAsync();

        return settlement.Id;
    }
}
