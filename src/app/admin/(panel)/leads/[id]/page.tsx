import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { LEAD_STATUSES, LEAD_TYPES } from "@/lib/notify";
import { deleteLead, updateLead } from "../../../actions";
import { ConfirmButton, Submit } from "../../../ui";
import s from "../../../admin.module.css";

export const metadata: Metadata = { title: "Заявка" };

type Item = { name: string; details?: string; qty: number; price?: number };

export default async function LeadPage(props: PageProps<"/admin/leads/[id]">) {
  const { id } = await props.params;
  const lead = await db.lead.findUnique({ where: { id: Number(id) } });
  if (!lead) notFound();
  const items = JSON.parse(lead.items || "[]") as Item[];
  const date = new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(lead.createdAt);

  return (
    <>
      <div className={s.head}>
        <div>
          <Link href="/admin/leads" className="muted" style={{ fontSize: 13 }}>
            ← Все заявки
          </Link>
          <h1>
            {LEAD_TYPES[lead.type] ?? lead.type} №{lead.id}
          </h1>
          <span className="muted">{date} (МСК)</span>
        </div>
        <span className={`${s.status} ${s[`status_${lead.status}`]}`}>{LEAD_STATUSES[lead.status]}</span>
      </div>

      <div className={s.grid2} style={{ alignItems: "start" }}>
        <div className={s.card}>
          <h2>Клиент</h2>
          <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "130px 1fr", gap: "6px 12px", fontSize: 14 }}>
            <dt className="muted">Имя</dt>
            <dd style={{ margin: 0, fontWeight: 700 }}>{lead.name}</dd>
            <dt className="muted">Телефон</dt>
            <dd style={{ margin: 0 }} className="mono">
              <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}>{lead.phone}</a>
            </dd>
            {lead.email && (
              <>
                <dt className="muted">Почта</dt>
                <dd style={{ margin: 0 }} className="mono">
                  <a href={`mailto:${lead.email}`}>{lead.email}</a>
                </dd>
              </>
            )}
            {lead.org && (
              <>
                <dt className="muted">Организация</dt>
                <dd style={{ margin: 0 }}>{lead.org}</dd>
              </>
            )}
            {lead.address && (
              <>
                <dt className="muted">Адрес</dt>
                <dd style={{ margin: 0 }}>{lead.address}</dd>
              </>
            )}
            {lead.comment && (
              <>
                <dt className="muted">Комментарий</dt>
                <dd style={{ margin: 0 }}>
                  <p className={s.pre}>{lead.comment}</p>
                </dd>
              </>
            )}
            <dt className="muted">Уведомления</dt>
            <dd style={{ margin: 0, fontSize: 13 }}>
              Почта: {lead.emailSent ? "отправлено" : "не отправлено"} · Telegram:{" "}
              {lead.telegramSent ? "отправлено" : "не отправлено"}
            </dd>
          </dl>
        </div>

        <form action={updateLead} className={s.card}>
          <h2>Обработка</h2>
          <input type="hidden" name="id" value={lead.id} />
          <label className="field" style={{ marginBottom: 12 }}>
            Статус
            <select name="status" defaultValue={lead.status}>
              {Object.entries(LEAD_STATUSES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="field" style={{ marginBottom: 12 }}>
            Заметка менеджера
            <textarea name="adminNote" defaultValue={lead.adminNote} placeholder="Видна только в админке" />
          </label>
          <Submit>Сохранить</Submit>
        </form>
      </div>

      {items.length > 0 && (
        <div className={s.card}>
          <h2>Состав</h2>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Позиция</th>
                  <th>Кол-во</th>
                  <th>Цена</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i, n) => (
                  <tr key={n}>
                    <td>
                      <b>{i.name}</b>
                      {i.details && <div className="muted" style={{ fontSize: 12 }}>{i.details}</div>}
                    </td>
                    <td className="mono">{i.qty}</td>
                    <td className="mono">{i.price != null ? formatPrice(i.price) : "—"}</td>
                    <td className="mono">{i.price != null ? formatPrice(i.price * i.qty) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {lead.total ? (
            <p style={{ textAlign: "right", fontSize: 18, margin: "12px 0 0" }}>
              Итого по рознице: <b className="mono">{formatPrice(lead.total)}</b>
            </p>
          ) : null}
        </div>
      )}

      <form action={deleteLead}>
        <input type="hidden" name="id" value={lead.id} />
        <ConfirmButton message="Удалить заявку без возможности восстановления?">Удалить заявку</ConfirmButton>
      </form>
    </>
  );
}
