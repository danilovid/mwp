"use client";

import { useActionState } from "react";
import { saveCategory } from "../../actions";
import { Message, Submit } from "../../ui";
import s from "../../admin.module.css";

export function CategoryForm({ category }: { category: { id: number; name: string; slug: string; sort: number } | null }) {
  const [state, action] = useActionState(saveCategory, null);
  return (
    <form action={action} className={s.row} style={{ alignItems: "flex-end" }}>
      {category && <input type="hidden" name="id" value={category.id} />}
      <label className="field" style={{ flex: "2 1 200px" }}>
        Название
        <input name="name" required defaultValue={category?.name} maxLength={80} />
      </label>
      <label className="field" style={{ flex: "1 1 140px" }}>
        Код (латиница)
        <input name="slug" defaultValue={category?.slug} maxLength={40} placeholder="авто" />
      </label>
      <label className="field" style={{ flex: "0 1 100px" }}>
        Порядок
        <input name="sort" type="number" defaultValue={category?.sort ?? 0} />
      </label>
      <Submit>{category ? "Сохранить" : "Добавить"}</Submit>
      <Message state={state} />
    </form>
  );
}
