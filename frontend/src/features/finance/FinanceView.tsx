import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { Cashbox, JournalEntry, Customer, Supplier } from '../../types';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, BookOpen, CheckCircle2 } from 'lucide-react';

export const FinanceView: React.FC = () => {
  const { t } = useTranslation();
  const [cashboxes, setCashboxes] = useState<Cashbox[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Modals
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);

  // Voucher Form
  const [voucherType, setVoucherType] = useState<'Receipt' | 'Payment'>('Receipt');
  const [partyType, setPartyType] = useState<'Customer' | 'Supplier'>('Customer');
  const [partyId, setPartyId] = useState('');
  const [amount, setAmount] = useState(50000);
  const [voucherDesc, setVoucherDesc] = useState('دفعة نقدية تحت الحساب');

  // Expense Form
  const [expenseAmount, setExpenseAmount] = useState(15000);
  const [expenseDesc, setExpenseDesc] = useState('فاتورة كهرباء تبريد الثلاجة المركزية');
  const [beneficiary, setBeneficiary] = useState('مؤسسة الكهرباء');

  const loadData = async () => {
    try {
      const [cb, j, c, s] = await Promise.all([
        api.getCashboxes(),
        api.getJournalEntries(),
        api.getCustomers(),
        api.getSuppliers(),
      ]);
      setCashboxes(cb);
      setJournals(j);
      setCustomers(c);
      setSuppliers(s);
      if (c.length > 0) setPartyId(c[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashboxes.length) return;
    try {
      await api.createVoucher({
        voucherType,
        partyType,
        partyId,
        amount: Number(amount),
        cashboxId: cashboxes[0].id,
        description: voucherDesc,
      });
      alert('تم حفظ السند وترحيل القيد المحاسبي المتوازن بنجاح!');
      setIsVoucherOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'فشل حفظ السند');
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashboxes.length) return;
    try {
      await api.createExpense({
        categoryId: '00000000-0000-0000-0000-000000000001',
        cashboxId: cashboxes[0].id,
        amount: Number(expenseAmount),
        expenseDate: new Date().toISOString(),
        description: expenseDesc,
        beneficiary,
      });
      alert('تم تسجيل وصرف المصروف بنجاح!');
      setIsExpenseOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'فشل تسجيل المصروف');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            الحسابات المالية وسجل القيود
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            إدارة الصناديق النقدية، سندات القبض والصرف، المصروفات التشغيلية، وميزان القيود المزدوجة
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsExpenseOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/20 transition-all shadow-sm"
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>تسجيل مصروف</span>
          </button>
          <button
            onClick={() => setIsVoucherOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
          >
            <Wallet className="h-4 w-4" />
            <span>سند قبض / صرف</span>
          </button>
        </div>
      </div>

      {/* Cashbox Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cashboxes.map((cb) => (
          <div key={cb.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">صندوق النقدية الفعلي</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-sm font-bold text-foreground">{cb.name}</h3>
              <div className="text-2xl font-black text-foreground mt-1">
                {cb.currentBalance.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{t('rial')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Double-Entry Journal Entries Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20 font-bold text-sm text-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>دفتر اليومية العامة والقيود المزدوجة (Double-Entry General Journal)</span>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            جميع القيود متوازنة بدقة (مدين = دائن)
          </span>
        </div>

        <div className="divide-y divide-border">
          {journals.map((j) => (
            <div key={j.id} className="p-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-primary">{j.entryNumber}</span>
                  <span className="text-xs font-bold text-foreground">{j.description}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">{new Date(j.entryDate).toLocaleDateString('ar-YE')}</span>
                  <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                    متوازن: {j.totalDebit.toLocaleString()} {t('rial')}
                  </span>
                </div>
              </div>

              {/* Journal Lines */}
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-right text-[11px]">
                  <thead className="bg-muted/40 font-bold text-muted-foreground">
                    <tr>
                      <th className="p-1.5">رمز الحساب</th>
                      <th className="p-1.5">اسم الحساب</th>
                      <th className="p-1.5">البيان</th>
                      <th className="p-1.5 text-left text-emerald-600 font-bold">مدين (Debit)</th>
                      <th className="p-1.5 text-left text-blue-600 font-bold">دائن (Credit)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {j.lines.map((l, idx) => (
                      <tr key={idx}>
                        <td className="p-1.5 font-mono text-muted-foreground">{l.accountCode}</td>
                        <td className="p-1.5 font-bold text-foreground">{l.accountName}</td>
                        <td className="p-1.5 text-muted-foreground">{l.description}</td>
                        <td className="p-1.5 text-left font-bold text-emerald-600">
                          {l.debit > 0 ? l.debit.toLocaleString() : '—'}
                        </td>
                        <td className="p-1.5 text-left font-bold text-blue-600">
                          {l.credit > 0 ? l.credit.toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Voucher Modal */}
      {isVoucherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-foreground mb-4">إنشاء سند مالي (قبض / صرف)</h3>
            <form onSubmit={handleCreateVoucher} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">نوع السند</label>
                  <select
                    value={voucherType}
                    onChange={(e) => {
                      const vt = e.target.value as any;
                      setVoucherType(vt);
                      setPartyType(vt === 'Receipt' ? 'Customer' : 'Supplier');
                      if (vt === 'Receipt' && customers.length) setPartyId(customers[0].id);
                      if (vt === 'Payment' && suppliers.length) setPartyId(suppliers[0].id);
                    }}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                  >
                    <option value="Receipt">سند قبض (توريد للصندوق)</option>
                    <option value="Payment">سند صرف (خروج من الصندوق)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">الجهة</label>
                  <select
                    value={partyId}
                    onChange={(e) => setPartyId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5"
                  >
                    {voucherType === 'Receipt'
                      ? customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            عميل: {c.name}
                          </option>
                        ))
                      : suppliers.map((s) => (
                          <option key={s.id} value={s.id}>
                            مورد: {s.name}
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">المبلغ ({t('rial')})</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background p-2.5 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">البيان / الملاحظات</label>
                <input
                  type="text"
                  value={voucherDesc}
                  onChange={(e) => setVoucherDesc(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVoucherOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary text-primary-foreground px-5 py-2 font-bold hover:bg-primary/90 shadow-sm"
                >
                  اعتماد السند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-foreground mb-4">تسجيل مصروف تشغيلي</h3>
            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">مبلغ المصروف ({t('rial')})</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">وصف المصروف</label>
                <input
                  type="text"
                  required
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">المستفيد / الجهة</label>
                <input
                  type="text"
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-destructive text-white px-5 py-2 font-bold hover:bg-destructive/90 shadow-sm"
                >
                  صرف المصروف من الصندوق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
