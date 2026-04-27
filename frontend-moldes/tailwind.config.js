
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'munipink': '#bd8d8a', // Rosa/Salmão do logo
        'munigreen': '#7a9f97', // Verde Sálvia do logo
        'munidark': '#4a5568', // Marrom/Cinza escuro para textos
        'munibg': '#faf8f5', // Fundo bege clarinho
      },
      fontFamily: {
        'sans': ['Montserrat', 'sans-serif'],
        'heading': ['"Playfair Display"', 'serif'],
      }
    },
  },
  plugins: [],
}