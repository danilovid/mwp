import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { LEAD_STATUSES, LEAD_TYPES } from "@/lib/notify";
import s from "../../admin.module.css";

export const metadata: Metadata = { title: "Заявки" };

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Moscow",
});

export default async function LeadsPage(props: PageProps<"/admin/leads">) {
  const sp = await props.searchParams;
  const status = typeof sp.status === "string" && sp.status in LEAD_STATUSES ? sp.status : undefined;
  const type = typeof sp.type === "string" && sp.type in LEAD_TYPES ? sp.type : undefined;
  const leads = await db.lead.findMany({
    where: { status, type },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  const counts = await db.lead.groupBy({ by: ["status"], _count: true });
  const countOf = (st: string) => counts.find((c) => c.status === st)?._count ?? 0;

  const href = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const next = { status, type, ...patch };
    for (const [k, v] of Object.entries(next)) if (v) q.set(k, v);
    const str = q.toString();
    return `/admin/leads${str ? `?${str}` : ""}`;
  };

  return (
    <>
      <div className={s.head}>
        <h1>Заявки</h1>
      </div>
      <div className={s.filters}>
        <Link href={href({ status: undefined })} className={s.chip} aria-current={!status}>
          Все
        </Link>
        {Object.entries(LEAD_STATUSES).map(([k, label]) => (
          <Link key={k} href={href({ status: k })} className={s.chip} aria-current={status === k}>
            {label} {countOf(k) > 0 && <span className="muted">{countOf(k)}</span>}
          </Link>
        ))}
        <span style={{ width: 16 }} />
        <Link href={href({ type: undefined })} className={s.chip} aria-current={!type}>
          Любой тип
        </Link>
        {Object.entries(LEAD_TYPES).map(([k, label]) => (
          <Link key={k} href={href({ type: k })} className={s.chip} aria-current={type === k}>
            {label}
          </Link>
        ))}
      </div>

      {leads.length === 0 ? (
        <div className={s.card}>Заявок пока нет.</div>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>№</th>
                <th>Дата</th>
                <th>Тип</th>
                <th>Клиент</th>
                <th>Телефон</th>
                <th>Сумма</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td>
                    <Link href={`/admin/leads/${l.id}`} style={{ fontWeight: 700 }}>
                      {l.id}
                    </Link>
                  </td>
                  <td className="mono" style={{ whiteSpace: "nowrap" }}>
                    {dateFmt.format(l.createdAt)}
                  </td>
                  <td>{LEAD_TYPES[l.type] ?? l.type}</td>
                  <td>
                    <Link href={`/admin/leads/${l.id}`} style={{ color: "var(--ink)", fontWeight: 600 }}>
                      {l.name}
                    </Link>
                    {l.org && <div className="muted" style={{ fontSize: 12 }}>{l.org}</div>}
                  </td>
                  <td className="mono" style={{ whiteSpace: "nowrap" }}>
                    <a href={`tel:${l.phone.replace(/[^\d+]/g, "")}`}>{l.phone}</a>
                  </td>
                  <td className="mono" style={{ whiteSpace: "nowrap" }}>
                    {l.total ? formatPrice(l.total) : "—"}
                  </td>
                  <td>
                    <span className={`${s.status} ${s[`status_${l.status}`]}`}>{LEAD_STATUSES[l.status] ?? l.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
