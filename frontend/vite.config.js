// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/auth": "http://localhost:4000",
      "/notes": "http://localhost:4000",
      "/ai": "http://localhost:4000",
      "/insights": "http://localhost:4000",
    },
  },
});
