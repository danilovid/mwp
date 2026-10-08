import { getProductBySlug, type ProductDetail } from "./catalog";
import { imageUrl } from "./media";

const categories = [
  // The helmet is sold without a cage here. The cage is a separate cart item.
  { key: "helmet", label: "Шлем", slug: "shlem", hotspot: [57, 7], measure: "обхват головы" },
  { key: "mask", label: "Маска для шлема", slug: "maska", hotspot: [37, 11], measure: "размер маски и совместимость со шлемом" },
  { key: "chin", label: "Защита подбородка", slug: "zashchita-podborodka", hotspot: [44, 17], measure: "крепление и посадка" },
  { key: "neck", label: "Защита шеи", slug: "zashchita-shei", hotspot: [61, 21], measure: "возрастная категория и обхват шеи" },
  { key: "chest", label: "Нагрудник", slug: "nagrudnik", hotspot: [49, 27], measure: "рост и обхват груди" },
  { key: "elbows", label: "Налокотники", slug: "nalokotniki", hotspot: [29, 39], measure: "рост и длина руки" },
  { key: "gloves", label: "Перчатки", slug: "perchatki", hotspot: [20, 53], measure: "длина кисти" },
  { key: "pants", label: "Шорты", slug: "shorty", hotspot: [50, 52], measure: "обхват талии" },
  { key: "groin", label: "Защита паха", slug: "zashchita-paha", hotspot: [50, 62], measure: "индивидуальная посадка" },
  { key: "shins", label: "Щитки", slug: "shchitki", hotspot: [35, 77], measure: "длина голени" },
] as const;

const toVariant = (p: ProductDetail) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  note: p.note,
  line: p.line,
  options: p.options,
  editions: p.editions.map(({ id, values, price }) => ({ id, values, price })),
  images: p.images.map((image) => ({ ...image, src: imageUrl(image.file, 480) })),
});

/** Published product data is loaded for each request; no price snapshot in the client bundle. */
export async function getConstructorCatalog() {
  const groups = await Promise.all(categories.map(async ({ slug, ...category }) => {
    const base = await getProductBySlug(slug) ?? await getProductBySlug(`${slug}-cube`);
    if (!base) return null;
    const pair = base.pair ? await getProductBySlug(base.pair.slug) : null;
    const variants = [base, pair]
      .filter((p): p is ProductDetail => p !== null && p.editions.length > 0)
      .map(toVariant);
    return variants.length ? { ...category, variants } : null;
  }));
  return groups.filter((group) => group !== null);
}

export type ConstructorCatalog = Awaited<ReturnType<typeof getConstructorCatalog>>;
