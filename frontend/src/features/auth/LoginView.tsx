import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { Snowflake, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { t } = useTranslation();
  const { login, isLoading } = useAuthStore();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول. تحقق من اسم المستخدم وكلمة المرور.');
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 mb-4">
            <Snowflake className="h-8 w-8 animate-pulse" />
          </div>
          <h1 className="text-xl font-extrabold text-foreground tracking-tight">
            نظام إدارة ثلاجة وتوزيع المياه والعصائر
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5 font-medium">
            منصة مركزية لإدارة المشتريات، المخازن، عهد الموزعين، المبيعات والحسابات
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              {t('username')}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              {t('password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Quick Demo Credentials */}
          <div className="rounded-lg bg-muted/60 p-2.5 text-[11px] text-muted-foreground border border-border flex items-center justify-between">
            <div>
              <span>بيانات المسؤول الافتراضية: </span>
              <strong className="text-foreground">admin</strong> / <strong className="text-foreground">Admin@123456</strong>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('Admin@123456');
              }}
              className="text-xs font-bold text-primary hover:underline"
            >
              تعبئة سريعة
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                جاري التحقق...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {t('login')}
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

