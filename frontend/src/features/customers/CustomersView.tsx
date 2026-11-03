import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { Customer, CustomerLedgerEntry } from '../../types';
import { StatementPrintModal } from '../../components/modals/StatementPrintModal';
import {
  Store,
  Plus,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Printer,
  MessageCircle,
  Search,
  Filter,
  DollarSign
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'debt_only' | 'exceeded'>('all');

  // Selected customer & statement
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [ledger, setLedger] = useState<CustomerLedgerEntry[]>([]);
  const [isStatementOpen, setIsStatementOpen] = useState(false);

  // Add customer modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [customerCode, setCustomerCode] = useState('');
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [creditLimit, setCreditLimit] = useState(200000);

  const loadCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const openStatement = async (cust: Customer) => {
    setSelectedCustomer(cust);
    try {
      const entries = await api.getCustomerLedger(cust.id);
      setLedger(entries);
      setIsStatementOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWhatsApp = (cust: Customer) => {
    if (!cust.phone) {
      alert('لا يوجد رقم هاتف مسجل لهذا المحل.');
      return;
    }
    const cleanPhone = cust.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `السلام عليكم ورحمة الله وبركاته، الأخوة في ${cust.name}.\n\nنود إحاطتكم بأن رصيد حسابكم الحالي المستحق لدى مؤسسة توزيع المياه والعصائر المركزية هو (${cust.currentBalance.toLocaleString()} ريال يمني).\n\nشاكرين ومقدرين حسن تعاونكم الدائم معنا.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCustomer({
        customerCode,
        name,
        ownerName,
        phone,
        area,
        creditLimit: Number(creditLimit),
        openingBalance: 0,
      });
      setIsAddOpen(false);
      // Reset form
      setCustomerCode('');
      setName('');
      setOwnerName('');
      setPhone('');
      setArea('');
      loadCustomers();
    } catch (err: any) {
      alert(err.message || 'فشل إضافة العميل');
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.area && c.area.includes(searchTerm));

    if (!matchSearch) return false;

    if (filterMode === 'debt_only') return c.currentBalance > 0;
    if (filterMode === 'exceeded') return c.currentBalance > c.creditLimit;
    return true;
  });

  const totalDebtSum = customers.reduce((acc, c) => acc + c.currentBalance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            العملاء والمحلات التجارية والمتاجر
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            إدارة شبكة البقالات والسوبرماركت، مراقبة المديونيات، التنبيه بالواتساب، وكشوفات الحسابات الطباعية
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-600 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>إجمالي ذمم العملاء: {totalDebtSum.toLocaleString()} {t('rial')}</span>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة محل / عميل جديد</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث باسم المحل، الكود، الهاتف، المنطقة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2 pr-9 pl-3 text-xs font-bold"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-background border border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            جميع المحلات ({customers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('debt_only')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'debt_only'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-background border border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            عليهم مديونية ({customers.filter((c) => c.currentBalance > 0).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('exceeded')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'exceeded'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-background border border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            تجاوزوا السقف ({customers.filter((c) => c.currentBalance > c.creditLimit).length})
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-right text-xs">
          <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
            <tr>
              <th className="p-3.5">رمز العميل</th>
              <th className="p-3.5">اسم المحل / البقالة</th>
              <th className="p-3.5">المسؤول / المالك</th>
              <th className="p-3.5">الهاتف</th>
              <th className="p-3.5">المنطقة</th>
              <th className="p-3.5">الموزع المسؤول</th>
              <th className="p-3.5">سقف الائتمان</th>
              <th className="p-3.5 font-black text-rose-600">الرصيد المستحق (المديونية)</th>
              <th className="p-3.5 text-center">الإجراءات والواتساب</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-muted-foreground">
                  لا توجد محلات تجارية مطابقة للبحث أو الفلتر.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((cust) => {
                const isOverLimit = cust.currentBalance > cust.creditLimit;
                return (
                  <tr key={cust.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold">{cust.customerCode}</td>
                    <td className="p-3.5 font-black text-foreground">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-primary shrink-0" />
                        <span>{cust.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-muted-foreground">{cust.ownerName || '-'}</td>
                    <td className="p-3.5 font-mono">{cust.phone || '-'}</td>
                    <td className="p-3.5 text-muted-foreground">{cust.area || '-'}</td>
                    <td className="p-3.5 font-bold text-foreground">
                      {cust.assignedDistributorName || 'غير مخصص'}
                    </td>
                    <td className="p-3.5 font-mono font-bold">
                      {cust.creditLimit.toLocaleString()} {t('rial')}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-mono font-black text-rose-600 text-sm">
                        <span>{cust.currentBalance.toLocaleString()} {t('rial')}</span>
                        {isOverLimit && (
                          <span title="تجاوز سقف الائتمان المسموح به">
                            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {cust.phone && (
                          <button
                            type="button"
                            onClick={() => handleWhatsApp(cust)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600 hover:text-white px-2.5 py-1 text-xs font-bold transition-all"
                            title="إرسال رسالة تذكير بالرصيد عبر واتساب"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>واتساب</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openStatement(cust)}
                          className="flex items-center gap-1 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground px-2.5 py-1 text-xs font-bold transition-all"
                          title="عرض وطباعة كشف الحساب التفصيلي"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>كشف الحساب</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-base font-extrabold text-foreground mb-4">
              إضافة محل / بقالة تجارية جديدة
            </h3>
            <form onSubmit={handleAddCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">كود المحل (Customer Code)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: CUST-010"
                  value={customerCode}
                  onChange={(e) => setCustomerCode(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 font-bold uppercase"
                />
              </div>
              <div>
                <label className="block font-bold text-foreground mb-1">اسم المحل التجاري / السوبرماركت</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: بقالة الأمانة الحديثة"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-foreground mb-1">اسم المالك / المسؤول</label>
                <input
                  type="text"
                  placeholder="اسم الشخص المسؤول عن الاستلام"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">رقم الهاتف (للواتساب)</label>
                  <input
                    type="text"
                    placeholder="777000222"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">المنطقة / الشارع</label>
                  <input
                    type="text"
                    placeholder="شارع تعز، حدة..."
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-foreground mb-1">
                  سقف الائتمان المسموح به (الحد الأقصى للآجل)
                </label>
                <input
                  type="number"
                  min="0"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background p-2.5 font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary text-primary-foreground px-5 py-2 font-bold hover:bg-primary/90 shadow-sm"
                >
                  حفظ العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statement Print Modal */}
      {isStatementOpen && selectedCustomer && (
        <StatementPrintModal
          customer={selectedCustomer}
          ledger={ledger}
          onClose={() => setIsStatementOpen(false)}
        />
      )}
    </div>
  );
};
