/**
 * Проставляет оптовые цены по ступеням из прайс-листа производителя.
 *   npm run import:prices             — показать, что изменится
 *   npm run import:prices -- --apply  — записать оптовые цены
 *   npm run import:prices -- --retail --apply — заодно выровнять розницу по прайсу
 *
 * По умолчанию розница не трогается: она пришла со старого сайта и местами расходится с прайсом.
 * Флаг --retail делает прайс источником истины и для неё.
 *
 * Источник: materials/docs/price-mwp.xlsx («!Прайс и заказ MWP», цены действительны с 01.11.2025).
 * В файле три колонки: «Цена на сайте» (розница), «Опт 10% (от 30 000 руб)» и «Опт 20% (от 100 000 руб)».
 *
 * Сопоставление задано явно, а не выводится из названий, по трём причинам:
 *  - одна строка прайса покрывает несколько размеров («р-р 2, 3»);
 *  - у части товаров размеры умножены на цвета, и правило должно применяться ко всем вариантам размера;
 *  - строк линейки CUBE в прайсе нет вовсе, поэтому для неё оптовых цен не существует.
 *
 * Для линейки CUBE в прайсе строк нет. По решению заказчика её оптовые цены считаются от базовой версии
 * с той же наценкой, что и в рознице: CUBE = база + (розница CUBE − розница базы). У пяти товаров эта
 * наценка 100 ₽, у защиты шеи — 60 ₽, поэтому берётся фактическая разница, а не фиксированные 100.
 *
 * retail в правиле — розничная цена из прайса. Она не пишется в базу, а служит проверкой:
 * если в базе другая цена, значит строка сопоставлена не с тем товаром либо прайс разошёлся с сайтом.
 */
import "dotenv/config";
import { db } from "../src/lib/db";
import { parseValues } from "../src/lib/catalog";

/** sizes: "all" — правило на все варианты товара */
type Rule = { sizes: string[] | "all"; retail: number; opt1: number; opt2: number };

