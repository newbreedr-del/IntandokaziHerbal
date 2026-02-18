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
        brand: {
          50: "#f3f1f9",
          100: "#e4e0f3",
          200: "#c9c1e7",
          300: "#a898d5",
          400: "#8b6ec3",
          500: "#6e4aaf",
          600: "#563892",
          700: "#432c75",
          800: "#2e1d54",
          900: "#1e1238",
          950: "#110a22",
        },
        navy: {
          50: "#eef0f7",
          100: "#d5d9ed",
          200: "#aab3db",
          300: "#7a8dc8",
          400: "#4f67b5",
          500: "#2d4a9e",
          600: "#1e3580",
          700: "#162660",
          800: "#0e1940",
          900: "#080f28",
          950: "#040818",
        },
      },
    },
  },
  plugins: [],
};
export default config;
