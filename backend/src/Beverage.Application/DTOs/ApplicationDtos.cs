namespace Beverage.Application.DTOs;

public record LoginRequest(string Username, string Password);

public record LoginResponse(
    string Token,
    Guid UserId,
    string Username,
    string FullName,
    string Role,
    string Language,
    string Theme,
    string FontFamily,
    DateTime ExpiresAt
);

public record UserProfileDto(
    Guid Id,
    string Username,
    string FullName,
    string? Email,
    string? Phone,
    string Role,
    string Language,
    string Theme,
    string FontFamily,
    int FontSize,
    bool NotificationSoundEnabled,
    int NotificationVolume,
    string DashboardLayoutJson
);

public record UpdatePreferenceRequest(
    string Language,
    string Theme,
    string FontFamily,
    int FontSize,
    bool NotificationSoundEnabled,
    int NotificationVolume,
    string DashboardLayoutJson
);

public record DashboardMetricsDto(
    decimal TodaySales,
    decimal TodayPurchases,
    decimal TodayReceipts,
    decimal TodayExpenses,
    decimal MainWarehouseStockPieces,
    decimal ColdStorageStockPieces,
    decimal DistributorCustodyPieces,
    decimal TotalCustomerDebt,
    decimal TotalSupplierDebt,
    decimal TotalCashboxBalance,
    int ActiveDistributorsCount,
    int ActiveCustomersCount,
    int LowStockAlertsCount
);

public record ProductDto(
    Guid Id,
    string Sku,
    string? Barcode,
    string Name,
    string? NameEn,
    Guid CategoryId,
    string CategoryName,
    string? Manufacturer,
    int UnitsPerCarton,
    decimal PurchasePriceCarton,
    decimal SalePriceCarton,
    decimal SalePricePiece,
    decimal MinStockAlert,
    decimal TotalStockPieces,
    decimal MainWarehouseCartons,
    decimal ColdStorageCartons,
    decimal DistributorCustodyCartons,
    bool IsActive
);

public record CreateProductRequest(
    string Sku,
    string? Barcode,
    string Name,
    string? NameEn,
    Guid? CategoryId,
    string? Manufacturer,
    int UnitsPerCarton,
    decimal DefaultPurchasePriceCarton,
    decimal DefaultSalePriceCarton,
    decimal DefaultSalePricePiece,
    decimal MinStockAlert
);

public record StockTransferRequest(
    Guid SourceWarehouseId,
    Guid TargetWarehouseId,
    Guid ProductId,
    decimal QuantityCartons,
    decimal QuantityPieces,
    string? Notes
);

public record SupplierDto(
    Guid Id,
    string SupplierCode,
    string Name,
    string? CompanyName,
    string? Phone,
    string? Address,
    decimal CurrentBalance,
    bool IsActive
);

public record CreateSupplierRequest(
    string SupplierCode,
    string Name,
    string? CompanyName,
    string? Phone,
    string? Address,
    decimal OpeningBalance,
    string? Notes
);

public record PurchaseInvoiceItemRequest(
    Guid ProductId,
    decimal QuantityCartons,
    decimal QuantityPieces,
    decimal UnitPricePerCarton,
    decimal Discount
);

public record CreatePurchaseInvoiceRequest(
    Guid SupplierId,
    Guid WarehouseId,
    DateTime InvoiceDate,
    string PaymentMethod, // Cash, Credit, Partial
    decimal PaidAmount,
    string? SupplierInvoiceNumber,
    string? Notes,
    List<PurchaseInvoiceItemRequest> Items
);

public record DistributorDto(
    Guid Id,
    string DistributorCode,
    string Name,
    string? Phone,
    string? Address,
    string? RouteArea,
    string RelationshipType,
    decimal CreditLimit,
    decimal CurrentBalance,
    decimal TotalCustodyPieces,
    decimal TotalCustodyCartons,
    bool IsActive
);

public record CreateDistributorRequest(
    string DistributorCode,
    string Name,
    string? Phone,
    string? Address,
    string? RouteArea,
    string RelationshipType,
    decimal CreditLimit,
    decimal OpeningBalance
);

public record DispatchItemRequest(
    Guid ProductId,
    decimal QuantityCartons,
    decimal QuantityPieces,
    decimal AgreedSalePrice
);

