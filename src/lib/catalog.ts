import { db } from "./db";

export type ProductOption = { name: string; values: string[] };
export type EditionValues = Record<string, string>;
export type Line = "base" | "cube";

export const parseOptions = (json: string): ProductOption[] => {
  try {
    return JSON.parse(json) as ProductOption[];
  } catch {
    return [];
  }
};
export const parseValues = (json: string): EditionValues => {
  try {
    return JSON.parse(json) as EditionValues;
  } catch {
    return {};
  }
};

const minOf = (prices: number[]) => (prices.length ? Math.min(...prices) : 0);

/** Минимальная оптовая цена товара по ступени; null — ни у одного варианта её нет. */
const optMin = (p: Loaded | null, field: "priceOpt1" | "priceOpt2") => {
  const vals = (p?.editions ?? []).map((e) => e[field]).filter((v): v is number => v != null);
  return vals.length ? Math.min(...vals) : null;
};
const maxOf = (prices: number[]) => (prices.length ? Math.max(...prices) : 0);

/** «рост 110-120» → [110, 120] */
export function heightRange(value: string): [number, number] | null {
  const m = value.match(/рост\s*(\d{2,3})\s*[-–]\s*(\d{2,3})/i);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

/** Короткая подпись размера: «1 (рост 110-120)» → «1» */
export const sizeShort = (value: string) => value.replace(/\s*\(.*\)\s*$/, "");

/** Подпись размерного ряда для карточки: «S, M, L», «10,5–14,5», «рост 110–195 см» */
export function sizesLabel(options: ProductOption[]): string {
  const size = options.find((o) => o.name === "Размер");
  if (!size || !size.values.length) return "";
  const ranges = size.values.map(heightRange);
  if (ranges.every(Boolean)) {
    const lo = Math.min(...ranges.map((r) => r![0]));
    const hi = Math.max(...ranges.map((r) => r![1]));
    return `${size.values.length} ${size.values.length < 5 ? "размера" : "размеров"}, рост ${lo}–${hi} см`;
  }
  if (size.values.length > 4) return `${sizeShort(size.values[0])}–${sizeShort(size.values.at(-1)!)}`;
  return size.values.map(sizeShort).join(", ");
}

const productInclude = {
  category: true,
  images: { orderBy: { sort: "asc" } },
  editions: { orderBy: { sort: "asc" } },
} as const;

async function loadPublished() {
  return db.product.findMany({
    where: { published: true },
    orderBy: [{ category: { sort: "asc" } }, { sort: "asc" }],
    include: productInclude,
  });
}
type Loaded = Awaited<ReturnType<typeof loadPublished>>[number];

/** Данные для добавления в корзину прямо из каталога, без захода в карточку. */
export type CardVariant = {
  id: number;
  slug: string;
  name: string;
  line: Line;
  options: ProductOption[];
  editions: { values: EditionValues; price: number }[];
  image: string | null;
};

export type CatalogCard = {
  slug: string;
  name: string;
  note: string;
  category: string;
  categoryName: string;
  image: string | null;
  cubeImage: string | null;
  sizes: string;
  /** цена «от» базовой версии; null — у товара только CUBE */
  basePrice: number | null;
  baseMax: number | null;
  baseHasRange: boolean;
  cubeSlug: string | null;
  cubePrice: number | null;
  cubeMax: number | null;
  cubeHasRange: boolean;
  colors: string[];
  /** прямая ссылка на товар в OZON; пустая строка — ссылки нет */
  ozonUrl: string;
  /** базовая и CUBE-версии с размерами и ценами — для добавления в корзину из каталога */
  buy: CardVariant[];
  /** минимальная оптовая цена: ступень «от 30 000 ₽». null — цены в прайсе нет (вся линейка CUBE и часть мелочи) */
  optFrom: number | null;
  /** минимальная оптовая цена: ступень «от 100 000 ₽» */
  opt2From: number | null;
};

function toCard(base: Loaded | null, cube: Loaded | null): CatalogCard {
  const main = (base ?? cube)!;
  const options = parseOptions(main.options);
  const bp = base ? base.editions.map((e) => e.price) : [];
  const cp = cube ? cube.editions.map((e) => e.price) : [];
  return {
    slug: main.slug,
    name: main.name,
    note: main.note,
    category: main.category.slug,
    categoryName: main.category.name,
    image: main.images[0]?.file ?? null,
    cubeImage: cube?.images[0]?.file ?? null,
    sizes: sizesLabel(options),
    basePrice: base ? minOf(bp) : null,
    baseMax: base ? maxOf(bp) : null,
    baseHasRange: minOf(bp) !== maxOf(bp),
    cubeSlug: base && cube ? cube.slug : null,
    cubePrice: cube ? minOf(cp) : null,
    cubeMax: cube ? maxOf(cp) : null,
    cubeHasRange: minOf(cp) !== maxOf(cp),
    colors: options.find((o) => o.name === "Цвет")?.values ?? [],
    ozonUrl: main.ozonUrl,
    optFrom: optMin(base, "priceOpt1"),
    opt2From: optMin(base, "priceOpt2"),
    buy: [base, cube].filter((p): p is Loaded => p !== null).map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      line: p.line as Line,
      options: parseOptions(p.options),
      editions: p.editions.map((e) => ({ values: parseValues(e.values), price: e.price })),
      image: p.images[0]?.file ?? null,
    })),
  };
}

