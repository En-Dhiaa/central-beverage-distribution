using Beverage.Application.DTOs;
using Beverage.Domain.Entities.Finance;
using Beverage.Domain.Entities.Identity;

namespace Beverage.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    Task<UserProfileDto?> GetUserProfileAsync(Guid userId);
    Task<bool> UpdatePreferencesAsync(Guid userId, UpdatePreferenceRequest request);
}

public interface IDashboardService
{
    Task<DashboardMetricsDto> GetMetricsAsync();
}

public interface IInventoryService
{
    Task<List<ProductDto>> GetProductsAsync();
    Task<ProductDto> CreateProductAsync(CreateProductRequest request, Guid userId);
    Task<bool> TransferStockAsync(StockTransferRequest request, Guid userId);
    Task<decimal> GetWarehouseStockPiecesAsync(Guid warehouseId, Guid productId);
    Task<decimal> GetDistributorCustodyPiecesAsync(Guid distributorId, Guid productId);
}

public interface IPurchasingService
{
    Task<List<SupplierDto>> GetSuppliersAsync();
    Task<SupplierDto> CreateSupplierAsync(CreateSupplierRequest request, Guid userId);
    Task<Guid> CreatePurchaseInvoiceAsync(CreatePurchaseInvoiceRequest request, Guid userId);
}

public interface IDistributorService
{
    Task<List<DistributorDto>> GetDistributorsAsync();
    Task<DistributorDto> CreateDistributorAsync(CreateDistributorRequest request, Guid userId);
    Task<Guid> DispatchToDistributorAsync(CreateDistributorDispatchRequest request, Guid userId);
    Task<Guid> SettleDistributorAsync(CreateDistributorSettlementRequest request, Guid userId);
}

public interface ISalesService
{
    Task<List<CustomerDto>> GetCustomersAsync();
    Task<CustomerDto> CreateCustomerAsync(CreateCustomerRequest request, Guid userId);
    Task<Guid> CreateSalesInvoiceAsync(CreateSalesInvoiceRequest request, Guid userId);
    Task<List<CustomerLedgerEntryDto>> GetCustomerLedgerAsync(Guid customerId);
}

public interface IFinanceService
{
    Task<List<CashboxDto>> GetCashboxesAsync();
    Task<Guid> CreatePaymentVoucherAsync(PaymentVoucherRequest request, Guid userId);
    Task<Guid> CreateExpenseAsync(ExpenseRequest request, Guid userId);
    Task<List<JournalEntryDto>> GetJournalEntriesAsync();
    Task<DailyClosingSummaryDto> GetDailyClosingSummaryAsync(DateTime businessDate);
    Task<Guid> SubmitDailyClosingAsync(CreateDailyClosingRequest request, Guid userId);
    Task<List<DailyClosingDto>> GetDailyClosingsAsync();
}

