import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: 'rgb(var(--color-brand-bg) / <alpha-value>)',
          surface: 'rgb(var(--color-brand-surface) / <alpha-value>)',
          elevated: 'rgb(var(--color-brand-elevated) / <alpha-value>)',
          border: 'rgb(var(--color-brand-border) / <alpha-value>)',
          accent: 'rgb(var(--color-brand-accent) / <alpha-value>)',
          accentMuted: 'rgb(var(--color-brand-accent) / 0.14)',
          protein: 'rgb(var(--color-brand-protein) / <alpha-value>)',
          carbs: 'rgb(var(--color-brand-carbs) / <alpha-value>)',
          fat: 'rgb(var(--color-brand-fat) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.4)',
        glow: '0 0 40px rgba(52, 211, 153, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
