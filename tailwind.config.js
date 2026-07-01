/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand — Llama (deep plum) + Marigold
        llama: {
          DEFAULT: "#620d3c",
          soft: "#7d1f52",
          deep: "#4a0a2d",
        },
        marigold: {
          DEFAULT: "#f1a222",
          soft: "#f6b955",
          deep: "#d9860a",
        },
        paper: {
          DEFAULT: "#fffbe2", // pale yellow
          pure: "#ffffff",
        },
        ink: {
          DEFAULT: "#2a1620",
          soft: "#6b5560",
          faint: "#a08c94",
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        drawer: "-24px 0 60px -20px rgba(74,10,45,0.35)",
        card: "0 2px 20px -8px rgba(74,10,45,0.18)",
      },
    },
  },
  plugins: [],
};
