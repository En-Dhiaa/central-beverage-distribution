import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { Customer, Product, SalesReturn } from '../../types';
import { useNotificationStore } from '../../stores/notificationStore';
import { sounds } from '../../utils/soundEffects';
import {
  RotateCcw,
  Plus,
  RotateCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Package
} from 'lucide-react';

export const SalesReturnsView: React.FC = () => {
  const { t } = useTranslation();
  const { addNotification } = useNotificationStore();

  const [returns, setReturns] = useState<SalesReturn[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedCustId, setSelectedCustId] = useState('');
  const [selectedProdId, setSelectedProdId] = useState('');
  const [quantityPieces, setQuantityPieces] = useState(12);
  const [unitPrice, setUnitPrice] = useState(250);
  const [returnType, setReturnType] = useState<'Resellable' | 'Damaged'>('Resellable');
  const [reason, setReason] = useState('إرجاع كرتون زائد من العميل بحالة سليمة');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rets, custs, prods] = await Promise.all([
        api.getSalesReturns(),
        api.getCustomers(),
        api.getProducts(),
      ]);
      setReturns(rets);
      setCustomers(custs);
      setProducts(prods);

      if (custs.length > 0 && !selectedCustId) setSelectedCustId(custs[0].id);
      if (prods.length > 0 && !selectedProdId) {
        setSelectedProdId(prods[0].id);
        setUnitPrice(Math.round(prods[0].salePriceCarton / (prods[0].unitsPerCarton || 12)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustId || !selectedProdId) return;

    try {
      await api.createSalesReturn({
        customerId: selectedCustId,
        returnDate: new Date().toISOString(),
        returnType,
        reason,
        warehouseId: '00000000-0000-0000-0000-000000000002', // Central cold-storage
        items: [
          {
            productId: selectedProdId,
            totalPieces: Number(quantityPieces),
            unitPrice: Number(unitPrice),
            reason,
          },
        ],
      });

      sounds.playWarning();
      addNotification({
        title: 'تم تسجيل مردودات مبيعات',
        message: `تم قيد مردودات بقيمة ${(quantityPieces * unitPrice).toLocaleString()} ر.ي وتخفيض مديونية العميل.`,
        type: 'warning',
        linkNav: 'returns',
      });

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert('فشل تسجيل المردودات: ' + (err.message || ''));
    }
  };

  const filteredReturns = returns.filter(r =>
    r.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            مردودات ومرتجعات المبيعات (Sales Returns)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            إثبات بضاعة المرتجعات السليمة للثلاجة أو التالفة، وتخفيض مديونية العميل، وإصدار قيود التسوية المحاسبية
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          <span>تسجيل مردود مبيعات جديد</span>
        </button>
      </div>

      {/* Summary Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-muted-foreground font-bold mb-1">إجمالي حركات المردودات</div>
          <div className="text-2xl font-black text-foreground">{returns.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">إشعارات مردودات مسجلة</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-muted-foreground font-bold mb-1">مرتجع سليم أُعيد للثلاجة</div>
          <div className="text-2xl font-black text-emerald-600">
            {returns.filter(r => r.returnType === 'Resellable').length}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">أُعيدت حباتها للمخزون القابل للبيع</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-muted-foreground font-bold mb-1">مرتجع تالف / منتهي الصلاحية</div>
          <div className="text-2xl font-black text-destructive">
            {returns.filter(r => r.returnType === 'Damaged').length}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">تم إثباته كخسائر تالف دون إدخاله للمخزن</div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث برقم الإشعار أو اسم العميل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-background pr-9 pl-3 py-2 text-xs"
            />
          </div>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>

        {filteredReturns.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            لا توجد مردودات مبيعات مسجلة حالياً.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="py-2.5 font-bold">رقم الإشعار</th>
                  <th className="py-2.5 font-bold">التاريخ</th>
                  <th className="py-2.5 font-bold">العميل / المحل</th>
                  <th className="py-2.5 font-bold">نوع المرتجع</th>
                  <th className="py-2.5 font-bold">القيمة الإجمالية</th>
                  <th className="py-2.5 font-bold">سبب الإرجاع</th>
                  <th className="py-2.5 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReturns.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-primary">{r.returnNumber}</td>
                    <td className="py-3 text-muted-foreground font-mono">
                      {new Date(r.returnDate).toLocaleDateString('ar-YE')}
                    </td>
                    <td className="py-3 font-bold text-foreground">{r.customerName}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          r.returnType === 'Resellable'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-destructive/10 text-destructive'
                        }`}
                      >
                        {r.returnType === 'Resellable' ? 'سليم (إعادة للمخزن)' : 'تالف / كسر'}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-foreground">
                      {r.total.toLocaleString()} {t('rial')}
                    </td>
                    <td className="py-3 text-muted-foreground">{r.reason || 'بدون سبب مدون'}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600">
                        معتمد ومقيد
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Return Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 my-6">
            <h3 className="text-base font-black text-foreground flex items-center gap-2 mb-4">
              <RotateCcw className="h-5 w-5 text-primary" />
              تسجيل مردود مبيعات جديد من العميل
            </h3>

            <form onSubmit={handleCreateReturn} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">العميل / المحل</label>
                <select
                  value={selectedCustId}
                  onChange={(e) => setSelectedCustId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (المديونية الحالية: {c.currentBalance.toLocaleString()} {t('rial')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">الصنف المرتجع</label>
                <select
                  value={selectedProdId}
                  onChange={(e) => {
                    setSelectedProdId(e.target.value);
                    const p = products.find(x => x.id === e.target.value);
                    if (p) setUnitPrice(Math.round(p.salePriceCarton / (p.unitsPerCarton || 12)));
                  }}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">الكمية المرتجعة (بالحبة)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantityPieces}
                    onChange={(e) => setQuantityPieces(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">سعر الحبة المعتمد ({t('rial')})</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 flex justify-between items-center text-sm font-black text-primary">
                <span>إجمالي قيمة المردود المخصوم:</span>
                <span>{(quantityPieces * unitPrice).toLocaleString()} {t('rial')}</span>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">حالة البضاعة المرتجعة</label>
                <select
                  value={returnType}
                  onChange={(e) => setReturnType(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                >
                  <option value="Resellable">سليم وقابل لإعادة البيع (تُضاف الحبات للمخزن)</option>
                  <option value="Damaged">تالف / منتهي الصلاحية (لا يُعاد للمخزن)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">سبب الإرجاع</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                  placeholder="مثال: فائض عن حاجة المحل / كسر أثناء التفريغ"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary text-primary-foreground px-5 py-2 font-bold hover:bg-primary/90 shadow-sm"
                >
                  اعتماد المردود وتخفيض الذمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
