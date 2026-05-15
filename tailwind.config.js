/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hotwheels: {
          red: "#E60000",
          orange: "#FF4D00",
          yellow: "#FFD700",
          black: "#0A0A0A",
          gray: "#1A1A1A",
          white: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
}