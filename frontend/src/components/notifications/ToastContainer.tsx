import React from 'react';
import { useNotificationStore, NotificationType } from '../../stores/notificationStore';
import { useUIStore } from '../../stores/uiStore';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  DollarSign,
  Truck,
  Snowflake,
  X,
  ExternalLink
} from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotificationStore();
  const { setActiveNav } = useUIStore();

  if (toasts.length === 0) return null;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
      case 'warning':
      case 'stock':
        return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive shrink-0" />;
      case 'sale':
        return <DollarSign className="h-5 w-5 text-primary shrink-0" />;
      case 'dispatch':
        return <Truck className="h-5 w-5 text-cyan-500 shrink-0" />;
      default:
        return <Info className="h-5 w-5 text-blue-500 shrink-0" />;
    }
  };

  const getBorderColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 bg-card/95';
      case 'warning':
      case 'stock':
        return 'border-amber-500/30 bg-card/95';
      case 'error':
        return 'border-destructive/30 bg-card/95';
      case 'sale':
        return 'border-primary/30 bg-card/95';
      case 'dispatch':
        return 'border-cyan-500/30 bg-card/95';
      default:
        return 'border-blue-500/30 bg-card/95';
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none select-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 ${getBorderColor(
            toast.type
          )}`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{getIcon(toast.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-black text-foreground truncate">{toast.title}</h4>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-lg"
                  title="إغلاق"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                {toast.message}
              </p>
              {toast.linkNav && (
                <button
                  onClick={() => {
                    setActiveNav(toast.linkNav!);
                    removeToast(toast.id);
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                >
                  <span>عرض التفاصيل</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          </div>
          {/* Progress duration indicator */}
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/30"
            style={{
              animation: `toast-progress ${toast.duration || 4500}ms linear forwards`,
            }}
          />
        </div>
      ))}
    </div>
  );
};

