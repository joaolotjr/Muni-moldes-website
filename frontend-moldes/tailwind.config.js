
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'munipink': '#DC96A0', // Rosa Principal (CTA, Destaque)
        'munigreen': '#64968C', // Verde Água (Acento)
        'munidark': '#322d2d', // Marrom/Cinza Escuro (Títulos, Textos)
        'munilight': '#F5F0E6', // Bege/Off-White (Fundo Suave)
      },
      // Adicione fontes customizadas aqui, se desejar (ex: font-serif, font-sans)
      fontFamily: {
        'sans': ['Lato', 'Open Sans', 'sans-serif'], // Fonte para corpo do texto
        'heading': ['Montserrat', 'serif'], // Fonte para títulos (ajuste conforme sua preferência)
      }
    },
  },
  plugins: [],
}