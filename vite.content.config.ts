import { defineConfig } from 'vite';
import { resolve } from 'path';

// Build do Content Script COMO SCRIPT CLÁSSICO (IIFE), não ESM.
// Gera UM ÚNICO ARQUIVO: dist/content.js
export default defineConfig({
  base: '', // caminhos relativos
  build: {
    outDir: 'dist',
    emptyOutDir: false, // dist já existe do build da UI
    target: 'es2020',
    minify: 'esbuild',
    lib: {
      entry: resolve(__dirname, 'src/content/index.ts'),
      formats: ['iife'], // obrigatório para content script (não pode ser module)
      name: 'content', // nome global (não é crítico)
      fileName: () => 'content.js',
    },
    rollupOptions: {
      output: {
        // garante bundle único, sem chunks
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
    },
  },
});
