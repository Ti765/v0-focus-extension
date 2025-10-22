import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

// Build somente da UI (popup/options). Não mexe no SW nem no content script.
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: "public/manifest.json", dest: "." },
        { src: "public/icons", dest: "." }
      ]
    })
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true, // limpa dist somente no build da UI
    rollupOptions: {
      // Entradas HTML (o Vite seguirá os <script type="module" ...> dentro delas)
      input: {
        popup: resolve(__dirname, "popup.html"),
        options: resolve(__dirname, "options.html")
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
