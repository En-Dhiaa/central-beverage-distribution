using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Beverage.Domain.Entities.Warehouses;
using Beverage.Domain.Enums;
using Beverage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Beverage.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly BeverageDbContext _context;
    private readonly IInventoryService _inventoryService;

    public DashboardService(BeverageDbContext context, IInventoryService inventoryService)
    {
        _context = context;
        _inventoryService = inventoryService;
    }

    public async Task<DashboardMetricsDto> GetMetricsAsync()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var todaySales = await _context.SalesInvoices
            .Where(s => s.InvoiceDate >= today && s.InvoiceDate < tomorrow && s.Status == DocumentStatus.Approved)
            .SumAsync(s => s.Total);

        var todayPurchases = await _context.PurchaseInvoices
            .Where(p => p.InvoiceDate >= today && p.InvoiceDate < tomorrow && p.Status == DocumentStatus.Approved)
            .SumAsync(p => p.Total);

        var todayReceipts = await _context.PaymentVouchers
            .Where(v => v.PaymentDate >= today && v.PaymentDate < tomorrow && v.VoucherType == VoucherType.Receipt && v.Status == DocumentStatus.Approved)
            .SumAsync(v => v.Amount);

        var todayExpenses = await _context.Expenses
            .Where(e => e.ExpenseDate >= today && e.ExpenseDate < tomorrow)
            .SumAsync(e => e.Amount);

        // Warehouses Stock
        var mainWh = await _context.Warehouses.FirstOrDefaultAsync(w => w.WarehouseType == WarehouseType.General);
        var coldWh = await _context.Warehouses.FirstOrDefaultAsync(w => w.WarehouseType == WarehouseType.ColdStorage);

        var balances = await _context.InventoryBalances.ToListAsync();
        var mainPieces = mainWh != null ? balances.Where(b => b.WarehouseId == mainWh.Id).Sum(b => b.QuantityInPieces) : 0;
        var coldPieces = coldWh != null ? balances.Where(b => b.WarehouseId == coldWh.Id).Sum(b => b.QuantityInPieces) : 0;

        // Total Custody across all distributors
        var custodyPieces = await _inventoryService.GetDistributorCustodyPiecesAsync(Guid.Empty, Guid.Empty);

        var customerDebt = await _context.Customers.Where(c => c.IsActive && c.CurrentBalance > 0).SumAsync(c => c.CurrentBalance);
        var supplierDebt = await _context.Suppliers.Where(s => s.IsActive && s.CurrentBalance > 0).SumAsync(s => s.CurrentBalance);
        var cashBalance = await _context.Cashboxes.Where(c => c.IsActive).SumAsync(c => c.CurrentBalance);

        var activeDistributors = await _context.Distributors.CountAsync(d => d.IsActive);
        var activeCustomers = await _context.Customers.CountAsync(c => c.IsActive);

        var lowStockAlerts = await _context.Products
            .Where(p => p.IsActive)
            .CountAsync(p => _context.InventoryBalances.Where(b => b.ProductId == p.Id).Sum(b => b.QuantityInPieces) <= (p.MinStockAlert * p.UnitsPerCarton));

        return new DashboardMetricsDto(
            todaySales,
            todayPurchases,
            todayReceipts,
            todayExpenses,
            mainPieces,
            coldPieces,
            custodyPieces,
            customerDebt,
            supplierDebt,
            cashBalance,
            activeDistributors,
            activeCustomers,
            lowStockAlerts
        );
    }
}
