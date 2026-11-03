using Beverage.Domain.Common;
using Beverage.Domain.Entities.Customers;
using Beverage.Domain.Entities.Distributors;
using Beverage.Domain.Entities.Products;
using Beverage.Domain.Entities.Warehouses;
using Beverage.Domain.Enums;

namespace Beverage.Domain.Entities.Sales;

public class SalesInvoice : AuditableEntity
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public Guid? DistributorId { get; set; } // Null if direct sale from warehouse
    public Distributor? Distributor { get; set; }
    public Guid? WarehouseId { get; set; } // Null if sold from distributor custody
    public Warehouse? Warehouse { get; set; }
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal Total { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount => Total - PaidAmount;
    public DateTime? DueDate { get; set; }

    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;
    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? Notes { get; set; }

    public ICollection<SalesInvoiceItem> Items { get; set; } = new List<SalesInvoiceItem>();
}

public class SalesInvoiceItem : BaseEntity
{
    public Guid SalesInvoiceId { get; set; }
    public SalesInvoice? SalesInvoice { get; set; }
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public Guid? BatchId { get; set; }
    
    public decimal QuantityCartons { get; set; }
    public decimal QuantityPieces { get; set; }
    public decimal TotalPieces { get; set; }
    
    public decimal UnitPricePerCarton { get; set; }
    public decimal UnitCost { get; set; }
    public decimal Discount { get; set; }
    public decimal Total { get; set; }
}

public class SalesReturn : AuditableEntity
{
    public string ReturnNumber { get; set; } = string.Empty;
    public Guid? SalesInvoiceId { get; set; }
    public SalesInvoice? SalesInvoice { get; set; }
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public Guid? DistributorId { get; set; }
    public Distributor? Distributor { get; set; }
    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public DateTime ReturnDate { get; set; } = DateTime.UtcNow;
    public ReturnType ReturnType { get; set; } = ReturnType.Resellable;
    public decimal Total { get; set; }
    public string? Reason { get; set; }
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;
    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }

    public ICollection<SalesReturnItem> Items { get; set; } = new List<SalesReturnItem>();
}

public class SalesReturnItem : BaseEntity
{
    public Guid SalesReturnId { get; set; }
    public SalesReturn? SalesReturn { get; set; }
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public decimal TotalPieces { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Total { get; set; }
    public string? Reason { get; set; }
}

