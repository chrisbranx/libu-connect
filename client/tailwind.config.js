export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: 'var(--color-primary, #2563EB)', light: 'var(--color-primary, #2563EB)', dark: 'var(--color-primary-dark, #1D4ED8)' },
        accent: { DEFAULT: 'var(--color-accent, #F59E0B)', light: 'var(--color-accent-light, #FCD34D)' },
      },
      fontFamily: {
        display: ['"Clash Display"', 'sans-serif'],
        body: ['Satoshi', 'DM Sans', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '6px', md: '12px', lg: '20px', xl: '28px',
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
