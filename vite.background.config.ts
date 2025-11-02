import { defineConfig } from "vite";
import { resolve } from "path";

// Gera um ÚNICO arquivo ESM: dist/background.js (sem chunks)
export default defineConfig({
  define: {
    // Replace all process.env.NODE_ENV references with a string literal during build
    // The process object itself is polyfilled at runtime via process-polyfill.ts
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  build: {
    outDir: "dist",
    emptyOutDir: false, // não limpar dist (a UI já escreveu lá)
    lib: {
      entry: resolve(__dirname, "src/background/index.ts"),
      name: "background",
      formats: ["es"],
      fileName: () => "background.js"
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    },
    minify: "esbuild",
    target: "es2020"
  }
});
