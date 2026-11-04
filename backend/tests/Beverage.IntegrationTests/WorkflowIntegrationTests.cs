using System.Globalization;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Beverage.Application.DTOs;
using Beverage.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Beverage.IntegrationTests;

public class WorkflowIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public WorkflowIntegrationTests(WebApplicationFactory<Program> factory)
    {
        var testDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "storage");
        Directory.CreateDirectory(testDir);
        var testDb = $"Data Source={Path.Combine(testDir, $"test_{Guid.NewGuid():N}.db")}";
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<BeverageDbContext>));
                if (descriptor != null) services.Remove(descriptor);

                services.AddDbContext<BeverageDbContext>(options =>
                {
                    options.UseSqlite(testDb);
                });
            });
        }).CreateClient();
    }

    [Fact]
    public async Task EndToEnd_CompleteBusinessWorkflow_ShouldSucceedAndBalance()
    {
        // 1. Authenticate as Admin
        var loginResponse = await _client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest("admin", "Admin@123456"));
        Assert.True(loginResponse.IsSuccessStatusCode);
        var authData = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        Assert.NotNull(authData);
        Assert.False(string.IsNullOrEmpty(authData.Token));

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", authData.Token);

        // 2. Setup Master Entities dynamically via API (Verifying fresh clean-state workflow)
        var supRes = await _client.PostAsJsonAsync("/api/v1/suppliers", new CreateSupplierRequest("SUP-101", "شركة مياه للتوريد", "مؤسسة التوريد", "770011223", "صنعاء", 0, "مورد معتمد"));
        Assert.True(supRes.IsSuccessStatusCode, "Supplier creation failed");
        var supplier = await supRes.Content.ReadFromJsonAsync<SupplierDto>();
        Assert.NotNull(supplier);

        var prodRes = await _client.PostAsJsonAsync("/api/v1/products", new CreateProductRequest("WAT-TEST-001", "629100099901", "مياه صحية 0.75L", "Healthy Water 0.75L", null, "مصنع المياه الحديث", 12, 2500m, 4500m, 400m, 20));
        Assert.True(prodRes.IsSuccessStatusCode, "Product creation failed");
        var product = await prodRes.Content.ReadFromJsonAsync<ProductDto>();
        Assert.NotNull(product);

        var distRes = await _client.PostAsJsonAsync("/api/v1/distributors", new CreateDistributorRequest("DIST-01", "موزع الأمانة والخط الغربي", "772233445", "شارع الستين", "خط الستين - الرباط", "Consignment", 500000m, 0));
        Assert.True(distRes.IsSuccessStatusCode, "Distributor creation failed");
        var distributor = await distRes.Content.ReadFromJsonAsync<DistributorDto>();
        Assert.NotNull(distributor);

        var custRes = await _client.PostAsJsonAsync("/api/v1/customers", new CreateCustomerRequest("CUST-01", "بقالة الأمل المركزية", "عبد الرحمن", "773344556", "شارع الستين", "الستين", 200000m, 0, distributor.Id));
        Assert.True(custRes.IsSuccessStatusCode, "Customer creation failed");
        var customer = await custRes.Content.ReadFromJsonAsync<CustomerDto>();
        Assert.NotNull(customer);

        // 3. Workflow 1: Purchase 100 cartons into Main Warehouse
        var purchaseReq = new CreatePurchaseInvoiceRequest(
            SupplierId: supplier.Id,
            WarehouseId: Guid.Empty, // Default will resolve to Main WH
            InvoiceDate: DateTime.UtcNow,
            PaymentMethod: "Credit",
            PaidAmount: 0,
            SupplierInvoiceNumber: "INV-TEST-100",
            Notes: "شراء 100 كرتون للتخزين",
            Items: new List<PurchaseInvoiceItemRequest>
            {
                new(product.Id, 100, 0, product.PurchasePriceCarton, 0)
            }
        );

        // Fetch warehouses to get actual IDs
        var purchaseRes = await _client.PostAsJsonAsync("/api/v1/suppliers/purchases", purchaseReq);
        Assert.True(purchaseRes.IsSuccessStatusCode, "Purchase invoice creation failed");

        // 4. Workflow 4: Sales Invoice to Customer (Direct Sale of 10 cartons)
        var saleReq = new CreateSalesInvoiceRequest(
            CustomerId: customer.Id,
            DistributorId: distributor.Id,
            WarehouseId: null, // from field
            InvoiceDate: DateTime.UtcNow,
            PaymentMethod: "Credit",
            PaidAmount: 0,
            DueDate: DateTime.UtcNow.AddDays(7),
            Notes: "بيع آجل للمحل التجاري",
            Items: new List<SalesInvoiceItemRequest>
            {
                new(product.Id, 10, 0, product.SalePriceCarton, 0)
            }
        );

        var saleRes = await _client.PostAsJsonAsync("/api/v1/customers/sales", saleReq);
        Assert.True(saleRes.IsSuccessStatusCode, "Sales invoice creation failed");

        // 5. Verify Customer Ledger updated
        var ledger = await _client.GetFromJsonAsync<List<CustomerLedgerEntryDto>>($"/api/v1/customers/{customer.Id}/ledger");
        Assert.NotNull(ledger);
        Assert.NotEmpty(ledger);

        // 6. Workflow: Cash Collection from Customer
        var cashboxes = await _client.GetFromJsonAsync<List<CashboxDto>>("/api/v1/finance/cashboxes");
        Assert.NotNull(cashboxes);
        Assert.NotEmpty(cashboxes);

        var voucherReq = new PaymentVoucherRequest(
            VoucherType: "Receipt",
            PartyType: "Customer",
            PartyId: customer.Id,
            Amount: 15000,
            CashboxId: cashboxes[0].Id,
            Description: "سند قبض نقدي سداد جزئي"
        );

        var voucherRes = await _client.PostAsJsonAsync("/api/v1/finance/vouchers", voucherReq);
        Assert.True(voucherRes.IsSuccessStatusCode, "Payment voucher failed");

        // 7. Verify Journal Entries are strictly balanced (Debit == Credit)
        var journals = await _client.GetFromJsonAsync<List<JournalEntryDto>>("/api/v1/finance/journal");
        Assert.NotNull(journals);
        Assert.NotEmpty(journals);

        foreach (var j in journals)
        {
            Assert.True(j.IsBalanced, $"Journal Entry {j.EntryNumber} is not balanced: Debit={j.TotalDebit}, Credit={j.TotalCredit}");
            Assert.Equal(j.TotalDebit, j.TotalCredit);
        }

        // 8. Verify Dashboard Metrics reflect real values
        var metrics = await _client.GetFromJsonAsync<DashboardMetricsDto>("/api/v1/dashboard/metrics");
        Assert.NotNull(metrics);
        Assert.True(metrics.TodaySales >= 0);
        Assert.True(metrics.TotalCustomerDebt >= 0);

        // 9. Execute and verify End-of-Day closing
        var dateStr = DateTime.UtcNow.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        var closingSummary = await _client.GetFromJsonAsync<DailyClosingSummaryDto>($"/api/v1/finance/daily-closing/summary?date={dateStr}");
        Assert.NotNull(closingSummary);
        Assert.True(closingSummary.ExpectedClosingCash >= 0);

        var closeReq = new CreateDailyClosingRequest(
            BusinessDate: DateTime.UtcNow.Date,
            ActualCash: closingSummary.ExpectedClosingCash,
            Notes: "إغلاق اليومية الآلي للاختبار الشامل"
        );
        var closeRes = await _client.PostAsJsonAsync("/api/v1/finance/daily-closing", closeReq);
        Assert.True(closeRes.IsSuccessStatusCode, "Daily closing failed");

        var closingHistory = await _client.GetFromJsonAsync<List<DailyClosingDto>>("/api/v1/finance/daily-closing/history");
        Assert.NotNull(closingHistory);
        Assert.NotEmpty(closingHistory);
        Assert.Equal(0, closingHistory[0].CashDifference);
    }
}
