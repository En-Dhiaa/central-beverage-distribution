# 02 — SYSTEM ARCHITECTURE & DATABASE DESIGN
# المعمارية البرمجية وتصميم قاعدة البيانات

**Project:** Beverage Distribution Management System  
**Document:** Technical Architecture & Database Specification  
**Version:** 1.0  
**Architecture:** Modular Monolith + Clean Architecture  
**Backend:** ASP.NET Core 10 Web API  
**Frontend:** React + TypeScript  
**Desktop:** Tauri 2  
**Database:** PostgreSQL  
**ORM:** Entity Framework Core  
**Real-time:** SignalR  
**Primary Language:** Arabic / RTL

---

# 1. ARCHITECTURAL VISION

يجب بناء النظام باستخدام معمارية برمجية حديثة، قابلة للتوسع والصيانة، وتسمح بإضافة وظائف جديدة دون التأثير على الوظائف المستقرة.

المعمارية الأساسية:

**Modular Monolith + Clean Architecture**

لا نريد البدء باستخدام Microservices؛ لأنها ستضيف تعقيدًا غير ضروري لحجم المشروع الحالي.

يجب تقسيم النظام إلى وحدات مستقلة منطقيًا، مع مشاركة الخدمات والبنية الأساسية بطريقة منظمة.

## 1.1 Architectural Principles

- Separation of Concerns.
- Dependency Inversion.
- Single Responsibility.
- Domain-Driven Design Principles.
- Transactional Consistency.
- Secure by Design.
- Database Integrity.
- API-First Development.
- Modular Business Domains.
- Testability and Maintainability.

يجب أن تبقى قواعد العمل داخل طبقات النظام الداخلية، ولا يتم وضع المنطق المحاسبي داخل React أو واجهات المستخدم.

---

# 2. TECHNOLOGY STACK

## 2.1 Frontend

**React + TypeScript**

المكتبات المقترحة:

- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- shadcn/ui.
- Lucide React.
- TanStack Query.
- React Hook Form.
- Zod.
- Zustand عند الحاجة لإدارة الحالة العامة.
- Recharts.
- i18next.
- Day.js.

المتطلبات:

- Component-Based Architecture.
- Reusable Components.
- Centralized API Client.
- Form Validation.
- Error Handling.
- Loading States.
- Empty States.
- Responsive Layout.
- RTL/LTR Support.
- Theme Provider.
- Font Management.
- Dashboard Customization.

لا تضع العمليات الحسابية أو قواعد صلاحيات المستخدم في الواجهة باعتبارها مصدرًا موثوقًا.

## 2.2 Backend

**ASP.NET Core 10 Web API**

استخدم:

- ASP.NET Core.
- Entity Framework Core.
- PostgreSQL Provider.
- FluentValidation.
- ASP.NET Core Identity أو آلية هوية آمنة متكاملة.
- JWT أو Cookie Authentication حسب نمط النشر.
- SignalR.
- Serilog.
- Swagger / OpenAPI.
- Background Services.
- Health Checks.

يجب اعتماد أحدث الإصدارات المستقرة والمتوافقة من الحزم عند بدء التنفيذ، وعدم استخدام حزم مهجورة.

## 2.3 Desktop

**Tauri 2**

وظيفته:

- تغليف واجهة React.
- إنشاء Windows EXE Installer.
- إدارة أيقونة التطبيق.
- إشعارات Windows.
- دعم فتح الملفات.
- دعم الطباعة.
- التكامل مع وظائف نظام التشغيل الضرورية.

يجب أن تتشارك نسخة Windows ونسخة الويب نفس API ونفس منطق العمل.

## 2.4 Database

**PostgreSQL**

المتطلبات:

- Relational Database.
- Foreign Keys.
- Constraints.
- Indexes.
- Transactions.
- Migrations.
- Audit Support.
- Backup and Restore.
- Data Integrity.

يجب عدم وضع ملف قاعدة البيانات في مجلد مشترك بين الأجهزة وفتحه مباشرة من كل جهاز.

الاتصال يكون عبر Backend API فقط.

---

# 3. SOLUTION STRUCTURE

هيكل المشروع المقترح:

