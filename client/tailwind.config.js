export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1E1B4B', light: '#312E81', dark: '#6C63FF' },
        'primary-dark': '#6C63FF',
        accent: { DEFAULT: '#F59E0B', light: '#FCD34D' },
        success: '#059669',
        danger: '#DC2626',
        warning: '#D97706',
        surface: { DEFAULT: '#F8F7FF', dark: '#1A1A2E' },
        'surface-dark': '#1A1A2E',
        border: { DEFAULT: '#E5E4F0', dark: '#2D2B45' },
        'border-dark': '#2D2B45',
        text: { DEFAULT: '#1F1D35', muted: '#6B6880', dark: '#E8E6F0' },
        'text-dark': '#E8E6F0',
        'bg-dark': '#0F0F1A',
      },
      fontFamily: {
        display: ['"Clash Display"', 'sans-serif'],
        body: ['Satoshi', 'DM Sans', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '6px', md: '12px', lg: '20px', xl: '28px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(30,27,75,0.08)',
        md: '0 4px 12px rgba(30,27,75,0.12)',
        lg: '0 8px 32px rgba(30,27,75,0.16)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        skeleton: { '0%, 100%': { opacity: '0.4' }, '50%': { opacity: '1' } },
      },
    },
  },
  plugins: [],
};
