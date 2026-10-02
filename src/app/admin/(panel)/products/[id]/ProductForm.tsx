"use client";

import { useActionState, useMemo, useState } from "react";
import type { ProductOption } from "@/lib/catalog";
import { saveProduct } from "../../../actions";
import { Message, Submit } from "../../../ui";
import s from "../../../admin.module.css";

type Edition = { values: Record<string, string>; price: number; priceOpt1: number | null; priceOpt2: number | null };
type ProductData = {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  line: string;
  baseId: number | null;
  note: string;
  description: string;
  published: boolean;
  sort: number;
  kitSort: number | null;
  ozonUrl: string;
  marketUrl: string;
  options: ProductOption[];
  editions: Edition[];
};

type OptionDraft = { name: string; text: string };

const keyOf = (values: Record<string, string>, names: string[]) => names.map((n) => values[n] ?? "").join("\u0001");

function combos(options: ProductOption[]): Record<string, string>[] {
  return options.reduce<Record<string, string>[]>(
    (acc, o) => acc.flatMap((c) => o.values.map((v) => ({ ...c, [o.name]: v }))),
    [{}],
  );
}

export function ProductForm({
  product,
  categories,
  baseCandidates,
}: {
  product: ProductData;
  categories: { id: number; name: string }[];
  baseCandidates: { id: number; name: string }[];
}) {
  const [state, action] = useActionState(saveProduct, null);
  const [line, setLine] = useState(product.line);
  const [drafts, setDrafts] = useState<OptionDraft[]>(
    product.options.map((o) => ({ name: o.name, text: o.values.join("\n") })),
  );
  // Цены храним по ключу сочетания значений — при правке опций уже введённые цены не теряются
  const [prices, setPrices] = useState<Record<string, string>>(() => {
    const names = product.options.map((o) => o.name);
    return Object.fromEntries(product.editions.map((e) => [keyOf(e.values, names), String(e.price)]));
  });
  // Оптовые ступени. Пустое поле — цены нет, на сайте показывается «по запросу»
  const [opt1, setOpt1] = useState<Record<string, string>>(() => {
    const names = product.options.map((o) => o.name);
    return Object.fromEntries(product.editions.map((e) => [keyOf(e.values, names), e.priceOpt1 == null ? "" : String(e.priceOpt1)]));
  });
  const [opt2, setOpt2] = useState<Record<string, string>>(() => {
    const names = product.options.map((o) => o.name);
    return Object.fromEntries(product.editions.map((e) => [keyOf(e.values, names), e.priceOpt2 == null ? "" : String(e.priceOpt2)]));
  });
  const [bulk, setBulk] = useState("");

  const options: ProductOption[] = useMemo(
    () =>
      drafts
        .map((d) => ({
          name: d.name.trim(),
          values: [...new Set(d.text.split("\n").map((v) => v.trim()).filter(Boolean))],
        }))
        .filter((o) => o.name && o.values.length),
    [drafts],
  );
  const names = options.map((o) => o.name);
  const rows = combos(options);
  const num = (raw: string | undefined) => {
    const t = (raw ?? "").replace(/\s/g, "").replace(",", ".");
    if (!t) return null;
    const n = Math.round(Number(t));
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  const editions: Edition[] = rows.map((values) => {
    const k = keyOf(values, names);
    return {
      values,
      price: num(prices[k]) ?? 0,
      priceOpt1: num(opt1[k]),
      priceOpt2: num(opt2[k]),
    };
  });

  const setPrice = (k: string, v: string) => setPrices((p) => ({ ...p, [k]: v }));
  const setOptA = (k: string, v: string) => setOpt1((p) => ({ ...p, [k]: v }));
  const setOptB = (k: string, v: string) => setOpt2((p) => ({ ...p, [k]: v }));
  const fillAll = () => {
    if (!bulk.trim()) return;
    setPrices((p) => ({ ...p, ...Object.fromEntries(rows.map((r) => [keyOf(r, names), bulk])) }));
  };
  /** Одна цена на все варианты с тем же значением этой опции (например, размер — независимо от цвета). */
  const fillSame = (optName: string, value: string, k: string) => {
    const keys = rows.filter((r) => r[optName] === value).map((r) => keyOf(r, names));
    const spread = (map: Record<string, string>) => Object.fromEntries(keys.map((x) => [x, map[k] ?? ""]));
    setPrices((p) => ({ ...p, ...spread(p) }));
    setOpt1((p) => ({ ...p, ...spread(p) }));
    setOpt2((p) => ({ ...p, ...spread(p) }));
  };

  return (
    <form action={action}>
      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="options" value={JSON.stringify(options)} />
      <input type="hidden" name="editions" value={JSON.stringify(editions)} />

      <div className={s.card}>
        <h2>Основное</h2>
        <div className={s.grid2}>
          <label className="field">
            Название *
            <input name="name" required defaultValue={product.name} maxLength={200} />
          </label>
          <label className="field">
            Адрес страницы (/catalog/…)
            <input name="slug" defaultValue={product.slug} maxLength={80} pattern="[a-z0-9\-]*" title="Латиница, цифры и дефисы" />
          </label>
          <label className="field">
            Раздел
            <select name="categoryId" defaultValue={product.categoryId}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Линейка
            <select name="line" value={line} onChange={(e) => setLine(e.target.value)}>
              <option value="base">Базовая</option>
              <option value="cube">CUBE</option>
            </select>
          </label>
          {line === "cube" && (
            <label className="field">
              Базовая версия этого товара
              <select name="baseId" defaultValue={product.baseId ?? ""}>
                <option value="">— нет (только CUBE)</option>
                {baseCandidates.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="field">
            Короткая подпись
            <input name="note" defaultValue={product.note} maxLength={300} placeholder="Например: 2 штуки в комплекте" />
          </label>
        </div>
        <label className="field" style={{ marginTop: 14 }}>
          Описание
          <textarea name="description" defaultValue={product.description} rows={6} maxLength={10000} />
        </label>
        <div className={s.grid2} style={{ marginTop: 14 }}>
          <label className="field">
            Ссылка на OZON
            <input name="ozonUrl" type="url" defaultValue={product.ozonUrl} placeholder="https://www.ozon.ru/product/…" />
          </label>
          <label className="field">
            Ссылка на Яндекс Маркет
            <input name="marketUrl" type="url" defaultValue={product.marketUrl} placeholder="https://market.yandex.ru/…" />
          </label>
          <label className="field">
            Порядок в каталоге
            <input name="sort" type="number" defaultValue={product.sort} />
          </label>
          <label className="field">
            Позиция в «Комплекте на игрока»
            <input name="kitSort" type="number" min={1} defaultValue={product.kitSort ?? ""} placeholder="пусто — не входит" />
          </label>
        </div>
        <label className={s.check} style={{ marginTop: 14 }}>
          <input type="checkbox" name="published" defaultChecked={product.published} />
          Показывать на сайте
        </label>
      </div>

      <div className={s.card}>
        <h2>Опции</h2>
        <p className={s.cardHint}>
          Например, «Размер» и «Цвет». Каждое значение — с новой строки. Если указать рост в скобках — «1 (рост 110-120)»,
          — размер попадёт в расчёт комплекта по росту.
        </p>
        {drafts.map((d, i) => (
          <div key={i} className={s.optRow}>
            <label className="field">
              Название опции
              <input
                value={d.name}
                onChange={(e) => setDrafts((all) => all.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                placeholder="Размер"
              />
            </label>
            <label className="field">
              Значения (каждое с новой строки)
              <textarea
                value={d.text}
                rows={Math.min(8, Math.max(3, d.text.split("\n").length))}
                onChange={(e) => setDrafts((all) => all.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
              />
            </label>
            <button
              type="button"
              className={`${s.btn} ${s.btnDanger}`}
              onClick={() => setDrafts((all) => all.filter((_, j) => j !== i))}
            >
              Убрать
            </button>
          </div>
        ))}
        <button type="button" className={s.btn} onClick={() => setDrafts((all) => [...all, { name: "", text: "" }])}>
          + Опция
        </button>
      </div>

      <div className={s.card}>
        <h2>Цены по вариантам</h2>
        <p className={s.cardHint}>
          Цены в рублях для каждого сочетания опций. «Опт 1» и «Опт 2» — ступени из прайс-листа; пустое поле значит,
          что на сайте вместо цены будет «по запросу».
        </p>
        <div className={s.row} style={{ marginBottom: 12 }}>
          <input
            className={s.priceInput}
            inputMode="numeric"
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder="Цена"
            aria-label="Цена для всех вариантов"
          />
          <button type="button" className={s.btn} onClick={fillAll}>
            Поставить всем
          </button>
        </div>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                {names.map((n) => (
                  <th key={n}>{n}</th>
                ))}
                {!names.length && <th>Вариант</th>}
                <th>Розница, ₽</th>
                <th>Опт 1, ₽</th>
                <th>Опт 2, ₽</th>
                {names.length > 1 && <th />}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const k = keyOf(r, names);
                const sizeName = names.find((n) => n === "Размер") ?? names.at(-1)!;
                return (
                  <tr key={k}>
                    {names.map((n) => (
                      <td key={n}>{r[n]}</td>
                    ))}
                    {!names.length && <td>Единственный вариант</td>}
                    <td>
                      <input
                        className={s.priceInput}
                        inputMode="numeric"
                        value={prices[k] ?? ""}
                        onChange={(e) => setPrice(k, e.target.value)}
                        aria-label={`Цена: ${Object.values(r).join(", ") || "товар"}`}
                        required
                      />
                    </td>
                    <td>
                      <input
                        className={s.priceInput}
                        inputMode="numeric"
                        value={opt1[k] ?? ""}
                        onChange={(e) => setOptA(k, e.target.value)}
                        aria-label={`Оптовая цена, первая ступень: ${Object.values(r).join(", ") || "товар"}`}
                        placeholder="—"
                      />
                    </td>
                    <td>
                      <input
                        className={s.priceInput}
                        inputMode="numeric"
                        value={opt2[k] ?? ""}
                        onChange={(e) => setOptB(k, e.target.value)}
                        aria-label={`Оптовая цена, вторая ступень: ${Object.values(r).join(", ") || "товар"}`}
                        placeholder="—"
                      />
                    </td>
                    {names.length > 1 && (
                      <td>
                        <button
                          type="button"
                          className={`${s.btn} ${s.btnSmall}`}
                          onClick={() => fillSame(sizeName, r[sizeName], k)}
                          title={`Эта цена для всех вариантов «${r[sizeName]}»`}
                        >
                          всем «{r[sizeName]}»
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`${s.row} ${s.saveBar}`}>
        <Submit>Сохранить товар</Submit>
        <Message state={state} />
      </div>
    </form>
  );
}
