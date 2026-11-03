import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { Supplier, Product } from '../../types';
import { ShoppingCart, Plus, Building2, CheckCircle, AlertCircle } from 'lucide-react';

export const PurchasingView: React.FC = () => {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Purchase Invoice Form
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantityCartons, setQuantityCartons] = useState(100); // 100 cartons workflow
  const [quantityPieces, setQuantityPieces] = useState(0);
  const [unitPriceCarton, setUnitPriceCarton] = useState(2500);
  const [paymentMethod, setPaymentMethod] = useState<'Credit' | 'Cash' | 'Partial'>('Credit');
  const [paidAmount, setPaidAmount] = useState(0);
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('شراء بضاعة جديدة للمستودع الرئيسي');

  // Supplier Form
  const [supplierCode, setSupplierCode] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');

  const loadData = async () => {
    try {
      const [sups, prods] = await Promise.all([api.getSuppliers(), api.getProducts()]);
      setSuppliers(sups);
      setProducts(prods);
      if (sups.length > 0) setSelectedSupplierId(sups[0].id);
      if (prods.length > 0) {
        setSelectedProductId(prods[0].id);
        setUnitPriceCarton(prods[0].purchasePriceCarton);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalAmount = quantityCartons * unitPriceCarton;

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    try {
      await api.createPurchase({
        supplierId: selectedSupplierId,
        warehouseId: '00000000-0000-0000-0000-000000000001', // Main WH
        invoiceDate: new Date().toISOString(),
        paymentMethod,
        paidAmount: paymentMethod === 'Cash' ? totalAmount : paymentMethod === 'Credit' ? 0 : Number(paidAmount),
        supplierInvoiceNumber,
        notes,
        items: [
          {
            productId: selectedProductId,
            quantityCartons: Number(quantityCartons),
            quantityPieces: Number(quantityPieces),
            unitPricePerCarton: Number(unitPriceCarton),
            discount: 0,
          },
        ],
      });
      setStatusMsg({
        type: 'success',
        text: `تم اعتماد فاتورة الشراء بنجاح! تم استلام ${quantityCartons} كرتون في المستودع الرئيسي وتحديث حساب المورد والقيود المالية.`,
      });
      setIsInvoiceOpen(false);
      loadData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'فشل تسجيل فاتورة الشراء' });
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSupplier({
        supplierCode,
        name: supplierName,
        phone: supplierPhone,
        openingBalance: 0,
      });
      setIsSupplierOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'فشل إضافة المورد');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            إدارة المشتريات والموردين
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            تسجيل فواتير الشراء، زيادة المخزون تلقائيًا، وإدارة حسابات شركات المياه والموردين
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSupplierOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-all shadow-sm"
          >
            <Building2 className="h-4 w-4 text-primary" />
            <span>إضافة مورد</span>
          </button>
          <button
            onClick={() => setIsInvoiceOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>تسجيل فاتورة شراء جديدة</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
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

      {/* Suppliers Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20 font-bold text-sm text-foreground flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span>قائمة الموردين وشركات المياه المعتمدة</span>
        </div>
        <table className="w-full text-right text-xs">
          <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
            <tr>
              <th className="p-3.5">رمز المورد</th>
              <th className="p-3.5">اسم المورد / الشركة</th>
              <th className="p-3.5">رقم الهاتف</th>
              <th className="p-3.5">العنوان</th>
              <th className="p-3.5 text-destructive font-black">المستحق للمورد (دائن)</th>
              <th className="p-3.5 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {suppliers.map((s) => (
              <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-3.5 font-mono font-bold text-muted-foreground">{s.supplierCode}</td>
                <td className="p-3.5 font-bold text-foreground">{s.name}</td>
                <td className="p-3.5 text-muted-foreground">{s.phone || '—'}</td>
                <td className="p-3.5 text-muted-foreground">{s.address || '—'}</td>
                <td className="p-3.5 font-bold text-destructive">
                  {s.currentBalance.toLocaleString()} {t('rial')}
                </td>
                <td className="p-3.5 text-center">
                  <button
                    onClick={() => {
                      setSelectedSupplierId(s.id);
                      setIsInvoiceOpen(true);
                    }}
                    className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20"
                  >
                    شراء بضاعة
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Purchase Invoice Modal */}
      {isInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-4">
              <ShoppingCart className="h-5 w-5 text-primary" />
              تسجيل فاتورة شراء بضاعة (زيادة المخزون)
            </h3>

            <form onSubmit={handleCreatePurchase} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">المورد</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.supplierCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">الصنف المطلوب شراؤه</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find((x) => x.id === e.target.value);
                    if (p) setUnitPriceCarton(p.purchasePriceCarton);
                  }}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">الكمية (كرتون)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantityCartons}
                    onChange={(e) => setQuantityCartons(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">سعر شراء الكرتون ({t('rial')})</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={unitPriceCarton}
                    onChange={(e) => setUnitPriceCarton(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                  />
                </div>
              </div>

              {/* Total Summary */}
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 flex justify-between items-center text-sm font-bold text-primary">
                <span>إجمالي الفاتورة:</span>
                <span>{totalAmount.toLocaleString()} {t('rial')}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">طريقة السداد</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-background p-2.5"
                  >
                    <option value="Credit">آجل بالكامل (على الحساب)</option>
                    <option value="Cash">نقدًا بالكامل من الصندوق</option>
                    <option value="Partial">دفع جزئي</option>
                  </select>
                </div>
                {paymentMethod === 'Partial' && (
                  <div>
                    <label className="block font-bold text-foreground mb-1">المبلغ المدفوع نقدًا</label>
                    <input
                      type="number"
                      max={totalAmount}
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">رقم فاتورة المورد (اختياري)</label>
                <input
                  type="text"
                  placeholder="INV-SUP-1234"
                  value={supplierInvoiceNumber}
                  onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                />
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
                  اعتماد الشراء وإضافة المخزون
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {isSupplierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-foreground mb-4">إضافة شركة أو مورد جديد</h3>
            <form onSubmit={handleCreateSupplier} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">رمز المورد</label>
                <input
                  type="text"
                  required
                  placeholder="SUP-002"
                  value={supplierCode}
                  onChange={(e) => setSupplierCode(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                />
              </div>
              <div>
                <label className="block font-bold text-foreground mb-1">اسم المورد التجاري</label>
                <input
                  type="text"
                  required
                  placeholder="شركة مياه حدة"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                />
              </div>
              <div>
                <label className="block font-bold text-foreground mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  placeholder="01-234567"
                  value={supplierPhone}
                  onChange={(e) => setSupplierPhone(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary text-primary-foreground px-4 py-2 font-bold hover:bg-primary/90"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
