import React from 'react';
import { Customer, CustomerLedgerEntry } from '../../types';
import { tafqeetRial } from '../../utils/tafqeet';
import { Printer, X, MessageCircle, Store } from 'lucide-react';

interface Props {
  customer: Customer;
  ledger: CustomerLedgerEntry[];
  onClose: () => void;
}

export const StatementPrintModal: React.FC<Props> = ({ customer, ledger, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    if (!customer.phone) {
      alert('لا يوجد رقم هاتف مسجل لهذا العميل.');
      return;
    }
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `السلام عليكم ورحمة الله وبركاته، الأخوة في ${customer.name}.\n\nنود إحاطتكم بأن رصيد حسابكم الحالي المستحق لدى مؤسسة توزيع المياه والعصائر المركزية هو (${customer.currentBalance.toLocaleString()} ريال يمني).\n\nشاكرين ومقدرين حسن تعاونكم الدائم معنا.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const totalDebit = ledger.reduce((acc, curr) => acc + curr.debit, 0);
  const totalCredit = ledger.reduce((acc, curr) => acc + curr.credit, 0);
  const netDue = customer.currentBalance;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden my-6">
        {/* Actions Bar (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold text-foreground">
              كشف حساب تفصيلي: {customer.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {customer.phone && (
              <button
                type="button"
                onClick={handleWhatsApp}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-sm"
              >
                <MessageCircle className="h-4 w-4" />
                <span>إرسال إشعار واتساب</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
            >
              <Printer className="h-4 w-4" />
              <span>طباعة كشف الحساب</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Statement Container */}
        <div className="p-6 max-h-[78vh] overflow-y-auto bg-slate-100 dark:bg-slate-900/40 flex justify-center">
          <div className="printable-area print-a4 w-full bg-white text-slate-900 shadow-lg rounded-xl p-8 border border-slate-200">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-300 pb-4 mb-4">
              <div>
                <h1 className="text-lg font-black text-slate-900">
                  مؤسسة توزيع المياه والعصائر المركزية
                </h1>
                <p className="text-xs text-slate-600 font-bold">
                  إدارة الحسابات والذمم المدينة | ت: 777000111
                </p>
                <p className="text-[11px] text-slate-500">
                  تاريخ استخراج الكشف: {new Date().toLocaleDateString('ar-YE')}
                </p>
              </div>
              <div className="text-left bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div className="font-bold text-slate-500">كشف حساب عميل</div>
                <div className="font-black text-base text-slate-900 mt-0.5">{customer.name}</div>
                <div className="text-slate-600 font-mono">كود: {customer.customerCode}</div>
              </div>
            </div>

            {/* Customer Details Bar */}
            <div className="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs mb-4">
              <div>
                <span className="text-slate-500 font-bold">اسم المسؤول: </span>
                <span className="font-bold text-slate-900">{customer.ownerName || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold">رقم الهاتف: </span>
                <span className="font-mono font-bold text-slate-900">{customer.phone || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold">المنطقة / الخط: </span>
                <span className="font-bold text-slate-900">{customer.area || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold">سقف الائتمان: </span>
                <span className="font-mono font-bold text-slate-900">
                  {customer.creditLimit.toLocaleString()} ريال
                </span>
              </div>
            </div>

            {/* Ledger Transactions Table */}
            <table className="w-full text-right text-xs border border-slate-300 mb-4">
              <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                <tr>
                  <th className="p-2.5 border-l border-slate-300">التاريخ</th>
                  <th className="p-2.5 border-l border-slate-300">نوع المستند</th>
                  <th className="p-2.5 border-l border-slate-300">رقم المرجع</th>
                  <th className="p-2.5 border-l border-slate-300">البيان والتفاصيل</th>
                  <th className="p-2.5 border-l border-slate-300 text-left text-rose-700">مدين (+)</th>
                  <th className="p-2.5 border-l border-slate-300 text-left text-emerald-700">دائن (-)</th>
                  <th className="p-2.5 text-left font-black">الرصيد المستحق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ledger.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      لا توجد حركات مسجلة على هذا الحساب.
                    </td>
                  </tr>
                ) : (
                  ledger.map((entry, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-2.5 border-l border-slate-200 font-mono text-[11px]">
                        {new Date(entry.date).toLocaleDateString('ar-YE')}
                      </td>
                      <td className="p-2.5 border-l border-slate-200 font-bold">
                        {entry.documentType === 'SalesInvoice' ? 'فاتورة مبيعات' : 'سند قبض نقدي'}
                      </td>
                      <td className="p-2.5 border-l border-slate-200 font-mono text-[11px]">
                        {entry.documentNumber}
                      </td>
                      <td className="p-2.5 border-l border-slate-200 text-slate-700">
                        {entry.description}
                      </td>
                      <td className="p-2.5 border-l border-slate-200 font-mono text-left font-bold text-rose-700">
                        {entry.debit > 0 ? entry.debit.toLocaleString() : '-'}
                      </td>
                      <td className="p-2.5 border-l border-slate-200 font-mono text-left font-bold text-emerald-700">
                        {entry.credit > 0 ? entry.credit.toLocaleString() : '-'}
                      </td>
                      <td className="p-2.5 font-mono text-left font-black text-slate-900">
                        {entry.balanceAfter.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Financial Summary */}
            <div className="grid grid-cols-3 gap-3 border border-slate-300 rounded-lg p-3 bg-slate-50 text-xs mb-4">
              <div>
                <span className="text-slate-500 font-bold block">إجمالي المسحوبات (مدين):</span>
                <span className="font-mono text-sm font-black text-rose-700">
                  {totalDebit.toLocaleString()} ريال
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">إجمالي المسدد (دائن):</span>
                <span className="font-mono text-sm font-black text-emerald-700">
                  {totalCredit.toLocaleString()} ريال
                </span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-2 text-left">
                <span className="text-blue-900 font-bold block text-[11px]">صافي الرصيد المستحق:</span>
                <span className="font-mono text-base font-black text-blue-700">
                  {netDue.toLocaleString()} ريال
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-700 font-bold bg-slate-100 p-2.5 rounded-lg border border-slate-200 mb-6">
              {tafqeetRial(netDue)}
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-end pt-6 border-t border-slate-300 text-xs text-slate-600">
              <div className="text-center w-1/3">
                <div className="border-b border-dashed border-slate-400 h-8 mb-1"></div>
                <span>ختم وتوقيع المحل / العميل</span>
              </div>
              <div className="text-center w-1/3">
                <div className="border-b border-dashed border-slate-400 h-8 mb-1"></div>
                <span>قسم الحسابات والمراجعة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

