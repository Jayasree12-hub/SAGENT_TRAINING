/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        obsidian: {
          50:  '#f2f2f0',
          100: '#e5e5e0',
          200: '#ccccc1',
          300: '#b2b2a3',
          400: '#999984',
          500: '#7f7f65',
          600: '#666651',
          700: '#4c4c3d',
          800: '#333328',
          900: '#1a1a14',
          950: '#0d0d0a',
        },
        gold: {
          50:  '#fdf9ed',
          100: '#faf0d0',
          200: '#f5e0a1',
          300: '#efc96e',
          400: '#e8b140',
          500: '#d4952a',
          600: '#b87420',
          700: '#8f531b',
          800: '#6b3d18',
          900: '#4d2c14',
        },
        cream: '#faf8f3',
        parchment: '#f4f1e8',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      }
    },
  },
  plugins: [],
}
