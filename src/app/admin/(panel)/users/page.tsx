import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteUser } from "../../actions";
import { ConfirmButton } from "../../ui";
import { PasswordForm, UserForm } from "./UserForms";
import s from "../../admin.module.css";

export const metadata: Metadata = { title: "Администраторы" };

export default async function UsersPage() {
  const session = await requireAdmin();
  const users = await db.adminUser.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <>
      <div className={s.head}>
        <h1>Администраторы</h1>
      </div>
      <div className={s.card}>
        <h2>Доступ</h2>
        {users.map((u) => (
          <div key={u.id} className={s.row} style={{ padding: "8px 0", borderTop: "1px solid var(--line)" }}>
            <b className="mono">{u.login}</b>
            {u.id === session.uid ? (
              <span className="muted">это вы</span>
            ) : (
              <form action={deleteUser} style={{ marginLeft: "auto" }}>
                <input type="hidden" name="id" value={u.id} />
                <ConfirmButton message={`Удалить администратора «${u.login}»?`} className={`${s.btn} ${s.btnSmall} ${s.btnDanger}`}>
                  Удалить
                </ConfirmButton>
              </form>
            )}
          </div>
        ))}
      </div>
      <div className={s.grid2} style={{ alignItems: "start" }}>
        <div className={s.card}>
          <h2>Сменить мой пароль</h2>
          <PasswordForm />
        </div>
        <div className={s.card}>
          <h2>Добавить администратора</h2>
          <UserForm />
        </div>
      </div>
    </>
  );
}
