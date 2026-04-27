/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#0a0a0f",
          surface: "#13131a",
          raised: "#1c1c28",
        },
        warm: {
          hot: "#ff4d1a",
          warm: "#ff8c42",
          cooling: "#4db8ff",
          cold: "#1e4d6b",
          frozen: "#0d1f2d",
        },
        accent: {
          DEFAULT: "#c084fc",
          glow: "rgba(192, 132, 252, 0.15)",
        },
      },
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        sans: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}
