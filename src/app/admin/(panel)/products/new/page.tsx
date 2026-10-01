import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { NewProductForm } from "./NewProductForm";
import s from "../../../admin.module.css";

export const metadata: Metadata = { title: "Новый товар" };

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { sort: "asc" } });
  return (
    <>
      <div className={s.head}>
        <div>
          <Link href="/admin/products" className="muted" style={{ fontSize: 13 }}>
            ← Товары
          </Link>
          <h1>Новый товар</h1>
        </div>
      </div>
      <NewProductForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </>
  );
}
