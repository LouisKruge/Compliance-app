/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff8eb",
          100: "#ffedc6",
          200: "#ffd988",
          300: "#ffbf4a",
          400: "#ffa620",
          500: "#f98307",
          600: "#dd5e02",
          700: "#b73f06",
          800: "#94300c",
          900: "#7a290d",
          950: "#461302",
        },
        ink: {
          50: "#f4f6f7",
          100: "#e3e7ea",
          200: "#cad2d7",
          300: "#a5b2bb",
          400: "#788a97",
          500: "#5d6f7c",
          600: "#4f5d6a",
          700: "#444e59",
          800: "#3d444c",
          900: "#363c42",
          950: "#21262b",
        },
      },
    },
  },
  plugins: [],
};
