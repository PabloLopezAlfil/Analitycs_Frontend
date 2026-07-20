/** @type {import('tailwindcss').Config} */
const tokens = require('./tailwind.tokens.cjs');

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: tokens.colors,
      fontFamily: tokens.fontFamily,
      fontSize: tokens.fontSize,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.boxShadow,
      backgroundImage: tokens.backgroundImage,
    },
  },
  plugins: [],
}
