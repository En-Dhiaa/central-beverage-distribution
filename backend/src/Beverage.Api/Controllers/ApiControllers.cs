using System.Security.Claims;
using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Beverage.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);
        if (response == null)
            return Unauthorized(new { message = "اسم المستخدم أو كلمة المرور غير صحيحة" });

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var profile = await _authService.GetUserProfileAsync(userId);
        if (profile == null) return NotFound();

        return Ok(profile);
    }

    [Authorize]
    [HttpPut("preferences")]
    public async Task<IActionResult> UpdatePreferences([FromBody] UpdatePreferenceRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var success = await _authService.UpdatePreferencesAsync(userId, request);
        return Ok(new { success });
    }
}

[ApiController]
[Route("api/v1/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics()
    {
        var metrics = await _dashboardService.GetMetricsAsync();
        return Ok(metrics);
    }
}

[ApiController]
[Route("api/v1/products")]
public class ProductsController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public ProductsController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts()
    {
        var products = await _inventoryService.GetProductsAsync();
        return Ok(products);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdStr, out var userId);

        var product = await _inventoryService.CreateProductAsync(request, userId);
        return CreatedAtAction(nameof(GetProducts), new { id = product.Id }, product);
    }

    [HttpPost("transfer")]
    public async Task<IActionResult> TransferStock([FromBody] StockTransferRequest request)
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var userId);

            var success = await _inventoryService.TransferStockAsync(request, userId);
            return Ok(new { success, message = "تم تحويل البضاعة بنجاح وتسجيل حركات المخزون." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

[ApiController]
[Route("api/v1/suppliers")]
public class SuppliersController : ControllerBase
{
    private readonly IPurchasingService _purchasingService;

    public SuppliersController(IPurchasingService purchasingService)
    {
        _purchasingService = purchasingService;
    }

    [HttpGet]
    public async Task<IActionResult> GetSuppliers()
    {
        var suppliers = await _purchasingService.GetSuppliersAsync();
        return Ok(suppliers);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSupplier([FromBody] CreateSupplierRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdStr, out var userId);

        var supplier = await _purchasingService.CreateSupplierAsync(request, userId);
        return Ok(supplier);
    }

    [HttpPost("purchases")]
    public async Task<IActionResult> CreatePurchaseInvoice([FromBody] CreatePurchaseInvoiceRequest request)
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var userId);

            var id = await _purchasingService.CreatePurchaseInvoiceAsync(request, userId);
            return Ok(new { id, message = "تم اعتماد فاتورة الشراء وتحديث المخزون والحسابات بنجاح." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

[ApiController]
[Route("api/v1/distributors")]
public class DistributorsController : ControllerBase
{
    private readonly IDistributorService _distributorService;

    public DistributorsController(IDistributorService distributorService)
    {
        _distributorService = distributorService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDistributors()
    {
        var distributors = await _distributorService.GetDistributorsAsync();
        return Ok(distributors);
    }

    [HttpPost]
    public async Task<IActionResult> CreateDistributor([FromBody] CreateDistributorRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdStr, out var userId);

        var distributor = await _distributorService.CreateDistributorAsync(request, userId);
        return Ok(distributor);
    }

    [HttpPost("dispatch")]
    public async Task<IActionResult> DispatchToDistributor([FromBody] CreateDistributorDispatchRequest request)
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var userId);

            var id = await _distributorService.DispatchToDistributorAsync(request, userId);
            return Ok(new { id, message = "تم تسليم البضاعة كعهدة للموزع وخصمها من الثلاجة بنجاح." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("settle")]
    public async Task<IActionResult> SettleDistributor([FromBody] CreateDistributorSettlementRequest request)
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var userId);

            var id = await _distributorService.SettleDistributorAsync(request, userId);
            return Ok(new { id, message = "تم اعتماد تسوية عهدة الموزع ومطابقة الفروقات وتحديث الحسابات بنجاح." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

[ApiController]
[Route("api/v1/customers")]
public class CustomersController : ControllerBase
{
    private readonly ISalesService _salesService;

    public CustomersController(ISalesService salesService)
    {
        _salesService = salesService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCustomers()
    {
        var customers = await _salesService.GetCustomersAsync();
        return Ok(customers);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdStr, out var userId);

        var customer = await _salesService.CreateCustomerAsync(request, userId);
        return Ok(customer);
    }

    [HttpGet("{id}/ledger")]
    public async Task<IActionResult> GetCustomerLedger(Guid id)
    {
        var ledger = await _salesService.GetCustomerLedgerAsync(id);
        return Ok(ledger);
    }

    [HttpPost("sales")]
    public async Task<IActionResult> CreateSalesInvoice([FromBody] CreateSalesInvoiceRequest request)
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var userId);

            var id = await _salesService.CreateSalesInvoiceAsync(request, userId);
            return Ok(new { id, message = "تم اعتماد فاتورة المبيعات وتحديث الحسابات والمخزون بنجاح." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

[ApiController]
[Route("api/v1/finance")]
public class FinanceController : ControllerBase
{
    private readonly IFinanceService _financeService;

    public FinanceController(IFinanceService financeService)
    {
        _financeService = financeService;
    }

    [HttpGet("cashboxes")]
    public async Task<IActionResult> GetCashboxes()
    {
        var boxes = await _financeService.GetCashboxesAsync();
        return Ok(boxes);
    }

    [HttpPost("vouchers")]
    public async Task<IActionResult> CreatePaymentVoucher([FromBody] PaymentVoucherRequest request)
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var userId);

            var id = await _financeService.CreatePaymentVoucherAsync(request, userId);
            return Ok(new { id, message = "تم حفظ سند القبض/الصرف وتحديث الصندوق والحسابات بنجاح." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("expenses")]
    public async Task<IActionResult> CreateExpense([FromBody] ExpenseRequest request)
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var userId);

            var id = await _financeService.CreateExpenseAsync(request, userId);
            return Ok(new { id, message = "تم تسجيل المصروف وصرفه من الصندوق بنجاح." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("journal")]
    public async Task<IActionResult> GetJournalEntries()
    {
        var entries = await _financeService.GetJournalEntriesAsync();
        return Ok(entries);
    }
}
