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


