import { defineConfig } from 'vite';
import { resolve } from 'path';

// Configuração separada para construir o content script como um bundle IIFE
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Não limpa a pasta 'dist' para não apagar o build principal
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/index.ts'),
      },
      output: {
        entryFileNames: 'content.js',
        // Formato IIFE (Immediately Invoked Function Expression)
        // Agrupa todo o código em um único arquivo sem 'import'
        format: 'iife',
      },
    },
  },
});

