import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the built app runs from any static path (offline / GitHub Pages).
export default defineConfig({
  base: "./",
  plugins: [react()],
});
