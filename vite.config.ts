import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath, URL } from 'node:url';
import { readFileSync, existsSync } from 'fs';

// Build somente da UI (popup/options). Não mexe no SW nem no content script.
export default defineConfig({
  plugins: [
    react(),
    // Plugin para copiar arquivos estáticos
    {
      name: 'copy-static',
      generateBundle() {
        // Copia manifest.json e ícones para o dist
        try {
          if (existsSync('public/manifest.json')) {
            this.emitFile({
              type: 'asset',
              fileName: 'manifest.json',
              source: readFileSync('public/manifest.json', 'utf-8')
            });
          } else {
            console.warn('[vite-plugin-copy-static] manifest.json not found, skipping...');
          }
        } catch (error) {
          console.error('[vite-plugin-copy-static] Failed to read manifest.json:', error);
        }
        
        // Copia ícones
        const iconFiles = ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png'];
        iconFiles.forEach(icon => {
          try {
            const iconPath = `public/icons/${icon}`;
            if (existsSync(iconPath)) {
              this.emitFile({
                type: 'asset',
                fileName: icon,
                source: readFileSync(iconPath)
              });
            } else {
              console.warn(`[vite-plugin-copy-static] ${icon} not found, skipping...`);
            }
          } catch (error) {
            console.error(`[vite-plugin-copy-static] Failed to read ${icon}:`, error);
          }
        });
      }
    }
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true, // limpa dist somente no build da UI
    rollupOptions: {
      // Entradas HTML (o Vite seguirá os <script type="module" ...> dentro delas)
      input: {
        popup: resolve(fileURLToPath(new URL('./popup.html', import.meta.url))),
        options: resolve(fileURLToPath(new URL('./options.html', import.meta.url)))
      },
      output: {
        // Mantém nomes estáveis e separa os chunks em /assets
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]"
      }
    },
    target: "es2020"
  }
});
