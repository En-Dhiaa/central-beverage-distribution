using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Beverage.Domain.Entities.Products;
using Beverage.Domain.Entities.Warehouses;
using Beverage.Domain.Enums;
using Beverage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Beverage.Infrastructure.Services;

public class InventoryService : IInventoryService
{
    private readonly BeverageDbContext _context;

    public InventoryService(BeverageDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductDto>> GetProductsAsync()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .OrderBy(p => p.Name)
            .ToListAsync();

        var mainWh = await _context.Warehouses.FirstOrDefaultAsync(w => w.WarehouseType == WarehouseType.General);
        var coldWh = await _context.Warehouses.FirstOrDefaultAsync(w => w.WarehouseType == WarehouseType.ColdStorage);

        var list = new List<ProductDto>();
        foreach (var p in products)
        {
            var balances = await _context.InventoryBalances
                .Where(b => b.ProductId == p.Id)
                .ToListAsync();

            var mainPieces = mainWh != null ? balances.Where(b => b.WarehouseId == mainWh.Id).Sum(b => b.QuantityInPieces) : 0;
            var coldPieces = coldWh != null ? balances.Where(b => b.WarehouseId == coldWh.Id).Sum(b => b.QuantityInPieces) : 0;
            var totalPieces = balances.Sum(b => b.QuantityInPieces);

            // Distributor custody is calculated from dispatches minus settled/sold
            var custodyPieces = await GetDistributorCustodyPiecesAsync(Guid.Empty, p.Id);

            list.Add(new ProductDto(
                Id: p.Id,
                Sku: p.Sku,
                Barcode: p.Barcode,
                Name: p.Name,
                NameEn: p.NameEn,
                CategoryId: p.CategoryId,
                CategoryName: p.Category?.Name ?? "غير مصنف",
                Manufacturer: p.Manufacturer,
                UnitsPerCarton: p.UnitsPerCarton,
                PurchasePriceCarton: p.DefaultPurchasePriceCarton,
                SalePriceCarton: p.DefaultSalePriceCarton,
                SalePricePiece: p.DefaultSalePricePiece,
                MinStockAlert: p.MinStockAlert,
                TotalStockPieces: totalPieces,
                MainWarehouseCartons: Math.Round(mainPieces / (p.UnitsPerCarton > 0 ? p.UnitsPerCarton : 12), 2),
                ColdStorageCartons: Math.Round(coldPieces / (p.UnitsPerCarton > 0 ? p.UnitsPerCarton : 12), 2),
                DistributorCustodyCartons: Math.Round(custodyPieces / (p.UnitsPerCarton > 0 ? p.UnitsPerCarton : 12), 2),
                IsActive: p.IsActive
            ));
        }

        return list;
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductRequest request, Guid userId)
    {
        var baseUnit = await _context.Units.FirstOrDefaultAsync(u => u.Name == "حبة")
            ?? await _context.Units.FirstAsync();

        var categoryId = request.CategoryId ?? Guid.Empty;
        if (categoryId == Guid.Empty)
        {
            var firstCat = await _context.Categories.FirstOrDefaultAsync();
            if (firstCat != null) categoryId = firstCat.Id;
        }

        var product = new Product
        {
            Sku = request.Sku.Trim().ToUpperInvariant(),
            Barcode = request.Barcode,
            Name = request.Name.Trim(),
            NameEn = request.NameEn?.Trim(),
            CategoryId = categoryId,
            Manufacturer = request.Manufacturer?.Trim(),
            BaseUnitId = baseUnit.Id,
            UnitsPerCarton = request.UnitsPerCarton > 0 ? request.UnitsPerCarton : 12,
            DefaultPurchasePriceCarton = request.DefaultPurchasePriceCarton,
            DefaultSalePriceCarton = request.DefaultSalePriceCarton,
            DefaultSalePricePiece = request.DefaultSalePricePiece,
            MinStockAlert = request.MinStockAlert,
            IsActive = true,
            CreatedBy = userId
        };

        await _context.Products.AddAsync(product);
        await _context.SaveChangesAsync();

        return new ProductDto(
            Id: product.Id,
            Sku: product.Sku,
            Barcode: product.Barcode,
            Name: product.Name,
            NameEn: product.NameEn,
            CategoryId: product.CategoryId,
            CategoryName: "",
            Manufacturer: product.Manufacturer,
            UnitsPerCarton: product.UnitsPerCarton,
            PurchasePriceCarton: product.DefaultPurchasePriceCarton,
            SalePriceCarton: product.DefaultSalePriceCarton,
            SalePricePiece: product.DefaultSalePricePiece,
            MinStockAlert: product.MinStockAlert,
            TotalStockPieces: 0,
            MainWarehouseCartons: 0,
            ColdStorageCartons: 0,
            DistributorCustodyCartons: 0,
            IsActive: true
        );
    }

