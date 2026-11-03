# SYSTEM ARCHITECTURE SPECIFICATION
## Central Water & Beverage Distribution Management System
**نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية**

---

## 1. Architectural Style: Modular Monolith + Clean Architecture

The system is built as a highly maintainable, high-performance Modular Monolith following Clean Architecture principles:

```
Beverage.Domain (Pure business logic, entities, enums, zero framework dependencies)
      ▲
      │
Beverage.Application (Use-case DTOs, interfaces, business rules, validation)
      ▲
      │
Beverage.Infrastructure (EF Core DbContext, PostgreSQL/SQLite, Auth, Storage, PDF)
      ▲
      │
Beverage.Api (ASP.NET Core Web API, JWT middleware, Swagger, CORS, DI)
```

### Presentation Layers:
1. **Web Application:** React + TypeScript + Vite + Tailwind CSS + Lucide React + i18next + TanStack Query.
2. **Desktop Application:** Native Windows EXE powered by WebView2 (`CentralBeverageDistribution.exe`) and Tauri 2 configuration.

---

## 2. Core Business Domains

### A. Inventory & Warehouse Management
- Multi-warehouse isolation: Main Receiving Warehouse vs Central Cold Storage (الثلاجة المركزية).
- Units & Unit Conversions: Smallest unit is tracked internally (`Piece / حبة`), with carton conversions (`Carton = 12 Pieces`).
- Immutable inventory transactions: Every movement (`PurchaseReceipt`, `TransferOut`, `TransferIn`, `DispatchToDistributor`, `ReturnFromDistributor`, `Sale`, `CustomerReturn`) creates an audit record. Direct database updates without transaction documents are prohibited.

### B. Distributor Consignment & Custody
- Consignment model: Dispatching stock to a distributor is NOT recognized as a sale.
- Stock moves from Cold Storage to distributor custody.
- Daily settlement strict formula:
  $$\text{Opening} + \text{Received} - \text{Sold} - \text{Returned} - \text{Damaged} - \text{Shortage} = \text{Remaining}$$
- Returned good stock is restored to Cold Storage. Documented damages and shortages are tracked independently.

### C. Customers & Retail Debt
- Credit limit enforcement.
- Support for Cash, Credit, and Partial payment models.
- Complete chronological Statement of Account (كشف حساب عميل).

### D. Double-Entry Accounting Engine
- Balanced journal entries:
  $$\sum \text{Debit} = \sum \text{Credit}$$
- Real-time posting on purchases, sales, payments, expenses, and settlements.
- Unbalanced transactions are blocked by domain rules.

---

## 3. Security & Auditing
- BCrypt password hashing.
- JWT Bearer Authentication with HMAC-SHA256 signature.
- Role-based and action-based authorization.
- Tamper-evident audit logging for sensitive actions.

