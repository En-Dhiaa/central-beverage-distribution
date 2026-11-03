using Beverage.Domain.Common;
using Beverage.Domain.Entities.Products;
using Beverage.Domain.Entities.Warehouses;
using Beverage.Domain.Enums;

namespace Beverage.Domain.Entities.Suppliers;

public class Supplier : AuditableEntity
{
    public string SupplierCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public Guid? ImageId { get; set; }
    public decimal OpeningBalance { get; set; }
    public decimal CurrentBalance { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<SupplierContact> Contacts { get; set; } = new List<SupplierContact>();
    public ICollection<PurchaseInvoice> PurchaseInvoices { get; set; } = new List<PurchaseInvoice>();
}

public class SupplierContact : BaseEntity
{
    public Guid SupplierId { get; set; }
    public Supplier? Supplier { get; set; }
    public string ContactName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Position { get; set; }
}

public class PurchaseInvoice : AuditableEntity
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public string? SupplierInvoiceNumber { get; set; }
    public Guid SupplierId { get; set; }
    public Supplier? Supplier { get; set; }
    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Credit;
    
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal AdditionalCost { get; set; }
    public decimal Total { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount => Total - PaidAmount;

    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;
    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? Notes { get; set; }

    public ICollection<PurchaseInvoiceItem> Items { get; set; } = new List<PurchaseInvoiceItem>();
}

public class PurchaseInvoiceItem : BaseEntity
{
    public Guid PurchaseInvoiceId { get; set; }
    public PurchaseInvoice? PurchaseInvoice { get; set; }
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public Guid? BatchId { get; set; }
    
    public decimal QuantityCartons { get; set; }
    public decimal QuantityPieces { get; set; }
    public decimal TotalPieces { get; set; } // QuantityCartons * UnitsPerCarton + QuantityPieces
    
    public decimal UnitPricePerCarton { get; set; }
    public decimal Discount { get; set; }
    public decimal Total { get; set; }
}

public class PurchaseReturn : AuditableEntity
{
    public string ReturnNumber { get; set; } = string.Empty;
    public Guid SupplierId { get; set; }
    public Supplier? Supplier { get; set; }
    public Guid? PurchaseInvoiceId { get; set; }
    public PurchaseInvoice? PurchaseInvoice { get; set; }
    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public DateTime ReturnDate { get; set; } = DateTime.UtcNow;
    public decimal Total { get; set; }
    public string? Reason { get; set; }
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;
    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }

    public ICollection<PurchaseReturnItem> Items { get; set; } = new List<PurchaseReturnItem>();
}

public class PurchaseReturnItem : BaseEntity
{
    public Guid PurchaseReturnId { get; set; }
    public PurchaseReturn? PurchaseReturn { get; set; }
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public decimal TotalPieces { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Total { get; set; }
}
