/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          50: '#F9F6EE',
          100: '#F3EDDC',
          200: '#EBE0C4',
          300: '#E3D3AC',
          400: '#DBC693',
          500: '#D4AF37',
          600: '#B8952E',
          700: '#8F7323',
          800: '#665218',
          900: '#3D310E',
        },
        cincel: {
          gold: '#D4AF37',
          black: '#1A1A1A',
          darkgray: '#2D2D2D',
          gray: '#6B6B6B',
          lightgray: '#F5F5F5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
    },
  },
  plugins: [],
}
