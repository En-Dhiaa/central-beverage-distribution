import React, { useState } from 'react';
import { SalesInvoicePrint } from '../../types';
import { tafqeetRial } from '../../utils/tafqeet';
import { Printer, X, Snowflake, CheckCircle2 } from 'lucide-react';

interface Props {
  invoice: SalesInvoicePrint;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<Props> = ({ invoice, onClose }) => {
  const [paperSize, setPaperSize] = useState<'80mm' | 'A4' | 'A5'>('80mm');

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(invoice.invoiceDate).toLocaleDateString('ar-YE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden my-6">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground">مقاس ورق الطباعة:</span>
            <div className="flex rounded-xl bg-background border border-border p-1 gap-1">
              <button
                type="button"
                onClick={() => setPaperSize('80mm')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  paperSize === '80mm'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                حراري 80 مم (POS)
              </button>
              <button
                type="button"
                onClick={() => setPaperSize('A4')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  paperSize === 'A4'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                A4 رسمي
              </button>
              <button
                type="button"
                onClick={() => setPaperSize('A5')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  paperSize === 'A5'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                A5 مدمج
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
            >
              <Printer className="h-4 w-4" />
              <span>طباعة الفاتورة الآن</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 max-h-[75vh] overflow-y-auto bg-slate-100 dark:bg-slate-900/40 flex justify-center">
          <div
            className={`printable-area bg-white text-slate-900 shadow-lg rounded-xl p-6 transition-all border border-slate-200 ${
              paperSize === '80mm'
                ? 'print-receipt-80mm max-w-[340px] text-xs'
                : paperSize === 'A4'
                ? 'print-a4 max-w-2xl text-sm'
                : 'print-a5 max-w-xl text-xs'
            }`}
          >
            {/* Enterprise Header */}
            <div className="text-center border-b pb-4 mb-4 border-slate-300">
              <div className="flex justify-center items-center gap-2 mb-1">
                <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                  ❄
                </div>
                <h1 className="text-base font-black tracking-tight text-slate-900">
                  مؤسسة توزيع المياه والعصائر المركزية
                </h1>
              </div>
              <p className="text-[10px] text-slate-600 font-bold">
                الثلاجة المركزية للتبريد والتوزيع بالجملة — صنعاء | ت: 777000111
              </p>
              <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-[11px] font-black">
                {invoice.paymentMethod === 'Cash' ? 'فاتورة مبيعات نقدية' : 'فاتورة مبيعات آجلة'}
              </div>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 font-bold">رقم الفاتورة: </span>
                <span className="font-mono font-black text-slate-900">{invoice.invoiceNumber}</span>
              </div>
              <div className="text-left" dir="ltr">
                <span className="text-slate-500 font-bold">:التاريخ </span>
                <span className="font-bold text-slate-900">{formattedDate}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold">العميل / المحل: </span>
                <span className="font-black text-slate-900">{invoice.customerName}</span>
              </div>
              {invoice.customerPhone && (
                <div>
                  <span className="text-slate-500 font-bold">الهاتف: </span>
                  <span className="font-bold text-slate-900">{invoice.customerPhone}</span>
                </div>
              )}
              {invoice.distributorName && (
                <div>
                  <span className="text-slate-500 font-bold">الموزع المسؤول: </span>
                  <span className="font-bold text-slate-900">{invoice.distributorName}</span>
                </div>
              )}
              {invoice.customerArea && (
                <div>
                  <span className="text-slate-500 font-bold">المنطقة / الخط: </span>
                  <span className="font-bold text-slate-900">{invoice.customerArea}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <table className="w-full text-right text-[11px] border border-slate-300 mb-4">
              <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                <tr>
                  <th className="p-2 border-l border-slate-300">م</th>
                  <th className="p-2 border-l border-slate-300">الصنف</th>
                  <th className="p-2 border-l border-slate-300 text-center">الكمية</th>
                  <th className="p-2 border-l border-slate-300 text-center">سعر الكرتون</th>
                  <th className="p-2 text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border-l border-slate-200 font-mono text-center">{idx + 1}</td>
                    <td className="p-2 border-l border-slate-200 font-bold text-slate-900">{item.productName}</td>
                    <td className="p-2 border-l border-slate-200 text-center font-bold">
                      {item.quantityCartons} كرتون
                    </td>
                    <td className="p-2 border-l border-slate-200 text-center font-mono font-bold">
                      {item.unitPricePerCarton.toLocaleString()}
                    </td>
                    <td className="p-2 text-left font-mono font-black text-slate-900">
                      {item.totalPrice.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Summary */}
            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 space-y-1.5 text-[11px] mb-4">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-slate-700">إجمالي الفاتورة:</span>
                <span className="font-mono text-blue-700">{invoice.totalAmount.toLocaleString()} ريال</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">المبلغ المدفوع نقدًا:</span>
                <span className="font-mono font-bold text-emerald-700">{invoice.paidAmount.toLocaleString()} ريال</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                <span className="text-slate-600 font-bold">المتبقي على الحساب:</span>
                <span className="font-mono font-black text-rose-700">{invoice.remainingAmount.toLocaleString()} ريال</span>
              </div>
              <div className="pt-2 text-[10px] text-slate-700 font-bold border-t border-slate-200">
                {tafqeetRial(invoice.totalAmount)}
              </div>
            </div>

            {/* Signatures & Barcode */}
            <div className="pt-4 border-t border-slate-300 text-[10px] text-slate-600">
              <div className="flex justify-between items-end mb-6">
                <div className="text-center w-1/3">
                  <div className="border-b border-dashed border-slate-400 h-6 mb-1"></div>
                  <span>توقيع المستلم / العميل</span>
                </div>
                <div className="text-center w-1/3">
                  <div className="border-b border-dashed border-slate-400 h-6 mb-1"></div>
                  <span>أمين الصندوق / الموزع</span>
                </div>
              </div>
              <div className="text-center text-[9px] text-slate-500 font-mono">
                * شكرًا لتعاملكم معنا | يرجى مراجعة الأصناف ومطابقتها قبل مغادرة الموزع *
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
