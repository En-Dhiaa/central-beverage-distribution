# API SPECIFICATION & INTEGRATION GUIDE
## Central Water & Beverage Distribution Management System

Base Route: `/api/v1`

---

## 1. Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/login`: Authenticates username + password, returns JWT token and profile.
- `GET /api/v1/auth/me`: Returns current user session profile.
- `PUT /api/v1/auth/preferences`: Updates language, theme, font family, volume.

## 2. Dashboard (`/api/v1/dashboard`)
- `GET /api/v1/dashboard/metrics`: Real-time aggregated KPIs (sales, receipts, stock, debt, cashbox).

## 3. Products & Inventory (`/api/v1/products`)
- `GET /api/v1/products`: List all products with current balances across Main Warehouse, Cold Storage, and Custody.
- `POST /api/v1/products`: Create a new product SKU.
- `POST /api/v1/products/transfer`: Execute stock transfer between warehouses with audit tracking.

## 4. Suppliers & Purchases (`/api/v1/suppliers`)
- `GET /api/v1/suppliers`: List registered suppliers with debt balances.
- `POST /api/v1/suppliers`: Register new supplier.
- `POST /api/v1/suppliers/purchases`: Record purchase invoice (increases stock, updates supplier balance, generates journal entry).

## 5. Distributors & Custody (`/api/v1/distributors`)
- `GET /api/v1/distributors`: List distributors and their current custody balances.
- `POST /api/v1/distributors`: Register new distributor.
- `POST /api/v1/distributors/dispatch`: Dispatch custody stock from Cold Storage to distributor.
- `POST /api/v1/distributors/settle`: Submit and approve daily settlement with balance verification.

## 6. Customers & Sales (`/api/v1/customers`)
- `GET /api/v1/customers`: List customers and debts.
- `POST /api/v1/customers`: Register new customer / retail store.
- `GET /api/v1/customers/{id}/ledger`: Detailed chronological customer account ledger.
- `POST /api/v1/customers/sales`: Record sales invoice (Cash, Credit, Partial) with double-entry accounting.

## 7. Finance (`/api/v1/finance`)
- `GET /api/v1/finance/cashboxes`: Active cashboxes and balances.
- `POST /api/v1/finance/vouchers`: Payment voucher (Receipt / Payment).
- `POST /api/v1/finance/expenses`: Record and pay operating expenses.
- `GET /api/v1/finance/journal`: List balanced double-entry journal entries.
