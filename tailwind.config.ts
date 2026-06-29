import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Reference design system
        brand: {
          DEFAULT: '#0b6b5f',
          dark: '#073f38',
          light: '#e8f6f1',
        },
        ink: {
          DEFAULT: '#151515',
        },
        muted: {
          DEFAULT: '#5f6368',
        },
        line: {
          DEFAULT: '#d8d8d8',
        },
        soft: {
          DEFAULT: '#f7f8fa',
        },
        gold: {
          DEFAULT: '#b4690e',
        },
        accent: {
          DEFAULT: '#c92a63',
        },
        // Logo-derived color palette
        navy: {
          50: "#e6edf5",
          100: "#c2d3e6",
          200: "#9ab6d5",
          300: "#7399c4",
          400: "#5582b8",
          500: "#386bab",
          600: "#3060a0",
          700: "#255291",
          800: "#1b4481",
          900: "#0a1929", // Deep navy from logo background
          950: "#060f1a",
        },
        ocean: {
          50: "#e0f7ff",
          100: "#b3ecff",
          200: "#80dfff",
          300: "#4dd2ff",
          400: "#4fc3f7", // Light blue from logo student figure
          500: "#33b5e5",
          600: "#2196c9",
          700: "#1976a9",
          800: "#125689",
          900: "#0a3a5e",
        },
        amber: {
          50: "#fff8e1",
          100: "#ffecb3",
          200: "#ffe082",
          300: "#ffd54f",
          400: "#ffca28",
          500: "#ffc107", // Gold star from logo
          600: "#ffa726", // Orange swoosh from logo
          700: "#ff9800",
          800: "#f57c00",
          900: "#e65100",
        },
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        secondary: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9f1239",
          900: "#831843",
        },
        success: {
          500: "#10b981",
          600: "#059669",
        },
        warning: {
          500: "#f59e0b",
          600: "#d97706",
        },
        danger: {
          500: "#ef4444",
          600: "#dc2626",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        hover:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        glow: "0 0 20px rgba(79, 195, 247, 0.3)",
        "glow-amber": "0 0 20px rgba(255, 167, 38, 0.3)",
        sidebar: "4px 0 24px -2px rgba(10, 25, 41, 0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "slide-out-left": "slideOutLeft 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideOutLeft: {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(-100%)", opacity: "0" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(79, 195, 247, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(79, 195, 247, 0.6)" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionDuration: {
        "400": "400ms",
      },
    },
  },
  plugins: [],
};
export default config;

