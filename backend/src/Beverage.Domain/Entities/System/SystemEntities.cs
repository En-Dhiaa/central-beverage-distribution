using Beverage.Domain.Common;
using Beverage.Domain.Entities.Identity;
using Beverage.Domain.Enums;

namespace Beverage.Domain.Entities.System;

public class FixedAsset : AuditableEntity
{
    public string AssetCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty; // سيارة دينا، ثلاجة عرض، كمبروسر تبريد
    public string? Description { get; set; }
    public Guid? ImageId { get; set; }
    public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;
    public decimal PurchaseCost { get; set; }
    public decimal CurrentValue { get; set; }
    public string? Location { get; set; }
    public string? AssignedTo { get; set; }
    public string Status { get; set; } = "Active"; // Active, InMaintenance, Retired
}

public class Notification : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType NotificationType { get; set; } = NotificationType.System;
    public NotificationPriority Priority { get; set; } = NotificationPriority.Medium;
    public string? ReferenceType { get; set; }
    public Guid? ReferenceId { get; set; }

    public ICollection<UserNotification> UserNotifications { get; set; } = new List<UserNotification>();
}

public class UserNotification : BaseEntity
{
    public Guid NotificationId { get; set; }
    public Notification? Notification { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
}

public class StoredFile : AuditableEntity
{
    public string OriginalName { get; set; } = string.Empty;
    public string StoredName { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string StoragePath { get; set; } = string.Empty;
    public string? Checksum { get; set; }
}

public class DocumentTemplate : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty; // SalesInvoice, PurchaseInvoice, Receipt, Settlement
    public string TemplateConfigurationJson { get; set; } = "{}";
    public bool IsDefault { get; set; }
}

public class DocumentShare : BaseEntity
{
    public string DocumentType { get; set; } = string.Empty;
    public Guid DocumentId { get; set; }
    public string ShareTokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public bool IsValid => RevokedAt == null && DateTime.UtcNow < ExpiresAt;
}

public class SystemSetting : BaseEntity
{
    public string SettingKey { get; set; } = string.Empty;
    public string SettingValue { get; set; } = string.Empty;
    public string SettingGroup { get; set; } = "General"; // General, Branding, Finance, Inventory
    public Guid? UpdatedBy { get; set; }
}

public class AuditLog : BaseEntity
{
    public Guid? UserId { get; set; }
    public string Action { get; set; } = string.Empty; // Create, Update, Delete, Approve, Settle
    public string Module { get; set; } = string.Empty; // Sales, Purchasing, Inventory, Finance
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string? OldValuesJson { get; set; }
    public string? NewValuesJson { get; set; }
    public string? IpAddress { get; set; }
}

public class BackupJob : AuditableEntity
{
    public string BackupType { get; set; } = "Full"; // Full, DatabaseOnly
    public string Destination { get; set; } = "Local";
    public string FilePath { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string Status { get; set; } = "InProgress"; // InProgress, Success, Failed
    public string? Checksum { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }
}

