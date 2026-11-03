import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { Product } from '../../types';
import { Package, Plus, ArrowLeftRight, Search, CheckCircle, AlertCircle, Snowflake } from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Transfer State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [transferCartons, setTransferCartons] = useState(10);
  const [transferPieces, setTransferPieces] = useState(0);
  const [transferNotes, setTransferNotes] = useState('نقل تبريد للثلاجة المركزية');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Product State
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newUnitsPerCarton, setNewUnitsPerCarton] = useState(12);
  const [newPurchasePrice, setNewPurchasePrice] = useState(2500);
  const [newSalePrice, setNewSalePrice] = useState(2900);
  const [newSalePiecePrice, setNewSalePiecePrice] = useState(250);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setStatusMsg(null);
    try {
      // Transfer from Main WH to Cold Storage
      await api.transferStock({
        sourceWarehouseId: '00000000-0000-0000-0000-000000000001', // Resolved by backend
        targetWarehouseId: '00000000-0000-0000-0000-000000000002',
        productId: selectedProduct.id,
        quantityCartons: Number(transferCartons),
        quantityPieces: Number(transferPieces),
        notes: transferNotes,
      });
      setStatusMsg({ type: 'success', text: 'تم نقل البضاعة إلى الثلاجة المركزية بنجاح!' });
      setIsTransferOpen(false);
      fetchProducts();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'فشل نقل البضاعة' });
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProduct({
        sku: newSku,
        name: newName,
        categoryId: products[0]?.categoryId || '00000000-0000-0000-0000-000000000000',
        unitsPerCarton: Number(newUnitsPerCarton),
        defaultPurchasePriceCarton: Number(newPurchasePrice),
        defaultSalePriceCarton: Number(newSalePrice),
        defaultSalePricePiece: Number(newSalePiecePrice),
        minStockAlert: 20,
      });
      setIsAddOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'فشل إضافة المنتج');
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            إدارة المنتجات والأصناف
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            متابعة أرصدة الكراتين والحبات بين المستودع الرئيسي، الثلاجة المركزية، وعهد الموزعين
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (products.length > 0) {
                setSelectedProduct(products[0]);
                setIsTransferOpen(true);
              }
            }}
            className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 transition-all shadow-sm"
          >
            <Snowflake className="h-4 w-4" />
            <span>نقل إلى الثلاجة (تبريد)</span>
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة منتج جديد</span>
          </button>
        </div>
      </div>

      {/* Alert banner */}
      {statusMsg && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3 text-xs font-bold border ${
            statusMsg.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
              : 'border-destructive/20 bg-destructive/10 text-destructive'
          }`}
        >
          {statusMsg.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو الرمز SKU..."
          className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 pl-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
              <tr>
                <th className="p-3.5">الرمز SKU</th>
                <th className="p-3.5">اسم المنتج</th>
                <th className="p-3.5">التصنيف</th>
                <th className="p-3.5">العبوة (حبة/كرتون)</th>
                <th className="p-3.5">سعر الكرتون</th>
                <th className="p-3.5">المستودع الرئيسي</th>
                <th className="p-3.5 text-cyan-600 dark:text-cyan-400">الثلاجة المركزية</th>
                <th className="p-3.5 text-amber-600 dark:text-amber-400">عهدة الموزعين</th>
                <th className="p-3.5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-muted-foreground">{p.sku}</td>
                  <td className="p-3.5 font-bold text-foreground">
                    <div>{p.name}</div>
                    {p.nameEn && <div className="text-[10px] text-muted-foreground">{p.nameEn}</div>}
                  </td>
                  <td className="p-3.5">{p.categoryName}</td>
                  <td className="p-3.5">
                    <span className="rounded-md bg-muted px-2 py-0.5 font-semibold">
                      {p.unitsPerCarton} حبة
                    </span>
                  </td>
                  <td className="p-3.5 font-bold">
                    {p.salePriceCarton.toLocaleString()} {t('rial')}
                  </td>
                  <td className="p-3.5 font-bold text-foreground">
                    {p.mainWarehouseCartons} كرتون
                  </td>
                  <td className="p-3.5 font-bold text-cyan-600 dark:text-cyan-400">
                    <span className="inline-flex items-center gap-1">
                      <Snowflake className="h-3 w-3" />
                      {p.coldStorageCartons} كرتون
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400">
                    {p.distributorCustodyCartons} كرتون
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => {
                        setSelectedProduct(p);
                        setIsTransferOpen(true);
                      }}
                      className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      نقل للثلاجة
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Stock Modal */}
      {isTransferOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-4">
              <Snowflake className="h-5 w-5 text-cyan-500" />
              نقل منتج إلى الثلاجة المركزية (تبريد وتجهيز)
            </h3>
            <div className="mb-4 rounded-xl bg-muted/50 p-3 text-xs">
              <span className="text-muted-foreground">المنتج المختار: </span>
              <strong className="text-foreground">{selectedProduct.name}</strong>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">عدد الكراتين للنقل</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={transferCartons}
                  onChange={(e) => setTransferCartons(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">حبات إضافية (مفردة)</label>
                <input
                  type="number"
                  min="0"
                  value={transferPieces}
                  onChange={(e) => setTransferPieces(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">ملاحظات التحويل</label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                  className="rounded-xl bg-cyan-600 text-white px-4 py-2 font-bold hover:bg-cyan-700 shadow-sm"
                >
                  تأكيد النقل المخزني
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-foreground mb-4">إضافة منتج جديد للمنظومة</h3>
            <form onSubmit={handleAddProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">رمز المنتج (SKU)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WAT-NEW-050"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                />
              </div>
              <div>
                <label className="block font-bold text-foreground mb-1">اسم المنتج</label>
                <input
                  type="text"
                  required
                  placeholder="مياه صنعاء 0.50L"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">حبات/كرتون</label>
                  <input
                    type="number"
                    value={newUnitsPerCarton}
                    onChange={(e) => setNewUnitsPerCarton(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">سعر الشراء للكرتون</label>
                  <input
                    type="number"
                    value={newPurchasePrice}
                    onChange={(e) => setNewPurchasePrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">سعر بيع الكرتون</label>
                  <input
                    type="number"
                    value={newSalePrice}
                    onChange={(e) => setNewSalePrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">سعر بيع الحبة</label>
                  <input
                    type="number"
                    value={newSalePiecePrice}
                    onChange={(e) => setNewSalePiecePrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
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
