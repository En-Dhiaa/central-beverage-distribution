using System.Security.Claims;
using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Beverage.Api.Controllers;

[ApiController]
[Route("api/v1/customers/quotations")]
[Authorize]
public class QuotationsController : ControllerBase
{
    private readonly IQuotationService _quotationService;

    public QuotationsController(IQuotationService quotationService)
    {
        _quotationService = quotationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetQuotations()
    {
        var list = await _quotationService.GetQuotationsAsync();
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetQuotationById(Guid id)
    {
        var q = await _quotationService.GetQuotationByIdAsync(id);
        if (q == null) return NotFound(new { message = "عرض السعر غير موجود." });
        return Ok(q);
    }

    [HttpPost]
    public async Task<IActionResult> CreateQuotation([FromBody] CreateQuotationRequest request)
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var userId);

            var q = await _quotationService.CreateQuotationAsync(request, userId);
            return Ok(q);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/convert-to-invoice")]
    public async Task<IActionResult> ConvertToInvoice(Guid id)
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var userId);

            var invoiceId = await _quotationService.ConvertToInvoiceAsync(id, userId);
            return Ok(new { invoiceId, message = "تم تحويل عرض السعر إلى فاتورة مبيعات معتمدة بنجاح." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

