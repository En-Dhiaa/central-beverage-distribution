import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { Cashbox, JournalEntry, Customer, Supplier, DailyClosingSummary, DailyClosing } from '../../types';
import { Wallet, ArrowUpRight, ArrowDownLeft, BookOpen, CheckCircle2, Lock, Calendar, AlertCircle, RefreshCw, DollarSign } from 'lucide-react';

export const FinanceView: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'journal' | 'closing'>('journal');
  const [cashboxes, setCashboxes] = useState<Cashbox[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Daily Closing states
  const [closingSummary, setClosingSummary] = useState<DailyClosingSummary | null>(null);
  const [closingHistory, setClosingHistory] = useState<DailyClosing[]>([]);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [actualCash, setActualCash] = useState<number>(0);
  const [closingNotes, setClosingNotes] = useState('');
  const [closingLoading, setClosingLoading] = useState(false);

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
      const [cb, j, c, s, summary, history] = await Promise.all([
        api.getCashboxes(),
        api.getJournalEntries(),
        api.getCustomers(),
        api.getSuppliers(),
        api.getDailyClosingSummary(),
        api.getDailyClosingHistory(),
      ]);
      setCashboxes(cb);
      setJournals(j);
      setCustomers(c);
      setSuppliers(s);
      setClosingSummary(summary);
      setClosingHistory(history);
      setActualCash(summary.expectedClosingCash);
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

  const handleSubmitDailyClosing = async (e: React.FormEvent) => {
    e.preventDefault();
    setClosingLoading(true);
    try {
      const todayIso = new Date().toISOString().split('T')[0];
      await api.submitDailyClosing({
        businessDate: todayIso,
        actualCash: Number(actualCash),
        notes: closingNotes || 'إغلاق وردية يومية معتمدة',
      });
      alert('تم إغلاق وترحيل اليومية بنجاح وقفل العمليات.');
      setIsClosingModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'فشل إغلاق اليومية');
    } finally {
      setClosingLoading(false);
    }
  };

  const diff = closingSummary ? actualCash - closingSummary.expectedClosingCash : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            الحسابات المالية وإغلاق اليومية
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            إدارة الصناديق النقدية، القيود المزدوجة، المصروفات التشغيلية، والإغلاق المحاسبي لليوم
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsClosingModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 text-xs font-bold text-amber-600 hover:bg-amber-500/20 transition-all shadow-sm"
          >
            <Lock className="h-4 w-4" />
            <span>إغلاق اليومية</span>
          </button>
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

        {closingSummary && (
          <div className="rounded-2xl border border-border bg-gradient-to-br from-amber-500/5 to-transparent p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600">النقدية المتوقعة لليوم</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-sm font-bold text-foreground">الرصيد الدفتري للإقفال</h3>
              <div className="text-2xl font-black text-foreground mt-1">
                {closingSummary.expectedClosingCash.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{t('rial')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('journal')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'journal' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>دفتر اليومية العامة والقيود المزدوجة</span>
        </button>
        <button
          onClick={() => setActiveTab('closing')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'closing' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>سجل الإقفالات اليومية والمطابقة</span>
        </button>
      </div>

      {activeTab === 'journal' ? (
        /* Double-Entry Journal Entries Table */
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="p-4 border-b border-border bg-muted/20 font-bold text-sm text-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>دفتر القيود المحاسبية التلقائية (Double-Entry General Journal)</span>
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
      ) : (
        /* Daily Closing History Table */
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="p-4 border-b border-border bg-muted/20 font-bold text-sm text-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>سجل الإقفالات اليومية المعتمدة (End-of-Day Closings Log)</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-muted/40 font-bold text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-3">رقم الإقفال</th>
                  <th className="p-3">تاريخ العمل</th>
                  <th className="p-3 text-left">رصيد الافتتاح</th>
                  <th className="p-3 text-left">إجمالي المبيعات</th>
                  <th className="p-3 text-left">المصروفات</th>
                  <th className="p-3 text-left">النقد المتوقع</th>
                  <th className="p-3 text-left">النقد الفعلي</th>
                  <th className="p-3 text-center">الفارق</th>
                  <th className="p-3 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {closingHistory.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-muted-foreground">
                      لا توجد إقفالات مسجلة حتى الآن. يمكنك إغلاق اليومية الحالية باستخدام الزر أعلاه.
                    </td>
                  </tr>
                ) : (
                  closingHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-muted/20">
                      <td className="p-3 font-mono font-bold text-primary">{h.closingNumber}</td>
                      <td className="p-3 font-semibold text-foreground">
                        {new Date(h.businessDate).toLocaleDateString('ar-YE')}
                      </td>
                      <td className="p-3 text-left">{h.openingCash.toLocaleString()} {t('rial')}</td>
                      <td className="p-3 text-left font-bold text-emerald-600">
                        {h.totalSales.toLocaleString()} {t('rial')}
                      </td>
                      <td className="p-3 text-left text-destructive">
                        {h.totalExpenses.toLocaleString()} {t('rial')}
                      </td>
                      <td className="p-3 text-left font-mono">{h.expectedCash.toLocaleString()} {t('rial')}</td>
                      <td className="p-3 text-left font-bold font-mono">{h.actualCash.toLocaleString()} {t('rial')}</td>
                      <td className="p-3 text-center">
                        {h.cashDifference === 0 ? (
                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                            مطابق (0)
                          </span>
                        ) : h.cashDifference > 0 ? (
                          <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-600">
                            +{h.cashDifference.toLocaleString()} (فائض)
                          </span>
                        ) : (
                          <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-bold text-destructive">
                            {h.cashDifference.toLocaleString()} (عجز)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                          معتمد ومقفل
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily Closing Modal */}
      {isClosingModalOpen && closingSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">إغلاق وردية يوم العمل (End of Day)</h3>
                  <p className="text-xs text-muted-foreground">مراجعة المبيعات، الصندوق، وقفل الحركات</p>
                </div>
              </div>
              <button
                onClick={() => setIsClosingModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitDailyClosing} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block mb-1">رصيد الافتتاح</span>
                  <span className="font-bold text-foreground font-mono text-sm">
                    {closingSummary.openingCash.toLocaleString()} {t('rial')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <span className="text-emerald-600 block mb-1">مبيعات نقدية اليوم</span>
                  <span className="font-bold text-emerald-600 font-mono text-sm">
                    {closingSummary.totalSalesCash.toLocaleString()} {t('rial')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <span className="text-blue-600 block mb-1">تحصيلات وسندات قبض</span>
                  <span className="font-bold text-blue-600 font-mono text-sm">
                    {closingSummary.totalReceipts.toLocaleString()} {t('rial')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                  <span className="text-destructive block mb-1">مصروفات ومشتريات نقدية</span>
                  <span className="font-bold text-destructive font-mono text-sm">
                    {(closingSummary.totalExpenses + closingSummary.totalPurchasesCash).toLocaleString()} {t('rial')}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-700 block">النقد الدفتري المتوقع بالصندوق:</span>
                  <span className="text-lg font-black text-amber-900 font-mono">
                    {closingSummary.expectedClosingCash.toLocaleString()} {t('rial')}
                  </span>
                </div>
                <div className="text-left text-xs">
                  <span className="text-muted-foreground block">العهد المفتوحة:</span>
                  <span className="font-bold text-foreground">{closingSummary.openCustodyPieces.toLocaleString()} حبة</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">
                  النقدية الفعلية المحصية في الصندوق (Physical Cash Count) *
                </label>
                <input
                  type="number"
                  value={actualCash}
                  onChange={(e) => setActualCash(Number(e.target.value))}
                  required
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Cash Difference Indicator */}
              <div className="p-3 rounded-xl border flex items-center justify-between text-xs font-bold">
                <span>الفارق بين الفعلي والمتوقع:</span>
                {diff === 0 ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    مطابق تماماً (0 ريال)
                  </span>
                ) : diff > 0 ? (
                  <span className="text-blue-600">
                    +{diff.toLocaleString()} ريال (فائض)
                  </span>
                ) : (
                  <span className="text-destructive">
                    {diff.toLocaleString()} ريال (عجز)
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">
                  ملاحظات الإقفال
                </label>
                <textarea
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="أي ملاحظات حول الجرد أو التسوية..."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsClosingModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={closingLoading}
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-amber-950 hover:bg-amber-400 transition-colors shadow-sm flex items-center gap-2"
                >
                  {closingLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  <span>اعتماد وقفل اليومية نهائياً</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Voucher Modal */}
      {isVoucherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-foreground mb-4">
              إصدار سند مالي جديد
            </h3>
            <form onSubmit={handleCreateVoucher} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">نوع السند</label>
                  <select
                    value={voucherType}
                    onChange={(e: any) => setVoucherType(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground font-bold"
                  >
                    <option value="Receipt">سند قبض (Receipt)</option>
                    <option value="Payment">سند صرف (Payment)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">الطرف</label>
                  <select
                    value={partyType}
                    onChange={(e: any) => setPartyType(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground font-bold"
                  >
                    <option value="Customer">عميل</option>
                    <option value="Supplier">مورد</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">تحديد الحساب الفرعي</label>
                <select
                  value={partyId}
                  onChange={(e) => setPartyId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground font-bold"
                >
                  {partyType === 'Customer'
                    ? customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} (رصيده: {c.currentBalance.toLocaleString()} {t('rial')})
                        </option>
                      ))
                    : suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} (رصيده: {s.currentBalance.toLocaleString()} {t('rial')})
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">المبلغ (ريال)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-mono font-bold text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">البيان / الوصف</label>
                <input
                  type="text"
                  value={voucherDesc}
                  onChange={(e) => setVoucherDesc(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsVoucherOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                >
                  حفظ وترحيل السند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-foreground mb-4">
              تسجيل مصروف تشغيلي جديد
            </h3>
            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">المبلغ المصروف (ريال)</label>
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(Number(e.target.value))}
                  required
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-mono font-bold text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">المستفيد</label>
                <input
                  type="text"
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">بيان المصروف</label>
                <textarea
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  required
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsExpenseOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-destructive px-5 py-2 text-xs font-bold text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm"
                >
                  صرف وقيد المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
