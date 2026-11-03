using Beverage.Domain.Common;
using Beverage.Domain.Entities.Finance;

namespace Beverage.Domain.Entities.Warehouses;

public class WarehouseWorker : AuditableEntity
{
    public string WorkerCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? NationalId { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string JobTitle { get; set; } = "عامل تحميل وتنزيل"; // فني تبريد، مراقب جودة، حارس مخزن
    public decimal BaseSalary { get; set; }
    public string SalaryType { get; set; } = "Monthly"; // Monthly, Daily
    public int ShiftHours { get; set; } = 8;
    public DateTime HireDate { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }

    public ICollection<WorkerSalaryVoucher> SalaryVouchers { get; set; } = new List<WorkerSalaryVoucher>();
}

public class WorkerSalaryVoucher : AuditableEntity
{
    public string VoucherNumber { get; set; } = string.Empty;
    public Guid WorkerId { get; set; }
    public WarehouseWorker? Worker { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal BaseSalary { get; set; }
    public decimal BonusAmount { get; set; }
    public decimal DeductionsAmount { get; set; }
    public decimal NetPaid { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public Guid CashboxId { get; set; }
    public Cashbox? Cashbox { get; set; }
    public string? Notes { get; set; }
    public Guid? JournalEntryId { get; set; }
}

