import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spiritual: {
          light: "#fff9f2",
          gold: "#d4a373",
          dark: "#8b4513",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;