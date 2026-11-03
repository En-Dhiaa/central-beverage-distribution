using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Beverage.Domain.Entities.Sales;
using Beverage.Domain.Enums;
using Beverage.Infrastructure.Data;

namespace Beverage.Infrastructure.Services;

public class QuotationService : IQuotationService
{
    private readonly BeverageDbContext _context;
    private readonly ISalesService _salesService;

    public QuotationService(BeverageDbContext context, ISalesService salesService)
    {
        _context = context;
        _salesService = salesService;
    }

    public async Task<List<QuotationDto>> GetQuotationsAsync()
    {
        var quotations = await _context.Quotations
            .Include(q => q.Customer)
            .Include(q => q.Items)
                .ThenInclude(i => i.Product)
            .OrderByDescending(q => q.QuotationDate)
            .ToListAsync();

        return quotations.Select(MapToDto).ToList();
    }

    public async Task<QuotationDto?> GetQuotationByIdAsync(Guid id)
    {
        var q = await _context.Quotations
            .Include(x => x.Customer)
            .Include(x => x.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(x => x.Id == id);

        return q == null ? null : MapToDto(q);
    }

    public async Task<QuotationDto> CreateQuotationAsync(CreateQuotationRequest request, Guid userId)
    {
        var customer = await _context.Customers.FindAsync(request.CustomerId)
            ?? throw new InvalidOperationException("العميل غير موجود.");

        var count = await _context.Quotations.CountAsync() + 1;
        var quotationNumber = $"QT-{DateTime.UtcNow:yyyyMM}-{count:D4}";

        var quotation = new Quotation
        {
            Id = Guid.NewGuid(),
            QuotationNumber = quotationNumber,
            CustomerId = customer.Id,
            QuotationDate = request.QuotationDate,
            ValidUntil = request.ValidUntil,
            Status = "Active",
            Notes = request.Notes,
            TermsAndConditions = request.TermsAndConditions,
            CreatedBy = userId
        };

        decimal subtotal = 0;
        decimal discount = 0;

        foreach (var itemReq in request.Items)
        {
            var product = await _context.Products.FindAsync(itemReq.ProductId)
                ?? throw new InvalidOperationException("أحد الأصناف غير موجود.");

            var itemSubtotal = (itemReq.QuantityCartons * itemReq.UnitPricePerCarton) +
                               (itemReq.QuantityPieces * (itemReq.UnitPricePerCarton / (product.UnitsPerCarton > 0 ? product.UnitsPerCarton : 1)));

            var lineTotal = itemSubtotal - itemReq.Discount;
            subtotal += itemSubtotal;
            discount += itemReq.Discount;

            quotation.Items.Add(new QuotationItem
            {
                Id = Guid.NewGuid(),
                QuotationId = quotation.Id,
                ProductId = product.Id,
                QuantityCartons = itemReq.QuantityCartons,
                QuantityPieces = itemReq.QuantityPieces,
                UnitPricePerCarton = itemReq.UnitPricePerCarton,
                Discount = itemReq.Discount,
                Total = lineTotal
            });
        }

        quotation.Subtotal = subtotal;
        quotation.Discount = discount;
        quotation.Total = subtotal - discount;

        _context.Quotations.Add(quotation);
        await _context.SaveChangesAsync();

        return (await GetQuotationByIdAsync(quotation.Id))!;
    }

    public async Task<Guid> ConvertToInvoiceAsync(Guid quotationId, Guid userId)
    {
        var quotation = await _context.Quotations
            .Include(q => q.Items)
            .FirstOrDefaultAsync(q => q.Id == quotationId)
            ?? throw new InvalidOperationException("عرض السعر غير موجود.");

        if (quotation.Status == "Converted" && quotation.ConvertedSalesInvoiceId.HasValue)
        {
            return quotation.ConvertedSalesInvoiceId.Value;
        }

        // Convert into SalesInvoice via SalesService
        var saleRequest = new CreateSalesInvoiceRequest(
            CustomerId: quotation.CustomerId,
            DistributorId: null,
            WarehouseId: null,
            InvoiceDate: DateTime.UtcNow,
            PaymentMethod: "Credit",
            PaidAmount: 0,
            DueDate: quotation.ValidUntil,
            Notes: $"فاتورة مبيعات محولة آلياً من عرض السعر رقم {quotation.QuotationNumber}",
            Items: quotation.Items.Select(i => new SalesInvoiceItemRequest(
                ProductId: i.ProductId,
                QuantityCartons: i.QuantityCartons,
                QuantityPieces: i.QuantityPieces,
                UnitPricePerCarton: i.UnitPricePerCarton,
                Discount: i.Discount
            )).ToList()
        );

        var invoiceId = await _salesService.CreateSalesInvoiceAsync(saleRequest, userId);

        quotation.Status = "Converted";
        quotation.ConvertedSalesInvoiceId = invoiceId;
        await _context.SaveChangesAsync();

        return invoiceId;
    }

    private static QuotationDto MapToDto(Quotation q)
    {
        return new QuotationDto(
            q.Id,
            q.QuotationNumber,
            q.QuotationDate,
            q.ValidUntil,
            q.CustomerId,
            q.Customer?.Name ?? "عميل غير محدد",
            q.Customer?.Phone,
            q.Customer?.Area,
            q.Subtotal,
            q.Discount,
            q.Total,
            q.Status,
            q.ConvertedSalesInvoiceId,
            q.Notes,
            q.TermsAndConditions,
            q.Items.Select(i => new QuotationItemDto(
                i.Id,
                i.ProductId,
                i.Product?.Name ?? "صنف غير معروف",
                i.QuantityCartons,
                i.QuantityPieces,
                i.UnitPricePerCarton,
                i.Discount,
                i.Total
            )).ToList()
        );
    }
}
