import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore, NotificationType } from '../stores/notificationStore';
import { useBrandStore } from '../stores/brandStore';
import {
  Sun,
  Moon,
  Globe,
  Bell,
  Snowflake,
  Volume2,
  VolumeX,
  CheckCheck,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  DollarSign,
  Truck,
  ExternalLink,
  Music
} from 'lucide-react';
import dayjs from 'dayjs';

export const Topbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, language, setLanguage, setActiveNav } = useUIStore();
  const { user } = useAuthStore();
  const { profile, loadProfile } = useBrandStore();
  const {
    notifications,
    soundEnabled,
    toggleSound,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotificationStore();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير والبركة';
    if (hour < 18) return 'مساء الخير والنشاط';
    return 'أهلًا بك';
  };

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
      case 'warning':
      case 'stock':
        return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive shrink-0" />;
      case 'sale':
        return <DollarSign className="h-4 w-4 text-primary shrink-0" />;
      case 'dispatch':
        return <Truck className="h-4 w-4 text-cyan-500 shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
    }
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
            <span className="flex items-center gap-1 text-blue-500 font-medium">
              <Snowflake className="h-3 w-3" />
              {profile.companyNameAr || 'الثلاجة المركزية للتوزيع'}
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

        {/* Notification Bell & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
              isNotifOpen
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            title="مركز الإشعارات والتنبيهات الصوتية"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white shadow-sm animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Floating Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute left-0 mt-2.5 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <span className="text-xs font-black text-foreground">الإشعارات والتنبيهات</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {unreadCount} جديد
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={toggleSound}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title={soundEnabled ? 'كتم الأصوات' : 'تفعيل نغمات التنبيه'}
                  >
                    {soundEnabled ? (
                      <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                    title="تعليم الكل كمقروء"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={clearAll}
                    disabled={notifications.length === 0}
                    className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                    title="مسح كافة الإشعارات"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    لا توجد إشعارات جديدة حالياً
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.linkNav) {
                          setActiveNav(n.linkNav);
                          setIsNotifOpen(false);
                        }
                      }}
                      className={`flex items-start gap-3 p-3.5 text-xs transition-colors cursor-pointer hover:bg-muted/50 ${
                        !n.isRead ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="mt-0.5">{getNotifIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`font-bold truncate ${
                              !n.isRead ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {n.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                            {dayjs(n.timestamp).format('HH:mm')}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        {n.linkNav && (
                          <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-primary">
                            <span>فتح الشاشة</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border bg-muted/20 px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Music className="h-3 w-3" />
                  <span>الصوت: {soundEnabled ? 'مفعل (Web Audio)' : 'صامت'}</span>
                </span>
                <button
                  onClick={() => {
                    setActiveNav('settings');
                    setIsNotifOpen(false);
                  }}
                  className="font-bold text-primary hover:underline"
                >
                  إعدادات التنبيهات والهوية
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
