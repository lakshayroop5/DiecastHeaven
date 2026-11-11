/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hotwheels: {
          red: "#E60000",
          yellow: "#FFD700",
          black: "#0A0A0A",
          gray: "#1A1A1A",
          white: "#FFFFFF",
          gold: "#D4A843",
        },
        apex: {
          asphalt: "#08090C",
          carbon: "#101318",
          pit: "#1A1F29",
          redline: "#FF1E2D",
          gold: "#D4A843",
          chequer: "#FFFFFF",
        },
        surface: {
          DEFAULT: "#121212",
          raised: "#1A1A1A",
          overlay: "#222222",
        },
      },
      borderRadius: {
        premium: "14px",
        hero: "20px",
      },
      boxShadow: {
        premium: "0 8px 30px rgb(0 0 0 / 0.35)",
        "premium-lg": "0 20px 60px rgb(0 0 0 / 0.45)",
        glow: "0 0 24px rgb(212 168 67 / 0.35)",
        nitro: "0 0 24px rgb(255 30 45 / 0.45), 0 0 64px rgb(255 30 45 / 0.2)",
        "glow-gold": "0 0 24px rgb(212 168 67 / 0.45)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "marquee-fast": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "speed-reveal": {
          from: { opacity: "0", clipPath: "inset(0 100% 0 0)", transform: "skewX(-12deg) translateX(-24px)" },
          to: { opacity: "1", clipPath: "inset(0 0 0 0)", transform: "skewX(0deg) translateX(0)" },
        },
        "rpm-pulse": {
          "0%, 100%": { opacity: "1", transform: "scaleX(1)" },
          "50%": { opacity: "0.7", transform: "scaleX(0.98)" },
        },
        "lights-out": {
          "0%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.92)" },
          "100%": { opacity: "0", transform: "scale(1.15)" },
        },
        "checker-slide": {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "64px 0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shine: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(100%)" },
        },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        "marquee-fast": "marquee-fast 18s linear infinite",
        "speed-reveal": "speed-reveal 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "rpm-pulse": "rpm-pulse 1.2s ease-in-out infinite",
        "lights-out": "lights-out 0.6s ease-out both",
        "checker-slide": "checker-slide 1.2s linear infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        shine: "shine 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}