/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#04070b',
        editor: '#0d1117',
        border: '#30363d',
        primary: '#238636',
        secondary: '#58a6ff',
        accent: '#7d4cdb',
        glass: 'rgba(22, 27, 34, 0.8)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
