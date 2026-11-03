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

        var todaySalesList = await _context.SalesInvoices
            .Where(s => s.InvoiceDate >= today && s.InvoiceDate < tomorrow && s.Status == DocumentStatus.Approved)
            .Select(s => s.Total)
            .ToListAsync();
        var todaySales = todaySalesList.Sum();

        var todayPurchasesList = await _context.PurchaseInvoices
            .Where(p => p.InvoiceDate >= today && p.InvoiceDate < tomorrow && p.Status == DocumentStatus.Approved)
            .Select(p => p.Total)
            .ToListAsync();
        var todayPurchases = todayPurchasesList.Sum();

        var todayReceiptsList = await _context.PaymentVouchers
            .Where(v => v.PaymentDate >= today && v.PaymentDate < tomorrow && v.VoucherType == VoucherType.Receipt && v.Status == DocumentStatus.Approved)
            .Select(v => v.Amount)
            .ToListAsync();
        var todayReceipts = todayReceiptsList.Sum();

        var todayExpensesList = await _context.Expenses
            .Where(e => e.ExpenseDate >= today && e.ExpenseDate < tomorrow)
            .Select(e => e.Amount)
            .ToListAsync();
        var todayExpenses = todayExpensesList.Sum();

        // Warehouses Stock
        var mainWh = await _context.Warehouses.FirstOrDefaultAsync(w => w.WarehouseType == WarehouseType.General);
        var coldWh = await _context.Warehouses.FirstOrDefaultAsync(w => w.WarehouseType == WarehouseType.ColdStorage);

        var balances = await _context.InventoryBalances.ToListAsync();
        var mainPieces = mainWh != null ? balances.Where(b => b.WarehouseId == mainWh.Id).Sum(b => b.QuantityInPieces) : 0;
        var coldPieces = coldWh != null ? balances.Where(b => b.WarehouseId == coldWh.Id).Sum(b => b.QuantityInPieces) : 0;

        // Total Custody across all distributors
        var custodyPieces = await _inventoryService.GetDistributorCustodyPiecesAsync(Guid.Empty, Guid.Empty);

        var customerDebtList = await _context.Customers.Where(c => c.IsActive && c.CurrentBalance > 0).Select(c => c.CurrentBalance).ToListAsync();
        var customerDebt = customerDebtList.Sum();

        var supplierDebtList = await _context.Suppliers.Where(s => s.IsActive && s.CurrentBalance > 0).Select(s => s.CurrentBalance).ToListAsync();
        var supplierDebt = supplierDebtList.Sum();

        var cashBalanceList = await _context.Cashboxes.Where(c => c.IsActive).Select(c => c.CurrentBalance).ToListAsync();
        var cashBalance = cashBalanceList.Sum();

        var activeDistributors = await _context.Distributors.CountAsync(d => d.IsActive);
        var activeCustomers = await _context.Customers.CountAsync(c => c.IsActive);

        var activeProducts = await _context.Products.Where(p => p.IsActive).ToListAsync();
        var lowStockAlerts = activeProducts.Count(p =>
            balances.Where(b => b.ProductId == p.Id).Sum(b => b.QuantityInPieces) <= (p.MinStockAlert * p.UnitsPerCarton));

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

