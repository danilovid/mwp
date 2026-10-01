import type { Metadata } from "next";
import Link from "next/link";
import { ProductImg } from "@/components/ProductImg";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { togglePublished } from "../../actions";
import s from "../../admin.module.css";

export const metadata: Metadata = { title: "Товары" };

export default async function ProductsPage() {
  const categories = await db.category.findMany({
    orderBy: { sort: "asc" },
    include: {
      products: {
        orderBy: { sort: "asc" },
        include: { images: { orderBy: { sort: "asc" }, take: 1 }, editions: true, base: true, cube: true },
      },
    },
  });

  return (
    <>
      <div className={s.head}>
        <h1>Товары</h1>
        <Link href="/admin/products/new" className={`${s.btn} ${s.btnPrimary}`}>
          + Добавить товар
        </Link>
      </div>
      {categories.map((c) => (
        <div key={c.id} className={s.card} style={{ padding: 0, overflow: "hidden" }}>
          <h2 style={{ padding: "16px 20px 0" }}>
            {c.name} <span className="muted" style={{ fontWeight: 500 }}>{c.products.length}</span>
          </h2>
          {c.products.length === 0 ? (
            <p className="muted" style={{ padding: "0 20px 16px", margin: 0 }}>
              В разделе нет товаров.
            </p>
          ) : (
            <div className={s.tableWrap} style={{ borderRadius: 0 }}>
              <table className={s.table} style={{ border: 0, borderRadius: 0 }}>
                <thead>
                  <tr>
                    <th />
                    <th>Название</th>
                    <th>Линейка</th>
                    <th>Цена</th>
                    <th>Комплект</th>
                    <th>На сайте</th>
                  </tr>
                </thead>
                <tbody>
                  {c.products.map((p) => {
                    const prices = p.editions.map((e) => e.price);
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    return (
                      <tr key={p.id}>
                        <td style={{ width: 56 }}>
                          <Link href={`/admin/products/${p.id}`} className={`${s.thumb} photoBg`}>
                            <ProductImg file={p.images[0]?.file ?? null} alt="" sizes="40px" />
                          </Link>
                        </td>
                        <td>
                          <Link href={`/admin/products/${p.id}`} style={{ fontWeight: 700, color: "var(--ink)" }}>
                            {p.name}
                          </Link>
                          <div className="muted mono" style={{ fontSize: 12 }}>
                            /catalog/{p.slug}
                          </div>
                        </td>
                        <td style={{ fontSize: 13 }}>
                          {p.line === "cube" ? <b className="cubeWord">CUBE</b> : "Базовая"}
                          {p.base && <div className="muted">к «{p.base.name}»</div>}
                          {p.cube && <div className="muted">есть CUBE</div>}
                        </td>
                        <td className="mono" style={{ whiteSpace: "nowrap" }}>
                          {prices.length ? (min === max ? formatPrice(min) : `${min.toLocaleString("ru-RU")}–${formatPrice(max)}`) : "—"}
                        </td>
                        <td className="mono">{p.kitSort ?? "—"}</td>
                        <td>
                          <form action={togglePublished}>
                            <input type="hidden" name="id" value={p.id} />
                            <button type="submit" className={`${s.btn} ${s.btnSmall}`} title="Переключить">
                              {p.published ? "✓ Показан" : "Скрыт"}
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
