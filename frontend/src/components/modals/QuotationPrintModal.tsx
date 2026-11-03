import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Quotation } from '../../types';
import { useBrandStore } from '../../stores/brandStore';
import { tafqeetRial } from '../../utils/tafqeet';
import {
  Printer,
  X,
  Building2,
  Calendar,
  FileCheck,
  CheckCircle,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';

interface Props {
  quotation: Quotation;
  onClose: () => void;
}

export const QuotationPrintModal: React.FC<Props> = ({ quotation, onClose }) => {
  const { t } = useTranslation();
  const { profile } = useBrandStore();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95">
        {/* Modal Toolbar (hidden on print) */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">
                معاينة وطباعة عرض السعر ({quotation.quotationNumber})
              </h3>
              <p className="text-[11px] text-muted-foreground">
                عرض سعر رسمي موجه للعميل بصلاحية حتى {new Date(quotation.validUntil).toLocaleDateString('ar-YE')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:bg-primary/90 shadow-sm"
            >
              <Printer className="h-4 w-4" />
              <span>طباعة المستند</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-border bg-background p-2 text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-8 bg-white text-slate-900 printable-area select-text">
          <div ref={printRef} className="space-y-6 text-xs">
            {/* Enterprise Header */}
            <div className="flex items-start justify-between border-b-2 pb-6" style={{ borderColor: profile.primaryColor }}>
              <div className="space-y-1">
                <h1 className="text-xl font-black tracking-tight" style={{ color: profile.primaryColor }}>
                  {profile.companyNameAr}
                </h1>
                <p className="text-xs text-slate-500 font-medium font-mono">{profile.companyNameEn}</p>
                <p className="text-[11px] text-slate-600">{profile.slogan}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span>هاتف: {profile.phone || profile.mobile}</span>
                  <span>•</span>
                  <span>السجل التجاري: {profile.commercialRegistration}</span>
                </div>
              </div>

              {/* Logo & Document Title Badge */}
              <div className="text-left flex flex-col items-end">
                {profile.logoBase64 ? (
                  <img src={profile.logoBase64} alt="Logo" className="h-16 w-auto object-contain mb-2" />
                ) : (
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center font-black text-white text-lg mb-2 shadow-sm" style={{ backgroundColor: profile.primaryColor }}>
                    💧
                  </div>
                )}
                <div className="inline-block px-3 py-1 rounded-lg text-white font-bold text-xs shadow-sm uppercase tracking-wider" style={{ backgroundColor: profile.primaryColor }}>
                  عرض سعر تجاري (Quotation)
                </div>
              </div>
            </div>

            {/* Quotation & Customer Details */}
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="space-y-1.5">
                <div className="text-slate-400 font-bold text-[10px] uppercase">بيانات العميل المستهدف:</div>
                <div className="text-sm font-black text-slate-800">{quotation.customerName}</div>
                {quotation.customerPhone && (
                  <div className="text-slate-600 text-[11px]">رقم الهاتف: {quotation.customerPhone}</div>
                )}
                {quotation.customerArea && (
                  <div className="text-slate-600 text-[11px]">المنطقة / العنوان: {quotation.customerArea}</div>
                )}
              </div>

              <div className="space-y-1.5 text-left font-mono">
                <div className="text-slate-400 font-bold text-[10px] uppercase">بيانات العرض:</div>
                <div className="text-xs font-bold text-slate-800">
                  رقم العرض: <span style={{ color: profile.primaryColor }}>{quotation.quotationNumber}</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  تاريخ الإصدار: {new Date(quotation.quotationDate).toLocaleDateString('ar-YE')}
                </div>
                <div className="text-[11px] text-emerald-600 font-bold">
                  ساري المفعول حتى: {new Date(quotation.validUntil).toLocaleDateString('ar-YE')}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="text-white text-xs font-bold" style={{ backgroundColor: profile.primaryColor }}>
                  <th className="p-2.5 rounded-r-lg">#</th>
                  <th className="p-2.5">الصنف / البيان</th>
                  <th className="p-2.5 text-center">الكراتين</th>
                  <th className="p-2.5 text-center">الحبات</th>
                  <th className="p-2.5">سعر الكرتون</th>
                  <th className="p-2.5">الخصم</th>
                  <th className="p-2.5 rounded-l-lg text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {quotation.items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-slate-800">{item.productName}</td>
                    <td className="p-2.5 text-center font-mono font-bold">{item.quantityCartons}</td>
                    <td className="p-2.5 text-center font-mono">{item.quantityPieces}</td>
                    <td className="p-2.5 font-mono">{item.unitPricePerCarton.toLocaleString()} ر.ي</td>
                    <td className="p-2.5 font-mono text-slate-400">{item.discount > 0 ? `${item.discount.toLocaleString()} ر.ي` : '0'}</td>
                    <td className="p-2.5 text-left font-mono font-bold text-slate-900">
                      {item.total.toLocaleString()} ر.ي
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals & Tafqeet */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-t border-slate-200 pt-4">
              <div className="flex-1 space-y-2">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs">
                  <span className="font-bold text-slate-500">المبلغ كتابةً: </span>
                  <span className="font-bold text-slate-800">{tafqeetRial(quotation.total)}</span>
                </div>

                {quotation.termsAndConditions && (
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    <span className="font-bold text-slate-700">شروط العرض: </span>
                    {quotation.termsAndConditions}
                  </div>
                )}
              </div>

              <div className="w-full sm:w-64 space-y-1.5 font-mono text-xs text-left">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">المجموع الفرعي:</span>
                  <span className="font-bold text-slate-800">{quotation.subtotal.toLocaleString()} ر.ي</span>
                </div>
                {quotation.discount > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                    <span>إجمالي الخصم:</span>
                    <span>- {quotation.discount.toLocaleString()} ر.ي</span>
                  </div>
                )}
                <div className="flex justify-between py-2 text-sm font-black rounded-lg px-2 text-white" style={{ backgroundColor: profile.primaryColor }}>
                  <span>صافي العرض:</span>
                  <span>{quotation.total.toLocaleString()} ر.ي</span>
                </div>
              </div>
            </div>

            {/* Official Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-center">
              <div>
                <div className="text-slate-500 font-bold mb-8">إعداد وتدقيق مسؤول المبيعات</div>
                <div className="border-b border-dashed border-slate-300 w-48 mx-auto" />
              </div>
              <div>
                <div className="text-slate-500 font-bold mb-8">اعتماد الإدارة والختم الرسمي</div>
                <div className="border-b border-dashed border-slate-300 w-48 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

