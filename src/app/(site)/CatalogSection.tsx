"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductImg } from "@/components/ProductImg";
import { QuickAdd } from "./QuickAdd";
import type { CatalogCard } from "@/lib/catalog";
import { formatPrice, plural } from "@/lib/format";
import s from "./home.module.css";

type Category = { slug: string; name: string; count: number };

const from = (price: number, range: boolean) => (range ? "от " : "") + formatPrice(price);

function meta(c: CatalogCard) {
  const parts = [c.sizes];
  if (c.colors.length > 1) parts.push(`${c.colors.length} ${plural(c.colors.length, "цвет", "цвета", "цветов")}`);
  if (c.note) parts.push(c.note);
  return parts.filter(Boolean).join(" · ");
}

export type CatalogMode = "retail" | "opt";

export function CatalogSection({
  cards,
  categories,
  mode = "retail",
  optStep1 = "30 000 ₽",
  optStep2 = "100 000 ₽",
}: {
  cards: CatalogCard[];
  categories: Category[];
  mode?: CatalogMode;
  optStep1?: string;
  optStep2?: string;
}) {
  const [zone, setZone] = useState("all");
  const [view, setView] = useState<"grid" | "table">("grid");
  const shown = zone === "all" ? cards : cards.filter((c) => c.category === zone);
  const tabs = [{ slug: "all", name: "Все позиции", count: cards.length }, ...categories];

  return (
    <section id="catalog" className={`wrap ${s.catalog}`}>
      <div className="sectionHead">
        <div>
          <span className="skewBar" />
          <h2>Каталог</h2>
          {mode === "opt" ? (
            <span className="muted">
              Собственное производство. Цены показаны <b style={{ color: "var(--ink)" }}>розничные</b> — как ориентир.
              Оптовая зависит от суммы заказа, её посчитает менеджер по вашей заявке.
            </span>
          ) : (
            <span className="muted">
              Собственное производство. Все цены в каталоге — <b style={{ color: "var(--ink)" }}>розничные</b>.
            </span>
          )}
        </div>
        <div className="seg" role="group" aria-label="Вид каталога">
          <button type="button" aria-pressed={view === "grid"} onClick={() => setView("grid")}>
            Плитки
          </button>
          <button type="button" aria-pressed={view === "table"} onClick={() => setView("table")}>
            Таблица
          </button>
        </div>
      </div>

      <div className={s.zoneTabs} role="group" aria-label="Раздел каталога">
        {tabs.map((t) => (
          <button
            key={t.slug}
            type="button"
            className={s.zoneTab}
            aria-pressed={zone === t.slug}
            onClick={() => setZone(t.slug)}
          >
            {t.name} <span>{t.count}</span>
          </button>
        ))}
      </div>

      {view === "grid" ? (
        <div className={s.grid}>
          {shown.map((c) => (
            <div key={c.slug} className={s.card}>
              <div className={`${s.cardPhoto} photoBg`}>
                <ProductImg file={c.image} alt={c.name} sizes="(max-width: 520px) 100vw, (max-width: 980px) 50vw, 300px" />
                <span className={s.cardZone}>{c.categoryName}</span>
              </div>
              <div className={s.cardBody}>
                <div>
                  <div className={s.cardName}>
                    <Link href={`/catalog/${c.slug}`} className={s.cardLink}>
                      {c.name}
                    </Link>
                  </div>
                  <div className={s.cardMeta}>{meta(c)}</div>
                </div>
                <div className={s.cardPrices}>
                  {mode === "opt" && (
                    <span className={`priceChip ${s.optChip}`} title={`Цена при заказе от ${optStep1}`}>
                      {c.optFrom != null ? `${from(c.optFrom, true)} опт` : "опт по запросу"}
                    </span>
                  )}
                  {c.basePrice != null && (
                    <span className="priceChip">
                      {from(c.basePrice, c.baseHasRange)} <small>розн.</small>
                    </span>
                  )}
                  {c.cubePrice != null && (
                    <span className="priceChip cubeChip">
                      <span className="cubeWord">CUBE</span> {from(c.cubePrice, c.cubeHasRange)}
                    </span>
                  )}
                  {mode === "retail" && c.ozonUrl && (
                    <a
                      href={c.ozonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={s.ozonChip}
                      title={`${c.name} — купить поштучно на OZON`}
                    >
                      OZON ↗
                    </a>
                  )}
                  <QuickAdd card={c} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`${s.table} ${mode === "opt" ? s.tableOpt : ""}`}>
          <div className={`${s.row} ${s.rowHead}`}>
            <span />
            <span>Позиция</span>
            <span>Раздел · размеры</span>
            <span className={s.rowPrice} style={{ fontFamily: "var(--font)" }}>
              Базовая
            </span>
            <span className={s.rowPrice} style={{ fontFamily: "var(--font)" }}>
              CUBE
            </span>
            {mode === "opt" && (
              <>
                <span className={s.rowPrice} style={{ fontFamily: "var(--font)" }}>
                  от {optStep1}
                </span>
                <span className={s.rowPrice} style={{ fontFamily: "var(--font)" }}>
                  от {optStep2}
                </span>
              </>
            )}
          </div>
          {shown.map((c) => (
            <Link key={c.slug} href={`/catalog/${c.slug}`} className={s.row}>
              <span className={`${s.rowThumb} photoBg`}>
                <ProductImg file={c.image} alt="" sizes="44px" />
              </span>
              <span className={s.rowName}>{c.name}</span>
              <span className={s.rowMeta}>
                {c.categoryName}
                {c.sizes && ` · ${c.sizes}`}
              </span>
              <span className={s.rowPrice}>{c.basePrice != null ? from(c.basePrice, c.baseHasRange) : "—"}</span>
              <span className={s.rowPrice} style={{ color: c.cubePrice != null ? "var(--ink)" : "var(--muted)" }}>
                {c.cubePrice != null ? from(c.cubePrice, c.cubeHasRange) : "—"}
              </span>
              {mode === "opt" && (
                <>
                  <span className={s.rowPrice} style={{ color: c.optFrom != null ? "var(--acc)" : "var(--muted)" }}>
                    {c.optFrom != null ? from(c.optFrom, true) : "по запросу"}
                  </span>
                  <span className={s.rowPrice} style={{ color: c.opt2From != null ? "var(--acc)" : "var(--muted)" }}>
                    {c.opt2From != null ? from(c.opt2From, true) : "по запросу"}
                  </span>
                </>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
