import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { Distributor, Product } from '../../types';
import { Truck, Plus, Send, CheckCheck, CheckCircle2, AlertCircle, Snowflake } from 'lucide-react';

export const DistributorsView: React.FC = () => {
  const { t } = useTranslation();
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active distributor for modal
  const [activeDistributor, setActiveDistributor] = useState<Distributor | null>(null);

  // Dispatch Form
  const [dispatchProdId, setDispatchProdId] = useState('');
  const [dispatchCartons, setDispatchCartons] = useState(20); // Workflow 3: 20 cartons
  const [agreedPrice, setAgreedPrice] = useState(2900);

  // Settlement Form (Workflow 6)
  const [settleProdId, setSettleProdId] = useState('');
  const [openingPieces, setOpeningPieces] = useState(0);
  const [receivedPieces, setReceivedPieces] = useState(240); // 20 cartons * 12 = 240
  const [soldPieces, setSoldPieces] = useState(144); // 12 cartons * 12 = 144 pieces (Workflow 4)
  const [returnedPieces, setReturnedPieces] = useState(36); // 3 cartons * 12 = 36 pieces (Workflow 5)
  const [damagedPieces, setDamagedPieces] = useState(0);
  const [shortagePieces, setShortagePieces] = useState(0);
  const [cashHandedOver, setCashHandedOver] = useState(34800); // 12 cartons * 2900 = 34,800

  const loadData = async () => {
    try {
      const [dists, prods] = await Promise.all([api.getDistributors(), api.getProducts()]);
      setDistributors(dists);
      setProducts(prods);
      if (dists.length > 0) setActiveDistributor(dists[0]);
      if (prods.length > 0) {
        setDispatchProdId(prods[0].id);
        setSettleProdId(prods[0].id);
        setAgreedPrice(prods[0].salePriceCarton);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const remainingPieces =
    openingPieces + receivedPieces - soldPieces - returnedPieces - damagedPieces - shortagePieces;

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDistributor) return;
    setStatusMsg(null);
    try {
      await api.dispatchCustody({
        distributorId: activeDistributor.id,
        warehouseId: '00000000-0000-0000-0000-000000000002', // Cold storage
        dispatchDate: new Date().toISOString(),
        notes: 'تسليم عهدة توزيع صباحية من الثلاجة المركزية',
        items: [
          {
            productId: dispatchProdId,
            quantityCartons: Number(dispatchCartons),
            quantityPieces: 0,
            agreedSalePrice: Number(agreedPrice),
          },
        ],
      });
      setStatusMsg({
        type: 'success',
        text: `تم تسليم ${dispatchCartons} كرتون لعهدة الموزع ${activeDistributor.name} بنجاح! تم خصمها من الثلاجة وإدراجها ضمن عهدته (ليست بيعًا نهائيًا).`,
      });
      setIsDispatchOpen(false);
      loadData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'فشل تسليم العهدة' });
    }
  };

  const handleSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDistributor) return;
    setStatusMsg(null);
    try {
      await api.settleDistributor({
        distributorId: activeDistributor.id,
        businessDate: new Date().toISOString(),
        totalSalesValue: (soldPieces / 12) * agreedPrice,
        cashCollected: Number(cashHandedOver),
        creditSalesAmount: 0,
        approvedExpenses: 0,
        cashHandedOver: Number(cashHandedOver),
        notes: 'تسوية يومية متطابقة للكميات والمبالغ الموردة',
        items: [
          {
            productId: settleProdId,
            openingQuantityPieces: Number(openingPieces),
            receivedQuantityPieces: Number(receivedPieces),
            soldQuantityPieces: Number(soldPieces),
            returnedQuantityPieces: Number(returnedPieces),
            damagedQuantityPieces: Number(damagedPieces),
            shortageQuantityPieces: Number(shortagePieces),
            remainingQuantityPieces: Number(remainingPieces),
          },
        ],
      });
      setStatusMsg({
        type: 'success',
        text: `تم اعتماد التسوية اليومية للموزع ${activeDistributor.name} بنجاح! تمت إعادة ${returnedPieces / 12} كرتون سليم للثلاجة وتوريد مبلغ ${cashHandedOver.toLocaleString()} ر.ي للصندوق.`,
      });
      setIsSettleOpen(false);
      loadData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'فشل اعتماد التسوية' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            إدارة الموزعين والعهد والتسويات
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            تسليم العهد من الثلاجة المركزية، مراقبة المبيعات الميدانية، والاعتماد المحاسبي للتسوية اليومية
          </p>
        </div>
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
          {statusMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Distributors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {distributors.map((d) => (
          <div key={d.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-muted-foreground">{d.distributorCode}</span>
                <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600">
                  {d.relationshipType === 'Consignment' ? 'عهدة وأمانة' : 'بيع جملة'}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-foreground mt-2">{d.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{d.routeArea || 'خط التوزيع العام'}</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">{d.phone}</p>

              {/* Custody Box */}
              <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
                <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  إجمالي البضاعة بعهدته:
                </div>
                <div className="text-lg font-black text-amber-600 dark:text-amber-400">
                  {d.totalCustodyCartons} كرتون <span className="text-xs font-normal">({d.totalCustodyPieces} حبة)</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border pt-4">
              <button
                onClick={() => {
                  setActiveDistributor(d);
                  setIsDispatchOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-all"
              >
                <Send className="h-3.5 w-3.5" />
                <span>تسليم عهدة</span>
              </button>
              <button
                onClick={() => {
                  setActiveDistributor(d);
                  setIsSettleOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-sm"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>تسوية يومية</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dispatch Modal (Workflow 3) */}
      {isDispatchOpen && activeDistributor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-4">
              <Send className="h-5 w-5 text-primary" />
              تسليم بضاعة لعهدة الموزع ({activeDistributor.name})
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              خصم الكمية من الثلاجة المركزية وإضافتها لعهدة الموزع (لا تحتسب مبيعات نهائية).
            </p>

            <form onSubmit={handleDispatch} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">المنتج المراد تسليمه</label>
                <select
                  value={dispatchProdId}
                  onChange={(e) => setDispatchProdId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (متوفر بالثلاجة: {p.coldStorageCartons} كرتون)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">الكمية المسلمة (كرتون)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={dispatchCartons}
                    onChange={(e) => setDispatchCartons(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">سعر البيع المعتمد ({t('rial')})</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={agreedPrice}
                    onChange={(e) => setAgreedPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDispatchOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary text-primary-foreground px-5 py-2 font-bold hover:bg-primary/90 shadow-sm"
                >
                  اعتماد تسليم العهدة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Settlement Modal (Workflow 6) */}
      {isSettleOpen && activeDistributor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-2">
              <CheckCheck className="h-5 w-5 text-emerald-600" />
              التسوية اليومية لعهدة الموزع ({activeDistributor.name})
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              التحقق الصارم من معادلة العهدة والمبالغ النقدية الموردة
            </p>

            <form onSubmit={handleSettle} className="space-y-4 text-xs">
              <div className="rounded-xl bg-muted/40 p-3 space-y-3">
                <div className="font-bold text-foreground">1. معادلة الكميات (بالحبات):</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-muted-foreground block mb-0.5">الرصيد الافتتاحي</label>
                    <input
                      type="number"
                      value={openingPieces}
                      onChange={(e) => setOpeningPieces(Number(e.target.value))}
                      className="w-full rounded-lg border border-border bg-background p-2"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground block mb-0.5">المستلم اليوم (20 كرتون = 240 حبة)</label>
                    <input
                      type="number"
                      value={receivedPieces}
                      onChange={(e) => setReceivedPieces(Number(e.target.value))}
                      className="w-full rounded-lg border border-border bg-background p-2 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-muted-foreground block mb-0.5">المباع (12 كرتون = 144 حبة)</label>
                    <input
                      type="number"
                      value={soldPieces}
                      onChange={(e) => setSoldPieces(Number(e.target.value))}
                      className="w-full rounded-lg border border-border bg-background p-2 font-bold text-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground block mb-0.5">المرتجع السليم (3 كرتون = 36 حبة)</label>
                    <input
                      type="number"
                      value={returnedPieces}
                      onChange={(e) => setReturnedPieces(Number(e.target.value))}
                      className="w-full rounded-lg border border-border bg-background p-2 font-bold text-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground block mb-0.5">التالف / العجز</label>
                    <input
                      type="number"
                      value={damagedPieces}
                      onChange={(e) => setDamagedPieces(Number(e.target.value))}
                      className="w-full rounded-lg border border-border bg-background p-2"
                    />
                  </div>
                </div>

                {/* Remaining calculation banner */}
                <div className="rounded-lg bg-card border border-border p-2.5 flex justify-between items-center font-bold">
                  <span>الرصيد الختامي المتبقي بعهدته:</span>
                  <span className="text-sm font-black text-primary">{remainingPieces} حبة ({remainingPieces / 12} كرتون)</span>
                </div>
              </div>

              <div className="rounded-xl bg-muted/40 p-3 space-y-3">
                <div className="font-bold text-foreground">2. التسوية المالية والنقدية:</div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span>قيمة المبيعات المحققة:</span>
                  <span>{((soldPieces / 12) * agreedPrice).toLocaleString()} {t('rial')}</span>
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">المبلغ النقدي المورد للصندوق فعليًا</label>
                  <input
                    type="number"
                    required
                    value={cashHandedOver}
                    onChange={(e) => setCashHandedOver(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettleOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 text-white px-5 py-2 font-bold hover:bg-emerald-700 shadow-sm"
                >
                  اعتماد التسوية وتوريد النقدية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
