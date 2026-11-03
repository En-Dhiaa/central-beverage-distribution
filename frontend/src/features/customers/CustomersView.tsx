import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { Customer, CustomerLedgerEntry } from '../../types';
import { Store, Plus, FileText, CheckCircle2, AlertTriangle, Printer } from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [ledger, setLedger] = useState<CustomerLedgerEntry[]>([]);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Add form
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

  const openLedger = async (cust: Customer) => {
    setSelectedCustomer(cust);
    try {
      const entries = await api.getCustomerLedger(cust.id);
      setLedger(entries);
      setIsLedgerOpen(true);
    } catch (err) {
      console.error(err);
    }
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
      loadCustomers();
    } catch (err: any) {
      alert(err.message || 'فشل إضافة العميل');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            العملاء والمحلات التجارية
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            إدارة شبكة المحلات والبقالات، السقوف الائتمانية، وكشوفات الحسابات التفصيلية
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة محل / عميل جديد</span>
        </button>
      </div>

      {/* Customers Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-right text-xs">
          <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
            <tr>
              <th className="p-3.5">رمز العميل</th>
              <th className="p-3.5">اسم المحل / البقالة</th>
              <th className="p-3.5">المسؤول / المالك</th>
              <th className="p-3.5">المنطقة</th>
              <th className="p-3.5">الموزع المسؤول</th>
              <th className="p-3.5">سقف الائتمان</th>
              <th className="p-3.5 text-destructive font-black">الرصيد المستحق (مدين)</th>
              <th className="p-3.5 text-center">كشف الحساب</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-muted/30">
                <td className="p-3.5 font-mono text-muted-foreground font-bold">{c.customerCode}</td>
                <td className="p-3.5 font-bold text-foreground">{c.name}</td>
                <td className="p-3.5 text-muted-foreground">{c.ownerName || '—'}</td>
                <td className="p-3.5">{c.area || '—'}</td>
                <td className="p-3.5 text-primary font-semibold">{c.assignedDistributorName || 'توزيع عام'}</td>
                <td className="p-3.5 font-semibold">{c.creditLimit.toLocaleString()} {t('rial')}</td>
                <td className="p-3.5 font-bold text-destructive">
                  {c.currentBalance.toLocaleString()} {t('rial')}
                </td>
                <td className="p-3.5 text-center">
                  <button
                    onClick={() => openLedger(c)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1 font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span>كشف الحساب</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer Ledger Modal */}
      {isLedgerOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  كشف حساب تفصيلي: {selectedCustomer.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  الرصيد القائم: <strong className="text-destructive font-black">{selectedCustomer.currentBalance.toLocaleString()} {t('rial')}</strong>
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted"
              >
                <Printer className="h-4 w-4" />
                <span>طباعة كشف الحساب</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
                  <tr>
                    <th className="p-2.5">التاريخ</th>
                    <th className="p-2.5">رقم المستند</th>
                    <th className="p-2.5">البيان</th>
                    <th className="p-2.5 text-destructive">مدين (+)</th>
                    <th className="p-2.5 text-emerald-600">دائن (-)</th>
                    <th className="p-2.5">الرصيد بعد الحركة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {ledger.map((e, idx) => (
                    <tr key={idx} className="hover:bg-muted/30">
                      <td className="p-2.5 text-muted-foreground">{new Date(e.date).toLocaleDateString('ar-YE')}</td>
                      <td className="p-2.5 font-mono text-[11px]">{e.documentNumber}</td>
                      <td className="p-2.5">{e.description}</td>
                      <td className="p-2.5 font-bold text-destructive">
                        {e.debit > 0 ? e.debit.toLocaleString() : '—'}
                      </td>
                      <td className="p-2.5 font-bold text-emerald-600">
                        {e.credit > 0 ? e.credit.toLocaleString() : '—'}
                      </td>
                      <td className="p-2.5 font-bold">{e.balanceAfter.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-border pt-4 mt-4 flex justify-end">
              <button
                onClick={() => setIsLedgerOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-foreground mb-4">إضافة محل / بقالة جديدة</h3>
            <form onSubmit={handleAddCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">رمز المحل</label>
                <input
                  type="text"
                  required
                  placeholder="CUST-003"
                  value={customerCode}
                  onChange={(e) => setCustomerCode(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                />
              </div>
              <div>
                <label className="block font-bold text-foreground mb-1">اسم المحل التجاري</label>
                <input
                  type="text"
                  required
                  placeholder="سوبرماركت التوفيق"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                />
              </div>
              <div>
                <label className="block font-bold text-foreground mb-1">اسم المالك</label>
                <input
                  type="text"
                  placeholder="محمد سعيد"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">الهاتف</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">المنطقة / الشارع</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-foreground mb-1">السقف الائتماني المسموح ({t('rial')})</label>
                <input
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary text-primary-foreground px-4 py-2 font-bold hover:bg-primary/90"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

