/// <reference types="node" />

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => {
  const repository = process.env.GITHUB_REPOSITORY;
  const repositoryName = repository ? repository.split("/")[1] : undefined;

  const envBase = process.env.VITE_BASE_PATH;
  const isDev = mode === "development";

  const cnamePath = fileURLToPath(new URL("./public/CNAME", import.meta.url));
  const hasCustomDomain = existsSync(cnamePath);

  const base = isDev
    ? "/"
    : (envBase ??
      (hasCustomDomain ? "./" : repositoryName ? `/${repositoryName}/` : "./"));

  const projectRoot = fileURLToPath(new URL(".", import.meta.url));

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.svg", "data/*.json"],
        manifest: {
          name: "RehaSport Reader",
          short_name: "RehaSport",
          description:
            "Strukturierte Trainingsstunden mit Alternativen für Knie- und Schulterprobleme",
          theme_color: "#5f8266",
          background_color: "#fafafa",
          display: "standalone",
          orientation: "portrait",
          start_url: base,
          scope: base,
          lang: "de",
          icons: [
            { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
            { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,json,woff2}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
          ],
        },
      }),
    ],
    base,
    resolve: {
      alias: {
        "@": resolve(projectRoot, "src"),
      },
    },
    server: {
      host: "0.0.0.0",
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
    },
  };
});
