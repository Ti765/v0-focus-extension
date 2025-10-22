import { defineConfig } from 'vite';
import { resolve } from 'path';

// Build dedicado ao Service Worker (Manifest V3).
// Gera UM ÚNICO ARQUIVO ESM (background.js) sem chunks externos.
export default defineConfig({
  base: '', // caminhos relativos — importante em extensões
  build: {
    outDir: 'dist',
    emptyOutDir: false, // a UI já gerou a pasta dist
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
      },
      output: {
        entryFileNames: 'background.js',
        format: 'esm',
        // impede code-splitting e quaisquer imports externos
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
    },
  },
});
