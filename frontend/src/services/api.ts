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
};

