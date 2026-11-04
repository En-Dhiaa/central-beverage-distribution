import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { DashboardMetrics } from '../../types';
import { useUIStore } from '../../stores/uiStore';
import { soundEffects } from '../../utils/soundEffects';
import {
  TrendingUp,
  Receipt,
  Wallet,
  Snowflake,
  Truck,
  Users,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  SlidersHorizontal,
  PlusCircle,
  FileCheck,
  CheckCircle2,
  X,
  RotateCcw,
  Package,
  Layers,
  ArrowLeftRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface WidgetConfig {
  id: string;
  label: string;
  category: 'kpi' | 'chart' | 'action' | 'alert';
  visible: boolean;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'kpi_sales', label: 'مبيعات اليوم', category: 'kpi', visible: true },
  { id: 'kpi_receipts', label: 'التوريدات النقدية', category: 'kpi', visible: true },
  { id: 'kpi_cold_storage', label: 'بضاعة الثلاجة المركزية', category: 'kpi', visible: true },
  { id: 'kpi_custody', label: 'عهدة الموزعين', category: 'kpi', visible: true },
  { id: 'financial_summary', label: 'شريط الصناديق والديون', category: 'kpi', visible: true },
  { id: 'quick_actions', label: 'شريط الإجراءات السريعة', category: 'action', visible: true },
  { id: 'sales_chart', label: 'رسم بياني للمبيعات والتحصيلات', category: 'chart', visible: true },
  { id: 'inventory_breakdown', label: 'توزيع المخزون بالمواقع', category: 'chart', visible: true },
  { id: 'alerts_panel', label: 'التنبيهات والمخاطر', category: 'alert', visible: true },
];

