import { revalidatePath } from "next/cache";
import { adminOrNull } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveProductImage } from "@/lib/images";

const MAX_FILES = 20;
const MAX_SIZE = 20 * 1024 * 1024;

/** Загрузка фото товара: обрабатываются через sharp в WebP двух размеров. */
export async function POST(req: Request) {
  if (!(await adminOrNull())) return Response.json({ error: "Нужно войти в админку" }, { status: 401 });

  const form = await req.formData();
  const productId = Number(form.get("productId"));
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return Response.json({ error: "Товар не найден" }, { status: 404 });

  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return Response.json({ error: "Выберите файлы" }, { status: 400 });
  if (files.length > MAX_FILES) return Response.json({ error: `Не больше ${MAX_FILES} файлов за раз` }, { status: 400 });

  const last = await db.productImage.aggregate({ where: { productId }, _max: { sort: true } });
  let sort = (last._max.sort ?? -1) + 1;
  const errors: string[] = [];
  for (const f of files) {
    if (!f.type.startsWith("image/")) {
      errors.push(`${f.name}: не изображение`);
      continue;
    }
    if (f.size > MAX_SIZE) {
      errors.push(`${f.name}: больше 20 МБ`);
      continue;
    }
    try {
      const file = await saveProductImage(Buffer.from(await f.arrayBuffer()), `p${productId}`);
      await db.productImage.create({ data: { productId, file, sort: sort++ } });
    } catch {
      errors.push(`${f.name}: не удалось обработать`);
    }
  }
  revalidatePath("/", "layout");
  return Response.json({ ok: true, errors });
}
