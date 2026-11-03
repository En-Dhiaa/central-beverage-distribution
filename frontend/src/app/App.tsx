import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { LoginView } from '../features/auth/LoginView';
import { MainLayout } from '../layouts/MainLayout';

export const App: React.FC = () => {
  const { isAuthenticated, loadUser, isLoading } = useAuthStore();
  const { theme, language } = useUIStore();

  useEffect(() => {
    loadUser();
    // Initialize theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Initialize direction & language
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <span className="text-xs font-bold text-muted-foreground">جاري تحميل المنظومة...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return <MainLayout />;
};
