import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          // Caminho simplificado a partir da raiz do projeto
          src: "public/manifest.json",
          dest: ".", // Destino é a raiz da pasta 'dist'
        },
      ],
    }),
  ],
  build: {
    outDir: "dist",
    // Limpa a pasta 'dist' a cada build, o que é uma boa prática.
    emptyOutDir: true,
    rollupOptions: {
      // Pontos de entrada para o build
      input: {
        popup: resolve(__dirname, "public/popup.html"),
        options: resolve(__dirname, "public/options.html"),
        background: resolve(__dirname, "src/background/index.ts"),
        content: resolve(__dirname, "src/content/index.ts"),
      },
      // Configuração de saída para nomes de arquivo previsíveis
      output: {
        entryFileNames: (chunkInfo) => {
          if (
            chunkInfo.name === "background" ||
            chunkInfo.name === "content"
          ) {
            return "[name].js";
          }
          return "assets/[name].js";
        },
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});