export const DashboardView: React.FC = () => {
  const { t } = useTranslation();
  const { setActiveNav } = useUIStore();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Load widget visibility from LocalStorage
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    try {
      const saved = localStorage.getItem('beverage_dashboard_widgets_v2');
      if (saved) {
        const parsed: WidgetConfig[] = JSON.parse(saved);
        return DEFAULT_WIDGETS.map((def) => {
          const found = parsed.find((p) => p.id === def.id);
          return found ? { ...def, visible: found.visible } : def;
        });
      }
    } catch {}
    return DEFAULT_WIDGETS;
  });

  const saveWidgets = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    localStorage.setItem('beverage_dashboard_widgets_v2', JSON.stringify(newWidgets));
  };

  const toggleWidget = (id: string) => {
    soundEffects.playPop();
    const updated = widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w));
    saveWidgets(updated);
  };

  const resetWidgets = () => {
    soundEffects.playPop();
    saveWidgets(DEFAULT_WIDGETS);
  };

  const isWidgetVisible = (id: string) => {
    return widgets.find((w) => w.id === id)?.visible ?? true;
  };

  const fetchMetrics = async () => {
    setIsLoading(true);
    soundEffects.playPop();
    try {
      const data = await api.getMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const chartData = [
    { name: 'السبت', sales: 120000, collections: 95000 },
    { name: 'الأحد', sales: 180000, collections: 140000 },
    { name: 'الإثنين', sales: 240000, collections: 210000 },
    { name: 'الثلاثاء', sales: 310000, collections: 280000 },
    { name: 'الأربعاء', sales: 190000, collections: 175000 },
    { name: 'الخميس', sales: 420000, collections: 390000 },
    { name: 'الجمعة', sales: 90000, collections: 85000 },
  ];

  const handleQuickNav = (nav: string) => {
    soundEffects.playPop();
    setActiveNav(nav);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <span>لوحة التحكم والمراقبة المركزية</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Live Real-Time
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            متابعة لحظية لنشاط الثلاجة، المبيعات اليومية، عهد الموزعين والأرصدة المالية
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCustomizeOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted shadow-sm transition-all"
            title="تخصيص وترتيب بطاقات لوحة التحكم"
          >
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <span>تخصيص اللوحة</span>
          </button>

          <button
            onClick={fetchMetrics}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted shadow-sm transition-all"
          >
            <RefreshCw className={`h-4 w-4 text-primary ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Quick Action Bar (Optional Widget) */}
      {isWidgetVisible('quick_actions') && (
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-card to-card p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-[11px]">
                ⚡
              </span>
              <span>الإجراءات التشغيلية المباشرة:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleQuickNav('pos')}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-all"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>نقطة بيع سريعة (POS)</span>
              </button>
              <button
                onClick={() => handleQuickNav('sales')}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-all"
              >
                <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>فاتورة مبيعات جديدة</span>
              </button>
              <button
                onClick={() => handleQuickNav('distributors')}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-all"
              >
                <Truck className="h-3.5 w-3.5 text-amber-600" />
                <span>تسليم عهدة لموزع</span>
              </button>
              <button
                onClick={() => handleQuickNav('closings')}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-all"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                <span>إغلاق اليومية</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        {isWidgetVisible('kpi_sales') && (
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-primary/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">{t('todaySales')}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-foreground">
                {(metrics?.todaySales || 0).toLocaleString()}{' '}
                <span className="text-xs font-normal text-muted-foreground">{t('rial')}</span>
              </div>
              <div className="mt-1 flex items-center text-[11px] text-emerald-600 font-semibold gap-1">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>مبيعات معتمدة اليوم</span>
              </div>
            </div>
          </div>
        )}

        {/* Cash Collections */}
        {isWidgetVisible('kpi_receipts') && (
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">{t('todayReceipts')}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <Receipt className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-foreground">
                {(metrics?.todayReceipts || 0).toLocaleString()}{' '}
                <span className="text-xs font-normal text-muted-foreground">{t('rial')}</span>
              </div>
              <div className="mt-1 flex items-center text-[11px] text-muted-foreground font-medium">
                <span>توريدات نقدية بالصندوق</span>
              </div>
            </div>
          </div>
        )}

        {/* Cold Storage Stock */}
        {isWidgetVisible('kpi_cold_storage') && (
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">{t('coldStorage')}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600">
                <Snowflake className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-foreground">
                {(metrics?.coldStorageStockPieces || 0).toLocaleString()}{' '}
                <span className="text-xs font-normal text-muted-foreground">حبة</span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground font-medium">
                <span>جاهز للتوزيع بالكراتين</span>
              </div>
            </div>
          </div>
        )}

        {/* Distributor Custody */}
        {isWidgetVisible('kpi_custody') && (
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">{t('distributorCustody')}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Truck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-foreground">
                {(metrics?.distributorCustodyPieces || 0).toLocaleString()}{' '}
                <span className="text-xs font-normal text-muted-foreground">حبة</span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground font-medium">
                <span>بضاعة مسلمة للموزعين كعهدة</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Secondary Financial Row */}
      {isWidgetVisible('financial_summary') && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => handleQuickNav('finance')}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 cursor-pointer transition-all"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">{t('cashBalance')}</div>
              <div className="text-lg font-bold text-foreground">
                {(metrics?.totalCashboxBalance || 0).toLocaleString()} {t('rial')}
              </div>
            </div>
          </div>

          <div
            onClick={() => handleQuickNav('debt')}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-destructive/50 cursor-pointer transition-all"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">{t('customerDebt')}</div>
              <div className="text-lg font-bold text-foreground">
                {(metrics?.totalCustomerDebt || 0).toLocaleString()} {t('rial')}
              </div>
            </div>
          </div>

          <div
            onClick={() => handleQuickNav('purchasing')}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-orange-500/50 cursor-pointer transition-all"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">{t('supplierDebt')}</div>
              <div className="text-lg font-bold text-foreground">
                {(metrics?.totalSupplierDebt || 0).toLocaleString()} {t('rial')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Charts & Stock Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales vs Collections Area Chart */}
        {isWidgetVisible('sales_chart') && (
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">حركة المبيعات والتحصيلات الأسبوعية</h3>
                <p className="text-xs text-muted-foreground">مقارنة المبيعات المحققة مقابل المبالغ النقدية المحصلة</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  المبيعات
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  التحصيلات
                </span>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    name="المبيعات"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#salesGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="collections"
                    name="التحصيلات"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Stock Breakdown Bar Chart */}
        {isWidgetVisible('inventory_breakdown') && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-1">توزيع المخزون حسب الموقع</h3>
            <p className="text-xs text-muted-foreground mb-4">توازن الكميات بين المستودع والثلاجة والموزعين</p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-blue-500" />
                    المستودع الرئيسي (استلام)
                  </span>
                  <span>{(metrics?.mainWarehouseStockPieces || 0).toLocaleString()} حبة</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Snowflake className="h-3.5 w-3.5 text-cyan-500" />
                    الثلاجة المركزية (تبريد وتجهيز)
                  </span>
                  <span>{(metrics?.coldStorageStockPieces || 0).toLocaleString()} حبة</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '30%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-amber-500" />
                    عهدة الموزعين في الميدان
                  </span>
                  <span>{(metrics?.distributorCustodyPieces || 0).toLocaleString()} حبة</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
              <span>إجمالي البضاعة المتداولة:</span>
              <span className="font-bold text-foreground">
                {(
                  (metrics?.mainWarehouseStockPieces || 0) +
                  (metrics?.coldStorageStockPieces || 0) +
                  (metrics?.distributorCustodyPieces || 0)
                ).toLocaleString()}{' '}
                حبة
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Widget Customization Modal */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">تخصيص بطاقات لوحة التحكم</h3>
              </div>
              <button
                onClick={() => setIsCustomizeOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-3 mb-4">
              اختر البطاقات والعناصر التي تريد إظهارها أو إخفاءها في واجهة لوحة التحكم حسب طبيعة عملك:
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {widgets.map((w) => (
                <div
                  key={w.id}
                  onClick={() => toggleWidget(w.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    w.visible
                      ? 'border-primary/40 bg-primary/5 text-foreground'
                      : 'border-border bg-muted/40 text-muted-foreground opacity-60'
                  }`}
                >
                  <span>{w.label}</span>
                  <div
                    className={`h-5 w-9 rounded-full transition-colors relative flex items-center p-0.5 ${
                      w.visible ? 'bg-primary justify-end' : 'bg-muted justify-start'
                    }`}
                  >
                    <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-3">
              <button
                onClick={resetWidgets}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>استعادة الافتراضي</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playSuccess();
                  setIsCustomizeOpen(false);
                }}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90"
              >
                حفظ وإغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
