import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import type { WarehouseWorker, WorkerSalaryVoucher, Cashbox } from '../../types';
import {
  Users,
  Plus,
  DollarSign,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Calendar,
  Snowflake
} from 'lucide-react';

export const WorkersView: React.FC = () => {
  const { t } = useTranslation();
  const [workers, setWorkers] = useState<WarehouseWorker[]>([]);
  const [vouchers, setVouchers] = useState<WorkerSalaryVoucher[]>([]);
  const [cashboxes, setCashboxes] = useState<Cashbox[]>([]);
  const [activeTab, setActiveTab] = useState<'workers' | 'salaries'>('workers');

  // Modals
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [isPaySalaryOpen, setIsPaySalaryOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Worker Form
  const [workerCode, setWorkerCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('عامل تحميل وتنزيل');
  const [baseSalary, setBaseSalary] = useState(60000);
  const [salaryType, setSalaryType] = useState('Monthly');
  const [shiftHours, setShiftHours] = useState(8);
  const [notes, setNotes] = useState('');

  // Pay Salary Form
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [payYear, setPayYear] = useState(new Date().getFullYear());
  const [payMonth, setPayMonth] = useState(new Date().getMonth() + 1);
  const [payBase, setPayBase] = useState(60000);
  const [payBonus, setPayBonus] = useState(5000);
  const [payDeductions, setPayDeductions] = useState(0);
  const [selectedCashboxId, setSelectedCashboxId] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const loadData = async () => {
    try {
      const [w, v, c] = await Promise.all([
        api.getWorkers(),
        api.getSalaryVouchers(),
        api.getCashboxes()
      ]);
      setWorkers(w);
      setVouchers(v);
      setCashboxes(c);
      if (w.length > 0) {
        setSelectedWorkerId(w[0].id);
        setPayBase(w[0].baseSalary);
      }
      if (c.length > 0) setSelectedCashboxId(c[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    try {
      await api.createWorker({
        workerCode,
        fullName,
        nationalId,
        phone,
        jobTitle,
        baseSalary: Number(baseSalary),
        salaryType,
        shiftHours: Number(shiftHours),
        notes,
      });
      setStatusMsg({ type: 'success', text: `تم إضافة العامل ${fullName} بنجاح كعضو في فريق الثلاجة.` });
      setIsAddWorkerOpen(false);
      setWorkerCode('');
      setFullName('');
      setPhone('');
      loadData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'فشل إضافة العامل' });
    }
  };

  const handlePaySalary = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    try {
      await api.payWorkerSalary({
        workerId: selectedWorkerId,
        year: Number(payYear),
        month: Number(payMonth),
        baseSalary: Number(payBase),
        bonusAmount: Number(payBonus),
        deductionsAmount: Number(payDeductions),
        cashboxId: selectedCashboxId,
        notes: payNotes,
      });

      const workerObj = workers.find((w) => w.id === selectedWorkerId);
      const net = Number(payBase) + Number(payBonus) - Number(payDeductions);
      setStatusMsg({
        type: 'success',
        text: `تم صرف راتب العامل ${workerObj?.fullName} لشهر ${payMonth}/${payYear} بصافي (${net.toLocaleString()} ريال) وترحيل قيد اليومية بنجاح.`
      });
      setIsPaySalaryOpen(false);
      loadData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'فشل صرف الراتب' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            عمال الثلاجة المركزية ومسيرات الرواتب
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            إدارة عمال التحميل والتفريغ وفنيي التبريد، تسجيل ساعات العمل، وصرف الرواتب بسندات محاسبية معتمدة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaySalaryOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-sm"
          >
            <DollarSign className="h-4 w-4" />
            <span>صرف راتب عامل</span>
          </button>
          <button
            onClick={() => setIsAddWorkerOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة عامل جديد</span>
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
          onClick={() => setActiveTab('workers')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'workers'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          فريق عمل الثلاجة ({workers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('salaries')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'salaries'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          سجل الرواتب المصروفة ({vouchers.length})
        </button>
      </div>

      {/* Workers Tab */}
      {activeTab === 'workers' && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-right text-xs">
            <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
              <tr>
                <th className="p-3.5">كود العامل</th>
                <th className="p-3.5">الاسم الكامل</th>
                <th className="p-3.5">المسمى الوظيفي</th>
                <th className="p-3.5">رقم الهاتف</th>
                <th className="p-3.5">ساعات الوردية</th>
                <th className="p-3.5">الراتب الأساسي</th>
                <th className="p-3.5">نوع الراتب</th>
                <th className="p-3.5">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {workers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    لا يوجد عمال مسجلين حالياً. انقر على [إضافة عامل جديد] للبدء.
                  </td>
                </tr>
              ) : (
                workers.map((w) => (
                  <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold">{w.workerCode}</td>
                    <td className="p-3.5 font-black text-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary shrink-0" />
                        <span>{w.fullName}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">
                      {w.jobTitle}
                    </td>
                    <td className="p-3.5 font-mono">{w.phone}</td>
                    <td className="p-3.5 font-mono">{w.shiftHours} ساعات</td>
                    <td className="p-3.5 font-mono font-black text-foreground text-sm">
                      {w.baseSalary.toLocaleString()} {t('rial')}
                    </td>
                    <td className="p-3.5">
                      <span className="rounded-lg bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                        {w.salaryType === 'Monthly' ? 'شهري' : 'يومي'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                        نشط بالعمل
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Salaries Vouchers Tab */}
      {activeTab === 'salaries' && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-right text-xs">
            <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
              <tr>
                <th className="p-3.5">رقم السند</th>
                <th className="p-3.5">العامل</th>
                <th className="p-3.5">الفترة المستحقة</th>
                <th className="p-3.5">تاريخ الصرف</th>
                <th className="p-3.5">الراتب الأساسي</th>
                <th className="p-3.5 text-emerald-600">الحوافز (+)</th>
                <th className="p-3.5 text-rose-600">الخصومات (-)</th>
                <th className="p-3.5 font-black text-foreground">الصافي المنصرف</th>
                <th className="p-3.5">الصندوق المنصرف منه</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    لا توجد سندات رواتب مصروفة حتى الآن.
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold">{v.voucherNumber}</td>
                    <td className="p-3.5 font-black text-foreground">{v.workerName}</td>
                    <td className="p-3.5 font-bold">شهر {v.month} / {v.year}</td>
                    <td className="p-3.5 font-mono text-[11px]">
                      {new Date(v.paymentDate).toLocaleDateString('ar-YE')}
                    </td>
                    <td className="p-3.5 font-mono">{v.baseSalary.toLocaleString()} {t('rial')}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-600">
                      +{v.bonusAmount.toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-rose-600">
                      -{v.deductionsAmount.toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono font-black text-sm text-foreground">
                      {v.netPaid.toLocaleString()} {t('rial')}
                    </td>
                    <td className="p-3.5 font-bold text-muted-foreground">{v.cashboxName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Worker Modal */}
      {isAddWorkerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-base font-extrabold text-foreground mb-4">
              إضافة عامل جديد في فريق الثلاجة المركزية
            </h3>
            <form onSubmit={handleAddWorker} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">كود العامل</label>
                  <input
                    type="text"
                    required
                    placeholder="WRK-001"
                    value={workerCode}
                    onChange={(e) => setWorkerCode(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    required
                    placeholder="777000333"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">الاسم الكامل للعامل</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يحيى صالح أحمد"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">الوظيفة / الدور</label>
                  <select
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                  >
                    <option value="عامل تحميل وتنزيل">عامل تحميل وتنزيل</option>
                    <option value="فني تبريد وثلاجة">فني تبريد وثلاجة</option>
                    <option value="مراقب جودة وتاريخ صلاحية">مراقب جودة وتاريخ صلاحية</option>
                    <option value="حارس أمن المخزن">حارس أمن المخزن</option>
                    <option value="سائق رافعة شوكية">سائق رافعة شوكية</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">ساعات الوردية</label>
                  <input
                    type="number"
                    min="4"
                    max="12"
                    value={shiftHours}
                    onChange={(e) => setShiftHours(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">الراتب الأساسي ({t('rial')})</label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">نوع الراتب</label>
                  <select
                    value={salaryType}
                    onChange={(e) => setSalaryType(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5"
                  >
                    <option value="Monthly">شهري منتظم</option>
                    <option value="Daily">يومي باليومية</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddWorkerOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary text-primary-foreground px-5 py-2 font-bold hover:bg-primary/90 shadow-sm"
                >
                  حفظ وتعيين العامل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Salary Modal */}
      {isPaySalaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-base font-extrabold text-foreground mb-4">
              صرف راتب مستحق لعامل الثلاجة
            </h3>
            <form onSubmit={handlePaySalary} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">العامل المستحق</label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => {
                    setSelectedWorkerId(e.target.value);
                    const w = workers.find((x) => x.id === e.target.value);
                    if (w) setPayBase(w.baseSalary);
                  }}
                  className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.fullName} ({w.jobTitle} - راتب: {w.baseSalary.toLocaleString()} ر.ي)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">شهر الاستحقاق</label>
                  <select
                    value={payMonth}
                    onChange={(e) => setPayMonth(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>شهر {m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">السنة</label>
                  <input
                    type="number"
                    value={payYear}
                    onChange={(e) => setPayYear(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-foreground mb-1">الأساسي</label>
                  <input
                    type="number"
                    value={payBase}
                    onChange={(e) => setPayBase(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-emerald-600 mb-1">حوافز/إضافي (+)</label>
                  <input
                    type="number"
                    value={payBonus}
                    onChange={(e) => setPayBonus(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2 font-mono font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-rose-600 mb-1">خصومات/سلف (-)</label>
                  <input
                    type="number"
                    value={payDeductions}
                    onChange={(e) => setPayDeductions(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2 font-mono font-bold text-rose-600"
                  />
                </div>
              </div>

              {/* Net Calculated */}
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 flex justify-between items-center text-xs font-black text-primary">
                <span>صافي الراتب المستحق للصرف:</span>
                <span className="font-mono text-sm">
                  {(Number(payBase) + Number(payBonus) - Number(payDeductions)).toLocaleString()} {t('rial')}
                </span>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">صندوق الصرف النقدي</label>
                <select
                  value={selectedCashboxId}
                  onChange={(e) => setSelectedCashboxId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                >
                  {cashboxes.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (رصيد: {b.currentBalance.toLocaleString()} ر.ي)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPaySalaryOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 text-white px-5 py-2 font-bold hover:bg-emerald-700 shadow-sm"
                >
                  اعتماد الصرف النقدي وترحيل القيد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
