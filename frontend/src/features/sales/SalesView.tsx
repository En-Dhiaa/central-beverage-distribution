import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { Customer, Product, Distributor } from '../../types';
import { Receipt, Plus, CheckCircle, AlertCircle } from 'lucide-react';

export const SalesView: React.FC = () => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State (Workflow 4: Sale of 12 cartons)
  const [selectedCustId, setSelectedCustId] = useState('');
  const [selectedDistId, setSelectedDistId] = useState('');
  const [selectedProdId, setSelectedProdId] = useState('');
  const [cartons, setCartons] = useState(12); // Workflow 4: 12 cartons
  const [pieces, setPieces] = useState(0);
  const [unitPrice, setUnitPrice] = useState(2900);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit' | 'Partial'>('Credit');
  const [paidAmount, setPaidAmount] = useState(0);

  const loadData = async () => {
    try {
      const [c, p, d] = await Promise.all([
        api.getCustomers(),
        api.getProducts(),
        api.getDistributors(),
      ]);
      setCustomers(c);
      setProducts(p);
      setDistributors(d);
      if (c.length > 0) setSelectedCustId(c[0].id);
      if (d.length > 0) setSelectedDistId(d[0].id);
      if (p.length > 0) {
        setSelectedProdId(p[0].id);
        setUnitPrice(p[0].salePriceCarton);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalInvoiceAmount = cartons * unitPrice;

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    try {
      await api.createSale({
        customerId: selectedCustId,
        distributorId: selectedDistId || null,
        warehouseId: null, // Sold from distributor custody in field
        invoiceDate: new Date().toISOString(),
        paymentMethod,
        paidAmount: paymentMethod === 'Cash' ? totalInvoiceAmount : paymentMethod === 'Credit' ? 0 : Number(paidAmount),
        notes: 'مبيعات توزيع يومية للمحل التجاري',
        items: [
          {
            productId: selectedProdId,
            quantityCartons: Number(cartons),
            quantityPieces: Number(pieces),
            unitPricePerCarton: Number(unitPrice),
            discount: 0,
          },
        ],
      });
      setStatusMsg({
        type: 'success',
        text: `تم اعتماد فاتورة البيع بنجاح! تم بيع ${cartons} كرتون بقيمة ${totalInvoiceAmount.toLocaleString()} ر.ي وتحديث مديونية العميل والقيود المحاسبية.`,
      });
      setIsInvoiceOpen(false);
      loadData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'فشل تسجيل فاتورة البيع' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            إدارة المبيعات وفواتير التوزيع
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            تسجيل فواتير البيع المباشر والميداني (نقدًا / آجلًا)، وتخفيض العهد، وتسجيل المديونيات
          </p>
        </div>
        <button
          onClick={() => setIsInvoiceOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
        >
          <Receipt className="h-4 w-4" />
          <span>إنشاء فاتورة بيع جديدة</span>
        </button>
      </div>

      {/* Alert banner */}
      {statusMsg && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-bold border ${
            statusMsg.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
              : 'border-destructive/20 bg-destructive/10 text-destructive'
          }`}
        >
          {statusMsg.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Summary Box */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-bold text-foreground mb-4">آلية المبيعات في نموذج التوزيع والعهدة</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
            <div className="font-bold text-blue-700 dark:text-blue-400 mb-1">1. تسليم العهدة</div>
            <p className="text-muted-foreground">خروج البضاعة من الثلاجة المركزية لسيارة الموزع يثبت كعهدة، ولا يسجل كإيراد بيع نهائي.</p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
            <div className="font-bold text-emerald-700 dark:text-emerald-400 mb-1">2. البيع للمحلات</div>
            <p className="text-muted-foreground">تسجيل فاتورة البيع للمحل يثبت الإيراد الفعلي، ويخفض عهدة الموزع، ويثبت مديونية المحل أو التحصيل.</p>
          </div>
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
            <div className="font-bold text-amber-700 dark:text-amber-400 mb-1">3. التسوية اليومية</div>
            <p className="text-muted-foreground">مطابقة نقدية الموزع الموردة للصندوق مع بضاعة العهدة المتبقية والمرتجعات السليمة للثلاجة.</p>
          </div>
        </div>
      </div>

      {/* Sales Invoice Modal (Workflow 4) */}
      {isInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-4">
              <Receipt className="h-5 w-5 text-primary" />
              إصدار فاتورة بيع جديدة للمحل التجاري
            </h3>

            <form onSubmit={handleCreateSale} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">المحل / العميل</label>
                <select
                  value={selectedCustId}
                  onChange={(e) => setSelectedCustId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (المديونية القائمة: {c.currentBalance.toLocaleString()} {t('rial')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">الموزع المسؤول عن التوصيل</label>
                <select
                  value={selectedDistId}
                  onChange={(e) => setSelectedDistId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                >
                  {distributors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.routeArea || 'خط عام'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">المنتج المراد بيعه</label>
                <select
                  value={selectedProdId}
                  onChange={(e) => {
                    setSelectedProdId(e.target.value);
                    const p = products.find((x) => x.id === e.target.value);
                    if (p) setUnitPrice(p.salePriceCarton);
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
                  <label className="block font-bold text-foreground mb-1">عدد الكراتين (12 كرتون)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={cartons}
                    onChange={(e) => setCartons(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">سعر بيع الكرتون للمحل ({t('rial')})</label>
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

              {/* Total Invoice */}
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 flex justify-between items-center text-sm font-black text-primary">
                <span>إجمالي الفاتورة:</span>
                <span>{totalInvoiceAmount.toLocaleString()} {t('rial')}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">نوع السداد</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-background p-2.5"
                  >
                    <option value="Credit">آجل (تسجيل على ذمة المحل)</option>
                    <option value="Cash">نقدًا (تحصيل فوري للصندوق)</option>
                    <option value="Partial">سداد جزئي</option>
                  </select>
                </div>
                {paymentMethod === 'Partial' && (
                  <div>
                    <label className="block font-bold text-foreground mb-1">المبلغ المحصل نقدًا</label>
                    <input
                      type="number"
                      max={totalInvoiceAmount}
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInvoiceOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary text-primary-foreground px-5 py-2 font-bold hover:bg-primary/90 shadow-sm"
                >
                  اعتماد الفاتورة وتحديث الأرصدة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
