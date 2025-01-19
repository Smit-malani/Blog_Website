/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'max-400': { max: '400px' },
        'max-500': { max: '500px' },
        'max-600': { max: '600px' },
        'max-700': { max: '700px' },
        'max-800': { max: '800px' },
        'max-1000': { max: '1000px' },
        'min-600': {min: '600px'},
      }
    },
  },
  plugins: [],
}