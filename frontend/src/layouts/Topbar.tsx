import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { Sun, Moon, Globe, Bell, Snowflake } from 'lucide-react';
import dayjs from 'dayjs';

export const Topbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, language, setLanguage } = useUIStore();
  const { user } = useAuthStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير والبركة';
    if (hour < 18) return 'مساء الخير والنشاط';
    return 'أهلًا بك';
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md sticky top-0 z-20">
      {/* Greeting & Date */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">
              {getGreeting()}، {user?.fullName?.split(' ')[0] || user?.username} 👋
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              النظام متصل
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            <span>{dayjs().format('YYYY-MM-DD')}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-blue-500">
              <Snowflake className="h-3 w-3" />
              الثلاجة المركزية جاهزة للتوزيع
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="تغيير اللغة"
        >
          <Globe className="h-4 w-4" />
          <span>{language === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={theme === 'light' ? 'الوضع الليلي' : 'الوضع النهاري'}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        {/* Notification Bell */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="الإشعارات والتنبيهات"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
            3
          </span>
        </button>
      </div>
    </header>
  );
};
