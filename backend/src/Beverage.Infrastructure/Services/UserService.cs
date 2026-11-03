using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Beverage.Domain.Entities.Identity;
using Beverage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Beverage.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly BeverageDbContext _context;

    public UserService(BeverageDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserDto>> GetUsersAsync()
    {
        return await _context.Users
            .Include(u => u.Role)
            .OrderBy(u => u.Username)
            .Select(u => new UserDto(
                u.Id,
                u.Username,
                u.FullName,
                u.Email,
                u.Phone,
                u.Role != null ? u.Role.Name : "User",
                u.RoleId,
                u.IsActive,
                u.CreatedAt
            ))
            .ToListAsync();
    }

    public async Task<UserDto> CreateUserAsync(CreateUserRequest request)
    {
        var normalized = request.Username.Trim().ToUpperInvariant();
        if (await _context.Users.AnyAsync(u => u.NormalizedUsername == normalized))
            throw new InvalidOperationException("اسم المستخدم مستخدم بالفعل في النظام.");

        var role = await _context.Roles.FindAsync(request.RoleId)
            ?? throw new InvalidOperationException("الدور الوظيفي المحدد غير موجود.");

        var user = new User
        {
            Username = request.Username.Trim(),
            NormalizedUsername = normalized,
            FullName = request.FullName.Trim(),
            Email = request.Email?.Trim(),
            Phone = request.Phone?.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = role.Id,
            IsActive = true
        };

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        return new UserDto(
            user.Id,
            user.Username,
            user.FullName,
            user.Email,
            user.Phone,
            role.Name,
            role.Id,
            user.IsActive,
            user.CreatedAt
        );
    }

    public async Task<bool> ToggleUserStatusAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId)
            ?? throw new InvalidOperationException("المستخدم غير موجود.");

        if (user.Username.Equals("admin", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("لا يمكن تعطيل حساب المسؤول العام الرئيسي للنظام.");

        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync();
        return user.IsActive;
    }

    public async Task<List<RoleDto>> GetRolesAsync()
    {
        return await _context.Roles
            .OrderBy(r => r.Name)
            .Select(r => new RoleDto(r.Id, r.Name, r.Description ?? ""))
            .ToListAsync();
    }
}

