# ARCHITECTURAL & TECHNICAL DECISIONS LOG
## Central Water & Beverage Distribution Management System

وثيقة توثيق القرارات الهندسية والتقنية (Architecture Decision Records - ADR)

---

## ADR 001: Target .NET 8.0 LTS for Backend Architecture

- **Date:** 2026-11-03
- **Context:** The environment audit revealed .NET SDK 8.0.404 installed on the host. While earlier wishlists referenced hypothetical versions, .NET 8 is the official Long Term Support (LTS) release of ASP.NET Core and Entity Framework Core, providing rock-solid enterprise stability, performance, and package compatibility.
- **Decision:** Target `net8.0` for all backend C# projects (`Beverage.Domain`, `Beverage.Application`, `Beverage.Infrastructure`, `Beverage.Api`, and test projects).
- **Consequences:** Ensures full compilation, clean runtime execution on host and Docker, zero deprecated package issues, and rock-solid compatibility.

---

## ADR 002: Dual Database Provider Support (PostgreSQL & SQLite)

- **Date:** 2026-11-03
- **Context:** The production specification requires PostgreSQL for central multi-device network deployment. However, local developer machines and isolated client stations may not always have a background PostgreSQL daemon running immediately.
- **Decision:** Architect the EF Core `BeverageDbContext` to seamlessly support both PostgreSQL (`Npgsql.EntityFrameworkCore.PostgreSQL`) and SQLite (`Microsoft.EntityFrameworkCore.Sqlite`). The provider is dynamically resolved based on the connection string and `DatabaseProvider` key in `appsettings.json`.
- **Consequences:** Immediate out-of-the-box local execution and integration testing without database setup friction, while maintaining full PostgreSQL schema and migrations for central server deployment.

---

## ADR 003: Clean Architecture & Modular Monolith

- **Date:** 2026-11-03
- **Context:** The system must handle interconnected inventory, distributor custody, customer balances, purchases, sales, and double-entry accounting.
- **Decision:** Adopt Clean Architecture with strict separation of concerns:
  - `Beverage.Domain`: Core business entities, enums, rules, domain exceptions. Zero dependencies on database or ASP.NET.
  - `Beverage.Application`: CQRS/Use-case services, DTOs, interfaces, business validation.
  - `Beverage.Infrastructure`: EF Core implementations, storage engines, PDF generation, security.
  - `Beverage.Api`: REST controllers, SignalR hubs, auth middleware, Swagger.
- **Consequences:** Highly testable, maintainable, decoupled domain logic, and easy future extension.

---

## ADR 004: Frontend Design System & Localization

- **Date:** 2026-11-03
- **Context:** System requires Arabic RTL default, English LTR secondary, Cairo font, dark/light themes, and responsive layout for mobile and desktop.
- **Decision:** Use React + TypeScript + Vite + Tailwind CSS + Lucide React + i18next + TanStack Query.
- **Consequences:** Lightweight, fast bundle, modern aesthetic, full RTL/LTR switching, responsive layouts.

---

## ADR 005: Strict Double-Entry Accounting & Inventory Movement Audit

- **Date:** 2026-11-03
- **Context:** Financial and inventory integrity is non-negotiable. Balances must never be arbitrarily updated by direct mutation.
- **Decision:** Every financial transaction automatically creates balanced journal entries (`debit == credit`). Every stock change creates an `InventoryTransaction` with document reference, user, and date.
- **Consequences:** Absolute auditability, tamper resistance, and zero balance drift.

