import { defineConfig } from "vite";
import { resolve } from "path";

// Gera um ÚNICO arquivo ESM: dist/background.js (sem chunks)
export default defineConfig({
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
