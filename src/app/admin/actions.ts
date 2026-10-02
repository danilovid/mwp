"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { hashPassword, login, logout, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteProductImage } from "@/lib/images";
import { sendTelegramTest } from "@/lib/notify";
import { SETTING_DEFAULTS, type SettingKey } from "@/lib/settings";
import { slugify } from "@/lib/translit";

export type FormState = { ok?: boolean; error?: string; message?: string } | null;

/** Сбросить кэш витрины после изменений в каталоге или настройках. */
function revalidateSite() {
  revalidatePath("/", "layout");
}

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

/* ---------- Вход ---------- */

export async function loginAction(_prev: FormState, form: FormData): Promise<FormState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
  const res = await login(str(form.get("login")), String(form.get("password") ?? ""), ip);
  if ("error" in res) return { error: res.error };
  redirect("/admin/leads");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

/* ---------- Заявки ---------- */

export async function updateLead(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const status = str(form.get("status"));
  if (!["new", "work", "done", "cancel"].includes(status)) return;
  await db.lead.update({ where: { id }, data: { status, adminNote: str(form.get("adminNote")).slice(0, 5000) } });
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
}

export async function deleteLead(form: FormData) {
  await requireAdmin();
  await db.lead.delete({ where: { id: Number(form.get("id")) } });
  revalidatePath("/admin/leads");
  redirect("/admin/leads");
}

/* ---------- Товары ---------- */

async function uniqueSlug(base: string, exceptId?: number) {
  const root = base || "tovar";
  let slug = root;
  for (let i = 2; ; i++) {
    const found = await db.product.findUnique({ where: { slug } });
    if (!found || found.id === exceptId) return slug;
    slug = `${root}-${i}`;
  }
}

export async function createProduct(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const name = str(form.get("name"));
  const categoryId = Number(form.get("categoryId"));
  if (!name) return { error: "Укажите название" };
  if (!categoryId) return { error: "Выберите раздел" };
  const line = str(form.get("line")) === "cube" ? "cube" : "base";
  const max = await db.product.aggregate({ _max: { sort: true } });
  const product = await db.product.create({
    data: {
      name,
      slug: await uniqueSlug(slugify(name)),
      line,
      categoryId,
      published: false,
      sort: (max._max.sort ?? 0) + 1,
      editions: { create: [{ values: "{}", price: 0 }] },
    },
  });
  redirect(`/admin/products/${product.id}`);
}

const OptionSchema = z.array(
  z.object({ name: z.string().trim().min(1).max(60), values: z.array(z.string().trim().min(1).max(80)).min(1).max(60) }),
);
const EditionSchema = z.array(
  z.object({
    values: z.record(z.string(), z.string()),
    price: z.number().int().min(0).max(10_000_000),
    // Оптовые ступени необязательны: null — цены нет, на витрине «по запросу»
    priceOpt1: z.number().int().min(0).max(10_000_000).nullable().default(null),
    priceOpt2: z.number().int().min(0).max(10_000_000).nullable().default(null),
  }),
);

export async function saveProduct(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(form.get("id"));
  const name = str(form.get("name"));
  if (!name) return { error: "Укажите название" };

  let options, editions;
  try {
    options = OptionSchema.parse(JSON.parse(String(form.get("options") ?? "[]")));
    editions = EditionSchema.parse(JSON.parse(String(form.get("editions") ?? "[]")));
  } catch {
    return { error: "Проверьте опции и цены: у каждой опции должно быть название и хотя бы одно значение" };
  }
  if (!editions.length) return { error: "Нужен хотя бы один вариант с ценой" };
  if (editions.some((e) => e.price <= 0)) return { error: "У всех вариантов должна быть цена больше нуля" };

  const line = str(form.get("line")) === "cube" ? "cube" : "base";
  const baseIdRaw = Number(form.get("baseId"));
  const baseId = line === "cube" && baseIdRaw ? baseIdRaw : null;
  if (baseId) {
    const taken = await db.product.findFirst({ where: { baseId, NOT: { id } } });
    if (taken) return { error: `У выбранного базового товара уже есть CUBE-версия: «${taken.name}»` };
  }
  const kitRaw = str(form.get("kitSort"));
  const slug = await uniqueSlug(slugify(str(form.get("slug")) || name), id);

  await db.$transaction([
    db.product.update({
      where: { id },
      data: {
        name: name.slice(0, 200),
        slug,
        categoryId: Number(form.get("categoryId")),
        line,
        baseId,
        note: str(form.get("note")).slice(0, 300),
        description: str(form.get("description")).slice(0, 10000),
        published: form.get("published") === "on",
        sort: Number(form.get("sort")) || 0,
        kitSort: kitRaw ? Number(kitRaw) || null : null,
        ozonUrl: str(form.get("ozonUrl")).slice(0, 500),
        marketUrl: str(form.get("marketUrl")).slice(0, 500),
        options: JSON.stringify(options),
      },
    }),
    db.edition.deleteMany({ where: { productId: id } }),
    db.edition.createMany({
      data: editions.map((e, sort) => ({
        productId: id,
        values: JSON.stringify(e.values),
        price: e.price,
        priceOpt1: e.priceOpt1,
        priceOpt2: e.priceOpt2,
        sort,
      })),
    }),
  ]);
  revalidateSite();
  revalidatePath(`/admin/products/${id}`);
  return { ok: true, message: "Сохранено" };
}