```text
BeverageManagement/
│
├── backend/
│   │
│   ├── src/
│   │   ├── Beverage.Api/
│   │   ├── Beverage.Domain/
│   │   ├── Beverage.Application/
│   │   ├── Beverage.Infrastructure/
│   │   ├── Beverage.Contracts/
│   │   └── Beverage.Shared/
│   │
│   ├── tests/
│   │   ├── Beverage.UnitTests/
│   │   ├── Beverage.IntegrationTests/
│   │   └── Beverage.ArchitectureTests/
│   │
│   └── Beverage.sln
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── i18n/
│   │   ├── themes/
│   │   ├── utils/
│   │   └── types/
│   │
│   └── package.json
│
├── desktop/
│   └── tauri/
│
├── infrastructure/
│   ├── docker/
│   ├── database/
│   ├── deployment/
│   └── scripts/
│
├── storage/
│   ├── product-images/
│   ├── user-images/
│   ├── customer-images/
│   ├── attachments/
│   └── generated-documents/
│
├── backups/
│
├── docs/
│   ├── 01_MASTER_PRODUCT_SPEC.md
│   ├── 02_SYSTEM_ARCHITECTURE_DATABASE.md
│   └── 03_UI_UX_IMPLEMENTATION_ROADMAP.md
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

يجب ألا تكون مجلدات التخزين والنسخ الاحتياطية مكشوفة مباشرة للعامة أو متاحة عبر مجلدات الويب الثابتة.

---

# 4. BACKEND LAYER RESPONSIBILITIES

## 4.1 Beverage.Domain

تحتوي على:

- Entities.
- Value Objects.
- Domain Enums.
- Domain Events.
- Business Rules.
- Domain Exceptions.

يجب ألا تعتمد على ASP.NET أو قاعدة البيانات مباشرة.

## 4.2 Beverage.Application

تحتوي على:

- Use Cases.
- Commands.
- Queries.
- DTOs.
- Validators.
- Interfaces.
- Business Workflows.
- Application Services.

يجب تنظيم العمليات حسب الوحدات الوظيفية.

## 4.3 Beverage.Infrastructure

تحتوي على:

- DbContext.
- Entity Configurations.
- Repository Implementations عند الحاجة.
- Authentication Implementations.
- Storage Services.
- Backup Services.
- Email Integrations.
- WhatsApp Integrations.
- PDF Generation.
- Logging.
- External Services.

## 4.4 Beverage.Api

تحتوي على:

- API Controllers أو Minimal API Modules.
- Authentication.
- Authorization.
- Middleware.
- Dependency Injection.
- Rate Limiting.
- Exception Handling.
- API Versioning.
- OpenAPI.
- Health Checks.

---

# 5. DOMAIN MODULES

يجب تقسيم النظام إلى وحدات منطقية.

```text
Core
├── Identity
├── Permissions
├── Audit
├── Notifications
└── Settings

Business
├── Suppliers
├── Products
├── Purchasing
├── Warehouses
├── Inventory
├── Distributors
├── Customers
├── Sales
├── Returns
└── Assets

Finance
├── Accounting
├── Accounts
├── Cashboxes
├── Payments
├── Receipts
├── Expenses
└── Reports

Documents
├── Invoices
├── Templates
├── PDF
├── Printing
└── Sharing

