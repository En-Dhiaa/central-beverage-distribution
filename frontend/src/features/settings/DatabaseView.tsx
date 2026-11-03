import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { DatabaseStatus } from '../../types';
import {
  Database,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  RotateCcw,
  Sparkles,
  Archive,
  FileCheck
} from 'lucide-react';

export const DatabaseView: React.FC = () => {
  const { t } = useTranslation();
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDatabaseStatus();
      setDbStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleCreateBackup = async () => {
    setStatusMsg(null);
    setIsLoading(true);
    try {
      const res = await api.createDatabaseBackup();
      setStatusMsg({ type: 'success', text: `تم إنشاء نسخة احتياطية بنجاح باسم: ${res.fileName} وحفظها في مجلد backups.` });
      await loadStatus();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'فشل إنشاء النسخة الاحتياطية' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVacuum = async () => {
    setStatusMsg(null);
    setIsLoading(true);
    try {
      const res = await api.vacuumDatabase();
      setStatusMsg({ type: 'success', text: res.message });
      await loadStatus();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'فشل ضغط قاعدة البيانات' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            إدارة قاعدة البيانات والنسخ الاحتياطي (Database Vault)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            مراقبة حجم قاعدة البيانات المحلية، إنشاء نسخ احتياطية فورية، وضغط وصيانة مساحة التخزين
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleVacuum}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-all shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>ضغط وصيانة (Vacuum)</span>
          </button>
          <button
            onClick={handleCreateBackup}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
          >
            <Archive className="h-4 w-4" />
            <span>أخذ نسخة احتياطية فورية</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`rounded-2xl border p-4 text-xs font-bold flex items-center gap-3 ${
            statusMsg.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
              : 'border-destructive/20 bg-destructive/10 text-destructive'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Database KPI Cards */}
      {dbStatus && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <span className="text-[11px] font-bold text-muted-foreground">نوع محرك البيانات</span>
            <div className="text-base font-black text-foreground mt-1 flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <span>{dbStatus.provider}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">مستقل ذاتياً بدون خادم خارجي</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <span className="text-[11px] font-bold text-muted-foreground">حجم الملف على القرص</span>
            <div className="text-xl font-black text-foreground font-mono mt-1">
              {dbStatus.fileSizeMegabytes} ميجابايت
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">أداء فائق وسرعة قراءة محلية</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <span className="text-[11px] font-bold text-muted-foreground">عدد الجداول والكيانات</span>
            <div className="text-xl font-black text-foreground font-mono mt-1">
              {dbStatus.tablesCount} جدول
            </div>
            <span className="text-[10px] text-muted-foreground">معمارية متكاملة (Clean Architecture)</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <span className="text-[11px] font-bold text-muted-foreground">إجمالي الحركات المسجلة</span>
            <div className="text-xl font-black text-foreground font-mono mt-1">
              {dbStatus.totalRecordsCount.toLocaleString()} سجل
            </div>
            <span className="text-[10px] text-muted-foreground">أصناف، عملاء، فواتير، قيود</span>
          </div>
        </div>
      )}

      {/* Database Path details */}
      {dbStatus && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm text-xs space-y-2">
          <div className="font-bold text-muted-foreground">المسار الفعلي لملف قاعدة البيانات:</div>
          <div className="font-mono bg-muted p-2.5 rounded-xl text-foreground font-bold break-all" dir="ltr">
            {dbStatus.databasePath}
          </div>
        </div>
      )}

      {/* Backups List */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-primary" />
            <span className="text-sm font-black text-foreground">
              سجل النسخ الاحتياطية المتوفرة في مجلد Backups ({dbStatus?.backups.length || 0})
            </span>
          </div>
          <button
            onClick={loadStatus}
            className="text-xs font-bold text-primary hover:underline"
          >
            تحديث القائمة
          </button>
        </div>

        <table className="w-full text-right text-xs">
          <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
            <tr>
              <th className="p-3.5">اسم ملف النسخة الاحتياطية</th>
              <th className="p-3.5">تاريخ ووقت الإنشاء</th>
              <th className="p-3.5">حجم النسخة</th>
              <th className="p-3.5">المسار الكامل</th>
              <th className="p-3.5 text-center">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(!dbStatus || dbStatus.backups.length === 0) ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  لا توجد نسخ احتياطية مسجلة بعد. انقر على [أخذ نسخة احتياطية فورية] لحفظ نسخة آمنة الآن.
                </td>
              </tr>
            ) : (
              dbStatus.backups.map((b, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5 font-mono font-black text-foreground">{b.fileName}</td>
                  <td className="p-3.5 font-mono text-[11px] text-muted-foreground">
                    {new Date(b.createdAt).toLocaleDateString('ar-YE', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-foreground">
                    {b.sizeMegabytes} ميجابايت
                  </td>
                  <td className="p-3.5 font-mono text-[10px] text-muted-foreground truncate max-w-xs" dir="ltr">
                    {b.fullPath}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                      نسخة سليمة وجاهزة
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

