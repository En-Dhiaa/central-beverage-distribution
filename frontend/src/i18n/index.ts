import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ar: {
    translation: {
      appName: 'إدارة وتوزيع المياه والعصائر',
      appSubtitle: 'نظام إدارة الثلاجة المركزية والتوزيع والمحاسبة',
      dashboard: 'لوحة التحكم',
      products: 'المنتجات والمخزون',
      purchases: 'المشتريات والموردين',
      warehouses: 'المخازن والثلاجة',
      distributors: 'الموزعون والعهد',
      customers: 'العملاء والمحلات',
      sales: 'المبيعات والفواتير',
      finance: 'الحسابات والصناديق',
      reports: 'التقارير والمستندات',
      settings: 'إعدادات النظام',
      logout: 'تسجيل الخروج',
      welcome: 'مرحبًا بك',
      login: 'تسجيل الدخول',
      username: 'اسم المستخدم',
      password: 'كلمة المرور',
      rememberMe: 'تذكر هذا الجهاز',
      todaySales: 'مبيعات اليوم',
      todayPurchases: 'مشتريات اليوم',
      todayReceipts: 'التحصيلات النقدية',
      todayExpenses: 'مصروفات اليوم',
      mainWarehouse: 'المستودع الرئيسي',
      coldStorage: 'الثلاجة المركزية',
      distributorCustody: 'عهدة الموزعين',
      customerDebt: 'ديون العملاء',
      supplierDebt: 'مستحقات الموردين',
      cashBalance: 'رصيد الصناديق',
      add: 'إضافة جديد',
      transfer: 'نقل بضاعة',
      dispatch: 'تسليم عهدة',
      settle: 'تسوية يومية',
      save: 'حفظ واعتماد',
      cancel: 'إلغاء',
      carton: 'كرتون',
      piece: 'حبة',
      rial: 'ر.ي'
    }
  },
  en: {
    translation: {
      appName: 'Beverage Distribution System',
      appSubtitle: 'Central Cold Storage & Accounting Distribution Platform',
      dashboard: 'Dashboard',
      products: 'Products & Inventory',
      purchases: 'Purchases & Suppliers',
      warehouses: 'Warehouses & Cold Storage',
      distributors: 'Distributors & Custody',
      customers: 'Customers & Stores',
      sales: 'Sales & Invoices',
      finance: 'Finance & Accounts',
      reports: 'Reports & Documents',
      settings: 'Settings',
      logout: 'Sign Out',
      welcome: 'Welcome',
      login: 'Sign In',
      username: 'Username',
      password: 'Password',
      rememberMe: 'Remember this device',
      todaySales: "Today's Sales",
      todayPurchases: "Today's Purchases",
      todayReceipts: 'Cash Receipts',
      todayExpenses: "Today's Expenses",
      mainWarehouse: 'Main Warehouse',
      coldStorage: 'Cold Storage',
      distributorCustody: 'Distributor Custody',
      customerDebt: 'Customer Receivables',
      supplierDebt: 'Supplier Payables',
      cashBalance: 'Cashbox Balance',
      add: 'Add New',
      transfer: 'Transfer Stock',
      dispatch: 'Dispatch Custody',
      settle: 'Daily Settlement',
      save: 'Save & Approve',
      cancel: 'Cancel',
      carton: 'Carton',
      piece: 'Piece',
      rial: 'YER'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar',
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

