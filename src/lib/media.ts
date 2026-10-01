/** Размеры, в которых храним каждое фото товара (по длинной стороне). */
export const IMAGE_SIZES = [1200, 480] as const;

/** URL фото товара нужного размера. */
export function imageUrl(file: string, size: (typeof IMAGE_SIZES)[number] = 1200) {
  return `/media/${file}-${size}.webp`;
}
