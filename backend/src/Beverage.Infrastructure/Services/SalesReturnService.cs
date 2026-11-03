using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Beverage.Domain.Entities.Sales;
using Beverage.Domain.Entities.Finance;
using Beverage.Domain.Enums;
using Beverage.Infrastructure.Data;

namespace Beverage.Infrastructure.Services;

public class SalesReturnService : ISalesReturnService
{
    private readonly BeverageDbContext _context;

    public SalesReturnService(BeverageDbContext context)
    {
        _context = context;
    }

    public async Task<List<SalesReturnDto>> GetSalesReturnsAsync()
    {
        var returns = await _context.SalesReturns
            .Include(r => r.Customer)
            .Include(r => r.SalesInvoice)
            .Include(r => r.Items)
                .ThenInclude(i => i.Product)
            .OrderByDescending(r => r.ReturnDate)
            .ToListAsync();

        return returns.Select(MapToDto).ToList();
    }

    public async Task<SalesReturnDto> CreateSalesReturnAsync(CreateSalesReturnRequest request, Guid userId)
    {
        var customer = await _context.Customers.FindAsync(request.CustomerId)
            ?? throw new InvalidOperationException("العميل غير موجود.");

        var count = await _context.SalesReturns.CountAsync() + 1;
        var returnNumber = $"RET-{DateTime.UtcNow:yyyyMM}-{count:D4}";

        var salesReturn = new SalesReturn
        {
            Id = Guid.NewGuid(),
            ReturnNumber = returnNumber,
            CustomerId = customer.Id,
            SalesInvoiceId = request.SalesInvoiceId,
            DistributorId = request.DistributorId,
            WarehouseId = request.WarehouseId != Guid.Empty ? request.WarehouseId : new Guid("00000000-0000-0000-0000-000000000002"), // Default to cold storage
            ReturnDate = request.ReturnDate,
            ReturnType = request.ReturnType == "Damaged" ? ReturnType.Damaged : ReturnType.Resellable,
            Reason = request.Reason,
            Status = DocumentStatus.Approved,
            ApprovedBy = userId,
            ApprovedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        decimal totalReturn = 0;

        foreach (var itemReq in request.Items)
        {
            var product = await _context.Products.FindAsync(itemReq.ProductId)
                ?? throw new InvalidOperationException("أحد الأصناف غير موجود.");

            var lineTotal = itemReq.TotalPieces * itemReq.UnitPrice;
            totalReturn += lineTotal;

            salesReturn.Items.Add(new SalesReturnItem
            {
                Id = Guid.NewGuid(),
                SalesReturnId = salesReturn.Id,
                ProductId = product.Id,
                TotalPieces = itemReq.TotalPieces,
                UnitPrice = itemReq.UnitPrice,
                Total = lineTotal,
                Reason = itemReq.Reason ?? request.Reason
            });

            // Re-stock inventory if resellable
            if (salesReturn.ReturnType == ReturnType.Resellable)
            {
                var stock = await _context.InventoryBalances
                    .FirstOrDefaultAsync(s => s.WarehouseId == salesReturn.WarehouseId && s.ProductId == product.Id);

                if (stock != null)
                {
                    stock.QuantityInPieces += itemReq.TotalPieces;
                }
            }
        }

        salesReturn.Total = totalReturn;

        // Reduce customer balance
        customer.CurrentBalance -= totalReturn;

        // Post Journal Entry: Debit Sales Returns (420000), Credit Customer Receivables (112000)
        var returnAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "420000" || a.AccountCode == "410000")
            ?? await _context.Accounts.FirstAsync();
        var arAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "112000")
            ?? await _context.Accounts.FirstAsync();

        var entryNumber = $"JE-RET-{DateTime.UtcNow:yyyyMM}-{count:D4}";
        var je = new JournalEntry
        {
            Id = Guid.NewGuid(),
            EntryNumber = entryNumber,
            EntryDate = DateTime.UtcNow,
            Description = $"مردودات مبيعات من العميل {customer.Name} بموجب إشعار {returnNumber}",
            SourceType = "SalesReturn",
            SourceId = salesReturn.Id,
            CreatedBy = userId
        };

        je.Lines.Add(new JournalEntryLine
        {
            Id = Guid.NewGuid(),
            JournalEntryId = je.Id,
            AccountId = returnAccount.Id,
            Debit = totalReturn,
            Credit = 0,
            Description = $"مردودات مبيعات - {customer.Name}"
        });

        je.Lines.Add(new JournalEntryLine
        {
            Id = Guid.NewGuid(),
            JournalEntryId = je.Id,
            AccountId = arAccount.Id,
            Debit = 0,
            Credit = totalReturn,
            Description = $"تخفيض ذمة العميل - {customer.Name}"
        });

        _context.SalesReturns.Add(salesReturn);
        _context.JournalEntries.Add(je);
        await _context.SaveChangesAsync();

        return MapToDto(salesReturn);
    }

    private static SalesReturnDto MapToDto(SalesReturn r)
    {
        return new SalesReturnDto(
            r.Id,
            r.ReturnNumber,
            r.ReturnDate,
            r.CustomerId,
            r.Customer?.Name ?? "عميل غير محدد",
            r.SalesInvoiceId,
            r.SalesInvoice?.InvoiceNumber,
            r.Total,
            r.ReturnType.ToString(),
            r.Reason,
            r.Status.ToString(),
            r.Items.Select(i => new SalesReturnItemDto(
                i.ProductId,
                i.Product?.Name ?? "صنف غير محدد",
                i.TotalPieces,
                i.UnitPrice,
                i.Total,
                i.Reason
            )).ToList()
        );
    }
}
