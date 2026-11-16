/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        d247: {
          dark: '#082136',
          primary: '#0d3859',
          accent: '#0284c7',
          sky: '#72bbef', // Exact Diamond Back Blue
          pink: '#faa9ba', // Exact Diamond Lay Pink
          gold: '#facc15'
        }
      }
    },
  },
  plugins: [],
}

