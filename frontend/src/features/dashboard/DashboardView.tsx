import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { DashboardMetrics } from '../../types';
import {
  TrendingUp,
  ShoppingCart,
  Receipt,
  Wallet,
  Warehouse,
  Snowflake,
  Truck,
  Users,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    setIsLoading(true);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            لوحة التحكم والمراقبة المركزية
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            متابعة لحظية لنشاط الثلاجة، المبيعات اليومية، عهد الموزعين والأرصدة المالية
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted shadow-sm transition-all"
        >
          <RefreshCw className={`h-4 w-4 text-primary ${isLoading ? 'animate-spin' : ''}`} />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">{t('todaySales')}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-foreground">
              {(metrics?.todaySales || 0).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{t('rial')}</span>
            </div>
            <div className="mt-1 flex items-center text-[11px] text-emerald-600 font-semibold gap-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>مبيعات معتمدة اليوم</span>
            </div>
          </div>
        </div>

        {/* Cash Collections */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">{t('todayReceipts')}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-foreground">
              {(metrics?.todayReceipts || 0).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{t('rial')}</span>
            </div>
            <div className="mt-1 flex items-center text-[11px] text-muted-foreground font-medium">
              <span>توريدات نقدية بالصندوق</span>
            </div>
          </div>
        </div>

        {/* Cold Storage Stock */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">{t('coldStorage')}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600">
              <Snowflake className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-foreground">
              {(metrics?.coldStorageStockPieces || 0).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">حبة</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground font-medium">
              <span>جاهز للتوزيع بالكراتين</span>
            </div>
          </div>
        </div>

        {/* Distributor Custody */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">{t('distributorCustody')}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-foreground">
              {(metrics?.distributorCustodyPieces || 0).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">حبة</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground font-medium">
              <span>بضاعة مسلمة للموزعين كعهدة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Financial Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
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

        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
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

        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
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

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales vs Collections Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">حركة المبيعات والتحصيلات الأسبوعية</h3>
              <p className="text-xs text-muted-foreground">مقارنة المبيعات المحققة مقابل المبالغ النقدية المحصلة</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" name="المبيعات" stroke="#2563eb" fillOpacity={1} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="collections" name="التحصيلات" stroke="#10b981" fillOpacity={1} fill="url(#colGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Breakdown Bar Chart */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold text-foreground mb-1">توزيع المخزون حسب الموقع</h3>
          <p className="text-xs text-muted-foreground mb-4">توازن الكميات بين المستودع والثلاجة والموزعين</p>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>المستودع الرئيسي (استلام)</span>
                <span>{(metrics?.mainWarehouseStockPieces || 0).toLocaleString()} حبة</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>الثلاجة المركزية (تبريد وتجهيز)</span>
                <span>{(metrics?.coldStorageStockPieces || 0).toLocaleString()} حبة</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: '30%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>عهدة الموزعين في الميدان</span>
                <span>{(metrics?.distributorCustodyPieces || 0).toLocaleString()} حبة</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
