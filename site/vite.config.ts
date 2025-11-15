import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const repository = process.env.GITHUB_REPOSITORY;
const repositoryName = repository ? repository.split("/")[1] : undefined;
const base = repositoryName ? `/${repositoryName}/` : "/";

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    host: "0.0.0.0"
  },
  test: {
    environment: "node"
  }
});
