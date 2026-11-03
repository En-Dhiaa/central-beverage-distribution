using Beverage.Domain.Entities.Customers;
using Beverage.Domain.Entities.Distributors;
using Beverage.Domain.Entities.Finance;
using Beverage.Domain.Entities.Identity;
using Beverage.Domain.Entities.Products;
using Beverage.Domain.Entities.Suppliers;
using Beverage.Domain.Entities.Warehouses;
using Beverage.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Beverage.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(BeverageDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        // 1. Seed Roles
        if (!await context.Roles.AnyAsync())
        {
            var adminRole = new Role
            {
                Name = "SuperAdmin",
                Description = "مدير النظام العام بكامل الصلاحيات",
                IsSystemRole = true
            };
            var accountantRole = new Role
            {
                Name = "Accountant",
                Description = "محاسب مالي وإدارة القيود والصناديق",
                IsSystemRole = true
            };
            var warehouseRole = new Role
            {
                Name = "WarehouseManager",
                Description = "أمين المخازن والثلاجة المركزية",
                IsSystemRole = true
            };
            var salesRole = new Role
            {
                Name = "SalesManager",
                Description = "مدير المبيعات والتوزيع",
                IsSystemRole = true
            };

            await context.Roles.AddRangeAsync(adminRole, accountantRole, warehouseRole, salesRole);
            await context.SaveChangesAsync();

            // 2. Seed Default Admin User
            var passwordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123456");
            var adminUser = new User
            {
                Username = "admin",
                NormalizedUsername = "ADMIN",
                FullName = "المدير العام للمؤسسة",
                Email = "admin@beverage.local",
                Phone = "777000111",
                PasswordHash = passwordHash,
                RoleId = adminRole.Id,
                IsActive = true
            };
            await context.Users.AddAsync(adminUser);

            var preference = new UserPreference
            {
                UserId = adminUser.Id,
                Language = "ar",
                Theme = "light",
                FontFamily = "Cairo",
                FontSize = 14,
                NotificationSoundEnabled = true,
                NotificationVolume = 80,
                DashboardLayoutJson = "{}"
            };
            await context.UserPreferences.AddAsync(preference);
            await context.SaveChangesAsync();
        }

        // 3. Seed Standard Chart of Accounts
        if (!await context.Accounts.AnyAsync())
        {
            var cashAccount = new Account { AccountCode = "10101", AccountName = "الصندوق الرئيسي", AccountType = AccountType.Asset, NormalBalance = NormalBalance.Debit };
            var bankAccount = new Account { AccountCode = "10102", AccountName = "الحساب البنكي", AccountType = AccountType.Asset, NormalBalance = NormalBalance.Debit };
            var arAccount = new Account { AccountCode = "10201", AccountName = "العملاء والمحلات (مدينون)", AccountType = AccountType.Asset, NormalBalance = NormalBalance.Debit };
            var inventoryAccount = new Account { AccountCode = "10301", AccountName = "مخزون البضائع", AccountType = AccountType.Asset, NormalBalance = NormalBalance.Debit };
            var custodyAccount = new Account { AccountCode = "10302", AccountName = "بضاعة عهدة لدى الموزعين", AccountType = AccountType.Asset, NormalBalance = NormalBalance.Debit };
            var apAccount = new Account { AccountCode = "20101", AccountName = "الموردون وشركات المياه (دائنون)", AccountType = AccountType.Liability, NormalBalance = NormalBalance.Credit };
            var capitalAccount = new Account { AccountCode = "30101", AccountName = "رأس المال", AccountType = AccountType.Equity, NormalBalance = NormalBalance.Credit };
            var salesAccount = new Account { AccountCode = "40101", AccountName = "إيرادات مبيعات المياه والعصائر", AccountType = AccountType.Revenue, NormalBalance = NormalBalance.Credit };
            var cogsAccount = new Account { AccountCode = "50101", AccountName = "تكلفة البضاعة المباعة", AccountType = AccountType.Expense, NormalBalance = NormalBalance.Debit };
            var operatingExpenseAccount = new Account { AccountCode = "50201", AccountName = "مصروفات تشغيلية وعمومية", AccountType = AccountType.Expense, NormalBalance = NormalBalance.Debit };

            await context.Accounts.AddRangeAsync(
                cashAccount, bankAccount, arAccount, inventoryAccount, custodyAccount,
                apAccount, capitalAccount, salesAccount, cogsAccount, operatingExpenseAccount
            );
            await context.SaveChangesAsync();

            // Default Cashbox
            var mainCashbox = new Cashbox
            {
                Name = "الصندوق الرئيسي للمؤسسة",
                AccountId = cashAccount.Id,
                OpeningBalance = 0,
                CurrentBalance = 0,
                IsActive = true
            };
            await context.Cashboxes.AddAsync(mainCashbox);
            await context.SaveChangesAsync();
        }

        // 4. Seed Units
        if (!await context.Units.AnyAsync())
        {
            var cartonUnit = new Unit { Name = "كرتون", Symbol = "ctn", UnitType = "Carton" };
            var pieceUnit = new Unit { Name = "حبة", Symbol = "pc", UnitType = "Piece" };
            var shrinkUnit = new Unit { Name = "باكت", Symbol = "pkt", UnitType = "Shrink" };

            await context.Units.AddRangeAsync(cartonUnit, pieceUnit, shrinkUnit);
            await context.SaveChangesAsync();
        }

        // 5. Seed Warehouses (General & Cold Storage)
        if (!await context.Warehouses.AnyAsync())
        {
            var mainWarehouse = new Warehouse
            {
                Code = "WH-MAIN",
                Name = "المستودع الرئيسي للاستلام",
                Location = "صنعاء - الحصبة",
                WarehouseType = WarehouseType.General,
                IsActive = true
            };

            var coldStorage = new Warehouse
            {
                Code = "WH-COLD",
                Name = "الثلاجة المركزية للتبريد والتوزيع",
                Location = "صنعاء - شارع الستين",
                WarehouseType = WarehouseType.ColdStorage,
                IsActive = true
            };

            await context.Warehouses.AddRangeAsync(mainWarehouse, coldStorage);
            await context.SaveChangesAsync();
        }

        // 6. Seed Expense Categories
        if (!await context.ExpenseCategories.AnyAsync())
        {
            var generalExpenseAccount = await context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "50201");
            await context.ExpenseCategories.AddRangeAsync(
                new ExpenseCategory { Name = "كهرباء وطاقة تبريد", Description = "فواتير كهرباء وتشغيل الثلاجة المركزية", AccountId = generalExpenseAccount?.Id },
                new ExpenseCategory { Name = "ديزل ووقود قاطرات وسيارات", Description = "وقود سيارات التوزيع والقاطرات", AccountId = generalExpenseAccount?.Id },
                new ExpenseCategory { Name = "أجور ومرتبات عمال ومحاسبين", Description = "أجور عمال التحميل وموظفي الثلاجة", AccountId = generalExpenseAccount?.Id },
                new ExpenseCategory { Name = "إيجار مقرات ومخازن", Description = "إيجار مستودع الاستلام والثلاجة", AccountId = generalExpenseAccount?.Id },
                new ExpenseCategory { Name = "صيانة معدات وتبريد", Description = "صيانة كمبروسرات التبريد والسيارات", AccountId = generalExpenseAccount?.Id }
            );
            await context.SaveChangesAsync();
        }

        // 7. Seed Sample Categories & Products
        if (!await context.Products.AnyAsync())
        {
            var waterCat = new Category { Name = "مياه صحية ومعدنية", Description = "مياه شرب معبأة بأحجام مختلفة", IsActive = true };
            var juiceCat = new Category { Name = "عصائر ومشروبات طبيعية", Description = "عصائر معلبة وكراتين متنوعة", IsActive = true };
            await context.Categories.AddRangeAsync(waterCat, juiceCat);
            await context.SaveChangesAsync();

            var pieceUnit = await context.Units.FirstAsync(u => u.Name == "حبة");

            var product1 = new Product
            {
                Sku = "WAT-SHM-075",
                Barcode = "629100011101",
                Name = "مياه شملان 0.75 لتر",
                NameEn = "Shamlan Water 0.75L",
                CategoryId = waterCat.Id,
                Manufacturer = "شركة مياه شملان",
                Description = "كرتون مياه شملان عبوة 0.75 لتر - 12 حبة",
                BaseUnitId = pieceUnit.Id,
                UnitsPerCarton = 12,
                DefaultPurchasePriceCarton = 2500m,
                DefaultSalePriceCarton = 2900m,
                DefaultSalePricePiece = 250m,
                MinStockAlert = 50,
                IsActive = true
            };

            var product2 = new Product
            {
                Sku = "WAT-HAD-150",
                Barcode = "629100011102",
                Name = "مياه حدة 1.5 لتر",
                NameEn = "Hadda Water 1.5L",
                CategoryId = waterCat.Id,
                Manufacturer = "شركة مياه حدة",
                Description = "كرتون مياه حدة عبوة 1.5 لتر عائلي - 6 حبات",
                BaseUnitId = pieceUnit.Id,
                UnitsPerCarton = 6,
                DefaultPurchasePriceCarton = 2200m,
                DefaultSalePriceCarton = 2600m,
                DefaultSalePricePiece = 450m,
                MinStockAlert = 30,
                IsActive = true
            };

            var product3 = new Product
            {
                Sku = "JUC-RAN-ORG",
                Barcode = "629100022201",
                Name = "عصير راني برتقال حبيبات",
                NameEn = "Rani Orange Juice Float",
                CategoryId = juiceCat.Id,
                Manufacturer = "شركة العوجان الصناعية",
                Description = "كرتون عصير راني برتقال 240 مل - 24 حبة",
                BaseUnitId = pieceUnit.Id,
                UnitsPerCarton = 24,
                DefaultPurchasePriceCarton = 6800m,
                DefaultSalePriceCarton = 7600m,
                DefaultSalePricePiece = 350m,
                MinStockAlert = 25,
                IsActive = true
            };

            await context.Products.AddRangeAsync(product1, product2, product3);
            await context.SaveChangesAsync();

            // Seed initial Supplier
            var supplier = new Supplier
            {
                SupplierCode = "SUP-001",
                Name = "شركة مياه شملان للمياه المعدنية",
                CompanyName = "مؤسسة شملان للتجارة والصناعة",
                Phone = "01-445566",
                Email = "sales@shamlanwater.com",
                Address = "صنعاء - وادي شملان",
                OpeningBalance = 0,
                CurrentBalance = 0,
                IsActive = true
            };
            await context.Suppliers.AddAsync(supplier);

            // Seed initial Distributor
            var distributor = new Distributor
            {
                DistributorCode = "DIST-001",
                Name = "محمد عبد الله الحكيمي",
                Phone = "771234567",
                Address = "صنعاء - الدائري الغربي",
                RouteArea = "خط شارع الستين - الجامعة - الرباط",
                RelationshipType = DistributorRelationshipType.Consignment,
                CreditLimit = 500000m,
                OpeningBalance = 0,
                CurrentBalance = 0,
                IsActive = true
            };
            await context.Distributors.AddAsync(distributor);
            await context.SaveChangesAsync();

            // Seed initial Customers linked to Distributor
            var customer1 = new Customer
            {
                CustomerCode = "CUST-001",
                Name = "بقالة النور المركزية",
                OwnerName = "الحاج عبد الرحمن",
                Phone = "772345678",
                Address = "شارع الستين أمام مستشفى آزال",
                Area = "الستين الغربي",
                CreditLimit = 200000m,
                OpeningBalance = 0,
                CurrentBalance = 0,
                AssignedDistributorId = distributor.Id,
                IsActive = true
            };

            var customer2 = new Customer
            {
                CustomerCode = "CUST-002",
                Name = "سوبرماركت البركة",
                OwnerName = "أحمد الوصابي",
                Phone = "773456789",
                Address = "تقاطع شارع الرباط مع الدائري",
                Area = "الرباط",
                CreditLimit = 350000m,
                OpeningBalance = 0,
                CurrentBalance = 0,
                AssignedDistributorId = distributor.Id,
                IsActive = true
            };

            await context.Customers.AddRangeAsync(customer1, customer2);
            await context.SaveChangesAsync();
        }
    }
}

