/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/preline/dist/*.js",
    "./**/*.vue",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      minecraft: ["Minecraft", "sans-serif"],
      sans: [
        "Lexend",
        "sans-serif",
        "ui-sans-serif",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "Arial",
        "Noto Sans",
        "sans-serif",
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol",
        "Noto Color Emoji",
      ],
    },
    extend: {
      // cuestom rounded
      borderRadius: {
        "xl": "0.4rem",
        "2xl": "0.6rem",
        "3xl": "0.8rem",
        "4xl": "1rem",
        "5xl": "1.2rem",
        "6xl": "1.4rem",
        "7xl": "1.6rem",
        "8xl": "1.8rem",
        "9xl": "2rem",
        "10xl": "2.2rem",
        "11xl": "2.4rem",
        "12xl": "2.6rem",
        "13xl": "2.8rem",
        "14xl": "3rem",
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      animation: {
        'spin-fast': 'spin 0.6s linear infinite',
      },
      colors: {
        primary: "#FFA100",
        purple: "#B798FF",
        steel: {
          50: "#868EA0",
          100: "#4E5462",
          200: "#333740",
          300: "#0F1217",
          400: "#21242A",
          500: "#13171E",
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
    require('@tailwindcss/container-queries'),
    require("tailwind-capitalize-first-letter"),
    require("preline/plugin"),
  ],
};
