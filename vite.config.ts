import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  // For a simple popup extension, the defaults are fine.
  // We just ensure the build outputs to "dist" (Vite default).
  build: {
    outDir: "dist",
  },
});