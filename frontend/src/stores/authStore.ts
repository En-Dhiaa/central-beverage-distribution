import { create } from 'zustand';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateUserPreferences: (pref: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('beverage_auth_token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('beverage_auth_token'),
  isLoading: false,

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const res = await api.login(username, password);
      localStorage.setItem('beverage_auth_token', res.token);
      set({
        token: res.token,
        isAuthenticated: true,
        user: {
          id: res.userId,
          username: res.username,
          fullName: res.fullName,
          role: res.role,
          language: res.language,
          theme: res.theme,
          fontFamily: res.fontFamily,
          fontSize: 14,
          notificationSoundEnabled: true,
          notificationVolume: 80,
          dashboardLayoutJson: '{}',
        },
      });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('beverage_auth_token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = get().token;
    if (!token) return;
    set({ isLoading: true });
    try {
      const profile = await api.getMe();
      set({ user: profile, isAuthenticated: true });
    } catch {
      get().logout();
    } finally {
      set({ isLoading: false });
    }
  },

  updateUserPreferences: async (pref) => {
    await api.updatePreferences(pref);
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...pref } });
    }
  },
}));
