using Beverage.Domain.Common;
using Beverage.Domain.Entities.Distributors;

namespace Beverage.Domain.Entities.Customers;

public class Customer : AuditableEntity
{
    public string CustomerCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty; // اسم المحل / البقالة
    public string? OwnerName { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? Area { get; set; }
    public string? GeoLocation { get; set; }
    public Guid? ImageId { get; set; }
    public decimal CreditLimit { get; set; }
    public decimal OpeningBalance { get; set; }
    public decimal CurrentBalance { get; set; }
    public Guid? AssignedDistributorId { get; set; }
    public Distributor? AssignedDistributor { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<CustomerDistributorHistory> DistributorHistories { get; set; } = new List<CustomerDistributorHistory>();
}

public class CustomerDistributorHistory : BaseEntity
{
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public Guid DistributorId { get; set; }
    public Distributor? Distributor { get; set; }
    public DateTime AssignedFrom { get; set; } = DateTime.UtcNow;
    public DateTime? AssignedTo { get; set; }
    public string? Notes { get; set; }
}