public record CreateDistributorDispatchRequest(
    Guid DistributorId,
    Guid WarehouseId,
    DateTime DispatchDate,
    string? Notes,
    List<DispatchItemRequest> Items
);

public record SettlementItemRequest(
    Guid ProductId,
    decimal OpeningQuantityPieces,
    decimal ReceivedQuantityPieces,
    decimal SoldQuantityPieces,
    decimal ReturnedQuantityPieces,
    decimal DamagedQuantityPieces,
    decimal ShortageQuantityPieces,
    decimal RemainingQuantityPieces
);

public record CreateDistributorSettlementRequest(
    Guid DistributorId,
    DateTime BusinessDate,
    decimal TotalSalesValue,
    decimal CashCollected,
    decimal CreditSalesAmount,
    decimal ApprovedExpenses,
    decimal CashHandedOver,
    string? Notes,
    List<SettlementItemRequest> Items
);

public record CustomerDto(
    Guid Id,
    string CustomerCode,
    string Name,
    string? OwnerName,
    string? Phone,
    string? Address,
    string? Area,
    decimal CreditLimit,
    decimal CurrentBalance,
    Guid? AssignedDistributorId,
    string? AssignedDistributorName,
    bool IsActive
);

public record CreateCustomerRequest(
    string CustomerCode,
    string Name,
    string? OwnerName,
    string? Phone,
    string? Address,
    string? Area,
    decimal CreditLimit,
    decimal OpeningBalance,
    Guid? AssignedDistributorId
);

public record SalesInvoiceItemRequest(
    Guid ProductId,
    decimal QuantityCartons,
    decimal QuantityPieces,
    decimal UnitPricePerCarton,
    decimal Discount
);

public record CreateSalesInvoiceRequest(
    Guid CustomerId,
    Guid? DistributorId,
    Guid? WarehouseId,
    DateTime InvoiceDate,
    string PaymentMethod, // Cash, Credit, Partial
    decimal PaidAmount,
    DateTime? DueDate,
    string? Notes,
    List<SalesInvoiceItemRequest> Items
);

public record CustomerLedgerEntryDto(
    DateTime Date,
    string DocumentType,
    string DocumentNumber,
    string Description,
    decimal Debit,
    decimal Credit,
    decimal BalanceAfter
);

public record CashboxDto(
    Guid Id,
    string Name,
    decimal CurrentBalance,
    bool IsActive
);

public record PaymentVoucherRequest(
    string VoucherType, // Receipt, Payment
    string PartyType,   // Customer, Supplier, Distributor
    Guid PartyId,
    decimal Amount,
    Guid CashboxId,
    string? Description
);

public record ExpenseRequest(
    Guid CategoryId,
    Guid CashboxId,
    decimal Amount,
    DateTime ExpenseDate,
    string Description,
    string? Beneficiary
);

public record JournalEntryDto(
    Guid Id,
    string EntryNumber,
    DateTime EntryDate,
    string Description,
    string SourceType,
    decimal TotalDebit,
    decimal TotalCredit,
    bool IsBalanced,
    List<JournalLineDto> Lines
);

public record JournalLineDto(
    string AccountCode,
    string AccountName,
    decimal Debit,
    decimal Credit,
    string? Description
);

public record DailyClosingSummaryDto(
    DateTime BusinessDate,
    decimal OpeningCash,
    decimal TotalSalesCash,
    decimal TotalSalesCredit,
    decimal TotalPurchasesCash,
    decimal TotalReceipts,
    decimal TotalExpenses,
    decimal ExpectedClosingCash,
    int PendingDistributorSettlementsCount,
    decimal OpenCustodyPieces
);

public record CreateDailyClosingRequest(
    DateTime BusinessDate,
    decimal ActualCash,
    string? Notes
);

public record DailyClosingDto(
    Guid Id,
    string ClosingNumber,
    DateTime BusinessDate,
    decimal OpeningCash,
    decimal TotalSales,
    decimal TotalPurchases,
    decimal TotalReceipts,
    decimal TotalExpenses,
    decimal ExpectedCash,
    decimal ActualCash,
    decimal CashDifference,
    string Status,
    string? Notes,
    DateTime CreatedAt
);

