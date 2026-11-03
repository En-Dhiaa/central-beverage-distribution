import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { Customer, Product, Quotation } from '../../types';
import { useNotificationStore } from '../../stores/notificationStore';
import { useUIStore } from '../../stores/uiStore';
import { QuotationPrintModal } from '../../components/modals/QuotationPrintModal';
import { sounds } from '../../utils/soundEffects';
import {
  FileCheck,
  Plus,
  Printer,
  ArrowRightLeft,
  Calendar,
  User,
  RotateCw,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

export const QuotationsView: React.FC = () => {
  const { t } = useTranslation();
  const { setActiveNav } = useUIStore();
  const { addNotification } = useNotificationStore();

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activePrintQuotation, setActivePrintQuotation] = useState<Quotation | null>(null);

  // New Quotation Form
  const [selectedCustId, setSelectedCustId] = useState('');
  const [validDays, setValidDays] = useState(15);
  const [notes, setNotes] = useState('عرض سعر خاص للعميل بالجملة');
  const [terms, setTerms] = useState('الأسعار شاملة التوصيل للفرع. الدفع نقداً عند الاستلام.');
  const [items, setItems] = useState<Array<{ productId: string; quantityCartons: number; quantityPieces: number; unitPrice: number; discount: number }>>([
    { productId: '', quantityCartons: 50, quantityPieces: 0, unitPrice: 2800, discount: 0 }
  ]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [quotes, custs, prods] = await Promise.all([
        api.getQuotations(),
        api.getCustomers(),
        api.getProducts(),
      ]);
      setQuotations(quotes);
      setCustomers(custs);
      setProducts(prods);

      if (custs.length > 0 && !selectedCustId) setSelectedCustId(custs[0].id);
      if (prods.length > 0 && items.length > 0 && !items[0].productId) {
        setItems([{ productId: prods[0].id, quantityCartons: 50, quantityPieces: 0, unitPrice: prods[0].salePriceCarton, discount: 0 }]);
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

  const handleAddItem = () => {
    if (products.length === 0) return;
    setItems([
      ...items,
      { productId: products[0].id, quantityCartons: 10, quantityPieces: 0, unitPrice: products[0].salePriceCarton, discount: 0 }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustId || items.length === 0) return;

    try {
      const validUntil = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString();
      const res = await api.createQuotation({
        customerId: selectedCustId,
        quotationDate: new Date().toISOString(),
        validUntil,
        notes,
        termsAndConditions: terms,
        items: items.map(i => ({
          productId: i.productId,
          quantityCartons: Number(i.quantityCartons),
          quantityPieces: Number(i.quantityPieces),
          unitPricePerCarton: Number(i.unitPrice),
          discount: Number(i.discount)
        }))
      });

      sounds.playSuccess();
      addNotification({
        title: 'تم إنشاء عرض السعر',
        message: `تم إصدار عرض السعر ${res.quotationNumber} بنجاح.`,
        type: 'success',
      });

      setIsCreateOpen(false);
      await loadData();
      setActivePrintQuotation(res);
    } catch (err: any) {
      alert('فشل إنشاء عرض السعر: ' + (err.message || ''));
    }
  };

  const handleConvertToInvoice = async (quote: Quotation) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في تحويل عرض السعر (${quote.quotationNumber}) إلى فاتورة مبيعات معتمدة؟`)) return;

    try {
      const res = await api.convertQuotationToInvoice(quote.id);
      sounds.playCash();
      addNotification({
        title: 'تم تحويل العرض إلى فاتورة بيع!',
        message: `تم إنشاء فاتورة مبيعات رسمية من عرض السعر ${quote.quotationNumber}.`,
        type: 'sale',
        linkNav: 'sales',
      });
      await loadData();
    } catch (err: any) {
      alert('فشل تحويل عرض السعر: ' + (err.message || ''));
    }
  };

  const filteredQuotes = quotations.filter(q =>
    q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            عروض الأسعار الرسمية (Quotations)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            إعداد وطباعة عروض الأسعار للمحلات والمراكز التجارية، مع إمكانية تحويلها لفواتير بنقرة واحدة
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            <span>إنشاء عرض سعر جديد</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-muted-foreground font-bold mb-1">إجمالي عروض الأسعار</div>
          <div className="text-2xl font-black text-foreground">{quotations.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">عروض أسعار مسجلة بالنظام</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-muted-foreground font-bold mb-1">عروض نشطة وقابلة للتحويل</div>
          <div className="text-2xl font-black text-emerald-600">
            {quotations.filter(q => q.status === 'Active').length}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">بانتظار موافقة العميل</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-muted-foreground font-bold mb-1">عروض محولة لفواتير مبيعات</div>
          <div className="text-2xl font-black text-primary">
            {quotations.filter(q => q.status === 'Converted').length}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">تم إثبات مبيعاتها فعلياً</div>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث برقم العرض أو اسم العميل..."
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

        {filteredQuotes.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            لا توجد عروض أسعار مطابقة حالياً. انقر على [إنشاء عرض سعر جديد] للبدء.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="py-2.5 font-bold">رقم العرض</th>
                  <th className="py-2.5 font-bold">التاريخ</th>
                  <th className="py-2.5 font-bold">صالح حتى</th>
                  <th className="py-2.5 font-bold">العميل / المحل</th>
                  <th className="py-2.5 font-bold">الإجمالي</th>
                  <th className="py-2.5 font-bold">الحالة</th>
                  <th className="py-2.5 font-bold text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-primary">{q.quotationNumber}</td>
                    <td className="py-3 text-muted-foreground font-mono">
                      {new Date(q.quotationDate).toLocaleDateString('ar-YE')}
                    </td>
                    <td className="py-3 text-muted-foreground font-mono">
                      {new Date(q.validUntil).toLocaleDateString('ar-YE')}
                    </td>
                    <td className="py-3 font-bold text-foreground">{q.customerName}</td>
                    <td className="py-3 font-mono font-bold text-foreground">
                      {q.total.toLocaleString()} {t('rial')}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          q.status === 'Converted'
                            ? 'bg-blue-500/10 text-blue-600'
                            : 'bg-emerald-500/10 text-emerald-600'
                        }`}
                      >
                        {q.status === 'Converted' ? 'محول لفاتورة' : 'عرض نشط'}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setActivePrintQuotation(q)}
                          className="flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:bg-muted transition-colors"
                          title="معاينة وطباعة عرض السعر"
                        >
                          <Printer className="h-3 w-3" />
                          <span>طباعة</span>
                        </button>
                        {q.status !== 'Converted' && (
                          <button
                            onClick={() => handleConvertToInvoice(q)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-[11px] font-bold hover:bg-emerald-700 transition-colors"
                            title="تحويل مباشر لفاتورة مبيعات معتمدة"
                          >
                            <ArrowRightLeft className="h-3 w-3" />
                            <span>تحويل لفاتورة</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Quotation Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 my-6">
            <h3 className="text-base font-black text-foreground flex items-center gap-2 mb-4">
              <FileCheck className="h-5 w-5 text-primary" />
              إصدار عرض سعر تجاري جديد (New Quotation)
            </h3>

            <form onSubmit={handleCreateQuotation} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">المحل / العميل المستهدف</label>
                  <select
                    value={selectedCustId}
                    onChange={(e) => setSelectedCustId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.area || 'خط عام'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">صلاحية العرض (بالأيام)</label>
                  <select
                    value={validDays}
                    onChange={(e) => setValidDays(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background p-2.5"
                  >
                    <option value={7}>7 أيام (أسبوع)</option>
                    <option value={15}>15 يوماً (أسبوعين)</option>
                    <option value={30}>30 يوماً (شهر كامل)</option>
                  </select>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-2 border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">الأصناف المشمولة في العرض:</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                  >
                    <Plus className="h-3 w-3" />
                    <span>إضافة صنف آخر</span>
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-muted/30 p-2.5 rounded-xl border border-border">
                    <div className="col-span-5">
                      <select
                        value={item.productId}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].productId = e.target.value;
                          const p = products.find(x => x.id === e.target.value);
                          if (p) updated[idx].unitPrice = p.salePriceCarton;
                          setItems(updated);
                        }}
                        className="w-full rounded-lg border border-border bg-background p-2 text-xs"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        min="1"
                        placeholder="كرتون"
                        value={item.quantityCartons}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].quantityCartons = Number(e.target.value);
                          setItems(updated);
                        }}
                        className="w-full rounded-lg border border-border bg-background p-2 font-mono text-center"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0"
                        placeholder="السعر"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].unitPrice = Number(e.target.value);
                          setItems(updated);
                        }}
                        className="w-full rounded-lg border border-border bg-background p-2 font-mono text-center font-bold"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-destructive font-black text-sm hover:opacity-80"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">ملاحظات العرض</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">شروط وأحكام العرض</label>
                <input
                  type="text"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary text-primary-foreground px-5 py-2 font-bold hover:bg-primary/90 shadow-sm"
                >
                  حفظ وطباعة العرض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quotation Print Modal */}
      {activePrintQuotation && (
        <QuotationPrintModal
          quotation={activePrintQuotation}
          onClose={() => setActivePrintQuotation(null)}
        />
      )}
    </div>
  );
};