    public async Task<bool> TransferStockAsync(StockTransferRequest request, Guid userId)
    {
        if (request.SourceWarehouseId == request.TargetWarehouseId)
            throw new InvalidOperationException("لا يمكن التحويل لنفس المستودع.");

        var product = await _context.Products.FindAsync(request.ProductId)
            ?? throw new InvalidOperationException("المنتج غير موجود.");

        decimal totalPiecesToTransfer = (request.QuantityCartons * product.UnitsPerCarton) + request.QuantityPieces;
        if (totalPiecesToTransfer <= 0)
            throw new InvalidOperationException("الكمية المحولة يجب أن تكون أكبر من الصفر.");

        // Check source stock
        var sourceBalance = await _context.InventoryBalances
            .FirstOrDefaultAsync(b => b.WarehouseId == request.SourceWarehouseId && b.ProductId == request.ProductId);

        if (sourceBalance == null || sourceBalance.AvailableQuantityPieces < totalPiecesToTransfer)
        {
            throw new InvalidOperationException($"الرصيد المتاح في المستودع المصدر غير كافٍ. المتاح: {(sourceBalance?.AvailableQuantityPieces ?? 0)} حبة.");
        }

        // Deduct from Source
        sourceBalance.QuantityInPieces -= totalPiecesToTransfer;

        // Add to Target
        var targetBalance = await _context.InventoryBalances
            .FirstOrDefaultAsync(b => b.WarehouseId == request.TargetWarehouseId && b.ProductId == request.ProductId);

        if (targetBalance == null)
        {
            targetBalance = new InventoryBalance
            {
                WarehouseId = request.TargetWarehouseId,
                ProductId = request.ProductId,
                QuantityInPieces = totalPiecesToTransfer
            };
            await _context.InventoryBalances.AddAsync(targetBalance);
        }
        else
        {
            targetBalance.QuantityInPieces += totalPiecesToTransfer;
        }

        // Record Inventory Transactions for Audit
        var transferDocNumber = $"TRF-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var outTransaction = new InventoryTransaction
        {
            TransactionNumber = $"{transferDocNumber}-OUT",
            ProductId = request.ProductId,
            WarehouseId = request.SourceWarehouseId,
            TransactionType = InventoryTransactionType.TransferOut,
            QuantityOutPieces = totalPiecesToTransfer,
            SourceType = "StockTransfer",
            UserId = userId,
            TransactionDate = DateTime.UtcNow,
            Notes = $"تحويل إلى المستودع المستلم: {request.Notes}"
        };

        var inTransaction = new InventoryTransaction
        {
            TransactionNumber = $"{transferDocNumber}-IN",
            ProductId = request.ProductId,
            WarehouseId = request.TargetWarehouseId,
            TransactionType = InventoryTransactionType.TransferIn,
            QuantityInPieces = totalPiecesToTransfer,
            SourceType = "StockTransfer",
            UserId = userId,
            TransactionDate = DateTime.UtcNow,
            Notes = $"استلام محول من المستودع المصدر: {request.Notes}"
        };

        await _context.InventoryTransactions.AddRangeAsync(outTransaction, inTransaction);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<decimal> GetWarehouseStockPiecesAsync(Guid warehouseId, Guid productId)
    {
        var balance = await _context.InventoryBalances
            .FirstOrDefaultAsync(b => b.WarehouseId == warehouseId && b.ProductId == productId);
        return balance?.QuantityInPieces ?? 0;
    }

    public async Task<decimal> GetDistributorCustodyPiecesAsync(Guid distributorId, Guid productId)
    {
        // Total dispatched to distributor
        var dispatchedQuery = _context.DistributorDispatchItems
            .Include(d => d.DistributorDispatch)
            .Where(i => i.DistributorDispatch!.Status == DocumentStatus.Approved);

        if (productId != Guid.Empty)
        {
            dispatchedQuery = dispatchedQuery.Where(i => i.ProductId == productId);
        }

        if (distributorId != Guid.Empty)
        {
            dispatchedQuery = dispatchedQuery.Where(i => i.DistributorDispatch!.DistributorId == distributorId);
        }

        var dispatchedList = await dispatchedQuery.Select(i => i.TotalPieces).ToListAsync();
        var totalDispatchedPieces = dispatchedList.Sum();

        // Deduct sold & returned via settlements
        var settledQuery = _context.DistributorSettlementItems
            .Include(s => s.DistributorSettlement)
            .Where(s => s.DistributorSettlement!.Status == DocumentStatus.Approved);

        if (productId != Guid.Empty)
        {
            settledQuery = settledQuery.Where(s => s.ProductId == productId);
        }

        if (distributorId != Guid.Empty)
        {
            settledQuery = settledQuery.Where(s => s.DistributorSettlement!.DistributorId == distributorId);
        }

        var settledList = await settledQuery
            .Select(s => s.SoldQuantityPieces + s.ReturnedQuantityPieces + s.DamagedQuantityPieces + s.ShortageQuantityPieces)
            .ToListAsync();
        var totalSettledOffPieces = settledList.Sum();

        return Math.Max(0, totalDispatchedPieces - totalSettledOffPieces);
    }
}

