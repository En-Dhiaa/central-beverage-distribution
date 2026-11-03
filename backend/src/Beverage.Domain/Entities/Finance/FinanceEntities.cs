using Beverage.Domain.Common;
using Beverage.Domain.Enums;

namespace Beverage.Domain.Entities.Finance;

public class Account : BaseEntity
{
    public string AccountCode { get; set; } = string.Empty; // e.g. 10101 (Cash), 10201 (Inventory), 10301 (Accounts Receivable)
    public string AccountName { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
    public Account? Parent { get; set; }
    public AccountType AccountType { get; set; }
    public NormalBalance NormalBalance { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Account> ChildAccounts { get; set; } = new List<Account>();
    public ICollection<JournalEntryLine> JournalLines { get; set; } = new List<JournalEntryLine>();
}

public class JournalEntry : AuditableEntity
{
    public string EntryNumber { get; set; } = string.Empty;
    public DateTime EntryDate { get; set; } = DateTime.UtcNow;
    public string Description { get; set; } = string.Empty;
    public string SourceType { get; set; } = string.Empty; // PurchaseInvoice, SalesInvoice, Payment, Expense, Settlement
    public Guid? SourceId { get; set; }
    public DocumentStatus Status { get; set; } = DocumentStatus.Approved;
    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }

    public ICollection<JournalEntryLine> Lines { get; set; } = new List<JournalEntryLine>();

    public decimal TotalDebit => Lines.Sum(l => l.Debit);
    public decimal TotalCredit => Lines.Sum(l => l.Credit);
    public bool IsBalanced => TotalDebit == TotalCredit;
}

public class JournalEntryLine : BaseEntity
{
    public Guid JournalEntryId { get; set; }
    public JournalEntry? JournalEntry { get; set; }
    public Guid AccountId { get; set; }
    public Account? Account { get; set; }
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
    public string? Description { get; set; }
    
    // Subledger tracking
    public Guid? CustomerId { get; set; }
    public Guid? SupplierId { get; set; }
    public Guid? DistributorId { get; set; }
}

public class Cashbox : AuditableEntity
{
    public string Name { get; set; } = string.Empty; // الصندوق الرئيسي، صندوق الثلاجة، صندوق الطوارئ
    public Guid AccountId { get; set; }
    public Account? Account { get; set; }
    public decimal OpeningBalance { get; set; }
    public decimal CurrentBalance { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<CashTransaction> Transactions { get; set; } = new List<CashTransaction>();
}

public class CashTransaction : BaseEntity
{
    public string TransactionNumber { get; set; } = string.Empty;
    public Guid CashboxId { get; set; }
    public Cashbox? Cashbox { get; set; }
    public VoucherType TransactionType { get; set; } // Receipt (قبض) or Payment (صرف)
    public decimal Amount { get; set; }
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
    public string ReferenceType { get; set; } = string.Empty; // PaymentVoucher, Expense, SalesInvoice, Settlement
    public Guid? ReferenceId { get; set; }
    public string Description { get; set; } = string.Empty;
    public Guid CreatedBy { get; set; }
}

public class PaymentVoucher : AuditableEntity
{
    public string VoucherNumber { get; set; } = string.Empty;
    public VoucherType VoucherType { get; set; } // Receipt (قبض) or Payment (صرف)
    public PartyType PartyType { get; set; }     // Customer, Supplier, Distributor
    public Guid PartyId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public Guid CashboxId { get; set; }
    public Cashbox? Cashbox { get; set; }
    public string? ReferenceNumber { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public string? Description { get; set; }
    public DocumentStatus Status { get; set; } = DocumentStatus.Approved;
}

public class ExpenseCategory : BaseEntity
{
    public string Name { get; set; } = string.Empty; // كهرباء، وقود، أجور، إيجار، صيانة، نقل
    public string? Description { get; set; }
    public Guid? AccountId { get; set; }
    public Account? Account { get; set; }
}

public class Expense : AuditableEntity
{
    public string ExpenseNumber { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public ExpenseCategory? Category { get; set; }
    public Guid CashboxId { get; set; }
    public Cashbox? Cashbox { get; set; }
    public decimal Amount { get; set; }
    public DateTime ExpenseDate { get; set; } = DateTime.UtcNow;
    public string Description { get; set; } = string.Empty;
    public string? Beneficiary { get; set; }
    public Guid? AttachmentId { get; set; }
}

public class DailyClosing : AuditableEntity
{
    public string ClosingNumber { get; set; } = string.Empty;
    public DateTime BusinessDate { get; set; } = DateTime.UtcNow.Date;
    public decimal OpeningCash { get; set; }
    public decimal TotalSales { get; set; }
    public decimal TotalPurchases { get; set; }
    public decimal TotalReceipts { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal ExpectedCash { get; set; }
    public decimal ActualCash { get; set; }
    public decimal CashDifference => ActualCash - ExpectedCash;
    public DocumentStatus Status { get; set; } = DocumentStatus.Approved;
    public Guid ClosedBy { get; set; }
    public Guid? ApprovedBy { get; set; }
    public string? Notes { get; set; }
}

