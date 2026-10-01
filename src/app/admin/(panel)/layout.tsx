import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logoutAction } from "../actions";
import { AdminNav } from "./AdminNav";
import s from "../admin.module.css";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdmin();
  const newLeads = await db.lead.count({ where: { status: "new" } });
  return (
    <div className={s.shell}>
      <aside className={s.side}>
        <Link href="/admin/leads" className={s.brand}>
          <span className={s.brandBar} />
          MWP <small>админка</small>
        </Link>
        <AdminNav newLeads={newLeads} />
        <div className={s.sideFoot}>
          <a href="/" target="_blank" rel="noopener noreferrer">
            Открыть сайт ↗
          </a>
          <span>Вы вошли как {session.login}</span>
          <form action={logoutAction}>
            <button type="submit">Выйти</button>
          </form>
        </div>
      </aside>
      <div className={s.main}>{children}</div>
    </div>
  );
}
