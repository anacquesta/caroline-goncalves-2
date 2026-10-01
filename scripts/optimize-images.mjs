import sharp from "sharp";
import fs from "node:fs/promises";
const files = await fs.readdir("public/images");
for (const file of files.filter((n) => /\.(jpg|png)$/.test(n))) {
  const base = file.replace(/\.(jpg|png)$/, "");
  const source = "public/images/" + file;
  for (const width of [480, 960, 1600])
    await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(`public/images/${base}-${width}.webp`);
}
console.log("Variantes WebP criadas.");
