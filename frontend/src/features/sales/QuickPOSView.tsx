import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { Customer, Product, Distributor, SalesInvoicePrint } from '../../types';
import { InvoicePrintModal } from '../../components/modals/InvoicePrintModal';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Printer,
  Search,
  Store,
  CreditCard,
  Banknote,
  Clock,
  Sparkles
} from 'lucide-react';

interface CartItem {
  product: Product;
  quantityCartons: number;
  quantityPieces: number;
  unitPrice: number;
}

export const QuickPOSView: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustId, setSelectedCustId] = useState<string>('');
  const [selectedDistId, setSelectedDistId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit' | 'Partial'>('Cash');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('بيع سريع مباشر من الثلاجة المركزية');

  // Status & Print Modal
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<SalesInvoicePrint | null>(null);

  const loadData = async () => {
    try {
      const [prods, custs, dists] = await Promise.all([
        api.getProducts(),
        api.getCustomers(),
        api.getDistributors()
      ]);
      setProducts(prods);
      setCustomers(custs);
      setDistributors(dists);
      if (custs.length > 0) setSelectedCustId(custs[0].id);
      if (dists.length > 0) setSelectedDistId(dists[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter products
  const categories = ['all', ...Array.from(new Set(products.map((p) => p.categoryName)))];
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'all' || p.categoryName === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchTerm)) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (product: Product, cartons = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantityCartons: item.quantityCartons + cartons }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantityCartons: cartons,
          quantityPieces: 0,
          unitPrice: product.salePriceCarton,
        },
      ];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantityCartons + delta;
            return newQty > 0 ? { ...item, quantityCartons: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalCartAmount = cart.reduce(
    (sum, item) => sum + item.quantityCartons * item.unitPrice,
    0
  );

  const totalCartPieces = cart.reduce(
    (sum, item) => sum + item.quantityCartons * item.product.unitsPerCarton,
    0
  );

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('يرجى إضافة أصناف إلى سلة البيع أولاً.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCustomer = customers.find((c) => c.id === selectedCustId);
      const selectedDistributor = distributors.find((d) => d.id === selectedDistId);

      const payload = {
        customerId: selectedCustId,
        distributorId: selectedDistId || null,
        warehouseId: '00000000-0000-0000-0000-000000000002', // Central Cold Store
        invoiceDate: new Date().toISOString(),
        paymentMethod,
        paidAmount: paymentMethod === 'Cash' ? totalCartAmount : paymentMethod === 'Credit' ? 0 : paidAmount,
        notes,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantityCartons: item.quantityCartons,
          quantityPieces: item.quantityPieces,
          unitPricePerCarton: item.unitPrice,
          discount: 0,
        })),
      };

      const res = await api.createSale(payload);

      // Create Print Object
      const printData: SalesInvoicePrint = {
        id: res.id,
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        invoiceDate: new Date().toISOString(),
        customerName: selectedCustomer ? selectedCustomer.name : 'عميل فوري',
        customerPhone: selectedCustomer?.phone,
        customerArea: selectedCustomer?.area,
        distributorName: selectedDistributor?.name,
        paymentMethod,
        totalAmount: totalCartAmount,
        paidAmount: paymentMethod === 'Cash' ? totalCartAmount : paymentMethod === 'Credit' ? 0 : paidAmount,
        remainingAmount: paymentMethod === 'Cash' ? 0 : paymentMethod === 'Credit' ? totalCartAmount : totalCartAmount - paidAmount,
        notes,
        items: cart.map((item) => ({
          productName: item.product.name,
          quantityCartons: item.quantityCartons,
          quantityPieces: item.quantityPieces,
          unitPricePerCarton: item.unitPrice,
          totalPrice: item.quantityCartons * item.unitPrice,
        })),
      };

      setCompletedInvoice(printData);
      setCart([]);
      loadData();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء اعتماد الفاتورة.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* POS Topbar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">
              واجهة البيع السريع ونقاط التوزيع (Fast POS)
            </h2>
            <p className="text-xs text-muted-foreground">
              إصدار فواتير نقدية وآجلة بنقرة واحدة مع طباعة فورية بمقاسات متعددة
            </p>
          </div>
        </div>

        {/* Search & Barcode input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث باسم الصنف أو الباركود..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2 pr-9 pl-3 text-xs font-bold"
          />
        </div>
      </div>

      {/* Main Grid: Products on Right (or left depending on RTL), Cart on side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Catalog (Takes 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                    : 'bg-card border border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {cat === 'all' ? 'جميع الأصناف' : cat}
              </button>
            ))}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((p) => {
              const inCartItem = cart.find((i) => i.product.id === p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => addToCart(p, 1)}
                  className={`group relative flex flex-col justify-between rounded-2xl border bg-card p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer select-none active:scale-[0.98] ${
                    inCartItem ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                >
                  {/* Badge */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="rounded-lg bg-blue-500/10 px-2 py-0.5 text-[10px] font-black text-blue-600">
                      {p.categoryName}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {p.unitsPerCarton} حبة/كرتون
                    </span>
                  </div>

                  {/* Title */}
                  <div className="my-1">
                    <h3 className="text-xs font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      رصيد الثلاجة: {p.coldStorageCartons} كرتون
                    </p>
                  </div>

                  {/* Price & Add */}
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-foreground font-mono">
                        {p.salePriceCarton.toLocaleString()} {t('rial')}
                      </span>
                      <span className="text-[9px] text-muted-foreground">للجملة</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p, 1);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {inCartItem && (
                    <div className="absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-sm">
                      {inCartItem.quantityCartons}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Cart Drawer (Takes 1 col) */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between h-full">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                <span className="text-sm font-black text-foreground">سلة الفاتورة</span>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-black text-foreground font-mono">
                {cart.length} أصناف
              </span>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-xs font-bold">السلة فارغة حالياً</p>
                  <p className="text-[10px]">انقر فوق أي منتج لإضافته مباشرة للفاتورة</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-background p-2.5 text-xs"
                  >
                    <div className="flex-1 truncate mr-2">
                      <div className="font-bold text-foreground truncate">{item.product.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {item.unitPrice.toLocaleString()} {t('rial')} / كرتون
                      </div>
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.product.id, -1)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg border border-border bg-muted hover:bg-muted/80"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-mono font-black text-sm w-5 text-center">
                        {item.quantityCartons}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.product.id, 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-muted-foreground hover:text-rose-600 p-1 mr-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleCheckout} className="border-t border-border pt-4 mt-4 space-y-3">
              {/* Customer Selector */}
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                  المحل / العميل المستلم
                </label>
                <select
                  value={selectedCustId}
                  onChange={(e) => setSelectedCustId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2 text-xs font-bold"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.currentBalance > 0 ? `(مدين: ${c.currentBalance.toLocaleString()} ر.ي)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Distributor / Cashier */}
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                  الموزع / نقطة التوزيع
                </label>
                <select
                  value={selectedDistId}
                  onChange={(e) => setSelectedDistId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2 text-xs font-bold"
                >
                  {distributors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.routeArea || 'مبيعات مباشرة'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method Tabs */}
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                  طريقة السداد
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash')}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      paymentMethod === 'Cash'
                        ? 'border-primary bg-primary/10 text-primary font-black'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    نقدًا
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Credit')}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      paymentMethod === 'Credit'
                        ? 'border-amber-600 bg-amber-500/10 text-amber-600 font-black'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    آجل
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Partial')}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      paymentMethod === 'Partial'
                        ? 'border-blue-600 bg-blue-500/10 text-blue-600 font-black'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    جزئي
                  </button>
                </div>
              </div>

              {paymentMethod === 'Partial' && (
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                    المبلغ المحصل نقداً
                  </label>
                  <input
                    type="number"
                    max={totalCartAmount}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2 text-xs font-mono font-bold"
                  />
                </div>
              )}

              {/* Total & Action Button */}
              <div className="rounded-xl bg-muted/60 p-3 space-y-1 text-xs">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>إجمالي الحبات:</span>
                  <span className="font-mono font-bold">{totalCartPieces.toLocaleString()} حبة</span>
                </div>
                <div className="flex justify-between items-center text-base font-black text-foreground pt-1 border-t border-border">
                  <span>المبلغ المطلوب:</span>
                  <span className="font-mono text-primary">
                    {totalCartAmount.toLocaleString()} {t('rial')}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 px-4 text-xs font-black text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>جاري الاعتماد والترحيل...</span>
                ) : (
                  <>
                    <Printer className="h-4 w-4" />
                    <span>اعتماد الفاتورة وطباعتها فوراً</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Invoice Print Modal Popup */}
      {completedInvoice && (
        <InvoicePrintModal
          invoice={completedInvoice}
          onClose={() => setCompletedInvoice(null)}
        />
      )}
    </div>
  );
};