const MAP: Record<string, { source: string; rules: Rule[] }> = {
  shlem: {
    source: "Шлем игрока (S, M, L)",
    rules: [{ sizes: "all", retail: 2040, opt1: 1850, opt2: 1800 }],
  },
  "shlem-s-maskoj": {
    source: "Шлем игрока с маской (S, M, L)",
    rules: [{ sizes: "all", retail: 2970, opt1: 2750, opt2: 2420 }],
  },
  maska: {
    source: "Маска игрока",
    rules: [{ sizes: "all", retail: 980, opt1: 890, opt2: 800 }],
  },
  nagrudnik: {
    source: "Нагрудник игрока 111",
    rules: [
      { sizes: ["1 (рост 110-120)"], retail: 2750, opt1: 2450, opt2: 2220 },
      { sizes: ["2 (рост 120-135)", "3 (рост 135-145)"], retail: 3080, opt1: 2750, opt2: 2530 },
      { sizes: ["4 (рост 145-165)"], retail: 3410, opt1: 3080, opt2: 2750 },
      { sizes: ["5 (рост 165-175)", "6 (рост 175-190)"], retail: 3960, opt1: 3520, opt2: 3190 },
      { sizes: ["7 (рост 180-195+объем)"], retail: 4280, opt1: 3850, opt2: 3470 },
    ],
  },
  nalokotniki: {
    source: "Налокотники игрока 111",
    rules: [
      { sizes: ["1 (рост 110-120)"], retail: 1320, opt1: 1180, opt2: 1070 },
      { sizes: ["2 (рост 120-135)", "3 (рост 135-145)"], retail: 1485, opt1: 1320, opt2: 1210 },
      { sizes: ["4 (рост 145-165)"], retail: 1650, opt1: 1485, opt2: 1320 },
      { sizes: ["5 (рост 165-175)", "6 (рост 175-190)"], retail: 1800, opt1: 1630, opt2: 1480 },
    ],
  },
  shchitki: {
    source: "Щитки игрока 111",
    rules: [
      { sizes: ["8 (рост 100-110)", "9 (рост 110-120)"], retail: 2310, opt1: 2110, opt2: 1915 },
      { sizes: ["10 (рост 120-135)", "11 (рост 135-145)"], retail: 2600, opt1: 2370, opt2: 2150 },
      { sizes: ["12 (рост 145-155)", "13 (рост 155-165)"], retail: 3090, opt1: 2800, opt2: 2560 },
      { sizes: ["14 (рост 165-175)", "15 (рост 175-185)", "16 (рост 185-190)"], retail: 3400, opt1: 3110, opt2: 2830 },
    ],
  },
  perchatki: {
    source: "Перчатки 111",
    rules: [
      { sizes: ["10,5", "11,5"], retail: 3520, opt1: 3080, opt2: 2800 },
      { sizes: ["12,5"], retail: 4120, opt1: 3740, opt2: 3330 },
      { sizes: ["13,5", "14,5"], retail: 4730, opt1: 4290, opt2: 3850 },
    ],
  },
  shorty: {
    source: "Шорты игрока 111",
    rules: [
      { sizes: ["34", "36", "38"], retail: 2920, opt1: 2620, opt2: 2360 },
      { sizes: ["40", "42"], retail: 3260, opt1: 2910, opt2: 2640 },
      { sizes: ["44", "46"], retail: 3400, opt1: 3080, opt2: 2780 },
      { sizes: ["48", "50"], retail: 3940, opt1: 3540, opt2: 3200 },
      { sizes: ["52", "54"], retail: 4100, opt1: 3690, opt2: 3320 },
    ],
  },
  "zashchita-paha": {
    source: "Раковина игрока",
    rules: [{ sizes: "all", retail: 590, opt1: 530, opt2: 480 }],
  },
  "zashchita-shei": {
    source: "Протектор шеи",
    rules: [{ sizes: "all", retail: 590, opt1: 530, opt2: 480 }],
  },
  podtyazhki: {
    source: "Подтяжки юн. / взр",
    rules: [{ sizes: "all", retail: 660, opt1: 600, opt2: 540 }],
  },
  "shlem-vratarya": {
    source: "Шлем вратаря с маской КГ",
    rules: [{ sizes: "all", retail: 7560, opt1: 6850, opt2: 6200 }],
  },
  "shorty-vratarya": {
    source: "Шорты вратаря 111",
    rules: [
      { sizes: ["38", "40"], retail: 4200, opt1: 3850, opt2: 3410 },
      { sizes: ["42", "44", "46", "48"], retail: 5370, opt1: 4840, opt2: 4360 },
      { sizes: ["50", "52", "54"], retail: 5870, opt1: 5280, opt2: 4770 },
    ],
  },
};

