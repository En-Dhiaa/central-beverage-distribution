using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Beverage.Domain.Entities.Identity;
using Beverage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Beverage.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly BeverageDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(BeverageDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var normalized = request.Username.Trim().ToUpperInvariant();
        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Preference)
            .FirstOrDefaultAsync(u => u.NormalizedUsername == normalized && u.IsActive);

        if (user == null)
            return null;

        bool passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!passwordValid)
            return null;

        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var secret = _configuration["JWT_SECRET"] ?? "super_secret_beverage_management_key_change_in_production_min_32_chars!";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAt = DateTime.UtcNow.AddHours(24);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim("FullName", user.FullName),
            new Claim(ClaimTypes.Role, user.Role?.Name ?? "Admin")
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["JWT_ISSUER"] ?? "BeverageManagementServer",
            audience: _configuration["JWT_AUDIENCE"] ?? "BeverageManagementClient",
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return new LoginResponse(
            Token: tokenString,
            UserId: user.Id,
            Username: user.Username,
            FullName: user.FullName,
            Role: user.Role?.Name ?? "Admin",
            Language: user.Preference?.Language ?? "ar",
            Theme: user.Preference?.Theme ?? "light",
            FontFamily: user.Preference?.FontFamily ?? "Cairo",
            ExpiresAt: expiresAt
        );
    }

    public async Task<UserProfileDto?> GetUserProfileAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Preference)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return null;

        return new UserProfileDto(
            Id: user.Id,
            Username: user.Username,
            FullName: user.FullName,
            Email: user.Email,
            Phone: user.Phone,
            Role: user.Role?.Name ?? "Admin",
            Language: user.Preference?.Language ?? "ar",
            Theme: user.Preference?.Theme ?? "light",
            FontFamily: user.Preference?.FontFamily ?? "Cairo",
            FontSize: user.Preference?.FontSize ?? 14,
            NotificationSoundEnabled: user.Preference?.NotificationSoundEnabled ?? true,
            NotificationVolume: user.Preference?.NotificationVolume ?? 80,
            DashboardLayoutJson: user.Preference?.DashboardLayoutJson ?? "{}"
        );
    }

    public async Task<bool> UpdatePreferencesAsync(Guid userId, UpdatePreferenceRequest request)
    {
        var pref = await _context.UserPreferences.FirstOrDefaultAsync(p => p.UserId == userId);
        if (pref == null)
        {
            pref = new UserPreference { UserId = userId };
            await _context.UserPreferences.AddAsync(pref);
        }

        pref.Language = request.Language;
        pref.Theme = request.Theme;
        pref.FontFamily = request.FontFamily;
        pref.FontSize = request.FontSize;
        pref.NotificationSoundEnabled = request.NotificationSoundEnabled;
        pref.NotificationVolume = request.NotificationVolume;
        pref.DashboardLayoutJson = request.DashboardLayoutJson;
        pref.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }
}
