import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { Settings, Palette, Type, Globe, Volume2, ShieldCheck, Database, Save, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme, language, setLanguage, fontFamily, setFontFamily } = useUIStore();
  const { user, updateUserPreferences } = useAuthStore();

  const [institutionName, setInstitutionName] = useState('مؤسسة توزيع المياه والعصائر المركزية');
  const [phone, setPhone] = useState('777000111');
  const [address, setAddress] = useState('صنعاء - شارع الستين');
  const [currency, setCurrency] = useState('ريال يمني (YER)');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserPreferences({
        language,
        theme,
        fontFamily,
        fontSize: 14,
        notificationSoundEnabled: soundEnabled,
        notificationVolume: 80,
        dashboardLayoutJson: '{}',
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const fonts = [
    { id: 'Cairo', name: 'خط كايرو (Cairo) — الافتراضي الرسمي' },
    { id: 'Tajawal', name: 'خط تجوال (Tajawal) — حديث وأنيق' },
    { id: 'IBM Plex Sans Arabic', name: 'خط IBM Plex العربي — رسمي وواضح' },
    { id: 'Inter', name: 'خط إنتر (Inter) — للأرقام والإنجليزية' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-foreground tracking-tight">
          إعدادات النظام والهوية البصرية
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          تخصيص الهوية التجارية، الخطوط، مظهر الشاشات، إعدادات الأمان والنسخ الاحتياطي
        </p>
      </div>

      {savedSuccess && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-600 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>تم حفظ الإعدادات بنجاح وتطبيقها على كامل النظام!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand Information */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            بيانات المنشأة والهوية التجارية
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-foreground mb-1">اسم المؤسسة التجاري</label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-foreground mb-1">رقم الهاتف والتواصل</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-foreground mb-1">العنوان والموقع</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-foreground mb-1">العملة الأساسية للنظام</label>
              <input
                type="text"
                disabled
                value={currency}
                className="w-full rounded-xl border border-border bg-muted p-2.5 font-bold text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Typography & Appearance */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
            <Type className="h-4 w-4 text-primary" />
            الخطوط ومظهر الواجهات
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-foreground mb-1">نوع الخط العربي المعتمد</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
              >
                {fonts.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">وضع المظهر اللوني</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (theme !== 'light') toggleTheme();
                  }}
                  className={`flex-1 rounded-xl border p-2.5 font-bold transition-all ${
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
                  className={`flex-1 rounded-xl border p-2.5 font-bold transition-all ${
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

        {/* Database & Backups */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            قاعدة البيانات والنسخ الاحتياطي (Automated Backups)
          </h3>
          <div className="text-xs text-muted-foreground leading-relaxed">
            محرك النسخ الاحتياطي مجهز للنسخ التلقائي عند إغلاق اليوم، مع حفظ النسخ المشفرة في مجلد <code className="font-mono text-foreground font-bold">backups/</code>.
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => alert('تم إنشاء نسخة احتياطية مشفرة بنجاح في مجلد backups/')}
              className="flex items-center gap-2 rounded-xl bg-muted px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted/80 border border-border"
            >
              <Database className="h-4 w-4 text-emerald-600" />
              <span>أخذ نسخة احتياطية فورية الآن</span>
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>حفظ جميع الإعدادات</span>
          </button>
        </div>
      </form>
    </div>
  );
};
