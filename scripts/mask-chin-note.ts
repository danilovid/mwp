/**
 * Подписывает, что защита подбородка входит в маску для шлема.
 *   npx tsx scripts/mask-chin-note.ts            — показать, что изменится
 *   npx tsx scripts/mask-chin-note.ts --apply    — записать
 *
 * Факт взят из описания «Шлема хоккейного с маской» на старом сайте:
 * «Маска обеспечивает высокую степень защиты и имеет подвижную защиту подбородка».
 * На фотографиях это видно: в маске (p3-2628ce92) стоит та же чёрная чашка,
 * что продаётся отдельной позицией за 490 ₽ (p4-f850fc6b).
 *
 * Без подписи покупатель берёт обе позиции и платит за чашку дважды.
 * Поле note выбрано потому, что оно и так показывается на карточке товара,
 * в каталоге, в прайс-листе и в конструкторе — одной записи хватает на все четыре
 * места. В проекте оно уже используется так же: у резинок для щитков там
 * «2 штуки в комплекте».
 *
 * Отдельную защиту из продажи не убираем: её берут на замену и на шлем без маски.
 */
import "dotenv/config";
import { db } from "../src/lib/db";

const NOTES: Record<string, string> = {
  maska: "Защита подбородка в комплекте",
  "zashchita-podborodka": "На замену — в маске для шлема уже есть",
};

async function main() {
  const apply = process.argv.includes("--apply");
  for (const [slug, note] of Object.entries(NOTES)) {
    const product = await db.product.findUnique({ where: { slug }, select: { id: true, name: true, note: true } });
    if (!product) throw new Error(`Товар ${slug} не найден`);
    if (product.note === note) {
      console.log(`${slug}: подпись уже стоит — пропускаю.`);
      continue;
    }
    console.log(`${product.name}\n  было:  ${product.note || "— пусто —"}\n  станет: ${note}`);
    if (apply) await db.product.update({ where: { id: product.id }, data: { note } });
  }
  console.log(apply ? "\nЗаписано." : "\nЭто предварительный показ. Для записи добавьте --apply");
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
