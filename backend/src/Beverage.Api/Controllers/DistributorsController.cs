using System.Security.Claims;
using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Beverage.Api.Controllers;

[ApiController]
[Route("api/v1/distributors")]
[Authorize]
public class DistributorsController : ControllerBase
{
    private readonly IDistributorService _distributorService;

    public DistributorsController(IDistributorService distributorService)
    {
        _distributorService = distributorService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDistributors()
    {
        var distributors = await _distributorService.GetDistributorsAsync();
        return Ok(distributors);
    }

    [HttpPost]
    public async Task<IActionResult> CreateDistributor([FromBody] CreateDistributorRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdStr, out var userId);

        var distributor = await _distributorService.CreateDistributorAsync(request, userId);
        return Ok(distributor);
    }

    [HttpPost("dispatch")]
    public async Task<IActionResult> DispatchToDistributor([FromBody] CreateDistributorDispatchRequest request)
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var userId);

            var id = await _distributorService.DispatchToDistributorAsync(request, userId);
            return Ok(new { id, message = "تم تسليم البضاعة كعهدة للموزع وخصمها من الثلاجة بنجاح." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("settle")]
    public async Task<IActionResult> SettleDistributor([FromBody] CreateDistributorSettlementRequest request)
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var userId);

            var id = await _distributorService.SettleDistributorAsync(request, userId);
            return Ok(new { id, message = "تم اعتماد تسوية عهدة الموزع ومطابقة الفروقات وتحديث الحسابات بنجاح." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

