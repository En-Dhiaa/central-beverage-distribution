import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { Product } from '../../types';
import { Warehouse, Snowflake, ArrowLeftRight, CheckCircle2, ThermometerSnowflake } from 'lucide-react';

export const WarehousesView: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedProdId, setSelectedProdId] = useState('');
  const [cartons, setCartons] = useState(30); // Workflow 2: 30 cartons transfer to cold storage

  const loadData = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
      if (data.length > 0) setSelectedProdId(data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.transferStock({
        sourceWarehouseId: '00000000-0000-0000-0000-000000000001',
        targetWarehouseId: '00000000-0000-0000-0000-000000000002',
        productId: selectedProdId,
        quantityCartons: Number(cartons),
        quantityPieces: 0,
        notes: 'نقل روتيني إلى الثلاجة المركزية للتبريد',
      });
      alert(`تم تحويل ${cartons} كرتون إلى الثلاجة المركزية بنجاح!`);
      setIsTransferOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'فشل التحويل المخزني');
    }
  };

  const totalMainCartons = products.reduce((acc, p) => acc + p.mainWarehouseCartons, 0);
  const totalColdCartons = products.reduce((acc, p) => acc + p.coldStorageCartons, 0);
  const totalCustodyCartons = products.reduce((acc, p) => acc + p.distributorCustodyCartons, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            المخازن والثلاجة المركزية
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            مراقبة بيئة التخزين والتبريد، وإدارة حركات النقل المخزنية بين المستودعات
          </p>
        </div>
        <button
          onClick={() => setIsTransferOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-cyan-600 text-white px-4 py-2.5 text-xs font-bold hover:bg-cyan-700 shadow-sm transition-all"
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span>تحويل بضاعة للثلاجة المركزية</span>
        </button>
      </div>

      {/* Warehouse Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Main Warehouse */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">مستودع الاستلام الجاف</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Warehouse className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-base font-extrabold text-foreground">المستودع الرئيسي</h3>
            <p className="text-xs text-muted-foreground mt-0.5">استلام الشحنات وتخزين البضائع قبل التبريد</p>
          </div>
          <div className="mt-6 border-t border-border pt-4">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">إجمالي الرصيد:</span>
              <span className="font-bold text-foreground">{totalMainCartons.toLocaleString()} كرتون</span>
            </div>
          </div>
        </div>

        {/* Central Cold Storage */}
        <div className="rounded-2xl border-2 border-cyan-500/30 bg-card p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
              <ThermometerSnowflake className="h-4 w-4" />
              درجة التبريد: 2°C إلى 4°C
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600">
              <Snowflake className="h-5 w-5 animate-spin" style={{ animationDuration: '10s' }} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-base font-extrabold text-foreground">الثلاجة المركزية</h3>
            <p className="text-xs text-muted-foreground mt-0.5">تبريد المياه والعصائر وتجهيز عهد الموزعين</p>
          </div>
          <div className="mt-6 border-t border-border pt-4">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">الرصيد المبرد المتاح:</span>
              <span className="font-bold text-cyan-600 dark:text-cyan-400 text-sm">{totalColdCartons.toLocaleString()} كرتون</span>
            </div>
          </div>
        </div>

        {/* Field Custody */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">سيارات التوزيع الميداني</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-base font-extrabold text-foreground">عهد الموزعين</h3>
            <p className="text-xs text-muted-foreground mt-0.5">بضاعة تحت التسوية والمبيعات اليومية</p>
          </div>
          <div className="mt-6 border-t border-border pt-4">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">إجمالي العهد:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{totalCustodyCartons.toLocaleString()} كرتون</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Breakdown Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="p-4 border-b border-border font-bold text-sm text-foreground">
          تفاصيل الأرصدة المخزنية لكل منتج
        </div>
        <table className="w-full text-right text-xs">
          <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
            <tr>
              <th className="p-3.5">الرمز</th>
              <th className="p-3.5">اسم المنتج</th>
              <th className="p-3.5">المستودع الرئيسي (كرتون)</th>
              <th className="p-3.5 text-cyan-600 dark:text-cyan-400">الثلاجة المركزية (كرتون)</th>
              <th className="p-3.5 text-amber-600 dark:text-amber-400">عهدة الموزعين (كرتون)</th>
              <th className="p-3.5">الإجمالي الكلي (حبة)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="p-3.5 font-mono text-muted-foreground">{p.sku}</td>
                <td className="p-3.5 font-bold text-foreground">{p.name}</td>
                <td className="p-3.5 font-bold">{p.mainWarehouseCartons}</td>
                <td className="p-3.5 font-bold text-cyan-600 dark:text-cyan-400">{p.coldStorageCartons}</td>
                <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400">{p.distributorCustodyCartons}</td>
                <td className="p-3.5 font-bold">{p.totalStockPieces.toLocaleString()} حبة</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transfer Modal */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Snowflake className="h-5 w-5 text-cyan-500" />
              تحويل بضاعة من المستودع إلى الثلاجة
            </h3>
            <form onSubmit={handleTransfer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">المنتج</label>
                <select
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (متوفر في الرئيسي: {p.mainWarehouseCartons} كرتون)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">عدد الكراتين للنقل للتبريد</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={cartons}
                  onChange={(e) => setCartons(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-600 text-white px-5 py-2 font-bold hover:bg-cyan-700 shadow-sm"
                >
                  تأكيد النقل للتبريد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
