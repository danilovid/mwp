"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart";
import type { CardVariant, CatalogCard } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import s from "./home.module.css";

/** «1 (рост 110-120)» → «1». Локально, а не из @/lib/catalog: тот модуль тянет Prisma в клиентский бандл. */
const sizeShort = (value: string) => value.replace(/\s*\(.*\)\s*$/, "");

/** «1 (рост 110-120)» → «110–120 см» */
function hint(value: string) {
  const m = value.match(/\((.*)\)\s*$/);
  if (!m) return "";
  const [range, extra] = m[1].replace(/^рост\s*/, "").split("+");
  return `${range.replace("-", "–")} см${extra ? ` +${extra}` : ""}`;
}

const lineName = (l: CardVariant["line"]) => (l === "cube" ? "CUBE" : "Базовая");

export function QuickAdd({ card }: { card: CatalogCard }) {
  const { add } = useCart();
  const [open, setOpen] = useState(false);
  const [variantIndex, setVariantIndex] = useState(0);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const variant = card.buy[variantIndex] ?? card.buy[0];

  // У варианта с единственным значением опции выбирать нечего — проставляем сразу
  const presets = useMemo(
    () =>
      variant
        ? Object.fromEntries(variant.options.filter((o) => o.values.length === 1).map((o) => [o.name, o.values[0]]))
        : {},
    [variant],
  );

  const needsChoice = Boolean(variant && variant.options.some((o) => o.values.length > 1)) || card.buy.length > 1;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!variant) return null;

  const values = { ...presets, ...selected };
  const complete = variant.options.every((o) => values[o.name]);
  const matching = variant.editions.filter((e) => Object.entries(values).every(([k, v]) => e.values[k] === v));
  const pool = matching.length ? matching : variant.editions;
  const edition = complete ? (matching[0] ?? null) : null;
  const low = Math.min(...pool.map((e) => e.price));

  const put = (v: CardVariant, vals: Record<string, string>, price: number) => {
    add({ productId: v.id, slug: v.slug, name: v.name, values: vals, price, image: v.image }, 1);
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  };

  const onButton = () => {
    // Выбирать нечего — кладём сразу
    if (!needsChoice && variant.editions.length === 1) {
      put(variant, variant.editions[0].values, variant.editions[0].price);
      return;
    }
    setVariantIndex(0);
    setSelected({});
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        className={`${s.addBtn} ${done ? s.addBtnDone : ""}`}
        onClick={onButton}
        aria-label={done ? "Добавлено в заявку" : `${card.name} — добавить в заявку`}
        title={done ? "Добавлено" : "Добавить в заявку"}
      >
        {done ? "✓" : "+"}
      </button>

      {open && (
        <div className={s.sheetWrap} role="dialog" aria-modal="true" aria-label={`${card.name}: выбор варианта`}>
          <button type="button" className={s.sheetBack} aria-label="Закрыть" onClick={() => setOpen(false)} />
          <div className={s.sheet}>
            <div className={s.sheetHead}>
              <b>{card.name}</b>
              <button type="button" className={s.sheetClose} onClick={() => setOpen(false)} aria-label="Закрыть">
                ×
              </button>
            </div>

            {card.buy.length > 1 && (
              <div className="seg small" role="group" aria-label="Линейка">
                {card.buy.map((v, i) => (
                  <button
                    key={v.slug}
                    type="button"
                    aria-pressed={i === variantIndex}
                    onClick={() => {
                      setVariantIndex(i);
                      setSelected({});
                    }}
                  >
                    {lineName(v.line)}
                  </button>
                ))}
              </div>
            )}

            {variant.options
              .filter((o) => o.values.length > 1)
              .map((o) => (
                <div key={o.name} className={s.sheetOpt}>
                  <span className={s.sheetOptName}>{o.name}</span>
                  <div className={s.sheetChips}>
                    {o.values.map((v) => (
                      <button
                        key={v}
                        type="button"
                        className={s.sheetChip}
                        aria-pressed={values[o.name] === v}
                        onClick={() => setSelected((p) => ({ ...p, [o.name]: v }))}
                      >
                        <b>{sizeShort(v)}</b>
                        {hint(v) && <small>{hint(v)}</small>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

            <div className={s.sheetFoot}>
              <span className={s.sheetPrice}>
                {!edition && <small>от </small>}
                {formatPrice(edition ? edition.price : low)}
                <small className={s.sheetRetail}> розн.</small>
              </span>
              <button
                type="button"
                className="btnRed"
                disabled={!complete}
                onClick={() => {
                  if (!edition) return;
                  put(variant, edition.values, edition.price);
                  setOpen(false);
                }}
              >
                {complete ? "Добавить в заявку" : "Выберите размер"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
