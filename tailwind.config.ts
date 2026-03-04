import type { Config } from "tailwindcss";

export default {
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
        sage: {
          50: "#f0f7f5",
          100: "#d9ede8",
          200: "#b7ddd4",
          300: "#7BAE9D",
          400: "#6a9d8c",
          500: "#7BAE9D",
          600: "#5d8a7a",
          700: "#4d7063",
          800: "#425c52",
          900: "#394d45",
        },
      },
    },
  },
} satisfies Config;
