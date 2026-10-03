import { db } from "./db";
import { parseValues, sizeShort } from "./catalog";
import { getPublicSettings } from "./settings";
import { buildXlsx, type Cell } from "./xlsx";

/**
 * Прайс-лист и бланк заказа одним файлом — как было на старом сайте, но собирается
 * из базы, поэтому не расходится с ценами на витрине. Покупатель проставляет количество,
 * итоги по трём ступеням считаются формулами.
 */

const S = { plain: 0, bold: 1, money: 2, moneyBold: 3, head: 4, group: 5, title: 6 } as const;
const t = (v: string, style?: number): Cell => ({ v, style });
const n = (num: number, style = S.money): Cell => ({ n: num, style });

export async function buildPriceList(): Promise<{ file: Buffer; name: string }> {
  const [settings, products] = await Promise.all([
    getPublicSettings(),
    db.product.findMany({
      where: { published: true },
      orderBy: [{ category: { sort: "asc" } }, { sort: "asc" }],
      include: { category: true, editions: { orderBy: { sort: "asc" } } },
    }),
  ]);

  const today = new Date();
  const rows: Cell[][] = [];
  const push = (...cells: Cell[]) => rows.push(cells);

  push(t(`ПРАЙС-ЛИСТ на хоккейную экипировку MWP`, S.title));
  push(t(`${settings.company} · производство в Чебоксарах`, S.bold));
  push(t(`Телефон: ${settings.phone1}, ${settings.phone2}${settings.messengers ? ` (${settings.messengers})` : ""}`));
  push(t(`Сайт: mwphockey.ru · Почта: ${settings.email1}, ${settings.email2}`));
  push(t(`Адрес: ${settings.address}`));
  push(t(`Цены действительны с ${today.toLocaleDateString("ru-RU")}`));
  push(null);
  push(t("Заполните контактные данные — так мы быстрее обработаем заказ:", S.bold));
  push(t("Организация:"), null, t("ИНН:"));
  push(t("ФИО контактного лица:"), null, t("Телефон:"));
  push(t("E-mail:"), null, t("Адрес доставки:"));
  push(null);

  const headRow = rows.length + 1;
  push(
    t("№", S.head),
    t("Наименование", S.head),
    t("Размер", S.head),
    t("Розница", S.head),
    t(`Опт от ${settings.optStep1}`, S.head),
    t(`Опт от ${settings.optStep2}`, S.head),
    t("Кол-во", S.head),
    t("Сумма (розн.)", S.head),
  );

  let first = 0; // строка первого товара — её узнаём, когда дойдём до него
  let num = 0;
  let group = "";
  let withoutOpt = 0;

  for (const p of products) {
    if (p.category.name !== group) {
      group = p.category.name;
      // Заливку ведём только по текстовым колонкам: в числовых пустые строки попали бы в диапазоны итогов
      push(t(group.toUpperCase(), S.group), t("", S.group), t("", S.group));
    }
    // Варианты одного размера с разными цветами стоят одинаково — в прайсе строка одна
    const bySize = new Map<string, { price: number; o1: number | null; o2: number | null }>();
    for (const e of p.editions) {
      const key = parseValues(e.values)["Размер"] ?? "";
      if (!bySize.has(key)) bySize.set(key, { price: e.price, o1: e.priceOpt1, o2: e.priceOpt2 });
    }
    for (const [size, v] of bySize) {
      num++;
      const r = rows.length + 1;
      if (!first) first = r;
      const noOpt = v.o1 == null;
      if (noOpt) withoutOpt++;
      push(
        { n: num },
        t(p.name + (noOpt ? " *" : "")),
        t(size ? sizeShort(size) + (size.includes("(") ? ` (${size.split("(")[1].replace(")", "")})` : "") : "—"),
        n(v.price),
        n(v.o1 ?? v.price),
        n(v.o2 ?? v.price),
        null,
        { f: `IF(G${r}="",0,G${r}*D${r})`, style: S.money },
      );
    }
  }
  const last = rows.length;

  push(null);
  push(null, t("ИТОГО по рознице", S.bold), null, null, null, null,
    { f: `SUM(G${first}:G${last})`, style: S.bold },
    { f: `SUMPRODUCT(G${first}:G${last},D${first}:D${last})`, style: S.moneyBold });
  push(null, t(`ИТОГО при заказе от ${settings.optStep1}`, S.bold), null, null, null, null, null,
    { f: `SUMPRODUCT(G${first}:G${last},E${first}:E${last})`, style: S.moneyBold });
  push(null, t(`ИТОГО при заказе от ${settings.optStep2}`, S.bold), null, null, null, null, null,
    { f: `SUMPRODUCT(G${first}:G${last},F${first}:F${last})`, style: S.moneyBold });

  push(null);
  if (withoutOpt) push(t("* Оптовая цена по позиции не установлена — в расчёт включена розничная, уточним при обработке заказа."));
  push(t("Цены указаны с учётом наличия товара на складе. Цены по предзаказу обсуждаются отдельно."));
  push(t("Производитель оставляет за собой право изменять цены в течение сезона."));
  push(t("Вратарская экипировка, клюшки, коньки и баулы — поставка под заказ, можем укомплектовать заявку целиком."));
  push(t(`Заполненный файл пришлите на ${settings.email1} — рассчитаем итоговую стоимость и сроки.`));

  const file = buildXlsx({
    sheetName: "Прайс и заказ",
    freezeRow: headRow,
    cols: [{ width: 5 }, { width: 46 }, { width: 22 }, { width: 13 }, { width: 16 }, { width: 17 }, { width: 9 }, { width: 15 }],
    rows,
  });
  return { file, name: `Прайс и заказ MWP ${today.toLocaleDateString("ru-RU").replace(/\./g, "-")}.xlsx` };
}
