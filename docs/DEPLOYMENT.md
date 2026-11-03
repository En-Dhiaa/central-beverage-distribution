# DEPLOYMENT & OPERATION GUIDE
## Central Water & Beverage Distribution Management System

---

## 1. Local Network / Central Server Deployment (Recommended)

In a central water & beverage distribution facility, the server runs centrally on the main office server or cloud host, while warehouse personnel, accountants, and sales coordinators connect via local network or browser/desktop.

### Prerequisites:
- .NET 8.0 SDK / Runtime
- Node.js 20+ (for building frontend)
- PostgreSQL 16 (or built-in SQLite)

### Step 1: Start Backend API
```powershell
cd backend/src/Beverage.Api
dotnet run
```
API runs on `http://localhost:5000` (Swagger at `/swagger`).

### Step 2: Start Frontend Web UI
```powershell
cd frontend
npm run dev
```
Accessible at `http://localhost:5173`.

---

## 2. Docker Deployment

Using `docker-compose.yml`:
```powershell
docker-compose up -d --build
```
This automatically provisions:
- `beverage_postgres`: PostgreSQL 16 database.
- `beverage_backend`: ASP.NET Core 8 Web API.
- `beverage_frontend`: Nginx reverse proxy serving built React bundle on port 80.

---

## 3. Windows Desktop Executable
Launch `desktop/dist/windows/CentralBeverageDistribution.exe`.
This native desktop application connects to the central server and provides native desktop convenience.
