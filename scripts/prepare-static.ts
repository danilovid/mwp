/**
 * Готовит статические картинки и документы из папки materials/ в public/.
 * Запускать вручную после замены исходников: npx tsx scripts/prepare-static.ts
 */
import { copyFile, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";

const PHOTOS: Record<string, string> = {
  "IMG_20260930_155251_090.jpg": "molding-shell-hand",
  "IMG_20260930_155252_474.jpg": "molding-shell-closeup",
  "IMG_20260930_155256_335.jpg": "molding-mold-hand",
  "IMG_20260930_155259_668.jpg": "molding-shells-row",
  "IMG_20260930_155303_589.jpg": "molding-mold-open",
  "IMG_20260930_155307_516.jpg": "molding-mold",
  "IMG_20260930_155311_587.jpg": "molding-machine",
  "IMG_20260930_155315_143.jpg": "molding-removal",
  "IMG_20260930_155318_498.jpg": "molding-ejector",
  "IMG_20260930_155322_183.jpg": "storefront",
  "IMG_20260930_155326_375.jpg": "assembly-padding",
  "IMG_20260930_155329_641.jpg": "laser-foam",
  "IMG_20260930_155333_452.jpg": "assembly-cage",
  "IMG_20260930_155337_583.jpg": "assembly-logo",
  "IMG_20260930_155340_971.jpg": "assembly-black-tag",
  "IMG_20260930_155344_451.jpg": "laser-table",
  "IMG_20260930_155348_629.jpg": "laser-head",
  "IMG_20260930_155352_359.jpg": "assembly-black-cage",
  "IMG_20260930_155356_231.jpg": "ready-elbow-cube",
  "IMG_20260930_155359_900.jpg": "laser-sheet",
  "IMG_20260930_155403_636.jpg": "sewing-machine",
  "IMG_20260930_155407_262.jpg": "sewing-cube",
  "IMG_20260930_155411_115.jpg": "sewing-cube-closeup",
  "IMG_20260930_155414_871.jpg": "sewing-stitch",
};

const DOCS = [
  {
    src: "ОС 02.Н00479 от 29.09.2026.pdf",
    out: "sertifikat-ROSS-RU-OS02-N00479",
  },
  { src: "1265239.eod.pdf", out: "tovarnyj-znak-1265239" },
];

async function main() {
  const photosOut = path.resolve("public/images/factory");
  await mkdir(photosOut, { recursive: true });
  for (const [src, name] of Object.entries(PHOTOS)) {
    const input = sharp(path.resolve("materials/photos", src)).rotate();
    for (const width of [1600, 800]) {
      await input
        .clone()
        .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(path.join(photosOut, `${name}-${width}.webp`));
    }
    console.log("✓", name);
  }

  const filesOut = path.resolve("public/files");
  const thumbsOut = path.resolve("public/images/docs");
  await mkdir(filesOut, { recursive: true });
  await mkdir(thumbsOut, { recursive: true });
  for (const doc of DOCS) {
    const pdf = path.resolve("materials/docs", doc.src);
    await copyFile(pdf, path.join(filesOut, `${doc.out}.pdf`));
    const tmp = path.join(thumbsOut, doc.out);
    execFileSync("pdftoppm", ["-png", "-r", "110", "-singlefile", pdf, tmp]);
    await sharp(`${tmp}.png`).resize({ width: 600 }).webp({ quality: 82 }).toFile(`${tmp}.webp`);
    execFileSync("rm", [`${tmp}.png`]);
    console.log("✓", doc.out);
  }
}

main();
