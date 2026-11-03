using Beverage.Domain.Common;
using Beverage.Domain.Entities.Products;
using Beverage.Domain.Entities.Warehouses;
using Beverage.Domain.Enums;

namespace Beverage.Domain.Entities.Distributors;

public class Distributor : AuditableEntity
{
    public string DistributorCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? RouteArea { get; set; }
    public Guid? ImageId { get; set; }
    public DistributorRelationshipType RelationshipType { get; set; } = DistributorRelationshipType.Consignment;
    public decimal CreditLimit { get; set; }
    public decimal OpeningBalance { get; set; }
    public decimal CurrentBalance { get; set; }
    public string? CommissionType { get; set; } // Percentage, FixedPerCarton
    public decimal CommissionValue { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<DistributorDispatch> Dispatches { get; set; } = new List<DistributorDispatch>();
    public ICollection<DistributorSettlement> Settlements { get; set; } = new List<DistributorSettlement>();
}

public class DistributorDispatch : AuditableEntity
{
    public string DispatchNumber { get; set; } = string.Empty;
    public Guid DistributorId { get; set; }
    public Distributor? Distributor { get; set; }
    public Guid WarehouseId { get; set; } // Usually Cold Storage or Main
    public Warehouse? Warehouse { get; set; }
    public DateTime DispatchDate { get; set; } = DateTime.UtcNow;
    public decimal TotalCost { get; set; }
    public decimal TotalAgreedValue { get; set; }
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;
    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? Notes { get; set; }

    public ICollection<DistributorDispatchItem> Items { get; set; } = new List<DistributorDispatchItem>();
}

public class DistributorDispatchItem : BaseEntity
{
    public Guid DistributorDispatchId { get; set; }
    public DistributorDispatch? DistributorDispatch { get; set; }
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public decimal QuantityCartons { get; set; }
    public decimal QuantityPieces { get; set; }
    public decimal TotalPieces { get; set; }
    public decimal UnitCost { get; set; }
    public decimal AgreedSalePrice { get; set; }
    public decimal TotalValue => TotalPieces * (AgreedSalePrice / (Product != null ? Product.UnitsPerCarton : 12));
}

public class DistributorSettlement : AuditableEntity
{
    public string SettlementNumber { get; set; } = string.Empty;
    public Guid DistributorId { get; set; }
    public Distributor? Distributor { get; set; }
    public DateTime BusinessDate { get; set; } = DateTime.UtcNow.Date;
    
    // Financial Totals
    public decimal OpeningFinancialBalance { get; set; }
    public decimal TotalSalesValue { get; set; }
    public decimal CashCollected { get; set; }
    public decimal CreditSalesAmount { get; set; }
    public decimal ApprovedExpenses { get; set; }
    public decimal DueCashAmount => TotalSalesValue - CreditSalesAmount - ApprovedExpenses;
    public decimal CashHandedOver { get; set; }
    public decimal CashDifference => CashHandedOver - DueCashAmount; // 0 if balanced
    public decimal ClosingFinancialBalance { get; set; }
    
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;
    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? Notes { get; set; }

    public ICollection<DistributorSettlementItem> Items { get; set; } = new List<DistributorSettlementItem>();
}

public class DistributorSettlementItem : BaseEntity
{
    public Guid DistributorSettlementId { get; set; }
    public DistributorSettlement? DistributorSettlement { get; set; }
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    
    // Quantity reconciliation in Pieces
    public decimal OpeningQuantityPieces { get; set; }
    public decimal ReceivedQuantityPieces { get; set; } // Dispatched today
    public decimal AvailableQuantityPieces => OpeningQuantityPieces + ReceivedQuantityPieces;
    public decimal SoldQuantityPieces { get; set; }
    public decimal ReturnedQuantityPieces { get; set; } // Returned good to warehouse
    public decimal DamagedQuantityPieces { get; set; }  // Documented damage
    public decimal ShortageQuantityPieces { get; set; } // Unexplained shortage
    public decimal RemainingQuantityPieces { get; set; } // Carried over to next day
    
    // Formula verification:
    // AvailableQuantityPieces - Sold - Returned - Damaged - Shortage == RemainingQuantityPieces
    public bool IsQuantityBalanced => (AvailableQuantityPieces - SoldQuantityPieces - ReturnedQuantityPieces - DamagedQuantityPieces - ShortageQuantityPieces) == RemainingQuantityPieces;
}
