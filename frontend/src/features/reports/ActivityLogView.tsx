import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { ActivityLogItem } from '../../types';
import {
  History,
  Search,
  Filter,
  Calendar,
  RefreshCw,
  ShoppingBag,
  Truck,
  Wallet,
  Store,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2
} from 'lucide-react';

export const ActivityLogView: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDailyActivityLog();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const modules = ['all', 'المبيعات', 'المشتريات', 'الموزعين والعهد', 'المالية والمقبوضات', 'المصروفات', 'شؤون العمال والرواتب', 'الإقفالات المالية'];

  const filteredLogs = logs.filter((item) => {
    const matchMod = selectedModule === 'all' || item.module === selectedModule;
    const matchSearch =
      item.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchMod && matchSearch;
  });

  const getModuleBadgeColor = (mod: string) => {
    switch (mod) {
      case 'المبيعات': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'المشتريات': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'الموزعين والعهد': return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20';
      case 'المالية والمقبوضات': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'المصروفات': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case 'شؤون العمال والرواتب': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default: return 'bg-muted text-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            سجل الحركة والعمليات اليومية (Daily Movement Audit Log)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            متابعة زمنية حية لكافة حركات التوريد، تسليم العهد، فواتير المبيعات، الصناديق، ومسيرات الرواتب
          </p>
        </div>
        <button
          onClick={loadLogs}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-all shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>تحديث السجل الحي</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث برقم المستند، البيان، المستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2 pr-9 pl-3 text-xs font-bold"
          />
        </div>

        {/* Module Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {modules.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedModule(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedModule === m
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {m === 'all' ? 'الكل' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-right text-xs">
          <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
            <tr>
              <th className="p-3.5">الوقت والتاريخ</th>
              <th className="p-3.5">القسم / الوحدة</th>
              <th className="p-3.5">نوع العملية</th>
              <th className="p-3.5">رقم المستند والمرجع</th>
              <th className="p-3.5">تفاصيل وبيان الحركة</th>
              <th className="p-3.5 text-left font-black">القيمة المالية</th>
              <th className="p-3.5">المستخدم المسؤول</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-muted-foreground">
                  لا توجد حركات مسجلة مطابقة للبحث.
                </td>
              </tr>
            ) : (
              filteredLogs.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleDateString('ar-YE', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black border ${getModuleBadgeColor(item.module)}`}>
                      {item.module}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-foreground whitespace-nowrap">
                    {item.actionType}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-foreground whitespace-nowrap">
                    {item.documentNumber}
                  </td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                    {item.description}
                  </td>
                  <td className="p-3.5 font-mono font-black text-left text-sm text-foreground whitespace-nowrap">
                    {item.amount > 0 ? `${item.amount.toLocaleString()} ${t('rial')}` : '-'}
                  </td>
                  <td className="p-3.5 font-bold text-muted-foreground whitespace-nowrap">
                    {item.userName}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

