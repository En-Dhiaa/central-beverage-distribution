export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: string;
  language: string;
  theme: string;
  fontFamily: string;
  fontSize: number;
  notificationSoundEnabled: boolean;
  notificationVolume: number;
  dashboardLayoutJson: string;
}

export interface DashboardMetrics {
  todaySales: number;
  todayPurchases: number;
  todayReceipts: number;
  todayExpenses: number;
  mainWarehouseStockPieces: number;
  coldStorageStockPieces: number;
  distributorCustodyPieces: number;
  totalCustomerDebt: number;
  totalSupplierDebt: number;
  totalCashboxBalance: number;
  activeDistributorsCount: number;
  activeCustomersCount: number;
  lowStockAlertsCount: number;
}

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  nameEn?: string;
  categoryId: string;
  categoryName: string;
  manufacturer?: string;
  unitsPerCarton: number;
  purchasePriceCarton: number;
  salePriceCarton: number;
  salePricePiece: number;
  minStockAlert: number;
  totalStockPieces: number;
  mainWarehouseCartons: number;
  coldStorageCartons: number;
  distributorCustodyCartons: number;
  isActive: boolean;
}

export interface Supplier {
  id: string;
  supplierCode: string;
  name: string;
  companyName?: string;
  phone?: string;
  address?: string;
  currentBalance: number;
  isActive: boolean;
}

export interface Distributor {
  id: string;
  distributorCode: string;
  name: string;
  phone?: string;
  address?: string;
  routeArea?: string;
  relationshipType: string;
  creditLimit: number;
  currentBalance: number;
  totalCustodyPieces: number;
  totalCustodyCartons: number;
  isActive: boolean;
}

export interface Customer {
  id: string;
  customerCode: string;
  name: string;
  ownerName?: string;
  phone?: string;
  address?: string;
  area?: string;
  creditLimit: number;
  currentBalance: number;
  assignedDistributorId?: string;
  assignedDistributorName?: string;
  isActive: boolean;
}

export interface CustomerLedgerEntry {
  date: string;
  documentType: string;
  documentNumber: string;
  description: string;
  debit: number;
  credit: number;
  balanceAfter: number;
}

export interface Cashbox {
  id: string;
  name: string;
  currentBalance: number;
  isActive: boolean;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  description: string;
  sourceType: string;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  lines: {
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
    description?: string;
  }[];
}
