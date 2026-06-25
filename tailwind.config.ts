import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#1B2B4B", 50: "#f0f4ff", 100: "#dde6f9", 200: "#bfcef5", 300: "#91a8ed", 400: "#5d7ce2", 500: "#3a59d4", 600: "#2b41be", 700: "#2534a0", 800: "#232d82", 900: "#1B2B4B" },
        green: { DEFAULT: "#1D9E75", 50: "#f0fdf6", 100: "#dcfaeb", 500: "#1D9E75", 600: "#178a64", 700: "#137556" },
      },
      fontFamily: { sans: ["Inter", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
