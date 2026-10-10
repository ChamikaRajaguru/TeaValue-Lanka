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
        tea: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#14442a",
          850: "#113822",
          900: "#0c2d1c",
          950: "#061a10",
        },
        cream: {
          50: "#fcfbf7",
          100: "#f7f5ee",
          200: "#eee9db",
          300: "#dfd7c2",
          400: "#cfc3a5",
          500: "#b5a580",
        },
        amberGold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        sinhala: ["var(--font-sinhala)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