System
├── Backup
├── Storage
├── Dashboard
├── Localization
└── Maintenance
```

كل وحدة لها خدماتها وعملياتها وقواعدها الخاصة، مع مشاركة الوظائف المشتركة من خلال واجهات محددة.

---

# 6. DATABASE DESIGN — DATABASE STRUCTURE

يجب تصميم قاعدة البيانات بشكل علائقي متكامل.

استخدم أسماء جداول وأعمدة واضحة باللغة الإنجليزية، مع توثيق معناها بالعربية.

استخدم:

- UUID للمعرفات الأساسية.
- Numeric/Decimal للمبالغ المالية.
- Timestamp with Time Zone للأوقات.
- Foreign Keys للعلاقات.
- Unique Constraints للبيانات الفريدة.
- Check Constraints للقيم المسموح بها.
- Indexes للاستعلامات المتكررة.

يجب تجنب استخدام Floating Point في تخزين المبالغ والأسعار.

## 6.1 Identity & Users

الجداول:

### users
- id
- username
- normalized_username
- full_name
- email
- phone
- password_hash
- profile_image_id
- role_id
- is_active
- last_login_at
- created_at
- updated_at

### roles
- id
- name
- description
- is_system_role
- created_at

### permissions
- id
- code
- name
- module
- description

### role_permissions
- id
- role_id
- permission_id

### user_permissions
- id
- user_id
- permission_id
- effect

### user_sessions
- id
- user_id
- device_name
- ip_address
- created_at
- last_activity_at
- expires_at
- revoked_at

### user_preferences
- id
- user_id
- language
- theme
- font_family
- font_size
- notification_sound_enabled
- notification_volume
- dashboard_layout_json

يجب استخدام نظام آمن لإدارة كلمات المرور والجلسات، وعدم تخزين كلمات المرور كنص عادي.

## 6.2 Suppliers

### suppliers
- id
- supplier_code
- name
- company_name
- phone
- email
- address
- image_id
- opening_balance
- current_balance
- notes
- is_active
- created_at

### supplier_contacts
- id
- supplier_id
- contact_name
- phone
- position

## 6.3 Products

### categories
- id
- name
- parent_id
- description
- image_id
- is_active

### products
- id
- sku
- barcode
- name
- name_en
- category_id
- manufacturer
- description
- image_id
- base_unit_id
- units_per_carton
- min_stock
- is_active
- created_at

### units
- id
- name
- symbol
- unit_type

### product_unit_conversions
- id
- product_id
- from_unit_id
- to_unit_id
- conversion_factor

### product_prices
- id
- product_id
- price_type
- customer_id
- distributor_id
- price
- effective_from
- effective_to

### product_cost_history
- id
- product_id
- purchase_price
- additional_cost
- effective_at
- purchase_document_id

يجب الاحتفاظ بتاريخ الأسعار والتكاليف بدل استبدال القيمة القديمة دون أثر.

## 6.4 Warehouses

### warehouses
- id
- code
- name
- location
- warehouse_type
- is_active

### warehouse_locations
- id
- warehouse_id
- name
- description

### inventory_balances
- id
- product_id
- warehouse_id
- location_id
- batch_id
- quantity
- reserved_quantity
- updated_at

### inventory_transactions
- id
- transaction_number
- product_id
- warehouse_id
- transaction_type
- quantity_in
- quantity_out
- unit_cost
- source_type
- source_id
- batch_id
- user_id
- transaction_date
- created_at

### inventory_batches
- id
- product_id
- batch_number
- production_date
- expiry_date
- received_quantity
- remaining_quantity

### stock_adjustments
- id
- adjustment_number
- warehouse_id
- reason
- status
- created_by
- approved_by
- created_at

يجب أن يكون سجل الحركات المخزنية هو المرجع الأساسي لتفسير تغير الأرصدة.

جدول الأرصدة يعتبر تمثيلًا محدثًا للحالة الحالية، ويجب التحقق من تطابقه مع الحركات.

## 6.5 Customers

### customers
- id
- customer_code
- name
- owner_name
- phone
- address
- image_id
- credit_limit
- opening_balance
- current_balance
- assigned_distributor_id
- is_active
- created_at

### customer_distributor_history
- id
- customer_id
- distributor_id
- assigned_from
- assigned_to
- notes

يجب الاحتفاظ بتاريخ تغيير الموزع المسؤول عن العميل.

## 6.6 Distributors

### distributors
- id
- distributor_code
- name
- phone
- address
- image_id
- relationship_type
- credit_limit
- opening_balance
- current_balance
- commission_type
- commission_value
- is_active
- created_at

### distributor_routes
- id
- distributor_id
- route_name
- description
- is_active

### distributor_customers
- id
- distributor_id
- customer_id
- assigned_at
- is_active

### distributor_dispatches
- id
- dispatch_number
- distributor_id
- warehouse_id
- dispatch_type
- dispatch_date
- total_cost
- status
- created_by
- approved_by

### distributor_dispatch_items
- id
- dispatch_id
- product_id
- batch_id
- quantity
- unit_cost
- agreed_sale_price

### distributor_settlements
- id
- settlement_number
- distributor_id
- period_start
- period_end
- opening_balance
- sales_total
- collected_total
- returns_total
- damaged_total
- shortage_total
- closing_balance
- status
- created_by
- approved_by

### distributor_settlement_items
- id
- settlement_id
- product_id
- opening_quantity
- received_quantity
- sold_quantity
- returned_quantity
- damaged_quantity
- shortage_quantity
- remaining_quantity

يجب دعم نموذج العهدة ونموذج البيع بالجملة بصورة منفصلة، وعدم تطبيق نفس المعالجة المحاسبية عليهما.

## 6.7 Purchasing

### purchase_invoices
- id
- invoice_number
- supplier_id
- warehouse_id
- supplier_invoice_number
- invoice_date
- subtotal
- discount
- additional_cost
- total
- paid_amount
- remaining_amount
- status
- created_by
- approved_by

### purchase_invoice_items
- id
- purchase_invoice_id
- product_id
- batch_id
- quantity
- unit_id
- unit_price
- discount
- total

### purchase_returns
- id
- return_number
- supplier_id
- purchase_invoice_id
- return_date
- total
- reason
- status

## 6.8 Sales

### sales_invoices
- id
- invoice_number
- customer_id
- distributor_id
- warehouse_id
- sales_type
- invoice_date
- subtotal
- discount
- total
- paid_amount
- remaining_amount
- due_date
- status
- created_by
- approved_by

### sales_invoice_items
- id
- sales_invoice_id
- product_id
- batch_id
- quantity
- unit_id
- unit_price
- cost_price
- discount
- total

### sales_returns
- id
- return_number
- sales_invoice_id
- customer_id
- return_date
- total
- reason
- status

يجب الفصل بين المبيعات المباشرة من المؤسسة والمبيعات التي ينفذها الموزع في نموذج العهدة.

في نموذج العهدة، بيع الموزع للمحل يجب أن يسجل في النظام باعتباره حركة بيع تخص المؤسسة، مع تخفيض عهدة الموزع وتسجيل المديونية على المحل عند البيع الآجل.

## 6.9 Financial Accounts

### accounts
- id
- account_code
- account_name
- parent_id
- account_type
- normal_balance
- is_active

### journal_entries
- id
- entry_number
- entry_date
- description
- source_type
- source_id
- status
- created_by
- approved_by

### journal_entry_lines
- id
- journal_entry_id
- account_id
- debit
- credit
- description
- customer_id
- supplier_id
- distributor_id

### cashboxes
- id
- name
- account_id
- opening_balance
- current_balance
- is_active

### cash_transactions
- id
- transaction_number
- cashbox_id
- transaction_type
- amount
- transaction_date
- reference_type
- reference_id
- description
- created_by

### payment_vouchers
- id
- voucher_number
- voucher_type
- party_type
- party_id
- amount
- payment_method
- cashbox_id
- reference_number
- payment_date
- status

### expenses
- id
- expense_number
- category_id
- cashbox_id
- amount
- expense_date
- description
- attachment_id
- created_by

### expense_categories
- id
- name
- description
- parent_id

## 6.10 Fixed Assets

### fixed_assets
- id
- asset_code
- name
- description
- image_id
- purchase_date
- purchase_cost
- current_value
- asset_category_id
- location
- assigned_to
- status

### asset_categories
- id
- name
- useful_life_months
- depreciation_method

### asset_depreciations
- id
- asset_id
- depreciation_date
- amount
- accumulated_depreciation

### asset_maintenance
- id
- asset_id
- maintenance_date
- description
- cost
- performed_by

## 6.11 Notifications

### notifications
- id
- title
- message
- notification_type
- priority
- reference_type
- reference_id
- created_at

### user_notifications
- id
- notification_id
- user_id
- is_read
- read_at

### notification_preferences
- id
- user_id
- notification_type
- enabled
- sound_enabled
- sound_id

## 6.12 Documents & Attachments

### files
- id
- original_name
- stored_name
- mime_type
- file_size
- storage_path
- checksum
- uploaded_by
- uploaded_at

### document_templates
- id
- name
- document_type
- template_configuration
- is_default
- created_at

### document_shares
- id
- document_type
- document_id
- share_token_hash
- expires_at
- revoked_at
- created_by

يجب ألا يكون رابط المشاركة وسيلة للوصول إلى ملفات أخرى أو بيانات غير مصرح بها.

## 6.13 System Settings & Audit

### system_settings
- id
- setting_key
- setting_value
- setting_group
- updated_by
- updated_at

### audit_logs
- id
- user_id
- action
- module
- entity_type
- entity_id
- old_values
- new_values
- ip_address
- created_at

### backup_jobs
- id
- backup_type
- destination
- file_path
- file_size
- status
- checksum
- started_at
- completed_at
- created_by

### daily_closings
- id
- closing_number
- business_date
- opening_cash
- closing_cash
- expected_cash
- cash_difference
- sales_total
- expenses_total
- status
- closed_by
- approved_by

---

# 7. DATABASE RELATIONSHIPS

يجب تنفيذ العلاقات بصورة صحيحة مع استخدام Foreign Keys والقيود المناسبة.

العلاقات الأساسية:

- المورد الواحد يمتلك عدة فواتير شراء.
- فاتورة الشراء تحتوي على عدة أصناف.
- المنتج ينتمي إلى تصنيف.
- المنتج يمتلك عدة أسعار تاريخية.
- المنتج يمتلك عدة تشغيلات.
- المستودع يحتوي على عدة منتجات.
- المنتج يتحرك بين المستودعات.
- الموزع يمتلك عدة عمليات تسليم.
- الموزع يمكن أن يرتبط بعدة محلات.
- المحل يمتلك عدة فواتير.
- الفاتورة تمتلك عدة دفعات أو تسديدات جزئية.
- كل عملية مالية يمكن ربطها بقيد محاسبي.
- كل مستخدم يمتلك عدة عمليات مسجلة.
- كل مستند يمكن أن يمتلك عدة مرفقات.

يجب استخدام قيود تمنع حذف السجلات المرجعية التي ترتبط بحركات مالية أو مخزنية معتمدة.

يفضل استخدام Soft Delete للبيانات الرئيسية عند الحاجة، مع منع حذف السجلات المحاسبية التاريخية.

---

# 8. ACCOUNTING ENGINE

محرك المحاسبة هو المصدر الأساسي لصحة البيانات المالية.

يجب استخدام نظام القيد المزدوج.

كل قيد يجب أن يحقق:

**Total Debit = Total Credit**

لا يتم اعتماد أي قيد غير متوازن.

## 8.1 Purchase Accounting

مثال:

شراء بضاعة بقيمة 500,000 ريال آجلًا.

القيد:

مدين: المخزون 500,000

دائن: الموردون 500,000

عند دفع 300,000:

مدين: الموردون 300,000

دائن: الصندوق 300,000

## 8.2 Sales Accounting

مثال:

بيع بضاعة بقيمة 100,000 وتكلفتها 70,000 آجلًا.

القيد الأول:

مدين: العملاء 100,000

دائن: المبيعات 100,000

القيد الثاني:

مدين: تكلفة البضاعة المباعة 70,000

دائن: المخزون 70,000

## 8.3 Customer Payment

تحصيل 50,000 من عميل:

مدين: الصندوق 50,000

دائن: العملاء 50,000

لا يتم تسجيل التحصيل باعتباره إيرادًا جديدًا.

## 8.4 Distributor Consignment

تسليم البضاعة للموزع في نموذج العهدة:

- تخفيض مخزون المستودع.
- زيادة مخزون العهدة لدى الموزع.
- لا تسجل مبيعات نهائية بمجرد التسليم.

عند بيع الموزع للمحل:

- إثبات المبيعات.
- إثبات تكلفة البضاعة المباعة.
- تخفيض عهدة الموزع.
- إثبات مديونية المحل أو التحصيل النقدي.

## 8.5 Returns & Damaged Goods

يجب تحديد المعالجة المحاسبية حسب نوع الحركة.

المرتجع الصالح يعود إلى المخزون.

التالف يسجل في حساب خسائر أو مصروفات التلف وفق سياسة المؤسسة.

العجز يسجل بصورة مستقلة ويحتاج إلى تحديد المسؤولية واعتماد التسوية.

يجب ألا تؤدي معالجة المرتجعات إلى تسجيل مبيعات أو إيرادات إضافية غير صحيحة.

## 8.6 Accounting Policies

يجب أن يدعم النظام سياسة واضحة لتقييم المخزون، ويوصى باستخدام المتوسط المرجح المتحرك كبداية، مع الاحتفاظ بتكلفة التشغيلات وتفاصيلها.

يجب تحديد طريقة توزيع تكاليف النقل والمصاريف المباشرة على المنتجات.

يجب عدم احتساب الأرباح من إجمالي المبيعات فقط.

---

# 9. TRANSACTION MANAGEMENT

جميع العمليات الحساسة يجب تنفيذها داخل Database Transactions.

مثال اعتماد فاتورة بيع:

1. التحقق من صلاحية المستخدم.
2. التحقق من حالة الفاتورة.
3. التحقق من توفر المخزون.
4. التحقق من الأسعار.
5. إنشاء الفاتورة.
6. إنشاء تفاصيل الفاتورة.
7. إنشاء حركات المخزون.
8. إنشاء القيود المالية.
9. تحديث الأرصدة.
10. تسجيل عملية التدقيق.
11. اعتماد المستند.

يجب أن تتم العمليات ذات الصلة بصورة ذرية؛ إما تنجح جميعها أو يتم التراجع عنها بالكامل.

يجب استخدام آليات منع التكرار Idempotency Keys عند تنفيذ العمليات الحساسة، خاصة مع إعادة إرسال الطلبات أو ضعف الاتصال.

يجب منع اعتماد الفاتورة مرتين.

---

# 10. API DESIGN

يجب اعتماد REST API منظم بإصدارات.

المسار الأساسي:

`/api/v1/`

أمثلة:

```text
/api/v1/auth
/api/v1/users
/api/v1/roles
/api/v1/suppliers
/api/v1/products
/api/v1/warehouses
/api/v1/inventory
/api/v1/purchases
/api/v1/customers
/api/v1/distributors
/api/v1/sales
/api/v1/returns
/api/v1/accounting
/api/v1/cashboxes
/api/v1/payments
/api/v1/expenses
/api/v1/assets
/api/v1/reports
/api/v1/notifications
/api/v1/dashboard
/api/v1/documents
/api/v1/settings
/api/v1/backups
```

المتطلبات:

- Pagination.
- Filtering.
- Sorting.
- Validation.
- Consistent Response Format.
- Error Codes.
- Authorization.
- Rate Limiting.
- API Versioning.

لا ترجع رسائل استثناء داخلية أو تفاصيل قاعدة البيانات للمستخدم النهائي.

---

# 11. REAL-TIME SYSTEM

استخدام SignalR لتحديث البيانات عند الحاجة.

أمثلة:

- إشعار وصول مشتريات.
- تحديث المخزون.
- اعتماد فاتورة.
- تسجيل تحصيل.
- تنبيه موزع.
- وصول إشعار جديد.
- تحديث لوحة التحكم.
- انتهاء النسخ الاحتياطي.

يجب أن يكون الاتصال آمنًا، وألا يتم إرسال أحداث إلى مستخدم غير مخول باستقبالها.

يجب عدم الاعتماد على SignalR كمصدر دائم للبيانات؛ الإشعارات المهمة تحفظ في قاعدة البيانات.

---

# 12. SECURITY ARCHITECTURE

تطبيق الأمن على جميع الطبقات.

## 12.1 Authentication

- إدارة هوية مركزية.
- كلمات مرور مجزأة بخوارزمية آمنة.
- انتهاء الجلسات.
- إلغاء الجلسات.
- تحديد محاولات الدخول.
- إمكانية المصادقة متعددة العوامل.

## 12.2 Authorization

يجب تطبيق الصلاحيات على مستوى:

- API.
- Application Services.
- Business Operations.
- Document Access.
- File Access.

لا يكفي إخفاء عناصر الواجهة.

## 12.3 Encryption

- TLS للاتصالات.
- تشفير النسخ الاحتياطية.
- تشفير الملفات الحساسة.
- حماية مفاتيح التشفير.
- عدم تخزين المفاتيح داخل Repository.
- تشفير بيانات الاتصال والأسرار.
- استخدام إدارة أسرار آمنة.

## 12.4 Audit Trail

يجب تسجيل:

- تسجيل الدخول.
- محاولات الدخول الفاشلة.
- إنشاء المستندات.
- اعتماد الفواتير.
- تعديل البيانات.
- عمليات التسوية.
- عمليات الحذف أو الإلغاء.
- تغيير الصلاحيات.
- النسخ الاحتياطي والاستعادة.
- إعدادات النظام الحساسة.

سجلات التدقيق يجب أن تكون محمية من التعديل غير المصرح به.

---

# 13. FILE STORAGE ARCHITECTURE

يجب فصل الملفات عن قاعدة البيانات.

أنواع الملفات:

- صور المستخدمين.
- صور العملاء.
- صور المنتجات.
- صور الموردين.
- صور الأصول.
- مرفقات الفواتير.
- ملفات PDF.
- النسخ الاحتياطية.

البنية المقترحة:

```text
storage/
├── images/
│   ├── users/
│   ├── customers/
│   ├── suppliers/
│   ├── distributors/
│   ├── products/
│   └── assets/
│
├── attachments/
├── invoices/
├── reports/
└── backups/
```

هذه بنية منطقية للتخزين، ويجب ألا تعني أن الملفات متاحة عبر روابط عامة مباشرة.

يجب استخدام معرفات الملفات في قاعدة البيانات، وتوفير وصول آمن عبر API.

يجب التحقق من:

- امتداد الملف.
- MIME Type.
- حجم الملف.
- محتوى الملف عند الحاجة.
- صلاحيات المستخدم.
- اسم التخزين الداخلي.

---

# 14. BACKUP & RECOVERY ARCHITECTURE

تصميم خدمة مستقلة للنسخ الاحتياطي.

المتطلبات:

- نسخ قاعدة البيانات.
- نسخ الملفات والمرفقات.
- تشفير النسخ.
- التحقق من السلامة.
- الاحتفاظ بالإصدارات.
- تحديد جدول زمني.
- تخزين خارج الجهاز الرئيسي.
- استعادة كاملة.
- اختبار الاستعادة.

يجب أن تكون النسخة الاحتياطية متسقة زمنيًا مع ملفاتها ومرفقاتها.

يجب ألا يتم الاعتماد على نسخ ملفات PostgreSQL أثناء تشغيله بطريقة غير آمنة؛ استخدم أدوات النسخ المعتمدة مثل pg_dump أو آليات النسخ الفيزيائي المناسبة.

يجب توفير خطة:

- Daily Backup.
- Weekly Backup.
- Monthly Archive.

مع إمكانية تعديل سياسة الاحتفاظ.

يجب تحديد أهداف الاستعادة:

- RPO: مقدار البيانات المقبول فقدها زمنيًا.
- RTO: الزمن المستهدف لإعادة تشغيل النظام.

تحدد القيم النهائية وفق طبيعة التشغيل وحجم البيانات.

---

# 15. DEPLOYMENT ARCHITECTURE

## 15.1 LAN Deployment

جهاز رئيسي يشغل:

- Backend API.
- PostgreSQL.
- File Storage.
- Backup Service.

الأجهزة الأخرى تتصل عبر الشبكة المحلية.

يجب تخصيص عنوان ثابت أو اسم شبكة للخادم.

يجب ألا يكون PostgreSQL مكشوفًا مباشرة للأجهزة الأخرى أو للإنترنت.

## 15.2 Cloud Deployment

خادم مركزي يشغل:

- API.
- Database.
- Storage.
- Backup.
- HTTPS.

يمكن للمستخدمين الاتصال من أي مكان وفق صلاحياتهم.

## 15.3 Hybrid Deployment

يمكن تطوير نموذج هجين مستقبلًا يجمع الخادم المحلي والنسخ الخارجية.

لا تفترض أن العمل دون اتصال يعني مزامنة آمنة تلقائية.

يجب تصميم المزامنة المستقبلية باستخدام:

- Unique Operation IDs.
- Conflict Resolution.
- Sync Status.
- Retry Handling.
- Audit Trail.

لا تسمح بحدوث تضارب غير معالج في الأرصدة أو الحركات المالية.

---

# 16. WINDOWS DESKTOP BUILD

إعداد Tauri 2 لإنتاج مثبت Windows.

المتطلبات:

- App Name.
- Application Identifier.
- App Icon.
- Installer.
- Windows Notifications.
- File Handling.
- Printing Integration.
- Secure API Connection.

يجب توقيع التطبيق رقميًا عند توفر شهادة مناسبة.

يجب فصل إصدار التطبيق عن إصدار Backend.

يجب أن تتحقق نسخة Desktop من توافق الإصدار مع الخادم، وأن تعرض رسالة واضحة عند الحاجة إلى تحديث.

---

# 17. PERFORMANCE & SCALABILITY

يجب تصميم النظام ليعمل بكفاءة مع تزايد:

- المنتجات.
- العملاء.
- الموزعين.
- الفواتير.
- الحركات المالية.
- الصور.
- المستخدمين.

المتطلبات:

- Pagination.
- Database Indexing.
- Query Optimization.
- Efficient Loading.
- Background Processing.
- Caching عند الحاجة.
- Image Compression.
- Avoid N+1 Queries.
- Asynchronous I/O.

لا تحمل جميع بيانات النظام في الواجهة مرة واحدة.

يجب قياس الأداء باستخدام بيانات تجريبية واقعية قبل الإطلاق.

---

# 18. TESTING STRATEGY

يجب تنفيذ الاختبارات على عدة مستويات.

## Unit Tests

اختبار:

- حساب الأسعار.
- تحويل الوحدات.
- حساب الديون.
- تسوية الموزعين.
- تكلفة المنتجات.
- المرتجعات.
- القيود المحاسبية.

## Integration Tests

اختبار:

- قاعدة البيانات.
- تسجيل الدخول.
- صلاحيات API.
- اعتماد الفواتير.
- تحديث المخزون.
- عمليات التحصيل.
- النسخ والاستعادة.

## Business Workflow Tests

اختبار دورة عمل كاملة:

شراء 500 كرتون.

استلامها في المستودع.

تحويل جزء منها للتبريد.

تسليم 100 كرتون لموزع.

بيع 60 كرتون للمحلات.

تسجيل مرتجع 10 كراتين صالحة.

تسجيل 5 كراتين تالفة.

تحصيل المبالغ.

إغلاق اليوم.

التحقق من:

- المخزون.
- العهدة.
- ديون العملاء.
- الصندوق.
- المبيعات.
- تكلفة المبيعات.
- التالف.
- القيود المحاسبية.

## Security Tests

- اختبار تجاوز الصلاحيات.
- اختبار الوصول المباشر.
- اختبار الملفات.
- اختبار الجلسات.
- اختبار API.
- اختبار الروابط المشتركة.
- اختبار استعادة النسخ.

---

# 19. IMPLEMENTATION RULES

تعليمات إلزامية لفريق التطوير وAntigravity:

1. اقرأ الملف الأول قبل البدء.
2. اعتمد هذا الملف مرجعًا للقرارات التقنية.
3. اقرأ الملف الثالث قبل تنفيذ تصميم الواجهات.
4. لا تنشئ قاعدة بيانات عشوائية.
5. لا تكرر الجداول والكيانات دون مبرر.
6. لا تضع المنطق المالي في Frontend.
7. لا تستخدم أرقامًا مالية من نوع Float.
8. لا تعتمد الأرصدة المخزنة دون مراجعة حركات المخزون.
9. لا تسمح بعمليات مالية غير متوازنة.
10. لا تسمح باعتماد الفواتير مرتين.
11. لا تسمح بتجاوز الصلاحيات.
12. لا تحفظ الأسرار داخل ملفات Git.
13. لا تعرض الملفات الحساسة بروابط عامة.
14. استخدم Database Migrations.
15. وثق كل تغيير في قاعدة البيانات.
16. أنشئ اختبارات للعمليات الحساسة.
17. استخدم بيانات تجريبية واضحة ومميزة عن بيانات الإنتاج.
18. لا تنفذ جميع الوحدات دفعة واحدة.
19. حافظ على استقرار الوحدات المكتملة.
20. نفذ Git Commit بعد كل مرحلة مستقرة.
21. لا تعتبر Mockup أو Placeholder تنفيذًا فعليًا.
22. لا تعلن اكتمال أي وظيفة قبل اختبارها.

---

# 20. DEFINITION OF DONE

تعتبر أي وحدة مكتملة عندما:

- تعمل واجهتها بصورة صحيحة.
- تتصل بقاعدة البيانات.
- تطبق قواعد العمل.
- تتحقق من صحة المدخلات.
- تطبق الصلاحيات.
- تسجل العمليات في Audit Trail.
- تتعامل مع الأخطاء.
- تدعم اللغة العربية.
- تدعم الاتجاه الصحيح.
- تتوفر لها اختبارات.
- لا تؤثر على الوحدات الأخرى.
- يتم توثيقها.

---

# FINAL ARCHITECTURAL PRINCIPLE

يجب بناء نظام مركزي موحد، بحيث يكون Backend هو المسؤول عن قواعد العمل، وقاعدة البيانات هي المرجع الأساسي للبيانات، والواجهات مجرد وسيلة آمنة للتفاعل مع النظام.

لا نريد تطبيقًا يتكون من شاشات منفصلة؛ نريد منصة واحدة مترابطة، بحيث تكون كل فاتورة وحركة مخزون وعملية تحصيل ومرتجع جزءًا من دورة تجارية ومحاسبية متكاملة.

**Build for correctness first, security second, usability third, and scalability throughout.**

**End of Document — 02_SYSTEM_ARCHITECTURE_DATABASE.md**