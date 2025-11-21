import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "",
  plugins: [react()],
  resolve: {
    alias: {
      // Backup: If you prefer, you can use the source directly instead of dist.
      // "react-html-capture": path.resolve(__dirname, "../../src")
    },
  },
  server: { port: 5173, open: true },
});