export async function deleteProduct(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const images = await db.productImage.findMany({ where: { productId: id } });
  await Promise.all(images.map((i) => deleteProductImage(i.file)));
  await db.product.updateMany({ where: { baseId: id }, data: { baseId: null } });
  await db.product.delete({ where: { id } });
  revalidateSite();
  redirect("/admin/products");
}

export async function togglePublished(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const p = await db.product.findUniqueOrThrow({ where: { id } });
  await db.product.update({ where: { id }, data: { published: !p.published } });
  revalidateSite();
  revalidatePath("/admin/products");
}

/* ---------- Фото товара ---------- */

export async function deleteImage(form: FormData) {
  await requireAdmin();
  const img = await db.productImage.findUnique({ where: { id: Number(form.get("id")) } });
  if (!img) return;
  await db.productImage.delete({ where: { id: img.id } });
  await deleteProductImage(img.file);
  revalidateSite();
  revalidatePath(`/admin/products/${img.productId}`);
}

export async function moveImage(form: FormData) {
  await requireAdmin();
  const img = await db.productImage.findUnique({ where: { id: Number(form.get("id")) } });
  if (!img) return;
  const all = await db.productImage.findMany({ where: { productId: img.productId }, orderBy: { sort: "asc" } });
  const i = all.findIndex((x) => x.id === img.id);
  const j = form.get("dir") === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= all.length) return;
  [all[i], all[j]] = [all[j], all[i]];
  await db.$transaction(all.map((x, sort) => db.productImage.update({ where: { id: x.id }, data: { sort } })));
  revalidateSite();
  revalidatePath(`/admin/products/${img.productId}`);
}

export async function setImageOption(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const img = await db.productImage.update({ where: { id }, data: { optionValue: str(form.get("optionValue")).slice(0, 80) } });
  revalidateSite();
  revalidatePath(`/admin/products/${img.productId}`);
}

/* ---------- Разделы ---------- */

export async function saveCategory(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(form.get("id")) || null;
  const name = str(form.get("name"));
  if (!name) return { error: "Укажите название раздела" };
  const slug = slugify(str(form.get("slug")) || name);
  const clash = await db.category.findUnique({ where: { slug } });
  if (clash && clash.id !== id) return { error: "Раздел с таким адресом уже есть" };
  const data = { name: name.slice(0, 80), slug, sort: Number(form.get("sort")) || 0 };
  if (id) await db.category.update({ where: { id }, data });
  else await db.category.create({ data });
  revalidateSite();
  revalidatePath("/admin/categories");
  return { ok: true, message: id ? "Сохранено" : "Раздел добавлен" };
}

export async function deleteCategory(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const count = await db.product.count({ where: { categoryId: id } });
  if (count) return;
  await db.category.delete({ where: { id } });
  revalidateSite();
  revalidatePath("/admin/categories");
}

/* ---------- Настройки ---------- */

export async function saveSettings(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const keys = Object.keys(SETTING_DEFAULTS) as SettingKey[];
  const metrika = str(form.get("metrikaId"));
  if (metrika && !/^\d+$/.test(metrika)) return { error: "Номер счётчика Метрики — только цифры" };
  await db.$transaction(
    keys
      .filter((k) => form.has(k))
      .map((k) => {
        const value = str(form.get(k)).slice(0, 1000);
        return db.setting.upsert({ where: { key: k }, update: { value }, create: { key: k, value } });
      }),
  );
  revalidateSite();
  revalidatePath("/admin/settings");
  return { ok: true, message: "Настройки сохранены" };
}

export async function testTelegram(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const token = str(form.get("telegramBotToken"));
  const chat = str(form.get("telegramChatId"));
  if (!token || !chat) return { error: "Заполните токен бота и ID чата" };
  try {
    await sendTelegramTest(token, chat);
    return { ok: true, message: "Тестовое сообщение отправлено" };
  } catch (e) {
    return { error: "Telegram ответил ошибкой: " + (e instanceof Error ? e.message : String(e)).slice(0, 200) };
  }
}

/* ---------- Администраторы ---------- */

export async function createUser(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const loginName = str(form.get("login")).toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!/^[a-z0-9._-]{3,40}$/.test(loginName)) return { error: "Логин: 3–40 латинских букв, цифр, точек или дефисов" };
  if (password.length < 10) return { error: "Пароль — не короче 10 символов" };
  if (await db.adminUser.findUnique({ where: { login: loginName } })) return { error: "Такой логин уже есть" };
  await db.adminUser.create({ data: { login: loginName, passwordHash: await hashPassword(password) } });
  revalidatePath("/admin/users");
  return { ok: true, message: `Администратор «${loginName}» добавлен` };
}

export async function changePassword(_prev: FormState, form: FormData): Promise<FormState> {
  const session = await requireAdmin();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  const user = await db.adminUser.findUniqueOrThrow({ where: { id: session.uid } });
  if (!(await bcrypt.compare(current, user.passwordHash))) return { error: "Текущий пароль указан неверно" };
  if (next.length < 10) return { error: "Новый пароль — не короче 10 символов" };
  await db.adminUser.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next) } });
  return { ok: true, message: "Пароль изменён" };
}

export async function deleteUser(form: FormData) {
  const session = await requireAdmin();
  const id = Number(form.get("id"));
  if (id === session.uid) return;
  await db.adminUser.delete({ where: { id } });
  revalidatePath("/admin/users");
}
