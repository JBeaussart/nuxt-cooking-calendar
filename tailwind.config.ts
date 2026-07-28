import type { Config } from "tailwindcss";

export default {
  darkMode: "media",
  content: [
    "./components/**/*.{vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./composables/**/*.ts",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: "#FDF3E1",
          100: "#F9E4BE",
          200: "#F1CD8C",
          300: "#E7B563",
          400: "#DE9F3E",
          500: "#D98E2B",
          600: "#C2762A",
          700: "#93601C",
          800: "#6E4816",
          900: "#4A3510",
        },
      },
    },
  },
} satisfies Config;
