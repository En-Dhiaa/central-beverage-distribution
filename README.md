# Central Water & Beverage Distribution Management System
# نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية

منظومة إدارية ومحاسبية وتشغيلية متكاملة لإدارة المستودعات، الثلاجة المركزية، المشتريات، عهد الموزعين، تسويات التوزيع اليومية، العملاء والمحلات، المبيعات والديون، الصناديق والقيود المحاسبية المزدوجة.

---

## 🚀 المميزات الرئيسية (Core Features)

1. **إدارة المخازن والتبريد المركزي (Cold Storage & Multi-Warehouse):**
   - فصل كامل بين المستودع الرئيسي للاستلام والثلاجة المركزية للتبريد وعهد الموزعين.
   - دعم بيع وتخزين الكراتين والحبات والتحويل التلقائي.
   - توثيق كل حركة مخزنية بمستند وسجل تدقيق غير قابل للتلاعب.

2. **إدارة عهد الموزعين والتسويات اليومية (Distributor Custody & Settlement):**
   - تطبيق نموذج الأمانة والعهدة: تسليم البضاعة للموزع ليس بيعًا نهائيًا.
   - التحقق الصارم من معادلة التسوية اليومية:
     $$\text{Opening} + \text{Received} - \text{Sold} - \text{Returned} - \text{Damaged} - \text{Shortage} = \text{Remaining}$$
   - إعادة المرتجعات السليمة تلقائيًا إلى الثلاجة المركزية وتوريد النقدية للصندوق.

3. **إدارة العملاء والمحلات والديون (Customers & Retail Network):**
   - متابعة السقف الائتماني والديون لكل محل وبقالة.
   - استخراج كشف حساب عميل تفصيلي تاريخي بالمعاملات.

4. **محرك المحاسبة المزدوجة (Strict Double-Entry Accounting):**
   - ميزان قيود يومية متوازن إلزاميًا: $\sum \text{Debit} = \sum \text{Credit}$.
   - قيود تلقائية للمشتريات والمبيعات والصناديق والمصروفات.

5. **واجهة مستخدم عصرية (Premium Modern UI/UX):**
   - دعم كامل للغة العربية (RTL) مع إمكانية التحويل للإنجليزية (LTR).
   - وضع نهاري فاخر (Light Mode الافتراضي) مع دعم كامل للوضع الليلي (Dark Mode).
   - تخصيص الخطوط (Cairo, Tajawal, IBM Plex Sans Arabic, Inter).

6. **تطبيق سطح مكتب لنظام Windows (Desktop Application):**
   - ملف تنفيذي أصلي `CentralBeverageDistribution.exe` مبني لبيئة Windows.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

- **Backend:** ASP.NET Core 8 Web API, C#, Clean Architecture, Modular Monolith.
- **ORM & Database:** Entity Framework Core 8 مع دعم مزدوج (PostgreSQL 16 & SQLite).
- **Security:** BCrypt.Net Password Hashing, JWT Bearer Tokens.
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, i18next, TanStack Query, Recharts, Zustand.
- **Desktop:** Native Windows Executable (`CentralBeverageDistribution.exe`) + Tauri 2.
- **DevOps:** Docker, Docker Compose, Nginx, GitHub Actions CI.

---

## ⚡ التشغيل السريع (Quick Start)

### 1. تشغيل Backend
```powershell
cd backend/src/Beverage.Api
dotnet run
```
الواجهة البرمجية ستعمل على: `http://localhost:5000`  
دليل Swagger متاح على: `http://localhost:5000/swagger`

### 2. تشغيل Frontend
```powershell
cd frontend
cmd /c "npm run dev"
```
واجهة الويب ستعمل على: `http://localhost:5173`

### 3. بيانات الدخول الافتراضية
- **اسم المستخدم:** `admin`
- **كلمة المرور:** `Admin@123456`

### 4. تشغيل تطبيق Windows Desktop
شغّل الملف التنفيذي المباشر:
```
desktop/dist/windows/CentralBeverageDistribution.exe
```

### 5. تشغيل عبر Docker Compose
```powershell
docker-compose up -d --build
```

---

## 🧪 الاختبارات الآلية (Automated Tests)
لتشغيل اختبارات دورات العمل المحاسبية والمخزنية:
```powershell
dotnet test backend/Beverage.sln
```

---

## 📂 هيكل المشروع (Project Structure)
```text
Store SAS/
├── backend/
│   ├── src/
│   │   ├── Beverage.Domain/           # Entities, Value Objects, Enums, Rules
│   │   ├── Beverage.Application/      # DTOs, Use Cases, Interfaces
│   │   ├── Beverage.Infrastructure/   # EF Core DbContext, PostgreSQL/SQLite, Services
│   │   └── Beverage.Api/              # Controllers, JWT, Swagger, Program.cs
│   └── tests/
│       ├── Beverage.UnitTests/        # Business workflows and accounting tests
│       └── Beverage.IntegrationTests/ # Integration verification tests
├── frontend/                          # React + TypeScript + Vite + Tailwind CSS
├── desktop/                           # Native Windows Executable & Tauri 2
├── infrastructure/                    # Dockerfile, Docker Compose, Nginx
├── storage/                           # Isolated file storage
├── backups/                           # Encrypted automated backups
├── docs/                              # Project architecture, database, API docs
└── README.md
```