// --- User Management ---
public record UserDto(
    Guid Id,
    string Username,
    string FullName,
    string? Email,
    string? Phone,
    string Role,
    Guid RoleId,
    bool IsActive,
    DateTime CreatedAt
);

public record CreateUserRequest(
    string Username,
    string Password,
    string FullName,
    string? Email,
    string? Phone,
    Guid RoleId
);

public record RoleDto(
    Guid Id,
    string Name,
    string Description
);

// --- Cold-Store Workers & Salaries ---
public record WorkerDto(
    Guid Id,
    string WorkerCode,
    string FullName,
    string? NationalId,
    string Phone,
    string JobTitle,
    decimal BaseSalary,
    string SalaryType,
    int ShiftHours,
    DateTime HireDate,
    bool IsActive,
    string? Notes
);

public record CreateWorkerRequest(
    string WorkerCode,
    string FullName,
    string? NationalId,
    string Phone,
    string JobTitle,
    decimal BaseSalary,
    string SalaryType,
    int ShiftHours,
    string? Notes
);

public record WorkerSalaryVoucherDto(
    Guid Id,
    string VoucherNumber,
    Guid WorkerId,
    string WorkerName,
    int Year,
    int Month,
    decimal BaseSalary,
    decimal BonusAmount,
    decimal DeductionsAmount,
    decimal NetPaid,
    DateTime PaymentDate,
    Guid CashboxId,
    string CashboxName,
    string? Notes
);

public record PayWorkerSalaryRequest(
    Guid WorkerId,
    int Year,
    int Month,
    decimal BaseSalary,
    decimal BonusAmount,
    decimal DeductionsAmount,
    Guid CashboxId,
    string? Notes
);

// --- Period Closings (Monthly / Annual) ---
public record PeriodClosingDto(
    Guid Id,
    string ClosingNumber,
    string ClosingType,
    int FiscalYear,
    int? Month,
    DateTime ClosingDate,
    decimal TotalSales,
    decimal TotalCostOfGoodsSold,
    decimal GrossProfit,
    decimal TotalExpenses,
    decimal TotalSalaries,
    decimal NetProfit,
    bool IsLocked,
    string? Notes
);

public record CreatePeriodClosingRequest(
    string ClosingType,
    int FiscalYear,
    int? Month,
    string? Notes
);

// --- Debt Aging & Customer Debt Management ---
public record CustomerDebtAgingDto(
    Guid CustomerId,
    string CustomerCode,
    string CustomerName,
    string? Phone,
    string? Area,
    decimal CreditLimit,
    decimal TotalDebt,
    decimal Current0To30Days,
    decimal Overdue31To60Days,
    decimal Overdue61To90Days,
    decimal CriticalOver90Days,
    DateTime? LastPaymentDate,
    string DebtStatus
);

// --- Daily Activity / Movement Audit Log ---
public record ActivityLogItemDto(
    DateTime Timestamp,
    string Module,
    string ActionType,
    string DocumentNumber,
    string Description,
    decimal Amount,
    string UserName,
    string Status
);

// --- Database Management ---
public record DatabaseStatusDto(
    string Provider,
    string DatabasePath,
    double FileSizeBytes,
    double FileSizeMegabytes,
    int TablesCount,
    long TotalRecordsCount,
    DateTime LastBackupDate,
    List<BackupFileInfoDto> Backups
);

public record BackupFileInfoDto(
    string FileName,
    string FullPath,
    double SizeMegabytes,
    DateTime CreatedAt
);

// --- Invoice Detail for Multi-Format Printing ---
public record SalesInvoicePrintDto(
    Guid Id,
    string InvoiceNumber,
    DateTime InvoiceDate,
    string CustomerName,
    string? CustomerPhone,
    string? CustomerArea,
    string? DistributorName,
    string PaymentMethod,
    decimal TotalAmount,
    decimal PaidAmount,
    decimal RemainingAmount,
    string Notes,
    List<SalesInvoicePrintItemDto> Items
);

public record SalesInvoicePrintItemDto(
    string ProductName,
    decimal QuantityCartons,
    decimal QuantityPieces,
    decimal UnitPricePerCarton,
    decimal TotalPrice
);



