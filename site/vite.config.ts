import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ mode }) => {
  const repository = process.env.GITHUB_REPOSITORY;
  const repositoryName = repository ? repository.split("/")[1] : undefined;

  const envBase = process.env.VITE_BASE_PATH;
  const isDev = mode === "development";

  const base = isDev
    ? "/"
    : envBase ?? (repositoryName ? `/${repositoryName}/` : "./");

  return {
    plugins: [react()],
    base,
    server: {
      host: "0.0.0.0"
    }
  };
});
