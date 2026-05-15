import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#050506',
          surface: '#111114',
          elevated: '#18181C',
          border: '#27272A',
          accent: '#34D399',
          accentMuted: 'rgba(52, 211, 153, 0.14)',
          protein: '#38BDF8',
          carbs: '#FBBF24',
          fat: '#C084FC',
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
