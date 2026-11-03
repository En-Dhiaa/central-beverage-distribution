using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Beverage.Domain.Entities.Finance;
using Beverage.Domain.Entities.Suppliers;
using Beverage.Domain.Entities.Warehouses;
using Beverage.Domain.Enums;
using Beverage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Beverage.Infrastructure.Services;

public class PurchasingService : IPurchasingService
{
    private readonly BeverageDbContext _context;

    public PurchasingService(BeverageDbContext context)
    {
        _context = context;
    }

    public async Task<List<SupplierDto>> GetSuppliersAsync()
    {
        return await _context.Suppliers
            .OrderBy(s => s.Name)
            .Select(s => new SupplierDto(
                s.Id,
                s.SupplierCode,
                s.Name,
                s.CompanyName,
                s.Phone,
                s.Address,
                s.CurrentBalance,
                s.IsActive
            ))
            .ToListAsync();
    }

    public async Task<SupplierDto> CreateSupplierAsync(CreateSupplierRequest request, Guid userId)
    {
        var supplier = new Supplier
        {
            SupplierCode = request.SupplierCode.Trim().ToUpperInvariant(),
            Name = request.Name.Trim(),
            CompanyName = request.CompanyName?.Trim(),
            Phone = request.Phone?.Trim(),
            Address = request.Address?.Trim(),
            OpeningBalance = request.OpeningBalance,
            CurrentBalance = request.OpeningBalance,
            Notes = request.Notes,
            IsActive = true,
            CreatedBy = userId
        };

        await _context.Suppliers.AddAsync(supplier);
        await _context.SaveChangesAsync();

        return new SupplierDto(
            supplier.Id,
            supplier.SupplierCode,
            supplier.Name,
            supplier.CompanyName,
            supplier.Phone,
            supplier.Address,
            supplier.CurrentBalance,
            supplier.IsActive
        );
    }

    public async Task<Guid> CreatePurchaseInvoiceAsync(CreatePurchaseInvoiceRequest request, Guid userId)
    {
        var supplier = await _context.Suppliers.FindAsync(request.SupplierId)
            ?? throw new InvalidOperationException("المورد غير موجود.");

        var warehouse = request.WarehouseId != Guid.Empty
            ? await _context.Warehouses.FindAsync(request.WarehouseId)
            : await _context.Warehouses.FirstOrDefaultAsync(w => w.WarehouseType == WarehouseType.General)
              ?? await _context.Warehouses.FirstAsync();

        if (warehouse == null)
            throw new InvalidOperationException("المستودع غير موجود.");

        var warehouseId = warehouse.Id;

        if (request.Items == null || !request.Items.Any())
            throw new InvalidOperationException("يجب أن تحتوي فاتورة الشراء على صنف واحد على الأقل.");

        using var dbTransaction = await _context.Database.BeginTransactionAsync();

        var invoiceNumber = $"PUR-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
        decimal invoiceTotal = 0;

        var invoice = new PurchaseInvoice
        {
            InvoiceNumber = invoiceNumber,
            SupplierInvoiceNumber = request.SupplierInvoiceNumber,
            SupplierId = request.SupplierId,
            WarehouseId = warehouseId,
            InvoiceDate = request.InvoiceDate,
            PaymentMethod = Enum.TryParse<PaymentMethod>(request.PaymentMethod, true, out var pm) ? pm : PaymentMethod.Credit,
            Status = DocumentStatus.Approved,
            ApprovedBy = userId,
            ApprovedAt = DateTime.UtcNow,
            Notes = request.Notes,
            CreatedBy = userId
        };

        foreach (var itemReq in request.Items)
        {
            var product = await _context.Products.FindAsync(itemReq.ProductId)
                ?? throw new InvalidOperationException($"المنتج برقم {itemReq.ProductId} غير موجود.");

            var unitsPerCarton = product.UnitsPerCarton > 0 ? product.UnitsPerCarton : 12;
            var totalPieces = (itemReq.QuantityCartons * unitsPerCarton) + itemReq.QuantityPieces;
            var itemTotal = (itemReq.QuantityCartons * itemReq.UnitPricePerCarton) 
                          + (itemReq.QuantityPieces * (itemReq.UnitPricePerCarton / unitsPerCarton)) 
                          - itemReq.Discount;

            invoiceTotal += itemTotal;

            invoice.Items.Add(new PurchaseInvoiceItem
            {
                ProductId = itemReq.ProductId,
                QuantityCartons = itemReq.QuantityCartons,
                QuantityPieces = itemReq.QuantityPieces,
                TotalPieces = totalPieces,
                UnitPricePerCarton = itemReq.UnitPricePerCarton,
                Discount = itemReq.Discount,
                Total = itemTotal
            });

            // 1. Update Inventory Balance
            var balance = await _context.InventoryBalances
                .FirstOrDefaultAsync(b => b.WarehouseId == warehouseId && b.ProductId == itemReq.ProductId);

            if (balance == null)
            {
                balance = new InventoryBalance
                {
                    WarehouseId = warehouseId,
                    ProductId = itemReq.ProductId,
                    QuantityInPieces = totalPieces
                };
                await _context.InventoryBalances.AddAsync(balance);
            }
            else
            {
                balance.QuantityInPieces += totalPieces;
            }

            // 2. Record Stock Transaction Audit
            await _context.InventoryTransactions.AddAsync(new InventoryTransaction
            {
                TransactionNumber = $"{invoiceNumber}-{product.Sku}",
                ProductId = itemReq.ProductId,
                WarehouseId = warehouseId,
                TransactionType = InventoryTransactionType.PurchaseReceipt,
                QuantityInPieces = totalPieces,
                UnitCost = itemReq.UnitPricePerCarton / unitsPerCarton,
                SourceType = "PurchaseInvoice",
                SourceId = invoice.Id,
                UserId = userId,
                TransactionDate = request.InvoiceDate,
                Notes = $"فاتورة شراء رقم {invoiceNumber}"
            });
        }

        invoice.Subtotal = invoiceTotal;
        invoice.Total = invoiceTotal;
        invoice.PaidAmount = Math.Min(request.PaidAmount, invoiceTotal);

        await _context.PurchaseInvoices.AddAsync(invoice);

        // 3. Update Supplier Balance (credit increases debt)
        var remainingCreditDebt = invoice.Total - invoice.PaidAmount;
        supplier.CurrentBalance += remainingCreditDebt;

        // 4. Create Strictly Balanced Double-Entry Accounting Entry
        var inventoryAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "10301")
            ?? await _context.Accounts.FirstAsync(a => a.AccountType == AccountType.Asset);

