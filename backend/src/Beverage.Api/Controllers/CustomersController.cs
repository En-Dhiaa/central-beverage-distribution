using System.Security.Claims;
using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Beverage.Api.Controllers;

[ApiController]
[Route("api/v1/customers")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly ISalesService _salesService;

    public CustomersController(ISalesService salesService)
    {
        _salesService = salesService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCustomers()
    {
        var customers = await _salesService.GetCustomersAsync();
        return Ok(customers);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdStr, out var userId);

        var customer = await _salesService.CreateCustomerAsync(request, userId);
        return Ok(customer);
    }

    [HttpGet("{id}/ledger")]
    public async Task<IActionResult> GetCustomerLedger(Guid id)
    {
        var ledger = await _salesService.GetCustomerLedgerAsync(id);
        return Ok(ledger);
    }

    [HttpPost("sales")]
    public async Task<IActionResult> CreateSalesInvoice([FromBody] CreateSalesInvoiceRequest request)
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var userId);

            var id = await _salesService.CreateSalesInvoiceAsync(request, userId);
            return Ok(new { id, message = "تم اعتماد فاتورة المبيعات وتحديث الحسابات والمخزون بنجاح." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("sales/history")]
    public async Task<IActionResult> GetRecentInvoices([FromQuery] int limit = 30)
    {
        var invoices = await _salesService.GetRecentInvoicesAsync(limit);
        return Ok(invoices);
    }

    [HttpGet("sales/{id}/print")]
    public async Task<IActionResult> GetInvoiceForPrint(Guid id)
    {
        var invoice = await _salesService.GetInvoiceForPrintAsync(id);
        if (invoice == null) return NotFound(new { message = "الفاتورة غير موجودة." });
        return Ok(invoice);
    }
}

