using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Beverage.Api.Controllers;

public record RestoreBackupRequest(string FileName);

[ApiController]
[Route("api/v1/database")]
[Authorize(Roles = "SuperAdmin")]
public class DatabaseController : ControllerBase
{
    private readonly IDatabaseService _databaseService;

    public DatabaseController(IDatabaseService databaseService)
    {
        _databaseService = databaseService;
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var status = await _databaseService.GetStatusAsync();
        return Ok(status);
    }

    [HttpPost("backup")]
    public async Task<IActionResult> CreateBackup()
    {
        try
        {
            var fileName = await _databaseService.CreateBackupAsync();
            return Ok(new { fileName, message = "تم إنشاء نسخة احتياطية مشفرة لقاعدة البيانات بنجاح في مجلد backups." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("restore")]
    public async Task<IActionResult> RestoreBackup([FromBody] RestoreBackupRequest request)
    {
        try
        {
            var success = await _databaseService.RestoreBackupAsync(request.FileName);
            return Ok(new { success, message = "تمت استعادة النسخة الاحتياطية بنجاح." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("vacuum")]
    public async Task<IActionResult> Vacuum()
    {
        var success = await _databaseService.VacuumDatabaseAsync();
        return Ok(new { success, message = "تم ضغط وترتيب مساحة قاعدة البيانات وإعادة بناء الفهارس بنجاح." });
    }
}
