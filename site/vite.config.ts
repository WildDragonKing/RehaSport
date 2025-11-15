/// <reference types="node" />

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
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
    : envBase ?? (hasCustomDomain ? "./" : repositoryName ? `/${repositoryName}/` : "./");

  const projectRoot = fileURLToPath(new URL(".", import.meta.url));
  const stundenDir = fileURLToPath(new URL("../stunden", import.meta.url));

  return {
    plugins: [react()],
    base,
    resolve: {
      alias: {
        "@": resolve(projectRoot, "src"),
        "@stunden": stundenDir
      }
    },
    server: {
      host: "0.0.0.0",
      fs: {
        allow: [projectRoot, stundenDir]
      }
    }
  };
});
