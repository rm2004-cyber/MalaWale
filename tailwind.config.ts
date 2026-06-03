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
          light: "#FCF8F2",
          gold: "#D4AF37",
          dark: "#9B1B1B",
          saffron: "#E65100",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;