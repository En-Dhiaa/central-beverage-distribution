import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBrandStore } from '../../stores/brandStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { sounds } from '../../utils/soundEffects';
import {
  Sparkles,
  Building2,
  Phone,
  Database,
  Palette,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Image,
  Folder,
  ShieldCheck,
  Check
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingWizardModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { profile, updateProfile } = useBrandStore();
  const { addNotification } = useNotificationStore();

  const [step, setStep] = useState(1);

  // Form State
  const [companyNameAr, setCompanyNameAr] = useState(profile.companyNameAr);
  const [companyNameEn, setCompanyNameEn] = useState(profile.companyNameEn);
  const [slogan, setSlogan] = useState(profile.slogan);
  const [cr, setCr] = useState(profile.commercialRegistration);
  const [taxNumber, setTaxNumber] = useState(profile.taxNumber);

  const [phone, setPhone] = useState(profile.phone);
  const [mobile, setMobile] = useState(profile.mobile);
  const [whatsApp, setWhatsApp] = useState(profile.whatsApp);
  const [address, setAddress] = useState(profile.address);
  const [bankAccounts, setBankAccounts] = useState(profile.bankAccounts);

  const [dataVaultPath, setDataVaultPath] = useState('C:\\CentralBeverageDistribution\\Data');
  const [backupVaultPath, setBackupVaultPath] = useState('C:\\CentralBeverageDistribution\\Data\\backups');
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);

  const [activeTemplate, setActiveTemplate] = useState(profile.activeTemplate);
  const [primaryColor, setPrimaryColor] = useState(profile.primaryColor);
  const [logoBase64, setLogoBase64] = useState<string | null>(profile.logoBase64);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoBase64(reader.result as string);
        sounds.playPop();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinish = async () => {
    try {
      await updateProfile({
        companyNameAr,
        companyNameEn,
        slogan,
        commercialRegistration: cr,
        taxNumber,
        phone,
        mobile,
        whatsApp,
        address,
        bankAccounts,
        activeTemplate,
        primaryColor,
        logoBase64,
      });

      localStorage.setItem('beverage_data_vault', dataVaultPath);
      localStorage.setItem('beverage_backup_vault', backupVaultPath);
      localStorage.setItem('beverage_onboarding_completed', 'true');

      sounds.playSuccess();
      addNotification({
        title: 'تم إعداد النظام بنجاح!',
        message: `مرحباً بك في ${companyNameAr}. تم ضبط الهوية ومسار البيانات وقوالب الفواتير بنجاح.`,
        type: 'success',
      });

      onClose();
    } catch (e: any) {
      alert('حدث خطأ أثناء حفظ الإعدادات: ' + (e.message || ''));
    }
  };

  const colorPalettes = [
    { name: 'أزرق ملكي (Royal Blue)', hex: '#2563eb' },
    { name: 'زمردي منعش (Emerald)', hex: '#059669' },
    { name: 'سماوي بارد (Ice Cyan)', hex: '#0284c7' },
    { name: 'كحلي داكن (Dark Slate)', hex: '#0f172a' },
    { name: 'عنابي وقور (Ruby)', hex: '#be123c' },
    { name: 'بنفسجي تقني (Indigo)', hex: '#4f46e5' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="border-b border-border bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">
                  معالج التهيئة والإعداد الأولي للنظام
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  إعداد هوية المنشأة، الشعار، ومسار حفظ البيانات والنسخ الاحتياطية
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <span>الخطوة {step} من 4</span>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="mt-5 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs space-y-4">
          {/* Step 1: Enterprise Identity */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="rounded-2xl border border-border bg-muted/30 p-4 flex items-center gap-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-card overflow-hidden">
                  {logoBase64 ? (
                    <img src={logoBase64} alt="شعار المؤسسة" className="h-full w-full object-contain p-1" />
                  ) : (
                    <Image className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="font-bold text-foreground">شعار المؤسسة (Logo)</div>
                  <p className="text-[11px] text-muted-foreground">
                    سيظهر هذا الشعار على فواتير المبيعات، عروض الأسعار، وسندات القبض.
                  </p>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 px-3 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/20 transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    <span>رفع صورة الشعار</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {logoBase64 && (
                    <button
                      onClick={() => setLogoBase64(null)}
                      className="mr-2 text-[11px] text-destructive hover:underline"
                    >
                      إزالة
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">اسم المنشأة / المؤسسة (بالعربية)</label>
                <input
                  type="text"
                  required
                  value={companyNameAr}
                  onChange={(e) => setCompanyNameAr(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 font-bold text-sm"
                  placeholder="مثال: مؤسسة توزيع المياه والعصائر المركزية"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">الاسم بالإنجليزي (اختياري)</label>
                  <input
                    type="text"
                    value={companyNameEn}
                    onChange={(e) => setCompanyNameEn(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono"
                    placeholder="Central Beverage Distribution Co."
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">الهتاف التجاري / الوصف</label>
                  <input
                    type="text"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5"
                    placeholder="تبريد فائق، توزيع موثوق، وتوريد ميداني دقيق"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">رقم السجل التجاري (CR)</label>
                  <input
                    type="text"
                    value={cr}
                    onChange={(e) => setCr(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono"
                    placeholder="1010-998877"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">الرقم الضريبي (Tax ID)</label>
                  <input
                    type="text"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono"
                    placeholder="300123456700003"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact & Address */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">هاتف الإدارة</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono"
                    placeholder="01-234567"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">رقم الموبايل</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono"
                    placeholder="777000111"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">واتساب خدمة العملاء</label>
                  <input
                    type="tel"
                    value={whatsApp}
                    onChange={(e) => setWhatsApp(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono text-emerald-600 font-bold"
                    placeholder="967777000111"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">العنوان والموقع الجغرافي</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                  placeholder="صنعاء - شارع الستين الجنوبي - جوار جولة المصباحي"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">الحسابات البنكية المعتمدة للتحويل (تطبع بالفاتورة)</label>
                <textarea
                  rows={2}
                  value={bankAccounts}
                  onChange={(e) => setBankAccounts(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5"
                  placeholder="بنك الكريمي: 123456789 | بنك التضامن: 987654321"
                />
              </div>
            </div>
          )}

          {/* Step 3: Data Vault & Storage */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 flex items-start gap-3">
                <Database className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-blue-700 dark:text-blue-400">
                    مستودع البيانات المحلي المشفر (Local Data Vault)
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    يعمل النظام محلياً 100% بدون أي خوادم سحابية خارجية. يمكنك تحديد المسار الآمن لحفظ ملف قاعدة بيانات SQLite وملفات النسخ الاحتياطي التلقائي.
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">مسار حفظ قاعدة البيانات والملفات المحلية</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dataVaultPath}
                    onChange={(e) => setDataVaultPath(e.target.value)}
                    className="flex-1 rounded-xl border border-border bg-background p-2.5 font-mono text-xs"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  سيتم إنشاء قاعدة البيانات <code>beverage_system.db</code> والمجلدات الفرعية داخل هذا المسار.
                </span>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">مسار النسخ الاحتياطية المخصصة (Backup Vault)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={backupVaultPath}
                    onChange={(e) => setBackupVaultPath(e.target.value)}
                    className="flex-1 rounded-xl border border-border bg-background p-2.5 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-3.5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-foreground">النسخ الاحتياطي التلقائي اليومي</div>
                  <p className="text-[11px] text-muted-foreground">أخذ نسخة احتياطية مضغوطة ومؤرخة تلقائياً عند كل إقفال لليومية.</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoBackupEnabled}
                  onChange={(e) => setAutoBackupEnabled(e.target.checked)}
                  className="h-5 w-5 rounded border-border accent-primary cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Step 4: Invoice Templates & Palette */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block font-bold text-foreground mb-2">اختر قالب الفواتير وعروض الأسعار الرسمي</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'modern',
                      title: 'القالب العصري (Modern)',
                      desc: 'ترويسة حديثة بظلال ناعمة وتنسيق ملون أنيق للشركات المتقدمة',
                    },
                    {
                      id: 'classic',
                      title: 'القالب الكلاسيكي (Classic)',
                      desc: 'إطارات رسمية مزدوجة مع جداول محاسبية واضحة جداً',
                    },
                    {
                      id: 'minimal',
                      title: 'القالب المدمج (Minimal)',
                      desc: 'توفير فائق لمساحة الورق وحبر الطابعة مع التركيز على الأرقام',
                    },
                  ].map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        setActiveTemplate(tpl.id as any);
                        sounds.playPop();
                      }}
                      className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
                        activeTemplate === tpl.id
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-border bg-card hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-foreground">{tpl.title}</span>
                        {activeTemplate === tpl.id && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{tpl.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-2">لون العلامة التجارية للفواتير</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {colorPalettes.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => {
                        setPrimaryColor(c.hex);
                        sounds.playPop();
                      }}
                      className={`flex items-center gap-2.5 rounded-xl border p-2 text-right transition-all ${
                        primaryColor === c.hex ? 'border-primary bg-primary/10 font-bold' : 'border-border bg-card'
                      }`}
                    >
                      <span className="h-5 w-5 rounded-lg shrink-0 shadow-sm" style={{ backgroundColor: c.hex }} />
                      <span className="truncate text-[11px] text-foreground">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-border bg-muted/30 px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 font-bold text-muted-foreground hover:bg-muted transition-colors text-xs"
          >
            {step === 1 ? 'تخطي الآن' : '< السابق'}
          </button>

          <div className="flex items-center gap-2">
            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  setStep(step + 1);
                  sounds.playPop();
                }}
                className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 font-bold hover:bg-primary/90 transition-colors text-xs shadow-sm shadow-primary/20"
              >
                <span>التالي</span>
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white px-6 py-2.5 font-bold hover:bg-emerald-700 transition-colors text-xs shadow-md shadow-emerald-600/20"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>حفظ وبدء العمل بالنظام</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
