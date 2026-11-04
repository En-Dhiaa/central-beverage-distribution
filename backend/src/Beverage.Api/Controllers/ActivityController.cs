using Beverage.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Beverage.Api.Controllers;

[ApiController]
[Route("api/v1/activity")]
[Authorize]
public class ActivityController : ControllerBase
{
    private readonly IActivityService _activityService;

    public ActivityController(IActivityService activityService)
    {
        _activityService = activityService;
    }

    [HttpGet("daily")]
    public async Task<IActionResult> GetDailyActivity([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
    {
        var log = await _activityService.GetDailyActivityLogAsync(fromDate, toDate);
        return Ok(log);
    }
}

