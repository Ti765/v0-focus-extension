import { defineConfig } from "vite";
import { resolve } from "path";

// Gera um ÚNICO arquivo ESM: dist/content.js (sem chunks)
export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false, // não limpar dist (a UI já escreveu lá)
    lib: {
      entry: resolve(__dirname, "src/content/index.ts"),
      name: "content",
      formats: ["es"],
      fileName: () => "content.js"
    },
    rollupOptions: {
      // Garante single-file sem code-splitting
      output: {
        inlineDynamicImports: true
      }
    },
    minify: "esbuild",
    target: "es2020"
  }
});
