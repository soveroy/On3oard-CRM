import type { Config } from 'tailwindcss'
export default {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { primary: '#ff914d', accent: '#f93f58', navy: '#0D1B2A' },
        surface: { DEFAULT: '#0D1B2A', raised: '#11233a', border: 'rgba(255,255,255,0.08)' },
      },
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
