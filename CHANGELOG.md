# CHANGELOG — سجل التغييرات والإصدارات
## Central Water & Beverage Distribution Management System

All notable changes to this project are documented in this file.

---

## [1.0.0] - 2026-11-03

### Initial Enterprise Release
- **Backend Architecture:**
  - Implemented Clean Architecture Modular Monolith with ASP.NET Core 8 Web API.
  - Entity Framework Core with Dual Provider support (PostgreSQL & SQLite).
  - Configured JWT Bearer Authentication and BCrypt hashing.
  - Implemented 6 core business domain modules (Identity, Products, Inventory, Distributors, Sales, Accounting).
- **Core Business Workflows:**
  - Workflow 1: Purchase 100 cartons from supplier -> increased stock, updated AP, posted balanced journal entry.
  - Workflow 2: Cold storage transfer -> deducted from main warehouse, added to cold storage with audit transaction.
  - Workflow 3: Distributor dispatch -> deducted from cold storage, increased distributor custody without recognizing premature sale.
  - Workflow 4: Sales -> recorded customer debit, deducted custody/stock, created double-entry journal entry.
  - Workflow 5: Returns -> restored good bottles to cold storage.
  - Workflow 6: Daily settlement -> verified strict quantity balance formula and reconciled cash.
- **Frontend & UI/UX:**
  - Full Arabic RTL default with English LTR support via `i18next`.
  - Premium Light and Dark mode themes.
  - Font switcher (Cairo, Tajawal, IBM Plex Sans Arabic, Inter).
  - Modern responsive dashboard with live KPIs, charts, and warehouse distribution.
  - Vertical slices for Products, Purchases, Warehouses, Distributors, Customers, Sales, Finance, Reports, Settings.
- **Desktop Application:**
  - Produced native Windows executable: `CentralBeverageDistribution.exe`.
  - Configured Tauri 2 desktop wrapper.
- **DevOps & Containers:**
  - Configured `docker-compose.yml` with PostgreSQL, Backend, and Frontend containers.
  - Configured GitHub Actions CI pipeline (`.github/workflows/ci.yml`).
