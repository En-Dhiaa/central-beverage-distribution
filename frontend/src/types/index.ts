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

export interface DailyClosingSummary {
  businessDate: string;
  openingCash: number;
  totalSalesCash: number;
  totalSalesCredit: number;
  totalPurchasesCash: number;
  totalReceipts: number;
  totalExpenses: number;
  expectedClosingCash: number;
  pendingDistributorSettlementsCount: number;
  openCustodyPieces: number;
}

export interface DailyClosing {
  id: string;
  closingNumber: string;
  businessDate: string;
  openingCash: number;
  totalSales: number;
  totalPurchases: number;
  totalReceipts: number;
  totalExpenses: number;
  expectedCash: number;
  actualCash: number;
  cashDifference: number;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: string;
  roleId: string;
  isActive: boolean;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface Worker {
  id: string;
  workerCode: string;
  fullName: string;
  nationalId?: string;
  phone: string;
  jobTitle: string;
  baseSalary: number;
  salaryType: string;
  shiftHours: number;
  hireDate: string;
  isActive: boolean;
  notes?: string;
}

export type WarehouseWorker = Worker;

export interface WorkerSalaryVoucher {
  id: string;
  voucherNumber: string;
  workerId: string;
  workerName: string;
  year: number;
  month: number;
  baseSalary: number;
  bonusAmount: number;
  deductionsAmount: number;
  netPaid: number;
  paymentDate: string;
  cashboxId: string;
  cashboxName: string;
  notes?: string;
}

export interface PeriodClosing {
  id: string;
  closingNumber: string;
  closingType: string;
  fiscalYear: number;
  month?: number;
  closingDate: string;
  totalSales: number;
  totalCostOfGoodsSold: number;
  grossProfit: number;
  totalExpenses: number;
  totalSalaries: number;
  netProfit: number;
  isLocked: boolean;
  notes?: string;
}

export interface CustomerDebtAging {
  customerId: string;
  customerCode: string;
  customerName: string;
  phone?: string;
  area?: string;
  creditLimit: number;
  totalDebt: number;
  current0To30Days: number;
  overdue31To60Days: number;
  overdue61To90Days: number;
  criticalOver90Days: number;
  lastPaymentDate?: string;
  debtStatus: string;
}

export interface ActivityLogItem {
  timestamp: string;
  module: string;
  actionType: string;
  documentNumber: string;
  description: string;
  amount: number;
  userName: string;
  status: string;
}

export interface DatabaseStatus {
  provider: string;
  databasePath: string;
  fileSizeBytes: number;
  fileSizeMegabytes: number;
  tablesCount: number;
  totalRecordsCount: number;
  lastBackupDate: string;
  backups: BackupFileInfo[];
}

export interface BackupFileInfo {
  fileName: string;
  fullPath: string;
  sizeMegabytes: number;
  createdAt: string;
}

export interface SalesInvoicePrint {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerPhone?: string;
  customerArea?: string;
  distributorName?: string;
  paymentMethod: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  notes: string;
  items: SalesInvoicePrintItem[];
}

export interface SalesInvoicePrintItem {
  productName: string;
  quantityCartons: number;
  quantityPieces: number;
  unitPricePerCarton: number;
  totalPrice: number;
}



