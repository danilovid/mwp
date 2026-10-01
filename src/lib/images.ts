import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import sharp from "sharp";

import { IMAGE_SIZES } from "./media";

export { IMAGE_SIZES, imageUrl } from "./media";

export function uploadDir() {
  return path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? "./data/uploads");
}

/**
 * Сохраняет фото товара: поворот по EXIF, перевод в WebP в двух размерах.
 * Возвращает базовое имя файла (без суффикса размера).
 */
export async function saveProductImage(input: Buffer, prefix: string): Promise<string> {
  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  const file = `${prefix}-${randomBytes(4).toString("hex")}`;
  const source = sharp(input, { failOn: "none" }).rotate();
  for (const size of IMAGE_SIZES) {
    const out = await source
      .clone()
      .resize({ width: size, height: size, fit: "inside", withoutEnlargement: true })
      .webp({ quality: size > 600 ? 82 : 78 })
      .toBuffer();
    await writeFile(path.join(dir, `${file}-${size}.webp`), out);
  }
  return file;
}

export async function deleteProductImage(file: string) {
  const dir = uploadDir();
  await Promise.all(
    IMAGE_SIZES.map((size) => unlink(path.join(dir, `${file}-${size}.webp`)).catch(() => undefined)),
  );
}