async function main() {
  const apply = process.argv.includes("--apply");
  const alignRetail = process.argv.includes("--retail");
  const retailUpdates: { id: number; price: number }[] = [];
  const products = await db.product.findMany({ include: { editions: true } });
  const updates: { id: number; opt1: number; opt2: number }[] = [];
  const warnings: string[] = [];
  let touched = 0;

  for (const [slug, { source, rules }] of Object.entries(MAP)) {
    const p = products.find((x) => x.slug === slug);
    if (!p) {
      warnings.push(`нет товара ${slug} (строка прайса «${source}»)`);
      continue;
    }
    const covered = new Set<number>();
    for (const rule of rules) {
      const hits = p.editions.filter((e) => {
        const size = parseValues(e.values)["Размер"];
        return rule.sizes === "all" ? true : size != null && rule.sizes.includes(size);
      });
      if (!hits.length) {
        warnings.push(`${slug}: правило на размеры ${JSON.stringify(rule.sizes)} ничего не нашло`);
        continue;
      }
      for (const e of hits) {
        covered.add(e.id);
        if (e.price !== rule.retail) {
          const size = parseValues(e.values)["Размер"] ?? "—";
          if (alignRetail) {
            retailUpdates.push({ id: e.id, price: rule.retail });
            console.log(`  розница ${slug} / ${size}: ${e.price} → ${rule.retail}`);
            // правим и в памяти: ниже от этой цены считается наценка CUBE
            e.price = rule.retail;
          } else {
            warnings.push(`${slug} / ${size}: розница в базе ${e.price}, в прайсе ${rule.retail}`);
          }
        }
        if (e.priceOpt1 !== rule.opt1 || e.priceOpt2 !== rule.opt2) {
          updates.push({ id: e.id, opt1: rule.opt1, opt2: rule.opt2 });
        }
      }
    }
    const missed = p.editions.filter((e) => !covered.has(e.id));
    if (missed.length) warnings.push(`${slug}: без оптовой цены осталось вариантов — ${missed.length}`);
    touched++;
  }

  // CUBE: цены выводим от базовой версии с её розничной наценкой
  const keyOf = (json: string) => {
    const v = parseValues(json);
    return Object.keys(v)
      .sort()
      .map((k) => `${k}=${v[k]}`)
      .join("|");
  };
  const derived: string[] = [];
  for (const cube of products.filter((p) => p.line === "cube")) {
    if (!cube.baseId) {
      warnings.push(`${cube.slug}: нет базовой версии, оптовую цену вывести не из чего`);
      continue;
    }
    const base = products.find((p) => p.id === cube.baseId);
    if (!base) continue;
    const byKey = new Map(base.editions.map((e) => [keyOf(e.values), e]));
    const deltas = new Set<number>();
    let n = 0;
    for (const e of cube.editions) {
      const b = byKey.get(keyOf(e.values));
      if (!b) {
        warnings.push(`${cube.slug}: варианту ${keyOf(e.values) || "—"} не нашлось пары в базовой версии`);
        continue;
      }
      if (b.priceOpt1 == null || b.priceOpt2 == null) continue;
      const delta = e.price - b.price;
      deltas.add(delta);
      const opt1 = b.priceOpt1 + delta;
      const opt2 = b.priceOpt2 + delta;
      if (e.priceOpt1 !== opt1 || e.priceOpt2 !== opt2) updates.push({ id: e.id, opt1, opt2 });
      n++;
    }
    if (n) derived.push(`${cube.slug}: ${n} вариантов, наценка ${[...deltas].join("/")} ₽`);
    if (deltas.size > 1) warnings.push(`${cube.slug}: наценка не одинаковая по размерам — ${[...deltas].join(", ")} ₽`);
  }
  if (derived.length) {
    console.log("\nCUBE выведен от базовой линейки:");
    for (const d of derived) console.log("  •", d);
  }

  const noPrices = products.filter((p) => !(p.slug in MAP));
  console.log(`\nТоваров из прайса: ${touched}.`);
  console.log(
    "Нет ни в прайсе, ни в CUBE:",
    noPrices.filter((p) => p.line !== "cube").map((p) => p.slug).join(", ") || "—",
  );
  if (warnings.length) {
    console.log("\nПредупреждения:");
    for (const w of warnings) console.log("  •", w);
  }
  console.log(`\nВариантов к обновлению: ${updates.length}` + (alignRetail ? `, розничных цен: ${retailUpdates.length}` : ""));

  if (!apply) {
    console.log("Это предпросмотр. Чтобы записать, запустите с --apply");
    return;
  }
  for (const u of retailUpdates) {
    await db.edition.update({ where: { id: u.id }, data: { price: u.price } });
  }
  for (const u of updates) {
    await db.edition.update({ where: { id: u.id }, data: { priceOpt1: u.opt1, priceOpt2: u.opt2 } });
  }
  console.log(`Записано: оптовых ${updates.length}` + (alignRetail ? `, розничных ${retailUpdates.length}` : ""));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
