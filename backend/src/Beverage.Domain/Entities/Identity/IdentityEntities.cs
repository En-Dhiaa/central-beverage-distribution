using Beverage.Domain.Common;
using Beverage.Domain.Enums;

namespace Beverage.Domain.Entities.Identity;

public class User : AuditableEntity
{
    public string Username { get; set; } = string.Empty;
    public string NormalizedUsername { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public Guid? ProfileImageId { get; set; }
    public Guid RoleId { get; set; }
    public Role? Role { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }

    public ICollection<UserSession> Sessions { get; set; } = new List<UserSession>();
    public UserPreference? Preference { get; set; }
}

public class Role : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsSystemRole { get; set; }
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    public ICollection<User> Users { get; set; } = new List<User>();
}

public class Permission : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class RolePermission : BaseEntity
{
    public Guid RoleId { get; set; }
    public Role? Role { get; set; }
    public Guid PermissionId { get; set; }
    public Permission? Permission { get; set; }
}

public class UserSession : BaseEntity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
    public DateTime LastActivityAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public bool IsActive => RevokedAt == null && DateTime.UtcNow < ExpiresAt;
}

public class UserPreference : BaseEntity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string Language { get; set; } = "ar";
    public string Theme { get; set; } = "light";
    public string FontFamily { get; set; } = "Cairo";
    public int FontSize { get; set; } = 14;
    public bool NotificationSoundEnabled { get; set; } = true;
    public int NotificationVolume { get; set; } = 80;
    public string DashboardLayoutJson { get; set; } = "{}";
}
