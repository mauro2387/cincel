/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#c08826', // Dorado corporativo
          50: '#FEF7E8',
          100: '#FDEFD1',
          200: '#FBDFA3',
          300: '#F9CF75',
          400: '#F7BF47',
          500: '#c08826',
          600: '#9A6D1F',
          700: '#735217',
          800: '#4D3710',
          900: '#261B08',
        },
        cincel: {
          primary: '#c08826',    // Dorado corporativo
          dark: '#373535',       // Gris oscuro
          blue: '#183950',       // Azul oscuro
          brown: '#342f1f',      // Marrón oscuro
          navy: '#132531',       // Azul marino
          gold: '#5a4e24',       // Dorado/marrón
          black: '#000000',      // Negro
          white: '#ffffff',      // Blanco
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
