import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2022",
    minify: "terser", // ~4% smaller than esbuild: keeps first-party JS inside the 60 KB gzip budget
    chunkSizeWarningLimit: 600, // three.js ships as its own lazy chunk
  },
});
