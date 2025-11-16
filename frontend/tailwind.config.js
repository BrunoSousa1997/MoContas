/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        main: "#a3c68c",
        second: "#879676",
        third: "#6e6662",
        fourth: "#e0d3b8",
        fifth: "#a69a81",
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
