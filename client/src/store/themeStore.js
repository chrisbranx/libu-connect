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
    const themeColors = {
      indigo: { primary: '#1E1B4B', accent: '#F59E0B' },
      emerald: { primary: '#059669', accent: '#34D399' },
      violet: { primary: '#7C3AED', accent: '#A78BFA' },
      rose: { primary: '#E11D48', accent: '#FB7185' },
      amber: { primary: '#D97706', accent: '#FBBF24' },
    };
    const colors = themeColors[color] || themeColors.indigo;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-dark', colors.primary);
    root.style.setProperty('--color-accent', colors.accent);
    set({ themeColor: color });
  },

  initTheme: () => {
    const dark = localStorage.getItem('darkMode') === 'true';
    const lang = localStorage.getItem('language') || 'en';
    const color = localStorage.getItem('themeColor') || 'indigo';
    if (dark) document.documentElement.classList.add('dark');
    const themeColors = {
      indigo: { primary: '#1E1B4B', accent: '#F59E0B' },
      emerald: { primary: '#059669', accent: '#34D399' },
      violet: { primary: '#7C3AED', accent: '#A78BFA' },
      rose: { primary: '#E11D48', accent: '#FB7185' },
      amber: { primary: '#D97706', accent: '#FBBF24' },
    };
    const colors = themeColors[color] || themeColors.indigo;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-dark', colors.primary);
    root.style.setProperty('--color-accent', colors.accent);
    set({ darkMode: dark, language: lang, themeColor: color });
  },
}));

export default useThemeStore;
