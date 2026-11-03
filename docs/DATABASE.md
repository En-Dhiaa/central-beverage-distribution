# DATABASE SCHEMA & MIGRATION SPECIFICATION
## Central Water & Beverage Distribution Management System

---

## 1. Relational Database Design

The system utilizes an enterprise relational schema designed for PostgreSQL in central production deployments and SQLite for standalone / offline operations.

### Tables Overview:

| الجدول (Table) | الوظيفة (Purpose) | القيود والفهارس (Constraints & Indexes) |
| :--- | :--- | :--- |
| `users` | حسابات المستخدمين | Unique NormalizedUsername, Foreign Key RoleId |
| `roles` | الأدوار والصلاحيات | Unique Name |
| `categories` | تصنيفات المنتجات (مياه، عصائر...) | Self-referencing ParentId |
| `units` | وحدات القياس (كرتون، حبة، باكت) | Symbol |
| `products` | كتالوج الأصناف | Unique SKU, Index Barcode |
| `warehouses` | المستودعات والثلاجة المركزية | Unique Code |
| `inventory_balances` | أرصدة المنتجات في المستودعات | Unique (ProductId, WarehouseId, LocationId, BatchId) |
| `inventory_transactions` | سجل الحركات المخزنية غير القابل للتعديل | Indexed ProductId, WarehouseId, TransactionDate |
| `suppliers` | شركات المياه والموردين | Unique SupplierCode |
| `purchase_invoices` | فواتير الشراء | Unique InvoiceNumber, Cascade on Items |
| `distributors` | الموزعون الميدانيون | Unique DistributorCode |
| `distributor_dispatches` | سندات تسليم العهد | Unique DispatchNumber, Cascade on Items |
| `distributor_settlements` | التسويات اليومية للموزعين | Unique SettlementNumber, Strict Balance Check |
| `customers` | المحلات والبقالات | Unique CustomerCode, Index Area |
| `sales_invoices` | فواتير المبيعات | Unique InvoiceNumber, Cascade on Items |
| `accounts` | دليل الحسابات المالي | Unique AccountCode |
| `journal_entries` | دفتر اليومية العامة | Balanced Debit == Credit |
| `journal_entry_lines` | بنود القيود المحاسبية | Indexed AccountId, Subledger Ids |
| `cashboxes` | الصناديق النقدية | Foreign Key AccountId |
| `cash_transactions` | حركات المقبوضات والمدفوعات | Reference Document |
| `expenses` | المصروفات التشغيلية | CategoryId, CashboxId |
| `audit_logs` | سجل التدقيق والعمليات الحساسة | Indexed UserId, Module, CreatedAt |

---

## 2. Seed Data
The database automatically seeds default records on first run:
- SuperAdmin (`admin` / `Admin@123456`)
- Standard Chart of Accounts (Cash 10101, Bank 10102, AR 10201, Inventory 10301, Custody 10302, AP 20101, Capital 30101, Revenue 40101, COGS 50101, Expenses 50201)
- Units: كرتون, حبة, باكت
- Warehouses: المستودع الرئيسي (General), الثلاجة المركزية (ColdStorage)
- Expense Categories: كهرباء وطاقة تبريد, وقود ومحروقات, أجور ومرتبات, إيجار, صيانة معدات وتبريد
- Initial Supplier: شركة مياه شملان
- Initial Distributor: موزع الأمانة - صنعاء
- Initial Customers: بقالة النور, سوبرماركت البركة

