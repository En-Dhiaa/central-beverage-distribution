using Beverage.Domain.Common;
using Beverage.Domain.Entities.Customers;
using Beverage.Domain.Entities.Distributors;
using Beverage.Domain.Entities.Finance;
using Beverage.Domain.Entities.Identity;
using Beverage.Domain.Entities.Products;
using Beverage.Domain.Entities.Sales;
using Beverage.Domain.Entities.Suppliers;
using Beverage.Domain.Entities.System;
using Beverage.Domain.Entities.Warehouses;
using Microsoft.EntityFrameworkCore;

namespace Beverage.Infrastructure.Data;

public class BeverageDbContext : DbContext
{
    public BeverageDbContext(DbContextOptions<BeverageDbContext> options) : base(options)
    {
    }

    // Identity
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<UserSession> UserSessions => Set<UserSession>();
    public DbSet<UserPreference> UserPreferences => Set<UserPreference>();

    // Products
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Unit> Units => Set<Unit>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductUnitConversion> ProductUnitConversions => Set<ProductUnitConversion>();
    public DbSet<ProductPrice> ProductPrices => Set<ProductPrice>();
    public DbSet<ProductCostHistory> ProductCostHistories => Set<ProductCostHistory>();

    // Warehouses & Inventory
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<WarehouseLocation> WarehouseLocations => Set<WarehouseLocation>();
    public DbSet<InventoryBalance> InventoryBalances => Set<InventoryBalance>();
    public DbSet<InventoryTransaction> InventoryTransactions => Set<InventoryTransaction>();
    public DbSet<InventoryBatch> InventoryBatches => Set<InventoryBatch>();
    public DbSet<StockAdjustment> StockAdjustments => Set<StockAdjustment>();
    public DbSet<StockAdjustmentItem> StockAdjustmentItems => Set<StockAdjustmentItem>();

    // Suppliers & Purchasing
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<SupplierContact> SupplierContacts => Set<SupplierContact>();
    public DbSet<PurchaseInvoice> PurchaseInvoices => Set<PurchaseInvoice>();
    public DbSet<PurchaseInvoiceItem> PurchaseInvoiceItems => Set<PurchaseInvoiceItem>();
    public DbSet<PurchaseReturn> PurchaseReturns => Set<PurchaseReturn>();
    public DbSet<PurchaseReturnItem> PurchaseReturnItems => Set<PurchaseReturnItem>();

    // Distributors & Customers
    public DbSet<Distributor> Distributors => Set<Distributor>();
    public DbSet<DistributorDispatch> DistributorDispatches => Set<DistributorDispatch>();
    public DbSet<DistributorDispatchItem> DistributorDispatchItems => Set<DistributorDispatchItem>();
    public DbSet<DistributorSettlement> DistributorSettlements => Set<DistributorSettlement>();
    public DbSet<DistributorSettlementItem> DistributorSettlementItems => Set<DistributorSettlementItem>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<CustomerDistributorHistory> CustomerDistributorHistories => Set<CustomerDistributorHistory>();

    // Sales
    public DbSet<SalesInvoice> SalesInvoices => Set<SalesInvoice>();
    public DbSet<SalesInvoiceItem> SalesInvoiceItems => Set<SalesInvoiceItem>();
    public DbSet<SalesReturn> SalesReturns => Set<SalesReturn>();
    public DbSet<SalesReturnItem> SalesReturnItems => Set<SalesReturnItem>();

    // Finance & Accounting
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<JournalEntry> JournalEntries => Set<JournalEntry>();
    public DbSet<JournalEntryLine> JournalEntryLines => Set<JournalEntryLine>();
    public DbSet<Cashbox> Cashboxes => Set<Cashbox>();
    public DbSet<CashTransaction> CashTransactions => Set<CashTransaction>();
    public DbSet<PaymentVoucher> PaymentVouchers => Set<PaymentVoucher>();
    public DbSet<ExpenseCategory> ExpenseCategories => Set<ExpenseCategory>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<DailyClosing> DailyClosings => Set<DailyClosing>();

    // System
    public DbSet<FixedAsset> FixedAssets => Set<FixedAsset>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<UserNotification> UserNotifications => Set<UserNotification>();
    public DbSet<StoredFile> StoredFiles => Set<StoredFile>();
    public DbSet<DocumentTemplate> DocumentTemplates => Set<DocumentTemplate>();
    public DbSet<DocumentShare> DocumentShares => Set<DocumentShare>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<BackupJob> BackupJobs => Set<BackupJob>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure all Decimals to have precision (18, 2) by default
        foreach (var property in modelBuilder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetPrecision(18);
            property.SetScale(2);
        }

        // Unique indexes
        modelBuilder.Entity<User>()
            .HasIndex(u => u.NormalizedUsername)
            .IsUnique();

        modelBuilder.Entity<Product>()
            .HasIndex(p => p.Sku)
            .IsUnique();

        modelBuilder.Entity<Supplier>()
            .HasIndex(s => s.SupplierCode)
            .IsUnique();

        modelBuilder.Entity<Customer>()
            .HasIndex(c => c.CustomerCode)
            .IsUnique();

        modelBuilder.Entity<Distributor>()
            .HasIndex(d => d.DistributorCode)
            .IsUnique();

        modelBuilder.Entity<Warehouse>()
            .HasIndex(w => w.Code)
            .IsUnique();

        modelBuilder.Entity<Account>()
            .HasIndex(a => a.AccountCode)
            .IsUnique();

        // Inventory balance unique per product + warehouse + location + batch
        modelBuilder.Entity<InventoryBalance>()
            .HasIndex(b => new { b.ProductId, b.WarehouseId, b.LocationId, b.BatchId })
            .IsUnique();

        // Restrict delete on relational audit safety
        foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
        {
            relationship.DeleteBehavior = DeleteBehavior.Restrict;
        }

        // Configure cascade on specific owned child items
        modelBuilder.Entity<PurchaseInvoice>()
            .HasMany(p => p.Items)
            .WithOne(i => i.PurchaseInvoice)
            .HasForeignKey(i => i.PurchaseInvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SalesInvoice>()
            .HasMany(s => s.Items)
            .WithOne(i => i.SalesInvoice)
            .HasForeignKey(i => i.SalesInvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DistributorDispatch>()
            .HasMany(d => d.Items)
            .WithOne(i => i.DistributorDispatch)
            .HasForeignKey(i => i.DistributorDispatchId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DistributorSettlement>()
            .HasMany(s => s.Items)
            .WithOne(i => i.DistributorSettlement)
            .HasForeignKey(i => i.DistributorSettlementId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<JournalEntry>()
            .HasMany(j => j.Lines)
            .WithOne(l => l.JournalEntry)
            .HasForeignKey(l => l.JournalEntryId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries<BaseEntity>();
        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}

