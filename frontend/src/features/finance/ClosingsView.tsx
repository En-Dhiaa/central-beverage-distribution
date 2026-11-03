import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { DailyClosing, PeriodClosing, DailyClosingSummary } from '../../types';
import {
  Lock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  FileCheck,
  ShieldAlert
} from 'lucide-react';

export const ClosingsView: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'daily' | 'period'>('daily');
  const [dailyClosings, setDailyClosings] = useState<DailyClosing[]>([]);
  const [periodClosings, setPeriodClosings] = useState<PeriodClosing[]>([]);
  const [todaySummary, setTodaySummary] = useState<DailyClosingSummary | null>(null);

  // Daily Closing Modal
  const [isDailyOpen, setIsDailyOpen] = useState(false);
  const [actualCash, setActualCash] = useState(0);
  const [dailyNotes, setDailyNotes] = useState('');

  // Period Closing Modal
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [closingType, setClosingType] = useState<'Monthly' | 'Annual'>('Monthly');
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear());
  const [closingMonth, setClosingMonth] = useState(new Date().getMonth() + 1);
  const [periodNotes, setPeriodNotes] = useState('');

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    try {
      const [daily, periods, summary] = await Promise.all([
        api.getDailyClosingHistory(),
        api.getPeriodClosings(),
        api.getDailyClosingSummary(),
      ]);
      setDailyClosings(daily);
      setPeriodClosings(periods);
      setTodaySummary(summary);
      if (summary) {
        setActualCash(summary.expectedClosingCash);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDailyClosing = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    try {
      await api.submitDailyClosing({
        businessDate: new Date().toISOString(),
        actualCash: Number(actualCash),
        notes: dailyNotes || 'إقفال يومي لصناديق النقدية والمبيعات',
      });
      setStatusMsg({
        type: 'success',
        text: `تم اعتماد إقفال اليومية بنجاح ومطابقة النقد الفعلي (${Number(actualCash).toLocaleString()} ريال).`
      });
      setIsDailyOpen(false);
      loadData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'فشل إقفال اليومية' });
    }
  };

  const handlePeriodClosing = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    try {
      await api.createPeriodClosing({
        closingType,
        fiscalYear: Number(fiscalYear),
        month: closingType === 'Monthly' ? Number(closingMonth) : undefined,
        notes: periodNotes || `إقفال ${closingType === 'Monthly' ? `شهر ${closingMonth}` : 'سنة'} ${fiscalYear}`,
      });
      setStatusMsg({
        type: 'success',
        text: `تم إتمام الإقفال ${closingType === 'Monthly' ? `الشهري لشهر ${closingMonth}/${fiscalYear}` : `السنوي لسنة ${fiscalYear}`} وقفل التعديل المحاسبي بنجاح.`
      });
      setIsPeriodOpen(false);
      loadData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'فشل إتمام الإقفال الدوري' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            الإقفالات الدورية (اليومية، الشهرية، والسنوية)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            إقفال صناديق النقدية اليومية، احتساب تكلفة المبيعات وصافي الأرباح الشهرية، وقفل الفترات المحاسبية
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDailyOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
          >
            <Clock className="h-4 w-4" />
            <span>إقفال اليومية الحالي</span>
          </button>
          <button
            onClick={() => setIsPeriodOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-700 transition-all shadow-sm"
          >
            <Lock className="h-4 w-4" />
            <span>إقفال شهري / سنوي</span>
          </button>
        </div>
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

      {/* Tabs */}
      <div className="flex rounded-xl bg-card border border-border p-1 w-fit gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'daily'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          سجل الإقفالات اليومية ({dailyClosings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('period')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'period'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          الإقفالات الشهرية والسنوية ({periodClosings.length})
        </button>
      </div>

      {/* Daily Closings Tab */}
      {activeTab === 'daily' && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-right text-xs">
            <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
              <tr>
                <th className="p-3.5">رقم الإقفال</th>
                <th className="p-3.5">تاريخ العمل</th>
                <th className="p-3.5">الرصيد الافتتاحي</th>
                <th className="p-3.5">مبيعات نقدية (+)</th>
                <th className="p-3.5">سندات قبض (+)</th>
                <th className="p-3.5 text-rose-600">مصروفات (-)</th>
                <th className="p-3.5 font-bold">النقد المتوقع</th>
                <th className="p-3.5 font-black text-foreground">النقد الفعلي</th>
                <th className="p-3.5">الفارق</th>
                <th className="p-3.5">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {dailyClosings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-muted-foreground">
                    لا توجد إقفالات يومية سابقة.
                  </td>
                </tr>
              ) : (
                dailyClosings.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold">{c.closingNumber}</td>
                    <td className="p-3.5 font-mono text-[11px]">
                      {new Date(c.businessDate).toLocaleDateString('ar-YE')}
                    </td>
                    <td className="p-3.5 font-mono">{c.openingCash.toLocaleString()} {t('rial')}</td>
                    <td className="p-3.5 font-mono text-emerald-600 font-bold">
                      +{c.totalSales.toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono text-emerald-600">
                      +{c.totalReceipts.toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono text-rose-600">
                      -{c.totalExpenses.toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono font-bold">
                      {c.expectedCash.toLocaleString()} {t('rial')}
                    </td>
                    <td className="p-3.5 font-mono font-black text-sm text-foreground">
                      {c.actualCash.toLocaleString()} {t('rial')}
                    </td>
                    <td className="p-3.5 font-mono font-bold">
                      {c.cashDifference === 0 ? (
                        <span className="text-emerald-600">متطابق (0)</span>
                      ) : c.cashDifference > 0 ? (
                        <span className="text-blue-600">فائض (+{c.cashDifference.toLocaleString()})</span>
                      ) : (
                        <span className="text-rose-600 font-black">عجز ({c.cashDifference.toLocaleString()})</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                        معتمد ومقفل
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Period Closings Tab */}
      {activeTab === 'period' && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-right text-xs">
            <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
              <tr>
                <th className="p-3.5">رقم الإقفال</th>
                <th className="p-3.5">نوع الإقفال</th>
                <th className="p-3.5">الفترة المالية</th>
                <th className="p-3.5">تاريخ الإقفال</th>
                <th className="p-3.5 font-bold">إجمالي المبيعات</th>
                <th className="p-3.5 text-muted-foreground">تكلفة المبيعات (COGS)</th>
                <th className="p-3.5 font-bold text-blue-600">مجمل الربح</th>
                <th className="p-3.5 text-rose-600">المصروفات والرواتب</th>
                <th className="p-3.5 font-black text-emerald-600 text-sm">صافي الربح الدوري</th>
                <th className="p-3.5">حالة القفل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {periodClosings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-muted-foreground">
                    لا توجد إقفالات شهرية أو سنوية سابقة.
                  </td>
                </tr>
              ) : (
                periodClosings.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold">{p.closingNumber}</td>
                    <td className="p-3.5 font-bold">
                      <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black ${
                        p.closingType === 'Annual' ? 'bg-purple-500/10 text-purple-600' : 'bg-blue-500/10 text-blue-600'
                      }`}>
                        {p.closingType === 'Annual' ? 'إقفال سنوي' : 'إقفال شهري'}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold">
                      {p.closingType === 'Annual' ? `سنة ${p.fiscalYear}` : `شهر ${p.month} / ${p.fiscalYear}`}
                    </td>
                    <td className="p-3.5 font-mono text-[11px]">
                      {new Date(p.closingDate).toLocaleDateString('ar-YE')}
                    </td>
                    <td className="p-3.5 font-mono font-bold">{p.totalSales.toLocaleString()} {t('rial')}</td>
                    <td className="p-3.5 font-mono text-muted-foreground">{p.totalCostOfGoodsSold.toLocaleString()} {t('rial')}</td>
                    <td className="p-3.5 font-mono font-black text-blue-600">{p.grossProfit.toLocaleString()} {t('rial')}</td>
                    <td className="p-3.5 font-mono text-rose-600">
                      -{(p.totalExpenses + p.totalSalaries).toLocaleString()} {t('rial')}
                    </td>
                    <td className="p-3.5 font-mono font-black text-emerald-600 text-sm">
                      {p.netProfit.toLocaleString()} {t('rial')}
                    </td>
                    <td className="p-3.5">
                      <span className="flex items-center gap-1 text-[11px] font-black text-emerald-600">
                        <Lock className="h-3.5 w-3.5" />
                        <span>فترة مقفلة</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Daily Closing Modal */}
      {isDailyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-base font-extrabold text-foreground mb-4">
              اعتماد إقفال اليومية ومطابقة الصناديق
            </h3>
            {todaySummary && (
              <div className="rounded-xl bg-muted/60 p-3 space-y-1.5 text-xs mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الرصيد الافتتاحي:</span>
                  <span className="font-mono font-bold">{todaySummary.openingCash.toLocaleString()} {t('rial')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المبيعات النقدية الموردة:</span>
                  <span className="font-mono font-bold text-emerald-600">+{todaySummary.totalSalesCash.toLocaleString()} {t('rial')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المصروفات النقدية:</span>
                  <span className="font-mono font-bold text-rose-600">-{todaySummary.totalExpenses.toLocaleString()} {t('rial')}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-border font-bold text-foreground">
                  <span>النقد المتوقع بالصناديق:</span>
                  <span className="font-mono font-black text-primary">{todaySummary.expectedClosingCash.toLocaleString()} {t('rial')}</span>
                </div>
              </div>
            )}
            <form onSubmit={handleDailyClosing} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">
                  المبلغ الفعلي الموجود بالصندوق (العد الفعلي)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={actualCash}
                  onChange={(e) => setActualCash(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background p-2.5 font-mono font-black text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">ملاحظات الإقفال</label>
                <input
                  type="text"
                  value={dailyNotes}
                  onChange={(e) => setDailyNotes(e.target.value)}
                  placeholder="ملاحظات جرد الصناديق..."
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDailyOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary text-primary-foreground px-5 py-2 font-bold hover:bg-primary/90 shadow-sm"
                >
                  تأكيد وقفل اليومية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Period Closing Modal */}
      {isPeriodOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-base font-extrabold text-foreground mb-4">
              إجراء إقفال دوري وحساب الأرباح وقفل الفترة
            </h3>
            <form onSubmit={handlePeriodClosing} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">نوع الإقفال</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setClosingType('Monthly')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      closingType === 'Monthly' ? 'bg-primary text-primary-foreground font-black' : 'border-border text-muted-foreground'
                    }`}
                  >
                    إقفال شهري
                  </button>
                  <button
                    type="button"
                    onClick={() => setClosingType('Annual')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      closingType === 'Annual' ? 'bg-purple-600 text-white font-black' : 'border-border text-muted-foreground'
                    }`}
                  >
                    إقفال سنوي شامل
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {closingType === 'Monthly' && (
                  <div>
                    <label className="block font-bold text-foreground mb-1">الشهر</label>
                    <select
                      value={closingMonth}
                      onChange={(e) => setClosingMonth(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                        <option key={m} value={m}>شهر {m}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block font-bold text-foreground mb-1">السنة المالية</label>
                  <input
                    type="number"
                    value={fiscalYear}
                    onChange={(e) => setFiscalYear(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">ملاحظات وقرارات الإقفال</label>
                <input
                  type="text"
                  value={periodNotes}
                  onChange={(e) => setPeriodNotes(e.target.value)}
                  placeholder="ملاحظات مجلس الإدارة والمحاسب..."
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPeriodOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 text-white px-5 py-2 font-bold hover:bg-purple-700 shadow-sm"
                >
                  اعتماد الإقفال وتجميد الفترة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

