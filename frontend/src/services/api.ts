import {
  DashboardMetrics,
  Product,
  Supplier,
  Distributor,
  Customer,
  CustomerLedgerEntry,
  Cashbox,
  JournalEntry,
  UserProfile,
  DailyClosingSummary,
  DailyClosing,
  WarehouseWorker,
  WorkerSalaryVoucher,
  PeriodClosing,
  CustomerDebtAging,
  ActivityLogItem,
  DatabaseStatus,
  BackupFileInfo,
  SalesInvoicePrint,
  UserAccount,
  Role,
} from '../types';

const API_BASE = '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('beverage_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse<{
      token: string;
      userId: string;
      username: string;
      fullName: string;
      role: string;
      language: string;
      theme: string;
      fontFamily: string;
    }>(res);
  },

  async getMe(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<UserProfile>(res);
  },

  async updatePreferences(pref: any) {
    const res = await fetch(`${API_BASE}/auth/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(pref),
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Dashboard
  async getMetrics(): Promise<DashboardMetrics> {
    const res = await fetch(`${API_BASE}/dashboard/metrics`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<DashboardMetrics>(res);
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<Product[]>(res);
  },

  async createProduct(data: any): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<Product>(res);
  },

  async transferStock(data: {
    sourceWarehouseId: string;
    targetWarehouseId: string;
    productId: string;
    quantityCartons: number;
    quantityPieces: number;
    notes?: string;
  }) {
    const res = await fetch(`${API_BASE}/products/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Suppliers & Purchases
  async getSuppliers(): Promise<Supplier[]> {
    const res = await fetch(`${API_BASE}/suppliers`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<Supplier[]>(res);
  },

  async createSupplier(data: any): Promise<Supplier> {
    const res = await fetch(`${API_BASE}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<Supplier>(res);
  },

  async createPurchase(data: any) {
    const res = await fetch(`${API_BASE}/suppliers/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ id: string; message: string }>(res);
  },

  // Distributors & Custody
  async getDistributors(): Promise<Distributor[]> {
    const res = await fetch(`${API_BASE}/distributors`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<Distributor[]>(res);
  },

  async createDistributor(data: any): Promise<Distributor> {
    const res = await fetch(`${API_BASE}/distributors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<Distributor>(res);
  },

  async dispatchCustody(data: any) {
    const res = await fetch(`${API_BASE}/distributors/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ id: string; message: string }>(res);
  },

  async settleDistributor(data: any) {
    const res = await fetch(`${API_BASE}/distributors/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ id: string; message: string }>(res);
  },

  // Customers & Sales
  async getCustomers(): Promise<Customer[]> {
    const res = await fetch(`${API_BASE}/customers`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<Customer[]>(res);
  },

  async createCustomer(data: any): Promise<Customer> {
    const res = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<Customer>(res);
  },

  async getCustomerLedger(customerId: string): Promise<CustomerLedgerEntry[]> {
    const res = await fetch(`${API_BASE}/customers/${customerId}/ledger`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<CustomerLedgerEntry[]>(res);
  },

  async createSale(data: any) {
    const res = await fetch(`${API_BASE}/customers/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ id: string; message: string }>(res);
  },

  // Finance
  async getCashboxes(): Promise<Cashbox[]> {
    const res = await fetch(`${API_BASE}/finance/cashboxes`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<Cashbox[]>(res);
  },

  async createVoucher(data: any) {
    const res = await fetch(`${API_BASE}/finance/vouchers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ id: string; message: string }>(res);
  },

  async createExpense(data: any) {
    const res = await fetch(`${API_BASE}/finance/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ id: string; message: string }>(res);
  },

  async getJournalEntries(): Promise<JournalEntry[]> {
    const res = await fetch(`${API_BASE}/finance/journal`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<JournalEntry[]>(res);
  },

  async getDailyClosingSummary(date?: string): Promise<DailyClosingSummary> {
    const url = date ? `${API_BASE}/finance/daily-closing/summary?date=${date}` : `${API_BASE}/finance/daily-closing/summary`;
    const res = await fetch(url, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<DailyClosingSummary>(res);
  },

  async submitDailyClosing(data: { businessDate: string; actualCash: number; notes?: string }) {
    const res = await fetch(`${API_BASE}/finance/daily-closing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ id: string; message: string }>(res);
  },

  async getDailyClosingHistory(): Promise<DailyClosing[]> {
    const res = await fetch(`${API_BASE}/finance/daily-closing/history`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<DailyClosing[]>(res);
  },

  // Sales History & Printable Invoices
  async getRecentInvoices(limit: number = 30): Promise<SalesInvoicePrint[]> {
    const res = await fetch(`${API_BASE}/customers/sales/history?limit=${limit}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<SalesInvoicePrint[]>(res);
  },

  async getInvoiceForPrint(id: string): Promise<SalesInvoicePrint> {
    const res = await fetch(`${API_BASE}/customers/sales/${id}/print`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<SalesInvoicePrint>(res);
  },

  // Debt Aging & Period Closings
  async getCustomerDebtAging(): Promise<CustomerDebtAging[]> {
    const res = await fetch(`${API_BASE}/finance/debt-aging`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<CustomerDebtAging[]>(res);
  },

  async getPeriodClosings(): Promise<PeriodClosing[]> {
    const res = await fetch(`${API_BASE}/finance/period-closings`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<PeriodClosing[]>(res);
  },

  async createPeriodClosing(data: { closingType: string; fiscalYear: number; month?: number; notes?: string }) {
    const res = await fetch(`${API_BASE}/finance/period-closings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ id: string; message: string }>(res);
  },

  // Users & Permissions
  async getUsers(): Promise<UserAccount[]> {
    const res = await fetch(`${API_BASE}/users`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<UserAccount[]>(res);
  },

  async createUser(data: any): Promise<UserAccount> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<UserAccount>(res);
  },

  async toggleUserStatus(id: string) {
    const res = await fetch(`${API_BASE}/users/${id}/status`, {
      method: 'PUT',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ isActive: boolean; message: string }>(res);
  },

  async getRoles(): Promise<Role[]> {
    const res = await fetch(`${API_BASE}/users/roles`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<Role[]>(res);
  },

  // Workers & Payroll
  async getWorkers(): Promise<WarehouseWorker[]> {
    const res = await fetch(`${API_BASE}/workers`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<WarehouseWorker[]>(res);
  },

  async createWorker(data: any): Promise<WarehouseWorker> {
    const res = await fetch(`${API_BASE}/workers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<WarehouseWorker>(res);
  },

  async payWorkerSalary(data: any) {
    const res = await fetch(`${API_BASE}/workers/salaries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ id: string; message: string }>(res);
  },

  async getSalaryVouchers(): Promise<WorkerSalaryVoucher[]> {
    const res = await fetch(`${API_BASE}/workers/salaries`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<WorkerSalaryVoucher[]>(res);
  },

  // Activity Log
  async getDailyActivityLog(fromDate?: string, toDate?: string): Promise<ActivityLogItem[]> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    const res = await fetch(`${API_BASE}/activity/daily?${params.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<ActivityLogItem[]>(res);
  },

  // Database Management
  async getDatabaseStatus(): Promise<DatabaseStatus> {
    const res = await fetch(`${API_BASE}/database/status`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<DatabaseStatus>(res);
  },

  async createDatabaseBackup() {
    const res = await fetch(`${API_BASE}/database/backup`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ fileName: string; message: string }>(res);
  },

  async restoreDatabaseBackup(fileName: string) {
    const res = await fetch(`${API_BASE}/database/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ fileName }),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async vacuumDatabase() {
    const res = await fetch(`${API_BASE}/database/vacuum`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Company Profile & Brand Settings
  async getCompanyProfile(): Promise<any> {
    const res = await fetch(`${API_BASE}/settings/company`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any>(res);
  },

  async updateCompanyProfile(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/settings/company`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  // Quotations (عروض الأسعار)
  async getQuotations(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/customers/quotations`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any[]>(res);
  },

  async getQuotationById(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/customers/quotations/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any>(res);
  },

  async createQuotation(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/customers/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async convertQuotationToInvoice(id: string): Promise<{ invoiceId: string; message: string }> {
    const res = await fetch(`${API_BASE}/customers/quotations/${id}/convert-to-invoice`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ invoiceId: string; message: string }>(res);
  },

  // Sales Returns (مردودات المبيعات)
  async getSalesReturns(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/customers/sales/returns`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<any[]>(res);
  },

  async createSalesReturn(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/customers/sales/returns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },
};

