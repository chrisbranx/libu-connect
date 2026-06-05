import { create } from 'zustand';
import { api } from '../services/api';

const useThemeStore = create((set) => ({
  darkMode: localStorage.getItem('darkMode') === 'true',
  language: localStorage.getItem('language') || 'en',
  themeColor: localStorage.getItem('themeColor') || 'indigo',

  toggleDarkMode: () => set((state) => {
    const newMode = !state.darkMode;
    localStorage.setItem('darkMode', newMode);
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    return { darkMode: newMode };
  }),

  setLanguage: (lang) => {
    localStorage.setItem('language', lang);
    set({ language: lang });
  },

  setThemeColor: (color) => {
    localStorage.setItem('themeColor', color);
    document.documentElement.style.setProperty('--color-primary', color);
    set({ themeColor: color });
  },

  initTheme: () => {
    const dark = localStorage.getItem('darkMode') === 'true';
    const lang = localStorage.getItem('language') || 'en';
    const color = localStorage.getItem('themeColor') || 'indigo';
    if (dark) document.documentElement.classList.add('dark');
    document.documentElement.style.setProperty('--color-primary', color);
    set({ darkMode: dark, language: lang, themeColor: color });
  },
}));

export default useThemeStore;
