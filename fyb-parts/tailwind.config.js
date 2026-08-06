// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fyb-teal': '#5A8073', // Este es el color verde apagado de tu antigua página
      },
    },
  },
  plugins: [],
}