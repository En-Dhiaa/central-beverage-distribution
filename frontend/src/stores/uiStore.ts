import { create } from 'zustand';
import i18n from '../i18n';

interface UIState {
  theme: 'light' | 'dark';
  language: 'ar' | 'en';
  fontFamily: string;
  activeNav: string;
  isSidebarOpen: boolean;
  toggleTheme: () => void;
  setLanguage: (lang: 'ar' | 'en') => void;
  setFontFamily: (font: string) => void;
  setActiveNav: (nav: string) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: (localStorage.getItem('beverage_theme') as 'light' | 'dark') || 'light',
  language: (localStorage.getItem('beverage_lang') as 'ar' | 'en') || 'ar',
  fontFamily: localStorage.getItem('beverage_font') || 'Cairo',
  activeNav: 'dashboard',
  isSidebarOpen: true,

  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('beverage_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme: next });
  },

  setLanguage: (lang) => {
    localStorage.setItem('beverage_lang', lang);
    i18n.changeLanguage(lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    set({ language: lang });
  },

  setFontFamily: (font) => {
    localStorage.setItem('beverage_font', font);
    document.body.style.fontFamily = `'${font}', system-ui, sans-serif`;
    set({ fontFamily: font });
  },

  setActiveNav: (nav) => set({ activeNav: nav }),
  toggleSidebar: () => set({ isSidebarOpen: !get().isSidebarOpen }),
}));

