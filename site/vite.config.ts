/// <reference types="node" />

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

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

  return {
    plugins: [react()],
    base,
    server: {
      host: "0.0.0.0"
    }
  };
});
