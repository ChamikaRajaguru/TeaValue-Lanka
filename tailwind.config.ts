import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Green & White Theme Palette
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        tea: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          850: "#14532d",
          900: "#0f3d23",
          950: "#062817",
        },
        cream: {
          50: "#fcfcfc",
          100: "#f8faf9",
          200: "#f0f4f1",
          300: "#e2e8e4",
          400: "#cbd5cf",
          500: "#94a39b",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "var(--font-inter)", "var(--font-sinhala)", "system-ui", "-apple-system", "sans-serif"],
        sinhala: ["var(--font-sinhala)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 4px 20px -2px rgba(16, 185, 129, 0.25)",
        "glow-sm": "0 2px 10px -1px rgba(16, 185, 129, 0.18)",
        card: "0 10px 30px -10px rgba(6, 78, 59, 0.07), 0 2px 6px -1px rgba(6, 78, 59, 0.04)",
        glass: "0 8px 30px rgba(0, 0, 0, 0.05)",
      },
      animation: {
        "pulse-slow": "pulse 3.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
