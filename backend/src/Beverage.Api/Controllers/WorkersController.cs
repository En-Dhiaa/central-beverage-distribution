using System.Security.Claims;
using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Beverage.Api.Controllers;

[ApiController]
[Route("api/v1/workers")]
[Authorize]
public class WorkersController : ControllerBase
{
    private readonly IWorkerService _workerService;

    public WorkersController(IWorkerService workerService)
    {
        _workerService = workerService;
    }

    [HttpGet]
    public async Task<IActionResult> GetWorkers()
    {
        var workers = await _workerService.GetWorkersAsync();
        return Ok(workers);
    }

    [HttpPost]
    public async Task<IActionResult> CreateWorker([FromBody] CreateWorkerRequest request)
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var userId);

            var worker = await _workerService.CreateWorkerAsync(request, userId);
            return Ok(worker);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("salaries")]
    public async Task<IActionResult> PaySalary([FromBody] PayWorkerSalaryRequest request)
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var userId);

            var id = await _workerService.PayWorkerSalaryAsync(request, userId);
            return Ok(new { id, message = "تم صرف راتب العامل وتسجيل قيد المحاسبة بنجاح." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("salaries")]
    public async Task<IActionResult> GetSalaryVouchers()
    {
        var vouchers = await _workerService.GetSalaryVouchersAsync();
        return Ok(vouchers);
    }
}

