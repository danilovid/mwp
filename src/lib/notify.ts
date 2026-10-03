import nodemailer from "nodemailer";
import type { Lead } from "@/generated/prisma/client";
import { db } from "./db";
import { formatPrice } from "./format";
import { getSettings } from "./settings";

export const LEAD_TYPES: Record<string, string> = {
  order: "Заказ с сайта",
  club: "Заявка для клуба",
  wholesale: "Оптовый запрос",
  tender: "Закупка или тендер",
};

export const LEAD_STATUSES: Record<string, string> = {
  new: "Новая",
  work: "В работе",
  done: "Выполнена",
  cancel: "Отменена",
};

type Item = { name: string; details?: string; qty: number; price?: number };

export function leadText(lead: Lead) {
  const items = JSON.parse(lead.items || "[]") as Item[];
  const lines = [
    `${LEAD_TYPES[lead.type] ?? lead.type} №${lead.id}`,
    "",
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    lead.email && `Почта: ${lead.email}`,
    lead.org && `Организация: ${lead.org}`,
    lead.address && `Адрес: ${lead.address}`,
    lead.comment && `Комментарий: ${lead.comment}`,
  ].filter((l) => l !== "" && l !== undefined && l !== null) as string[];
  if (items.length) {
    lines.push("", "Состав:");
    for (const i of items) {
      const price = i.price != null ? ` × ${formatPrice(i.price)} = ${formatPrice(i.price * i.qty)}` : "";
      lines.push(`• ${i.name}${i.details ? ` (${i.details})` : ""} — ${i.qty} шт.${price}`);
    }
  }
  if (lead.total) lines.push("", `Итого по рознице: ${formatPrice(lead.total)}`);
  return lines.join("\n");
}

async function sendEmail(lead: Lead, to: string) {
  const host = process.env.SMTP_HOST;
  if (!host || !to) return false;
  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  const site = process.env.SITE_URL ?? "";
  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    replyTo: lead.email || undefined,
    subject: `${LEAD_TYPES[lead.type] ?? "Заявка"} №${lead.id} — ${lead.name}`,
    text: leadText(lead) + (site ? `\n\nОткрыть в админке: ${site}/admin/leads/${lead.id}` : ""),
  });
  return true;
}

async function sendTelegram(lead: Lead, token: string, chatId: string) {
  if (!token || !chatId) return false;
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: leadText(lead), disable_web_page_preview: true }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Telegram ${res.status}: ${await res.text()}`);
  return true;
}

/** Рассылает уведомления о заявке и отмечает, куда удалось отправить. Ошибки только логируются. */
export async function notifyLead(lead: Lead) {
  const settings = await getSettings();
  const [mail, tg] = await Promise.allSettled([
    sendEmail(lead, settings.orderEmail),
    sendTelegram(lead, settings.telegramBotToken, settings.telegramChatId),
  ]);
  if (mail.status === "rejected") console.error("Письмо о заявке не отправлено:", mail.reason);
  if (tg.status === "rejected") console.error("Telegram: заявка не отправлена:", tg.reason);
  await db.lead.update({
    where: { id: lead.id },
    data: {
      emailSent: mail.status === "fulfilled" && mail.value,
      telegramSent: tg.status === "fulfilled" && tg.value,
    },
  });
}

/** Проверка настроек Telegram из админки. */
export async function sendTelegramTest(token: string, chatId: string) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: "MWP: проверка уведомлений о заявках ✅" }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(await res.text());
}
