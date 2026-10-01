import type { Metadata } from "next";
import { db } from "@/lib/db";
import { deleteCategory } from "../../actions";
import { ConfirmButton } from "../../ui";
import { CategoryForm } from "./CategoryForm";
import s from "../../admin.module.css";

export const metadata: Metadata = { title: "Разделы" };

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { sort: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return (
    <>
      <div className={s.head}>
        <h1>Разделы каталога</h1>
      </div>
      <p className="muted" style={{ marginTop: -8 }}>
        Разделы — это вкладки над каталогом на главной («Голова и шея», «Корпус»…). Удалить можно только пустой раздел.
      </p>
      {categories.map((c) => (
        <div key={c.id} className={s.card}>
          <CategoryForm category={{ id: c.id, name: c.name, slug: c.slug, sort: c.sort }} />
          <div className={s.row} style={{ marginTop: 10, fontSize: 13 }}>
            <span className="muted">Товаров: {c._count.products}</span>
            {c._count.products === 0 && (
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={c.id} />
                <ConfirmButton message={`Удалить раздел «${c.name}»?`} className={`${s.btn} ${s.btnSmall} ${s.btnDanger}`}>
                  Удалить
                </ConfirmButton>
              </form>
            )}
          </div>
        </div>
      ))}
      <div className={s.card}>
        <h2>Новый раздел</h2>
        <CategoryForm category={null} />
      </div>
    </>
  );
}
