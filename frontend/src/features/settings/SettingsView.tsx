import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { useBrandStore } from '../../stores/brandStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { OnboardingWizardModal } from '../../components/modals/OnboardingWizardModal';
import { sounds } from '../../utils/soundEffects';
import {
  Settings,
  Palette,
  Type,
  Globe,
  Volume2,
  VolumeX,
  ShieldCheck,
  Database,
  Save,
  Check,
  Upload,
  Image,
  Sparkles,
  Printer,
  CheckCircle2,
  FileText,
  Phone,
  Building2,
  Music
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme, language, setLanguage, fontFamily, setFontFamily, setActiveNav } = useUIStore();
  const { user, updateUserPreferences } = useAuthStore();
  const { profile, updateProfile, loadProfile } = useBrandStore();
  const { soundEnabled, toggleSound, soundVolume, setSoundVolume, addNotification } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<'branding' | 'templates' | 'audio' | 'appearance' | 'system'>('branding');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Brand Form State
  const [companyNameAr, setCompanyNameAr] = useState(profile.companyNameAr);
  const [companyNameEn, setCompanyNameEn] = useState(profile.companyNameEn);
  const [slogan, setSlogan] = useState(profile.slogan);
  const [cr, setCr] = useState(profile.commercialRegistration);
  const [taxNumber, setTaxNumber] = useState(profile.taxNumber);
  const [phone, setPhone] = useState(profile.phone);
  const [mobile, setMobile] = useState(profile.mobile);
  const [whatsApp, setWhatsApp] = useState(profile.whatsApp);
  const [email, setEmail] = useState(profile.email);
  const [website, setWebsite] = useState(profile.website);
  const [address, setAddress] = useState(profile.address);
  const [bankAccounts, setBankAccounts] = useState(profile.bankAccounts);
  const [invoiceTerms, setInvoiceTerms] = useState(profile.invoiceTerms);
  const [logoBase64, setLogoBase64] = useState<string | null>(profile.logoBase64);

  // Template State
  const [activeTemplate, setActiveTemplate] = useState(profile.activeTemplate);
  const [primaryColor, setPrimaryColor] = useState(profile.primaryColor);
  const [showLogo, setShowLogo] = useState(profile.showLogo);
  const [showTaxNumber, setShowTaxNumber] = useState(profile.showTaxNumber);
  const [showBankDetails, setShowBankDetails] = useState(profile.showBankDetails);
  const [defaultPrintSize, setDefaultPrintSize] = useState(profile.defaultPrintSize);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    setCompanyNameAr(profile.companyNameAr);
    setCompanyNameEn(profile.companyNameEn);
    setSlogan(profile.slogan);
    setCr(profile.commercialRegistration);
    setTaxNumber(profile.taxNumber);
    setPhone(profile.phone);
    setMobile(profile.mobile);
    setWhatsApp(profile.whatsApp);
    setEmail(profile.email);
    setWebsite(profile.website);
    setAddress(profile.address);
    setBankAccounts(profile.bankAccounts);
    setInvoiceTerms(profile.invoiceTerms);
    setLogoBase64(profile.logoBase64);
    setActiveTemplate(profile.activeTemplate);
    setPrimaryColor(profile.primaryColor);
    setShowLogo(profile.showLogo);
    setShowTaxNumber(profile.showTaxNumber);
    setShowBankDetails(profile.showBankDetails);
    setDefaultPrintSize(profile.defaultPrintSize);
  }, [profile]);

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

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
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
        email,
        website,
        address,
        bankAccounts,
        invoiceTerms,
        logoBase64,
        activeTemplate,
        primaryColor,
        showLogo,
        showTaxNumber,
        showBankDetails,
        defaultPrintSize,
      });

      await updateUserPreferences({
        language,
        theme,
        fontFamily,
        fontSize: 14,
        notificationSoundEnabled: soundEnabled,
        notificationVolume: soundVolume,
        dashboardLayoutJson: '{}',
      });

      sounds.playSuccess();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);

      addNotification({
        title: 'تم حفظ الإعدادات',
        message: 'تم تحديث هوية المنشأة، قوالب الفواتير، والأصوات بنجاح.',
        type: 'success',
      });
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ الإعدادات');
    }
  };

  const fonts = [
    { id: 'Cairo', name: 'خط كايرو (Cairo) — الافتراضي الرسمي' },
    { id: 'Tajawal', name: 'خط تجوال (Tajawal) — حديث وأنيق' },
    { id: 'IBM Plex Sans Arabic', name: 'خط IBM Plex العربي — رسمي وواضح' },
    { id: 'Inter', name: 'خط إنتر (Inter) — للأرقام والإنجليزية' },
  ];

  const colorPalettes = [
    { name: 'أزرق ملكي (Royal Blue)', hex: '#2563eb' },
    { name: 'زمردي منعش (Emerald)', hex: '#059669' },
    { name: 'سماوي بارد (Ice Cyan)', hex: '#0284c7' },
    { name: 'كحلي داكن (Dark Slate)', hex: '#0f172a' },
    { name: 'عنابي وقور (Ruby)', hex: '#be123c' },
    { name: 'بنفسجي تقني (Indigo)', hex: '#4f46e5' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            إعدادات النظام، الهوية، والتنبيهات
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            إدارة الهوية البصرية، الشعار، بيانات التواصل، قوالب وألوان الفواتير، ونغمات الإشعارات
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOnboardingOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            <span>معالج الإعداد التأسيسي</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-600 flex items-center gap-2 animate-in fade-in">
          <Check className="h-4 w-4" />
          <span>تم حفظ كافة الإعدادات وتطبيقها فورياً على كامل النظام والمستندات!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'branding', label: 'هوية المنشأة والشعار', icon: Building2 },
          { id: 'templates', label: 'قوالب الفواتير والألوان', icon: Printer },
          { id: 'audio', label: 'الأصوات والتنبيهات', icon: Volume2 },
          { id: 'appearance', label: 'المظهر والخطوط', icon: Palette },
          { id: 'system', label: 'قاعدة البيانات والمستخدمين', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-primary text-primary font-black'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Tab 1: Branding & Logo */}
        {activeTab === 'branding' && (
          <div className="space-y-5 animate-in fade-in">
            {/* Logo Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Image className="h-4 w-4 text-primary" />
                شعار المؤسسة (Company Logo)
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-muted/30 overflow-hidden shadow-inner">
                  {logoBase64 ? (
                    <img src={logoBase64} alt="شعار المؤسسة" className="h-full w-full object-contain p-1.5" />
                  ) : (
                    <div className="text-center text-muted-foreground text-[10px]">بدون شعار</div>
                  )}
                </div>
                <div className="space-y-2 text-xs flex-1">
                  <div className="font-bold text-foreground">رفع وتحديث شعار المؤسسة</div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    يدعم ملفات PNG أو SVG أو JPG بخلفية شفافة. سيظهر هذا الشعار تلقائياً على كافة الفواتير وعروض الأسعار وكشوفات الحساب.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2 font-bold hover:bg-primary/90 transition-colors shadow-sm">
                      <Upload className="h-3.5 w-3.5" />
                      <span>اختيار صورة جديدة</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    {logoBase64 && (
                      <button
                        type="button"
                        onClick={() => setLogoBase64(null)}
                        className="rounded-xl border border-destructive/20 bg-destructive/10 text-destructive px-3 py-2 font-bold hover:bg-destructive/20 transition-colors"
                      >
                        حذف الشعار
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Names & CR */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                البيانات الرسمية للمنشأة
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-foreground mb-1">اسم المنشأة بالعربية (الاسم التجاري)</label>
                  <input
                    type="text"
                    required
                    value={companyNameAr}
                    onChange={(e) => setCompanyNameAr(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">اسم المنشأة بالإنجليزية</label>
                  <input
                    type="text"
                    value={companyNameEn}
                    onChange={(e) => setCompanyNameEn(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">الهتاف التجاري أو الوصف التعريفي</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-foreground mb-1">رقم السجل التجاري (CR Number)</label>
                  <input
                    type="text"
                    value={cr}
                    onChange={(e) => setCr(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">الرقم الضريبي (Tax Identification Number)</label>
                  <input
                    type="text"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Contact & Address */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                أرقام التواصل والعناوين الرسمية
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-foreground mb-1">الهاتف الثابت</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">رقم الموبايل / الإدارة</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">رقم الواتساب الرسمي</label>
                  <input
                    type="tel"
                    value={whatsApp}
                    onChange={(e) => setWhatsApp(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono text-emerald-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">العنوان بالتفصيل</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">الحسابات البنكية المعتمدة للتحويل (تطبع بأسفل الفاتورة)</label>
                <textarea
                  rows={2}
                  value={bankAccounts}
                  onChange={(e) => setBankAccounts(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">شروط وأحكام الفاتورة (ملاحظات التذييل)</label>
                <input
                  type="text"
                  value={invoiceTerms}
                  onChange={(e) => setInvoiceTerms(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Invoice Templates & Colors */}
        {activeTab === 'templates' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Printer className="h-4 w-4 text-primary" />
                تخصيص قوالب وتصميم الفواتير وعروض الأسعار
              </h3>

              <div>
                <label className="block font-bold text-foreground mb-2 text-xs">القالب المعتمد للطباعة</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'modern', title: 'القالب العصري (Modern)', desc: 'ترويسة ملونة وجميلة مع مربعات بيانات ناعمة' },
                    { id: 'classic', title: 'القالب الكلاسيكي (Classic)', desc: 'إطارات رسمية مزدوجة مع التركيز المحاسبي الصارم' },
                    { id: 'minimal', title: 'القالب المدمج (Minimal)', desc: 'توفير فائق لمساحة الورق وحبر الطابعة وسرعة الإخراج' },
                  ].map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        setActiveTemplate(tpl.id as any);
                        sounds.playPop();
                      }}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        activeTemplate === tpl.id
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-border bg-card hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-foreground text-xs">{tpl.title}</span>
                        {activeTemplate === tpl.id && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{tpl.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-2 text-xs">لون العلامة التجارية للفواتير</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {colorPalettes.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => {
                        setPrimaryColor(c.hex);
                        sounds.playPop();
                      }}
                      className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-right transition-all ${
                        primaryColor === c.hex ? 'border-primary bg-primary/10 font-bold' : 'border-border bg-card'
                      }`}
                    >
                      <span className="h-5 w-5 rounded-lg shrink-0 shadow-sm" style={{ backgroundColor: c.hex }} />
                      <span className="truncate text-xs text-foreground">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-muted/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLogo}
                    onChange={(e) => setShowLogo(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span className="font-bold text-foreground">إظهار الشعار بالفاتورة</span>
                </label>
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-muted/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTaxNumber}
                    onChange={(e) => setShowTaxNumber(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span className="font-bold text-foreground">إظهار السجل والرقم الضريبي</span>
                </label>
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-muted/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBankDetails}
                    onChange={(e) => setShowBankDetails(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span className="font-bold text-foreground">إظهار الحسابات البنكية</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1 text-xs">المقاس الافتراضي عند فتح نافذة الطباعة</label>
                <select
                  value={defaultPrintSize}
                  onChange={(e) => setDefaultPrintSize(e.target.value as any)}
                  className="w-full sm:w-64 rounded-xl border border-border bg-background p-2.5 text-xs font-bold"
                >
                  <option value="80mm">طابعة إيصالات حرارية 80 مم (POS)</option>
                  <option value="a4">ورق قياسي A4</option>
                  <option value="a5">ورق نصف مدمج A5</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Audio & Notifications */}
        {activeTab === 'audio' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                محرك التنبيهات والأصوات التفاعلية (Web Audio Synthesizer)
              </h3>

              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                <div>
                  <div className="font-bold text-foreground text-xs">تفعيل نغمات وأصوات النظام</div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    تشغيل أصوات مخصصة للتحصيل النقدي، اعتماد الفواتير، ونغمات التحذير عند اقتراب تجاوز سقف الدين.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    soundEnabled
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-muted border border-border text-muted-foreground'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  <span>{soundEnabled ? 'مفعل' : 'صامت'}</span>
                </button>
              </div>

              {soundEnabled && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">مستوى الصوت:</span>
                    <span className="font-mono text-primary font-bold">{soundVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={soundVolume}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSoundVolume(v);
                      sounds.playPop();
                    }}
                    className="w-full accent-primary"
                  />
                </div>
              )}

              {/* Sound Previews */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="font-bold text-foreground text-xs mb-3">تجربة واستماع لأصوات النظام:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => sounds.playCash()}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-primary/20 bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-all gap-1.5"
                  >
                    <span>💰 صوت التحصيل والكاش</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Cash Register Ding</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => sounds.playSuccess()}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 font-bold text-xs hover:bg-emerald-500/20 transition-all gap-1.5"
                  >
                    <span>✅ صوت الاعتماد والنجاح</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Crystal Chime</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => sounds.playWarning()}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 font-bold text-xs hover:bg-amber-500/20 transition-all gap-1.5"
                  >
                    <span>⚠️ صوت التنبيه والحدود</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Subtle Pulse</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => sounds.playPop()}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-muted/40 text-foreground font-bold text-xs hover:bg-muted transition-all gap-1.5"
                  >
                    <span>🔘 صوت النقر والتنقل</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Soft Pop</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Appearance */}
        {activeTab === 'appearance' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                مظهر الواجهة والخطوط
              </h3>

              <div>
                <label className="block font-bold text-foreground mb-1 text-xs">نوع الخط العربي المعتمد</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fonts.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFontFamily(f.id)}
                      className={`p-3 rounded-xl border text-right transition-all ${
                        fontFamily === f.id
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-border bg-card text-muted-foreground'
                      }`}
                    >
                      <div className="text-xs">{f.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">تجربة: 1234567890 أبجد هوز</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1 text-xs">الوضع الليلي / النهاري</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (theme !== 'light') toggleTheme();
                    }}
                    className={`flex-1 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      theme === 'light'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    الوضع النهاري (Light)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (theme !== 'dark') toggleTheme();
                    }}
                    className={`flex-1 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      theme === 'dark'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    الوضع الليلي (Dark)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: System & Database */}
        {activeTab === 'system' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                إدارة قاعدة البيانات وحسابات المستخدمين
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                يمكنك التبديل إلى لوحة التحكم المتقدمة لإدارة ملفات النسخ الاحتياطي، وضغط قاعدة البيانات، أو إدارة حسابات المشرفين وصلاحياتهم.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveNav('database')}
                  className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 text-primary px-4 py-2.5 text-xs font-bold hover:bg-primary/20 transition-colors shadow-sm"
                >
                  <Database className="h-4 w-4" />
                  <span>فتح إدارة قاعدة البيانات والنسخ الاحتياطي</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNav('users')}
                  className="flex items-center gap-2 rounded-xl bg-muted border border-border text-foreground px-4 py-2.5 text-xs font-bold hover:bg-muted/80 transition-colors shadow-sm"
                >
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>فتح إدارة مستخدمي النظام والصلاحيات</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-3 text-xs font-bold hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>حفظ جميع التغييرات</span>
          </button>
        </div>
      </form>

      {/* Onboarding Wizard Modal */}
      {isOnboardingOpen && (
        <OnboardingWizardModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
        />
      )}
    </div>
  );
};
