using Beverage.Domain.Common;
using Beverage.Domain.Entities.Products;
using Beverage.Domain.Enums;

namespace Beverage.Domain.Entities.Warehouses;

public class Warehouse : AuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty; // المستودع الرئيسي، الثلاجة المركزية...
    public string? Location { get; set; }
    public WarehouseType WarehouseType { get; set; } = WarehouseType.General;
    public bool IsActive { get; set; } = true;

    public ICollection<WarehouseLocation> Locations { get; set; } = new List<WarehouseLocation>();
    public ICollection<InventoryBalance> Balances { get; set; } = new List<InventoryBalance>();
}

public class WarehouseLocation : BaseEntity
{
    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public string Name { get; set; } = string.Empty; // قسم A، رف 1، مساحة التبريد 2
    public string? Description { get; set; }
}

public class InventoryBalance : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public Guid? LocationId { get; set; }
    public WarehouseLocation? Location { get; set; }
    public Guid? BatchId { get; set; }
    public InventoryBatch? Batch { get; set; }

    // Always tracked internally in smallest unit (Pieces / حبات)
    public decimal QuantityInPieces { get; set; }
    public decimal ReservedQuantityInPieces { get; set; }
    public decimal AvailableQuantityInPieces => QuantityInPieces - ReservedQuantityInPieces;
    public decimal AvailableQuantityPieces => AvailableQuantityInPieces;
}

public class InventoryTransaction : BaseEntity
{
    public string TransactionNumber { get; set; } = string.Empty;
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public InventoryTransactionType TransactionType { get; set; }
    
    // Pieces
    public decimal QuantityInPieces { get; set; }
    public decimal QuantityOutPieces { get; set; }
    public decimal UnitCost { get; set; }
    
    public string SourceType { get; set; } = string.Empty; // PurchaseInvoice, Transfer, Dispatch, Sale, Settlement
    public Guid? SourceId { get; set; }
    public Guid? BatchId { get; set; }
    public InventoryBatch? Batch { get; set; }
    public Guid UserId { get; set; }
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
}

public class InventoryBatch : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public string BatchNumber { get; set; } = string.Empty;
    public DateTime? ProductionDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public decimal ReceivedQuantityPieces { get; set; }
    public decimal RemainingQuantityPieces { get; set; }
}

public class StockAdjustment : AuditableEntity
{
    public string AdjustmentNumber { get; set; } = string.Empty;
    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;
    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }

    public ICollection<StockAdjustmentItem> Items { get; set; } = new List<StockAdjustmentItem>();
}

public class StockAdjustmentItem : BaseEntity
{
    public Guid StockAdjustmentId { get; set; }
    public StockAdjustment? StockAdjustment { get; set; }
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public decimal CurrentQuantityPieces { get; set; }
    public decimal CountedQuantityPieces { get; set; }
    public decimal DifferencePieces => CountedQuantityPieces - CurrentQuantityPieces;
    public decimal UnitCost { get; set; }
    public string? Notes { get; set; }
}
