/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: {
          50: "#e8e6f0",
          100: "#c5c1d8",
          200: "#9e98be",
          300: "#776fa4",
          400: "#5a4f8e",
          500: "#3d3078",
          600: "#372a6e",
          700: "#2f2360",
          800: "#271c52",
          900: "#1a1a2e",
          950: "#0f0f1c",
        },
        cinnabar: {
          50: "#fef2f0",
          100: "#fde0db",
          200: "#fbc0b6",
          300: "#f89a8a",
          400: "#e85d4a",
          500: "#c0392b",
          600: "#a83024",
          700: "#8c261d",
          800: "#721e18",
          900: "#5c1813",
        },
        washi: {
          50: "#fdfcfa",
          100: "#f5f0e8",
          200: "#ebe3d4",
          300: "#ddd0ba",
          400: "#c9b898",
          500: "#b5a076",
        },
        indigo: {
          DEFAULT: "#2c3e7b",
          light: "#4a5fa0",
          dark: "#1e2d5e",
        },
        gold: {
          DEFAULT: "#d4a843",
          light: "#e4c46a",
          dark: "#b08a2e",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"Noto Sans SC"', "sans-serif"],
      },
      borderRadius: {
        "4xl": "1.5rem",
        "5xl": "2rem",
      },
      boxShadow: {
        "ink": "0 4px 20px rgba(26, 26, 46, 0.15)",
        "ink-lg": "0 8px 30px rgba(26, 26, 46, 0.25)",
        "cinnabar": "0 4px 15px rgba(192, 57, 43, 0.3)",
        "gold": "0 4px 15px rgba(212, 168, 67, 0.3)",
        "washi": "0 2px 10px rgba(245, 240, 232, 0.3)",
      },
      animation: {
        "stamp-down": "stampDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "fade-up": "fadeUp 0.5s ease-out",
      },
      keyframes: {
        stampDown: {
          "0%": { transform: "scale(2) rotate(-15deg)", opacity: "0" },
          "60%": { transform: "scale(0.9) rotate(2deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.3)" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
