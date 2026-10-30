/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mono: {
          black: '#000000',
          dark: '#0a0a0a',
          surface: '#121212',
          elevated: '#1a1a1a',
          border: 'rgba(255, 255, 255, 0.12)',
          subtle: 'rgba(255, 255, 255, 0.06)',
          muted: '#8a8a8a',
          white: '#ffffff',
        }
      },
      fontFamily: {
        display: ['"Inter Tight"', '"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        grotesk: ['"Space Grotesk"', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        widest: '0.25em',
        ultra: '0.35em',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