/** Карточки каталога: базовый товар и его CUBE-версия — одна карточка. */
export async function getCatalog() {
  const products = await loadPublished();
  const bySlug = new Map(products.map((p) => [p.id, p]));
  const cards: CatalogCard[] = [];
  for (const p of products) {
    if (p.line === "cube" && p.baseId && bySlug.has(p.baseId)) continue;
    const cube = p.line === "base" ? (products.find((c) => c.baseId === p.id) ?? null) : null;
    cards.push(p.line === "cube" ? toCard(null, p) : toCard(p, cube));
  }
  const categories = await db.category.findMany({ orderBy: { sort: "asc" } });
  return {
    cards,
    categories: categories
      .map((c) => ({ slug: c.slug, name: c.name, count: cards.filter((k) => k.category === c.slug).length }))
      .filter((c) => c.count > 0),
  };
}

export async function getProductBySlug(slug: string) {
  const p = await db.product.findUnique({
    where: { slug },
    include: { ...productInclude, base: { include: productInclude }, cube: { include: productInclude } },
  });
  if (!p || !p.published) return null;
  const pair = p.line === "cube" ? p.base : p.cube;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    line: p.line as Line,
    note: p.note,
    description: p.description,
    category: { slug: p.category.slug, name: p.category.name },
    ozonUrl: p.ozonUrl,
    marketUrl: p.marketUrl,
    options: parseOptions(p.options),
    images: p.images.map((i) => ({ file: i.file, optionValue: i.optionValue })),
    editions: p.editions.map((e) => ({
      id: e.id,
      values: parseValues(e.values),
      price: e.price,
      priceOpt1: e.priceOpt1,
      priceOpt2: e.priceOpt2,
    })),
    minPrice: minOf(p.editions.map((e) => e.price)),
    pair:
      pair && pair.published
        ? { slug: pair.slug, line: pair.line as Line, minPrice: minOf(pair.editions.map((e) => e.price)) }
        : null,
  };
}
export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export async function getPublishedSlugs() {
  const rows = await db.product.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } });
  return rows;
}

export async function getRelated(categorySlug: string, exclude: string[]) {
  const { cards } = await getCatalog();
  return cards.filter((c) => c.category === categorySlug && !exclude.includes(c.slug)).slice(0, 4);
}

/* ---------- Комплект на игрока и заказ для клуба ---------- */

export type KitItem = {
  slug: string;
  name: string;
  /** цена по каждому диапазону роста; для товаров без размера по росту — минимальная */
  base: number[];
  cube: number[] | null;
  cubeSlug: string | null;
  /** true — размер подбирается не по росту, цена «от» */
  approx: boolean;
};

export type KitData = { heights: string[]; items: KitItem[] };

/** Сетка роста для комплекта и заказа клуба — по нагруднику (7 размеров, 110–195 см). */
const HEIGHT_SOURCE = "nagrudnik";

/**
 * Диапазоны роста берутся из размерного ряда нагрудника, а если его нет — из товара комплекта
 * с самой подробной сеткой «по росту».
 */
export async function getKit(): Promise<KitData> {
  const products = await loadPublished();
  const kit = products.filter((p) => p.kitSort != null).sort((a, b) => a.kitSort! - b.kitSort!);

  const rangesOf = (p: Loaded) =>
    (parseOptions(p.options).find((o) => o.name === "Размер")?.values.map(heightRange) ?? []) as [number, number][];
  let heights: [number, number][] = [];
  const source = kit.find((p) => p.slug === HEIGHT_SOURCE);
  if (source && rangesOf(source).every(Boolean)) heights = rangesOf(source);
  else
    for (const p of kit) {
      const ranges = rangesOf(p);
      if (ranges.length > heights.length && ranges.every(Boolean)) heights = ranges;
    }

  const pricesFor = (p: Loaded) => {
    const editions = p.editions.map((e) => ({ v: parseValues(e.values), price: e.price }));
    const min = minOf(editions.map((e) => e.price));
    const sized = editions.filter((e) => e.v["Размер"] && heightRange(e.v["Размер"]));
    if (!sized.length) return { prices: heights.map(() => min), approx: editions.some((e) => e.price !== min) };
    const prices = heights.map(([lo, hi]) => {
      const mid = (lo + hi) / 2;
      const hit =
        sized.find((e) => {
          const [a, b] = heightRange(e.v["Размер"])!;
          return mid >= a && mid <= b;
        }) ??
        // рост выше сетки товара — берём самый большой размер, ниже — самый маленький
        (mid > heightRange(sized.at(-1)!.v["Размер"])![1] ? sized.at(-1)! : sized[0]);
      return hit.price;
    });
    return { prices, approx: false };
  };

  const items = kit.map((p) => {
    const cube = products.find((c) => c.baseId === p.id) ?? null;
    const b = pricesFor(p);
    const c = cube ? pricesFor(cube) : null;
    return {
      slug: p.slug,
      name: p.name,
      base: b.prices,
      cube: c?.prices ?? null,
      cubeSlug: cube?.slug ?? null,
      approx: b.approx,
    };
  });

  return { heights: heights.map(([lo, hi]) => `${lo}–${hi}`), items };
}
