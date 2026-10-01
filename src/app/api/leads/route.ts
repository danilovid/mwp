import { z } from "zod";
import { db } from "@/lib/db";
import { parseValues } from "@/lib/catalog";
import { notifyLead } from "@/lib/notify";

const Item = z.object({
  name: z.string().trim().min(1).max(300),
  details: z.string().max(1000).optional(),
  qty: z.number().int().min(1).max(9999),
  price: z.number().int().min(0).max(10_000_000).optional(),
  productId: z.number().int().optional(),
  values: z.record(z.string(), z.string()).optional(),
});

const Body = z.object({
  type: z.enum(["order", "club", "wholesale"]),
  name: z.string().trim().min(1, "Укажите имя").max(120),
  phone: z
    .string()
    .trim()
    .max(40)
    .refine((v) => v.replace(/\D/g, "").length >= 6, "Укажите телефон"),
  email: z.union([z.literal(""), z.email("Проверьте адрес почты").max(120)]).default(""),
  org: z.string().trim().max(200).default(""),
  address: z.string().trim().max(300).default(""),
  comment: z.string().trim().max(3000).default(""),
  website: z.string().max(0).optional().or(z.literal("")),
  items: z.array(Item).max(100).default([]),
  total: z.number().int().min(0).nullable().optional(),
});

/** Простое ограничение частоты: не больше 5 заявок за 10 минут с одного адреса. */
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  if (limited(ip)) return Response.json({ error: "Слишком много заявок. Попробуйте позже или позвоните нам." }, { status: 429 });

  const raw = await req.json().catch(() => null);
  const parsed = Body.safeParse(
    raw && typeof raw === "object"
      ? Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v === null && k !== "total" ? undefined : v]))
      : raw,
  );
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Проверьте поля формы" }, { status: 400 });
  }
  const data = parsed.data;
  // Ловушка заполнена — делаем вид, что всё хорошо
  if (data.website) return Response.json({ ok: true });

  let items = data.items;
  let total = data.total ?? null;

  // Цены заказа из корзины пересчитываем по базе
  if (data.type === "order") {
    const checked = [];
    for (const it of items) {
      if (!it.productId) continue;
      const product = await db.product.findUnique({ where: { id: it.productId }, include: { editions: true } });
      if (!product) continue;
      const wanted = JSON.stringify(it.values ?? {});
      const edition =
        product.editions.find((e) => JSON.stringify(parseValues(e.values)) === wanted) ?? product.editions[0];
      checked.push({ ...it, name: product.name, price: edition?.price ?? it.price });
    }
    if (!checked.length) return Response.json({ error: "Корзина пуста" }, { status: 400 });
    items = checked;
    total = checked.reduce((a, i) => a + (i.price ?? 0) * i.qty, 0);
  }

  const lead = await db.lead.create({
    data: {
      type: data.type,
      name: data.name,
      phone: data.phone,
      email: data.email,
      org: data.org,
      address: data.address,
      comment: data.comment,
      items: JSON.stringify(
        items.map(({ name, details, qty, price, values }) => ({
          name,
          details: details ?? (values ? Object.entries(values).map(([k, v]) => `${k}: ${v}`).join(", ") : undefined),
          qty,
          price,
        })),
      ),
      total,
    },
  });

  await notifyLead(lead);
  return Response.json({ ok: true, id: lead.id });
}
