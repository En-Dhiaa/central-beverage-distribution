using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Beverage.Domain.Enums;
using Beverage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Beverage.Infrastructure.Services;

public class ActivityService : IActivityService
{
    private readonly BeverageDbContext _context;

    public ActivityService(BeverageDbContext context)
    {
        _context = context;
    }

    public async Task<List<ActivityLogItemDto>> GetDailyActivityLogAsync(DateTime? fromDate = null, DateTime? toDate = null)
    {
        var start = fromDate?.Date ?? DateTime.UtcNow.AddDays(-7).Date;
        var end = (toDate?.Date ?? DateTime.UtcNow.Date).AddDays(1).AddTicks(-1);

        var list = new List<ActivityLogItemDto>();

        // 1. Sales Invoices
        var sales = await _context.SalesInvoices
            .Include(s => s.Customer)
            .Where(s => s.InvoiceDate >= start && s.InvoiceDate <= end)
            .OrderByDescending(s => s.InvoiceDate)
            .Take(50)
            .ToListAsync();

        foreach (var s in sales)
        {
            list.Add(new ActivityLogItemDto(
                s.InvoiceDate,
                "المبيعات",
                s.PaymentMethod == PaymentMethod.Cash ? "بيع نقدي" : "بيع آجل",
                s.InvoiceNumber,
                $"فاتورة مبيعات للعميل: {s.Customer?.Name ?? "عميل نقدي"}",
                s.Total,
                "المبيعات",
                s.Status.ToString()
            ));
        }

        // 2. Purchases
        var purchases = await _context.PurchaseInvoices
            .Include(p => p.Supplier)
            .Where(p => p.InvoiceDate >= start && p.InvoiceDate <= end)
            .OrderByDescending(p => p.InvoiceDate)
            .Take(50)
            .ToListAsync();

        foreach (var p in purchases)
        {
            list.Add(new ActivityLogItemDto(
                p.InvoiceDate,
                "المشتريات",
                "فاتورة شراء وتوريد",
                p.InvoiceNumber,
                $"توريد بضاعة من المورد: {p.Supplier?.Name ?? "مورد"}",
                p.Total,
                "المشتريات",
                p.Status.ToString()
            ));
        }

        // 3. Distributor Dispatches (تسليم عهد)
        var dispatches = await _context.DistributorDispatches
            .Include(d => d.Distributor)
            .Where(d => d.DispatchDate >= start && d.DispatchDate <= end)
            .OrderByDescending(d => d.DispatchDate)
            .Take(50)
            .ToListAsync();

        foreach (var d in dispatches)
        {
            list.Add(new ActivityLogItemDto(
                d.DispatchDate,
                "الموزعين والعهد",
                "تسليم عهدة بضاعة",
                d.DispatchNumber,
                $"تسليم عهدة توزيع صباحية للموزع: {d.Distributor?.Name}",
                d.TotalAgreedValue,
                "أمين الثلاجة",
                d.Status.ToString()
            ));
        }

        // 4. Distributor Settlements (تسويات العهد)
        var settlements = await _context.DistributorSettlements
            .Include(s => s.Distributor)
            .Where(s => s.BusinessDate >= start && s.BusinessDate <= end)
            .OrderByDescending(s => s.BusinessDate)
            .Take(50)
            .ToListAsync();

        foreach (var s in settlements)
        {
            list.Add(new ActivityLogItemDto(
                s.BusinessDate,
                "الموزعين والعهد",
                "تسوية عهدة يومية",
                s.SettlementNumber,
                $"اعتماد تسوية عهدة الموزع: {s.Distributor?.Name} (تحصيل نقدي: {s.CashCollected:N0})",
                s.CashCollected,
                "المحاسب",
                s.Status.ToString()
            ));
        }

        // 5. Payment Vouchers (سندات القبض والصرف)
        var vouchers = await _context.PaymentVouchers
            .Where(v => v.PaymentDate >= start && v.PaymentDate <= end)
            .OrderByDescending(v => v.PaymentDate)
            .Take(50)
            .ToListAsync();

        foreach (var v in vouchers)
        {
            list.Add(new ActivityLogItemDto(
                v.PaymentDate,
                "المالية والمقبوضات",
                v.VoucherType == VoucherType.Receipt ? "سند قبض" : "سند صرف",
                v.VoucherNumber,
                v.Description ?? $"سند {v.VoucherType}",
                v.Amount,
                "أمين الصندوق",
                v.Status.ToString()
            ));
        }

        // 6. Expenses
        var expenses = await _context.Expenses
            .Include(e => e.Category)
            .Where(e => e.ExpenseDate >= start && e.ExpenseDate <= end)
            .OrderByDescending(e => e.ExpenseDate)
            .Take(50)
            .ToListAsync();

        foreach (var e in expenses)
        {
            list.Add(new ActivityLogItemDto(
                e.ExpenseDate,
                "المصروفات",
                "صرف مصروف تشغيلي",
                e.ExpenseNumber,
                $"{e.Category?.Name ?? "مصروف"}: {e.Description}",
                e.Amount,
                "أمين الصندوق",
                "Approved"
            ));
        }

        // 7. Worker Salaries
        var salaries = await _context.WorkerSalaryVouchers
            .Include(s => s.Worker)
            .Where(s => s.PaymentDate >= start && s.PaymentDate <= end)
            .OrderByDescending(s => s.PaymentDate)
            .Take(50)
            .ToListAsync();

        foreach (var s in salaries)
        {
            list.Add(new ActivityLogItemDto(
                s.PaymentDate,
                "شؤون العمال والرواتب",
                "صرف راتب عامل",
                s.VoucherNumber,
                $"صرف راتب العامل: {s.Worker?.FullName} لشهر {s.Month}/{s.Year}",
                s.NetPaid,
                "إدارة الموارد",
                "Approved"
            ));
        }

        // 8. Daily Closings
        var closings = await _context.DailyClosings
            .Where(c => c.BusinessDate >= start && c.BusinessDate <= end)
            .OrderByDescending(c => c.BusinessDate)
            .Take(20)
            .ToListAsync();

        foreach (var c in closings)
        {
            list.Add(new ActivityLogItemDto(
                c.BusinessDate,
                "الإقفالات المالية",
                "إقفال يومية الصندوق",
                c.ClosingNumber,
                $"إقفال صندوق اليومية (المبلغ الفعلي: {c.ActualCash:N0}، الفارق: {c.CashDifference:N0})",
                c.ActualCash,
                "مسؤول الإقفال",
                c.Status.ToString()
            ));
        }

        return list.OrderByDescending(l => l.Timestamp).ToList();
    }
}
