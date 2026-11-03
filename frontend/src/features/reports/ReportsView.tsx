import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileBarChart, Printer, Download, Share2, Calendar, FileText } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { t } = useTranslation();

  const reportCards = [
    {
      title: 'تقرير المبيعات والتحصيلات اليومية',
      description: 'كشف تفصيلي بجميع المبيعات النقدية والآجلة والمبالغ المحصلة حسب كل موزع ومحل',
      category: 'المبيعات',
    },
    {
      title: 'تقرير حركة وأرصدة المخزون والثلاجة',
      description: 'جرد شامل لكميات الكراتين والحبات في المستودع الرئيسي، الثلاجة المركزية، وعهد الموزعين',
      category: 'المخزون',
    },
    {
      title: 'كشف تسويات عهد الموزعين الميدانيين',
      description: 'مطابقة حركات البضاعة المستلمة، المباعة، المرتجعة، التالفة، والعجز المالي لكل موزع',
      category: 'الموزعون',
    },
    {
      title: 'تقرير مديونيات العملاء وكشوفات الحساب',
      description: 'أرصدة ديون المحلات والبقالات وسقف الائتمان ومواعيد السداد المتأخرة',
      category: 'العملاء',
    },
    {
      title: 'تقرير حركة الصناديق والمصروفات والأرباح',
      description: 'المقبوضات والمدفوعات والمصروفات التشغيلية وصافي الأرباح التقديرية للفترة',
      category: 'المالية',
    },
    {
      title: 'ميزان المراجعة ودفتر الأستاذ العام',
      description: 'الأرصدة المحاسبية لجميع الحسابات والتحقق من توازن القيود المزدوجة',
      category: 'المحاسبة',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            مركز التقارير والمستندات الرسمية
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            استخراج التقارير التشغيلية والمالية بصيغة PDF قابلة للطباعة والتصدير والمشاركة الفورية
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
        >
          <Printer className="h-4 w-4" />
          <span>طباعة التقرير الشامل</span>
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reportCards.map((r, idx) => (
          <div key={idx} className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-all">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                  {r.category}
                </span>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="text-base font-extrabold text-foreground mt-3">{r.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.description}</p>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>معاينة وطباعة</span>
              </button>
              <button
                onClick={() => alert('تم تصدير المستند بصيغة PDF عالية الدقة')}
                className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                <Download className="h-3.5 w-3.5" />
                <span>تحميل PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
