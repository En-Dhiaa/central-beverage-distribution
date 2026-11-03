namespace Beverage.Domain.Enums;

public enum UserRoleType
{
    SuperAdmin,
    Owner,
    Administrator,
    Accountant,
    WarehouseManager,
    WarehouseEmployee,
    SalesManager,
    SalesEmployee,
    DistributorManager,
    ReadOnly
}

public enum WarehouseType
{
    General,
    ColdStorage,     // الثلاجة المركزية
    DispatchStaging, // منطقة التجهيز
    DamagedGoods     // مستودع التالف
}

public enum InventoryTransactionType
{
    PurchaseReceipt,      // استلام مشتريات
    TransferOut,          // تحويل صادر
    TransferIn,           // تحويل وارد
    DispatchToDistributor,// تسليم عهدة موزع
    ReturnFromDistributor,// مرتجع من موزع
    Sale,                 // بيع مباشر أو بيع معتمد
    CustomerReturn,       // مرتجع من عميل
    DamageLoss,           // تالف
    InventoryAdjustment   // تسوية جردية
}

public enum DistributorRelationshipType
{
    Consignment, // عهدة وأمانة
    Wholesale    // بيع جملة مباشر
}

public enum DocumentStatus
{
    Draft,     // مسودة
    Approved,  // معتمد
    Completed, // مكتمل
    Cancelled  // ملغى
}

public enum PaymentMethod
{
    Cash,        // نقدًا
    Credit,      // آجل
    Partial,     // دفع جزئي
    BankTransfer // تحويل بنكي
}

public enum AccountType
{
    Asset,     // أصول
    Liability, // خصوم / التزامات
    Equity,    // حقوق ملكية
    Revenue,   // إيرادات
    Expense    // مصروفات
}

public enum NormalBalance
{
    Debit,
    Credit
}

public enum VoucherType
{
    Receipt, // سند قبض
    Payment  // سند صرف
}

public enum PartyType
{
    Customer,
    Supplier,
    Distributor,
    Other
}

public enum ReturnType
{
    Resellable,      // صالح للبيع
    InspectionNeeded,// يحتاج فحص
    Damaged,         // تالف
    Expired          // منتهي الصلاحية
}

public enum NotificationType
{
    Financial,
    Inventory,
    Sales,
    Purchasing,
    Distributor,
    Security,
    System
}

public enum NotificationPriority
{
    Low,
    Medium,
    High,
    Urgent
}

