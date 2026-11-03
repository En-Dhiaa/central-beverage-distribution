using Beverage.Domain.Common;

namespace Beverage.Domain.Entities.Products;

public class Category : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
    public Category? Parent { get; set; }
    public string? Description { get; set; }
    public Guid? ImageId { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<Category> SubCategories { get; set; } = new List<Category>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
}

public class Unit : BaseEntity
{
    public string Name { get; set; } = string.Empty; // كرتون، حبة، باكت
    public string Symbol { get; set; } = string.Empty; // ctn, pc
    public string UnitType { get; set; } = "Count"; // Count, Volume
}

public class Product : AuditableEntity
{
    public string Sku { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }
    public string? Manufacturer { get; set; } // شركة شملان، شركة صنعاء...
    public string? Description { get; set; }
    public Guid? ImageId { get; set; }
    
    // Base unit is the smallest unit (e.g. Piece / حبة)
    public Guid BaseUnitId { get; set; }
    public Unit? BaseUnit { get; set; }
    
    // Units per carton (e.g. 12 or 24 bottles per carton)
    public int UnitsPerCarton { get; set; } = 12;
    
    public decimal DefaultPurchasePriceCarton { get; set; }
    public decimal DefaultSalePriceCarton { get; set; }
    public decimal DefaultSalePricePiece { get; set; }
    public decimal MinStockAlert { get; set; } = 10;
    public bool IsActive { get; set; } = true;

    public ICollection<ProductUnitConversion> UnitConversions { get; set; } = new List<ProductUnitConversion>();
    public ICollection<ProductPrice> CustomPrices { get; set; } = new List<ProductPrice>();
    public ICollection<ProductCostHistory> CostHistories { get; set; } = new List<ProductCostHistory>();
}

public class ProductUnitConversion : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public Guid FromUnitId { get; set; }
    public Unit? FromUnit { get; set; }
    public Guid ToUnitId { get; set; }
    public Unit? ToUnit { get; set; }
    public decimal ConversionFactor { get; set; } // e.g. 1 Carton = 12 Pieces -> factor = 12
}

public class ProductPrice : AuditableEntity
{
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public string PriceType { get; set; } = "Wholesale"; // Wholesale, Retail, Distributor
    public Guid? CustomerId { get; set; }
    public Guid? DistributorId { get; set; }
    public decimal Price { get; set; }
    public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;
    public DateTime? EffectiveTo { get; set; }
}

public class ProductCostHistory : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public decimal PurchasePrice { get; set; }
    public decimal AdditionalCost { get; set; }
    public decimal TotalUnitCost => PurchasePrice + AdditionalCost;
    public DateTime EffectiveAt { get; set; } = DateTime.UtcNow;
    public Guid? PurchaseDocumentId { get; set; }
}

