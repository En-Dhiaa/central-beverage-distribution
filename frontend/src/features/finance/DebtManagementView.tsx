import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { CustomerDebtAging, Cashbox } from '../../types';
import {
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MessageCircle,
  Plus,
  Search,
  ArrowDownLeft,
  FileBarChart
} from 'lucide-react';

export const DebtManagementView: React.FC = () => {
  const { t } = useTranslation();
  const [agingList, setAgingList] = useState<CustomerDebtAging[]>([]);
  const [cashboxes, setCashboxes] = useState<Cashbox[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State: Collect Debt
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCashboxId, setSelectedCashboxId] = useState('');
  const [receiptAmount, setReceiptAmount] = useState(10000);
  const [receiptNotes, setReceiptNotes] = useState('سداد دفعة نقدية من مديونية الحساب');

  const loadData = async () => {
    try {
      const [aging, boxes] = await Promise.all([
        api.getCustomerDebtAging(),
        api.getCashboxes()
      ]);
      setAgingList(aging);
      setCashboxes(boxes);
      if (aging.length > 0) setSelectedCustomerId(aging[0].customerId);
      if (boxes.length > 0) setSelectedCashboxId(boxes[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalDebt = agingList.reduce((acc, c) => acc + c.totalDebt, 0);
  const totalCurrent = agingList.reduce((acc, c) => acc + c.current0To30Days, 0);
  const totalOverdue = agingList.reduce((acc, c) => acc + c.overdue31To60Days + c.overdue61To90Days, 0);
  const totalCritical = agingList.reduce((acc, c) => acc + c.criticalOver90Days, 0);

  const filteredList = agingList.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm))
  );

  const handleCollectDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    try {
      await api.createVoucher({
        voucherType: 'Receipt',
        partyType: 'Customer',
        partyId: selectedCustomerId,
        cashboxId: selectedCashboxId,
        amount: Number(receiptAmount),
        paymentMethod: 'Cash',
        description: receiptNotes,
      });

      setStatusMsg({
        type: 'success',
        text: `تم تسجيل سند قبض نقدي بمبلغ ${receiptAmount.toLocaleString()} ريال بنجاح وتخفيض مديونية العميل وتوريد النقد للصندوق.`
      });
      setIsReceiptOpen(false);
      loadData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'فشل تسجيل سند القبض' });
    }
  };

  const handleWhatsAppReminder = (c: CustomerDebtAging) => {
    if (!c.phone) {
      alert('لا يوجد رقم هاتف مسجل لهذا المحل.');
      return;
    }
    const cleanPhone = c.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `السلام عليكم ورحمة الله، الإخوة في ${c.customerName}.\nنود التذكير بضرورة مطابقة وسداد مديونية الحساب القائمة بمبلغ (${c.totalDebt.toLocaleString()} ريال) لدى مؤسسة توزيع المياه والعصائر المركزية.\nشاكرين تعاونكم الكريم.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            إدارة الديون وأعمار الذمم المدينة (Debt Aging)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            تحليل فترات تأخر سداد المحلات التجارية، تحصيل الديون بسندات قبض فورية، وتنبيهات الواتساب
          </p>
        </div>
        <button
          onClick={() => setIsReceiptOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-sm"
        >
          <ArrowDownLeft className="h-4 w-4" />
          <span>سند قبض دفعة من عميل</span>
        </button>
      </div>

      {statusMsg && (
        <div
          className={`rounded-2xl border p-4 text-xs font-bold flex items-center gap-3 ${
            statusMsg.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
              : 'border-destructive/20 bg-destructive/10 text-destructive'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <span className="text-[11px] font-bold text-muted-foreground">إجمالي مديونيات العملاء</span>
          <div className="text-xl font-black text-foreground font-mono mt-1">
            {totalDebt.toLocaleString()} {t('rial')}
          </div>
          <span className="text-[10px] text-muted-foreground">كافة الأرصدة القائمة</span>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-700">ديون جارية (1 - 30 يوم)</span>
          <div className="text-xl font-black text-emerald-700 font-mono mt-1">
            {totalCurrent.toLocaleString()} {t('rial')}
          </div>
          <span className="text-[10px] text-emerald-600/80">ضمن فترة السماح العادية</span>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-sm">
          <span className="text-[11px] font-bold text-amber-700">ديون متأخرة (31 - 90 يوم)</span>
          <div className="text-xl font-black text-amber-700 font-mono mt-1">
            {totalOverdue.toLocaleString()} {t('rial')}
          </div>
          <span className="text-[10px] text-amber-600/80">تتطلب متابعة الموزع والمحصل</span>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 shadow-sm">
          <span className="text-[11px] font-bold text-rose-700">ديون حرجة (+90 يوم)</span>
          <div className="text-xl font-black text-rose-700 font-mono mt-1">
            {totalCritical.toLocaleString()} {t('rial')}
          </div>
          <span className="text-[10px] text-rose-600/80">متعثرة ومشكوك في تحصيلها</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="بحث باسم المحل أو الكود..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-2 pr-9 pl-3 text-xs font-bold"
        />
      </div>

      {/* Aging Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-right text-xs">
          <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
            <tr>
              <th className="p-3.5">العميل / المحل</th>
              <th className="p-3.5">الهاتف والمنطقة</th>
              <th className="p-3.5">سقف الائتمان</th>
              <th className="p-3.5 font-black text-foreground">إجمالي الرصيد</th>
              <th className="p-3.5 text-emerald-600 font-bold">1 - 30 يوم</th>
              <th className="p-3.5 text-amber-600 font-bold">31 - 60 يوم</th>
              <th className="p-3.5 text-orange-600 font-bold">61 - 90 يوم</th>
              <th className="p-3.5 text-rose-600 font-bold">+90 يوم (حرجة)</th>
              <th className="p-3.5 text-center">تنبيه واتساب</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredList.map((c) => (
              <tr key={c.customerId} className="hover:bg-muted/30 transition-colors">
                <td className="p-3.5">
                  <div className="font-black text-foreground">{c.customerName}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">{c.customerCode}</div>
                </td>
                <td className="p-3.5">
                  <div className="font-mono">{c.phone || '-'}</div>
                  <div className="text-[10px] text-muted-foreground">{c.area || '-'}</div>
                </td>
                <td className="p-3.5 font-mono">{c.creditLimit.toLocaleString()} {t('rial')}</td>
                <td className="p-3.5 font-mono font-black text-sm text-foreground">
                  {c.totalDebt.toLocaleString()} {t('rial')}
                </td>
                <td className="p-3.5 font-mono text-emerald-600 font-bold">
                  {c.current0To30Days > 0 ? c.current0To30Days.toLocaleString() : '-'}
                </td>
                <td className="p-3.5 font-mono text-amber-600 font-bold">
                  {c.overdue31To60Days > 0 ? c.overdue31To60Days.toLocaleString() : '-'}
                </td>
                <td className="p-3.5 font-mono text-orange-600 font-bold">
                  {c.overdue61To90Days > 0 ? c.overdue61To90Days.toLocaleString() : '-'}
                </td>
                <td className="p-3.5 font-mono text-rose-600 font-black">
                  {c.criticalOver90Days > 0 ? c.criticalOver90Days.toLocaleString() : '-'}
                </td>
                <td className="p-3.5 text-center">
                  {c.phone && c.totalDebt > 0 && (
                    <button
                      type="button"
                      onClick={() => handleWhatsAppReminder(c)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600 hover:text-white px-2.5 py-1 text-xs font-bold transition-all"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>تذكير بالسداد</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Collect Debt Modal */}
      {isReceiptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-base font-extrabold text-foreground mb-4">
              تسجيل سند قبض دفعة نقدية من عميل
            </h3>
            <form onSubmit={handleCollectDebt} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">العميل / المحل التجاري</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                >
                  {agingList.map((c) => (
                    <option key={c.customerId} value={c.customerId}>
                      {c.customerName} (المديونية: {c.totalDebt.toLocaleString()} ر.ي)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">الصندوق المودع فيه النقد</label>
                <select
                  value={selectedCashboxId}
                  onChange={(e) => setSelectedCashboxId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                >
                  {cashboxes.map((box) => (
                    <option key={box.id} value={box.id}>
                      {box.name} (الرصيد: {box.currentBalance.toLocaleString()} ر.ي)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">المبلغ المحصل نقداً ({t('rial')})</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={receiptAmount}
                  onChange={(e) => setReceiptAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background p-2.5 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">البيان وملاحظات السند</label>
                <input
                  type="text"
                  value={receiptNotes}
                  onChange={(e) => setReceiptNotes(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsReceiptOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 text-white px-5 py-2 font-bold hover:bg-emerald-700 shadow-sm"
                >
                  تأكيد وترحيل السند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

