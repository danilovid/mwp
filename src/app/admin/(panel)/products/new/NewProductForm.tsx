"use client";

import { useActionState } from "react";
import { createProduct } from "../../../actions";
import { Message, Submit } from "../../../ui";
import s from "../../../admin.module.css";

export function NewProductForm({ categories }: { categories: { id: number; name: string }[] }) {
  const [state, action] = useActionState(createProduct, null);
  return (
    <form action={action} className={s.card} style={{ maxWidth: 560 }}>
      <p className={s.cardHint} style={{ marginTop: 0 }}>
        Товар создаётся скрытым. После создания откроется страница, где можно добавить описание, размеры, цены и фото.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <label className="field">
          Название *
          <input name="name" required maxLength={200} placeholder="Например: Налокотники хоккейные" />
        </label>
        <label className="field">
          Раздел *
          <select name="categoryId" required defaultValue="">
            <option value="" disabled>
              Выберите раздел
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Линейка
          <select name="line" defaultValue="base">
            <option value="base">Базовая</option>
            <option value="cube">CUBE</option>
          </select>
        </label>
        <div className={s.row}>
          <Submit>Создать</Submit>
          <Message state={state} />
        </div>
      </div>
    </form>
  );
}
