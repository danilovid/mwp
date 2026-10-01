/**
 * Импорт каталога со старого сайта на Tilda (mwphockey.ru).
 *
 *   npm run import:tilda            — импорт в пустую базу
 *   npm run import:tilda -- --force — удалить текущие товары и импортировать заново
 *
 * Цены, размеры, описания и фото берутся из API магазина Tilda.
 * Здесь задаётся только то, чего в Tilda нет: раздел каталога, пары «базовая — CUBE»,
 * состав «Комплекта на игрока» и исправления опечаток.
 */
import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { db } from "../src/lib/db";
import { deleteProductImage, saveProductImage } from "../src/lib/images";
import { MARKETPLACE_LINKS, TILDA_PLAN as PLAN } from "../src/lib/tilda-plan";

const API =
  "https://store.tildaapi.com/api/getproductslist/?storepartuid=248628491552&recid=1297746491&getparts=true&getoptions=true&slice=1&size=100&flag_root=withroot";

const CATEGORIES = [
  { slug: "head", name: "Голова и шея" },
  { slug: "body", name: "Корпус" },
  { slug: "arms", name: "Руки" },
  { slug: "legs", name: "Ноги" },
  { slug: "goalie", name: "Вратарь" },
  { slug: "parts", name: "Запчасти" },
];

/** Опечатки старого сайта. */
const TYPOS: [RegExp, string][] = [
  [/хоккеный/g, "хоккейный"],
  [/Врозлые/g, "Взрослые"],
  [/дополнтельный/g, "дополнительный"],
  [/обспечивает/g, "обеспечивает"],
  [/аммортизацию/g, "амортизацию"],
  [/предплечия/g, "предплечья"],
  [/\.(?=[А-ЯA-Z])/g, ". "],
];
const fix = (s: string) => TYPOS.reduce((acc, [re, to]) => acc.replace(re, to), s);

const clean = (html: string) =>
  fix(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&quot;/g, '"')
      .replace(/&laquo;/g, "«")
      .replace(/&raquo;/g, "»")
      .replace(/&amp;/g, "&")
      .replace(/[ \t]+/g, " ")
      .replace(/ *\n */g, "\n")
      .trim(),
  );

const toPrice = (s: string) => Math.round(Number(String(s).replace(/\s/g, "")));

type TildaEdition = Record<string, string> & { price: string; img?: string };
type TildaProduct = {
  uid: string | number;
  title: string;
  descr: string;
  text: string;
  price: string;
  gallery: string;
  json_options?: string;
  editions?: TildaEdition[];
};

const CACHE = path.resolve("data/import-cache");

async function download(url: string): Promise<Buffer> {
  await mkdir(CACHE, { recursive: true });
  const file = path.join(CACHE, createHash("sha1").update(url).digest("hex") + path.extname(new URL(url).pathname));
  try {
    return await readFile(file);
  } catch {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(file, buf);
    return buf;
  }
}

async function main() {
  const force = process.argv.includes("--force");
  const existing = await db.product.count();
  if (existing && !force) {
    console.log(`В базе уже ${existing} товаров. Для повторного импорта: npm run import:tilda -- --force`);
    return;
  }
  if (force) {
    const images = await db.productImage.findMany();
    await Promise.all(images.map((i) => deleteProductImage(i.file)));
    await db.product.updateMany({ data: { baseId: null } });
    await db.product.deleteMany();
  }

  const res = await fetch(API, { headers: { Referer: "https://mwphockey.ru/" } });
  const data = (await res.json()) as { products: TildaProduct[] };
  console.log(`Tilda: ${data.products.length} товаров`);

  const cats = new Map<string, number>();
  for (const [i, c] of CATEGORIES.entries()) {
    const row = await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sort: i },
      create: { slug: c.slug, name: c.name, sort: i },
    });
    cats.set(c.slug, row.id);
  }

  const ids = new Map<string, number>();
  for (const [index, p] of data.products.entries()) {
    const plan = PLAN[String(p.uid)];
    if (!plan) {
      console.warn(`! Нет плана для «${p.title}» (${p.uid}) — пропускаю`);
      continue;
    }
    const options = (JSON.parse(p.json_options || "[]") as { title: string; values: string[] }[]).map((o) => ({
      name: o.title,
      values: o.values.map(fix),
    }));
    const optionNames = options.map((o) => o.name);
    const editions = (p.editions ?? []).map((e, sort) => ({
      values: JSON.stringify(Object.fromEntries(optionNames.map((n) => [n, fix(e[n] ?? "")]))),
      price: toPrice(e.price),
      sort,
      img: e.img,
      color: e["Цвет"] ? fix(e["Цвет"]) : "",
    }));
    if (!editions.length) editions.push({ values: "{}", price: toPrice(p.price), sort: 0, img: undefined, color: "" });

    const product = await db.product.create({
      data: {
        slug: plan.slug,
        name: fix(p.title),
        line: plan.cubeOf || plan.cube ? "cube" : "base",
        categoryId: cats.get(plan.cat)!,
        note: clean(p.descr || ""),
        description: clean(p.text || ""),
        sort: index,
        kitSort: plan.kit ?? null,
        ozonUrl: MARKETPLACE_LINKS[plan.slug]?.ozon ?? "",
        marketUrl: MARKETPLACE_LINKS[plan.slug]?.market ?? "",
        options: JSON.stringify(options),
        editions: { create: editions.map(({ values, price, sort }) => ({ values, price, sort })) },
      },
    });
    ids.set(plan.slug, product.id);

    // Фото: галерея + фото, привязанные к цвету в вариантах
    const gallery = (JSON.parse(p.gallery || "[]") as { img: string }[]).map((g) => g.img);
    const colorByImg = new Map<string, string>();
    for (const e of editions) if (e.img && e.color && !colorByImg.has(e.img)) colorByImg.set(e.img, e.color);
    for (const img of colorByImg.keys()) if (!gallery.includes(img)) gallery.push(img);

    for (const [sort, url] of gallery.entries()) {
      const file = await saveProductImage(await download(url), `p${product.id}`);
      await db.productImage.create({
        data: { productId: product.id, file, sort, optionValue: colorByImg.get(url) ?? "" },
      });
    }
    console.log(`✓ ${product.name}: ${editions.length} вар., ${gallery.length} фото`);
  }

  for (const plan of Object.values(PLAN)) {
    if (!plan.cubeOf) continue;
    await db.product.update({ where: { slug: plan.slug }, data: { baseId: ids.get(plan.cubeOf) } });
  }
  console.log("Готово");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