        var apAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "20101")
            ?? await _context.Accounts.FirstAsync(a => a.AccountType == AccountType.Liability);

        var cashAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "10101")
            ?? await _context.Accounts.FirstAsync(a => a.AccountType == AccountType.Asset);

        var journalEntry = new JournalEntry
        {
            EntryNumber = $"JE-PUR-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
            EntryDate = request.InvoiceDate,
            Description = $"قيد فاتورة شراء رقم {invoiceNumber} من المورد {supplier.Name}",
            SourceType = "PurchaseInvoice",
            SourceId = invoice.Id,
            Status = DocumentStatus.Approved,
            ApprovedBy = userId,
            ApprovedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        // Debit: Inventory Account (Assets increase)
        journalEntry.Lines.Add(new JournalEntryLine
        {
            AccountId = inventoryAccount.Id,
            Debit = invoice.Total,
            Credit = 0,
            Description = $"زيادة مخزون البضائع بموجب فاتورة شراء {invoiceNumber}",
            SupplierId = supplier.Id
        });

        // Credit: Accounts Payable (Liability increases for remaining debt)
        if (remainingCreditDebt > 0)
        {
            journalEntry.Lines.Add(new JournalEntryLine
            {
                AccountId = apAccount.Id,
                Debit = 0,
                Credit = remainingCreditDebt,
                Description = $"مستحق للمورد {supplier.Name} فاتورة {invoiceNumber}",
                SupplierId = supplier.Id
            });
        }

        // Credit: Cashbox (Assets decrease for cash paid)
        if (invoice.PaidAmount > 0)
        {
            journalEntry.Lines.Add(new JournalEntryLine
            {
                AccountId = cashAccount.Id,
                Debit = 0,
                Credit = invoice.PaidAmount,
                Description = $"سداد نقدي من الصندوق لفاتورة شراء {invoiceNumber}",
                SupplierId = supplier.Id
            });

            // Update default cashbox balance & record cash transaction
            var cashbox = await _context.Cashboxes.FirstOrDefaultAsync(c => c.IsActive);
            if (cashbox != null)
            {
                cashbox.CurrentBalance -= invoice.PaidAmount;
                await _context.CashTransactions.AddAsync(new CashTransaction
                {
                    TransactionNumber = $"CSH-OUT-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
                    CashboxId = cashbox.Id,
                    TransactionType = VoucherType.Payment,
                    Amount = invoice.PaidAmount,
                    TransactionDate = request.InvoiceDate,
                    ReferenceType = "PurchaseInvoice",
                    ReferenceId = invoice.Id,
                    Description = $"سداد فاتورة شراء رقم {invoiceNumber}",
                    CreatedBy = userId
                });
            }
        }

        await _context.JournalEntries.AddAsync(journalEntry);
        await _context.SaveChangesAsync();
        await dbTransaction.CommitAsync();

        return invoice.Id;
    }
}

