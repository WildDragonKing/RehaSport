import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = __dirname;
const publicDir = path.join(projectRoot, "public");
const distDir = path.join(projectRoot, "dist");

async function build() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
  await cp(publicDir, distDir, { recursive: true });
  console.log(`Statischer Build abgeschlossen: ${publicDir} → ${distDir}`);
}

build().catch((error) => {
  console.error("Build fehlgeschlagen:", error);
  process.exitCode = 1;
});
