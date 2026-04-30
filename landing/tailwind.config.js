/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFC530',
          'yellow-light': '#FFD970',
          'yellow-dark': '#E6AD00',
          coral: '#FF6B35',
          purple: '#7C3AED',
          'purple-light': '#A855F7',
          cyan: '#06B6D4',
          'cyan-light': '#38D9F5',
        },
        dark: {
          950: '#06030F',
          900: '#0F0A1E',
          800: '#1A1230',
          700: '#251A42',
          600: '#312160',
        },
      },
      fontFamily: {
        syne: ['"Barlow Condensed"', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
        'float-slower': 'float 10s ease-in-out 2s infinite',
        'spin-slow': 'spin 25s linear infinite',
        'marquee': 'marquee 28s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
