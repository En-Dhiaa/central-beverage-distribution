using System.Security.Claims;
using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Beverage.Api.Controllers;

[ApiController]
[Route("api/v1/finance")]
[Authorize]
public class FinanceController : ControllerBase
{
    private readonly IFinanceService _financeService;

    public FinanceController(IFinanceService financeService)
    {
        _financeService = financeService;
    }

    [HttpGet("cashboxes")]
    public async Task<IActionResult> GetCashboxes()
    {
        var boxes = await _financeService.GetCashboxesAsync();
        return Ok(boxes);
    }

    [HttpPost("vouchers")]
    public async Task<IActionResult> CreatePaymentVoucher([FromBody] PaymentVoucherRequest request)
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var userId);

            var id = await _financeService.CreatePaymentVoucherAsync(request, userId);
            return Ok(new { id, message = "تم حفظ سند القبض/الصرف وتحديث الصندوق والحسابات بنجاح." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("expenses")]
    public async Task<IActionResult> CreateExpense([FromBody] ExpenseRequest request)
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var userId);

            var id = await _financeService.CreateExpenseAsync(request, userId);
            return Ok(new { id, message = "تم تسجيل المصروف وصرفه من الصندوق بنجاح." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("journal")]
    public async Task<IActionResult> GetJournalEntries()
    {
        var entries = await _financeService.GetJournalEntriesAsync();
        return Ok(entries);
    }

    [HttpGet("daily-closing/summary")]
    public async Task<IActionResult> GetDailyClosingSummary([FromQuery] string? date)
    {
        var targetDate = DateTime.UtcNow.Date;
        if (!string.IsNullOrEmpty(date) && DateTime.TryParse(date, System.Globalization.CultureInfo.InvariantCulture, out var parsed))
        {
            targetDate = parsed.Date;
        }

        var summary = await _financeService.GetDailyClosingSummaryAsync(targetDate);
        return Ok(summary);
    }

    [HttpPost("daily-closing")]
    public async Task<IActionResult> SubmitDailyClosing([FromBody] CreateDailyClosingRequest request)
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var userId);

            var id = await _financeService.SubmitDailyClosingAsync(request, userId);
            return Ok(new { id, message = "تم اعتماد إغلاق اليومية بنجاح وقفل العمليات." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("daily-closing/history")]
    public async Task<IActionResult> GetDailyClosingHistory()
    {
        var closings = await _financeService.GetDailyClosingsAsync();
        return Ok(closings);
    }

    [HttpGet("debt-aging")]
    public async Task<IActionResult> GetCustomerDebtAging()
    {
        var list = await _financeService.GetCustomerDebtAgingAsync();
        return Ok(list);
    }

    [HttpGet("period-closings")]
    public async Task<IActionResult> GetPeriodClosings()
    {
        var list = await _financeService.GetPeriodClosingsAsync();
        return Ok(list);
    }

    [HttpPost("period-closings")]
    public async Task<IActionResult> CreatePeriodClosing([FromBody] CreatePeriodClosingRequest request)
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var userId);

            var id = await _financeService.CreatePeriodClosingAsync(request, userId);
            return Ok(new { id, message = "تم اعتماد الإقفال الدوري بنجاح وقفل الفترة المحاسبية." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
