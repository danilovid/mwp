/**
 * Заводит расцветки перчаток игрока.
 *   npx tsx scripts/glove-colours.ts            — показать, что изменится
 *   npx tsx scripts/glove-colours.ts --apply    — записать
 *
 * До этого у перчаток был только размер, а четыре расцветки существовали лишь
 * фотографиями в галерее. Из-за этого конструктор отказывался класть красные
 * перчатки в заявку: исполнения с таким цветом в каталоге не было.
 *
 * Расцветки опознаны по снимкам галереи и подтверждены заказчиком:
 * чёрные, красные, красно-чёрные, сине-чёрные.
 *
 * Цена от цвета не зависит — только от размера. Проверено по трём источникам:
 * карточка на старом сайте (цвета нет вовсе), прайс-лист производителя
 * (строки заданы размерами) и текущая база. Поэтому цены каждой расцветки
 * повторяют нынешние по размеру, включая обе оптовые ступени.
 *
 * Названия цветов — в том же стиле, что у шлема («Черный», а не «Чёрный»),
 * чтобы сопоставление цвета с исполнением работало одинаково у обоих товаров.
 */
import "dotenv/config";
import { db } from "../src/lib/db";
import { parseValues } from "../src/lib/catalog";

type Plan = {
  colours: string[];
  /** Цены по размеру: розница, опт 10%, опт 20%. Из прайс-листа производителя. */
  bySize: Record<string, [number, number, number]>;
  /** Какая фотография галереи показывает какую расцветку. */
  photos: Record<string, string>;
};

const PLANS: Record<string, Plan> = {
  perchatki: {
    colours: ["Черный", "Красный", "Красно-черный", "Сине-черный"],
    bySize: {
      "10,5": [3520, 3080, 2800],
      "11,5": [3520, 3080, 2800],
      "12,5": [4120, 3740, 3330],
      "13,5": [4730, 4290, 3850],
      "14,5": [4730, 4290, 3850],
    },
    photos: {
      "p9-4f8251a5": "Черный",
      "p9-b1a24abf": "Красный",
      "p9-8d3ad275": "Красно-черный",
      "p9-ce7d4da6": "Сине-черный",
      // На боевом сервере те же снимки загружены отдельно, поэтому у них свои id,
      // и лежат они в другом порядке галереи. Цвета опознаны по самим фотографиям,
      // а не по позиции. Лишние строки безвредны: файла нет — привязка не делается.
      "p9-e345a5e4": "Черный",
      "p9-8f6eba77": "Красный",
      "p9-b3854f7b": "Красно-черный",
      "p9-a0e9cc7b": "Сине-черный",
    },
  },
  // У CUBE расцветка одна — чёрно-красная, она же на всех одиннадцати снимках галереи.
  // Выбирать нечего, но цвет записывается, чтобы в заявке было видно, какие перчатки заказали.
  "perchatki-cube": {
    colours: ["Черно-красный"],
    bySize: {
      "10,5": [3620, 3180, 2900],
      "11,5": [3620, 3180, 2900],
      "12,5": [4220, 3840, 3430],
      "13,5": [4830, 4390, 3950],
      "14,5": [4830, 4390, 3950],
    },
    photos: {},
  },
};

async function run(SLUG: string, { colours: COLOURS, bySize: BY_SIZE, photos: PHOTOS }: Plan, apply: boolean) {
  const product = await db.product.findUnique({
    where: { slug: SLUG },
    include: { editions: { orderBy: { sort: "asc" } }, images: { orderBy: { sort: "asc" } } },
  });
  if (!product) throw new Error(`Товар ${SLUG} не найден`);

  const options = JSON.parse(product.options) as { name: string; values: string[] }[];
  if (options.some((o) => o.name === "Цвет")) {
    console.log(`${SLUG}: опция «Цвет» уже есть — пропускаю.`);
    return;
  }
  console.log(`\n=== ${SLUG} ===`);

  const sizes = options.find((o) => o.name === "Размер")?.values ?? [];
  const missing = sizes.filter((s) => !BY_SIZE[s]);
  if (missing.length) throw new Error(`Нет цен для размеров: ${missing.join(", ")}`);

  // Сверка: цены в базе должны совпасть с теми, что мы собираемся размножить по цветам.
  for (const e of product.editions) {
    const size = parseValues(e.values)["Размер"];
    const [retail] = BY_SIZE[size] ?? [];
    if (retail !== e.price) throw new Error(`Размер ${size}: в базе ${e.price} ₽, в правиле ${retail} ₽`);
  }

  // Цвет идёт первым, как у шлема.
  const nextOptions = [{ name: "Цвет", values: [...COLOURS] }, ...options];
  const nextEditions = COLOURS.flatMap((colour, ci) =>
    sizes.map((size, si) => {
      const [price, priceOpt1, priceOpt2] = BY_SIZE[size];
      return { values: JSON.stringify({ Цвет: colour, Размер: size }), price, priceOpt1, priceOpt2, sort: ci * 100 + si };
    }),
  );

  console.log(`Опция «Цвет»: ${COLOURS.join(", ")}`);
  console.log(`Исполнений: было ${product.editions.length}, станет ${nextEditions.length}`);
  for (const colour of COLOURS) {
    const line = sizes.map((s) => `${s} — ${BY_SIZE[s][0]} ₽`).join(", ");
    console.log(`  ${colour}: ${line}`);
  }
  console.log("Привязка фотографий:");
  for (const img of product.images) {
    const colour = PHOTOS[img.file];
    console.log(`  ${img.file} → ${colour ?? "— не трогаем —"}`);
  }
  if (!apply) return;

  await db.$transaction(async (tx) => {
    await tx.edition.deleteMany({ where: { productId: product.id } });
    await tx.edition.createMany({ data: nextEditions.map((e) => ({ ...e, productId: product.id })) });
    await tx.product.update({ where: { id: product.id }, data: { options: JSON.stringify(nextOptions) } });
    for (const [file, colour] of Object.entries(PHOTOS)) {
      await tx.productImage.updateMany({ where: { productId: product.id, file }, data: { optionValue: colour } });
    }
  });
  console.log("Записано.");
}

async function main() {
  const apply = process.argv.includes("--apply");
  for (const [slug, plan] of Object.entries(PLANS)) await run(slug, plan, apply);
  if (!apply) console.log("\nЭто предварительный показ. Для записи добавьте --apply");
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
