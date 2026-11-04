using System.Security.Claims;
using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Beverage.Api.Controllers;

[ApiController]
[Route("api/v1/settings/company")]
[Authorize]
public class BrandSettingsController : ControllerBase
{
    private readonly IBrandSettingsService _brandService;

    public BrandSettingsController(IBrandSettingsService brandService)
    {
        _brandService = brandService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var profile = await _brandService.GetCompanyProfileAsync();
        return Ok(profile);
    }

    [HttpPut]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateCompanyProfileRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdStr, out var userId);

        var profile = await _brandService.UpdateCompanyProfileAsync(request, userId);
        return Ok(profile);
    }
}
