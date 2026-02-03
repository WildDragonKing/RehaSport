import sharp from "sharp";
import { readFileSync } from "fs";
import { join } from "path";

const publicDir = "./public";
const svgBuffer = readFileSync(join(publicDir, "favicon.svg"));

const sizes = [192, 512];

for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(publicDir, `pwa-${size}x${size}.png`));
  console.log(`Created pwa-${size}x${size}.png`);
}

// Apple Touch Icon
await sharp(svgBuffer)
  .resize(180, 180)
  .png()
  .toFile(join(publicDir, "apple-touch-icon.png"));
console.log("Created apple-touch-icon.png");

console.log("Done!");
