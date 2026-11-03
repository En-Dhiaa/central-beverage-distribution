import { create } from 'zustand';
import { sounds } from '../utils/soundEffects';

export type NotificationType = 'success' | 'info' | 'warning' | 'error' | 'sale' | 'dispatch' | 'stock';

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
  linkNav?: string;
}

export interface ToastItem extends SystemNotification {
  duration?: number;
}

interface NotificationState {
  notifications: SystemNotification[];
  toasts: ToastItem[];
  soundEnabled: boolean;
  soundVolume: number;
  addNotification: (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'isRead'> & { playSound?: boolean; duration?: number }) => void;
  removeToast: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  toggleSound: () => void;
  setSoundVolume: (volume: number) => void;
}

const DEFAULT_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'n-1',
    title: 'جاهزية الثلاجة المركزية',
    message: 'تم فحص درجات الحرارة في الثلاجة المركزية وتأكيد جاهزية عهد التوزيع الصباحية.',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isRead: false,
    linkNav: 'warehouses',
  },
  {
    id: 'n-2',
    title: 'تنبيه حد ائتمان عميل',
    message: 'المحل (سوبرماركت البركة) قارب تجاوز سقف الائتمان المحدد (250,000 ر.ي).',
    type: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    isRead: false,
    linkNav: 'debt',
  },
  {
    id: 'n-3',
    title: 'اكتمال تسوية موزع',
    message: 'تم توريد النقدية واعتماد التسوية المحاسبية للموزع (خط حدة والسبعين).',
    type: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    isRead: true,
    linkNav: 'distributors',
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: (() => {
    try {
      const stored = localStorage.getItem('beverage_notifications');
      return stored ? JSON.parse(stored) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  })(),
  toasts: [],
  soundEnabled: localStorage.getItem('beverage_sound_enabled') !== 'false',
  soundVolume: parseInt(localStorage.getItem('beverage_sound_volume') || '70', 10),

  addNotification: (params) => {
    const id = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newNotif: SystemNotification = {
      id,
      title: params.title,
      message: params.message,
      type: params.type,
      timestamp: new Date().toISOString(),
      isRead: false,
      linkNav: params.linkNav,
    };

    // Play Sound
    if (params.playSound !== false && get().soundEnabled) {
      switch (params.type) {
        case 'sale':
          sounds.playCash();
          break;
        case 'success':
        case 'dispatch':
          sounds.playSuccess();
          break;
        case 'warning':
        case 'stock':
          sounds.playWarning();
          break;
        case 'error':
          sounds.playError();
          break;
        default:
          sounds.playPop();
          break;
      }
    }

    // Add to toasts for floating UI alert
    const duration = params.duration || 4500;
    const toastItem: ToastItem = { ...newNotif, duration };

    set((state) => {
      const updated = [newNotif, ...state.notifications].slice(0, 50);
      try {
        localStorage.setItem('beverage_notifications', JSON.stringify(updated));
      } catch {}
      return {
        notifications: updated,
        toasts: [...state.toasts, toastItem],
      };
    });

    // Auto dismiss toast
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  markAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      try {
        localStorage.setItem('beverage_notifications', JSON.stringify(updated));
      } catch {}
      return { notifications: updated };
    });
  },

  markAllAsRead: () => {
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, isRead: true }));
      try {
        localStorage.setItem('beverage_notifications', JSON.stringify(updated));
      } catch {}
      return { notifications: updated };
    });
  },

  clearAll: () => {
    try {
      localStorage.setItem('beverage_notifications', JSON.stringify([]));
    } catch {}
    set({ notifications: [], toasts: [] });
  },

  toggleSound: () => {
    const next = !get().soundEnabled;
    localStorage.setItem('beverage_sound_enabled', String(next));
    if (next) sounds.playPop();
    set({ soundEnabled: next });
  },

  setSoundVolume: (volume) => {
    localStorage.setItem('beverage_sound_volume', String(volume));
    set({ soundVolume: volume });
  },
}));
