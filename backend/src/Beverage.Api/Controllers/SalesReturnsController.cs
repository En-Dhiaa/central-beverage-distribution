using System.Security.Claims;
using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Beverage.Api.Controllers;

[ApiController]
[Route("api/v1/customers/sales/returns")]
[Authorize]
public class SalesReturnsController : ControllerBase
{
    private readonly ISalesReturnService _returnService;

    public SalesReturnsController(ISalesReturnService returnService)
    {
        _returnService = returnService;
    }

    [HttpGet]
    public async Task<IActionResult> GetReturns()
    {
        var list = await _returnService.GetSalesReturnsAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> CreateReturn([FromBody] CreateSalesReturnRequest request)
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var userId);

            var ret = await _returnService.CreateSalesReturnAsync(request, userId);
            return Ok(ret);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

