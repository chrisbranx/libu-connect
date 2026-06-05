import { create } from 'zustand';
import { api } from '../services/api';

const useThemeStore = create((set) => ({
  darkMode: localStorage.getItem('darkMode') === 'true',
  language: localStorage.getItem('language') || 'en',

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

  initTheme: () => {
    const dark = localStorage.getItem('darkMode') === 'true';
    const lang = localStorage.getItem('language') || 'en';
    if (dark) document.documentElement.classList.add('dark');
    set({ darkMode: dark, language: lang });
  },
}));

export default useThemeStore;
