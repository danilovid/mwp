"use client";

import Link from "next/link";
import { useState } from "react";
import { LeadForm, Modal } from "@/components/LeadForm";
import type { CatalogCard } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import s from "./home.module.css";

const range = (min: number, max: number) =>
  min === max ? formatPrice(min) : `${min.toLocaleString("ru-RU")}–${formatPrice(max)}`;

export function PricesSection({ cards, priceListUrl }: { cards: CatalogCard[]; priceListUrl: string }) {
  const [line, setLine] = useState<"base" | "cube">("base");
  const [open, setOpen] = useState(false);

  const rows = cards.map((c) => {
    const useCube = line === "cube" && c.cubePrice != null;
    const onlyCube = c.basePrice == null;
    const min = useCube || onlyCube ? c.cubePrice! : c.basePrice!;
    const max = useCube || onlyCube ? c.cubeMax! : c.baseMax!;
    let note = "";
    if (line === "cube" && c.cubePrice == null) note = "одна версия";
    if (line === "base" && onlyCube && !/CUBE/i.test(c.name)) note = "только CUBE";
    return {
      key: c.slug,
      href: `/catalog/${useCube && c.cubeSlug ? c.cubeSlug : c.slug}`,
      name: c.name,
      note,
      sizes: c.sizes,
      price: range(min, max),
    };
  });

  return (
    <section id="prices" className={s.pricesBg}>
      <div className={`wrap ${s.pricesGrid}`}>
        <div style={{ minWidth: 0 }}>
          <div className="sectionHead" style={{ marginBottom: 16 }}>
            <div>
              <span className="skewBar" />
              <h2>Розничные цены</h2>
              <span className="muted">Цены по размерам. Магазинам, клубам и спортшколам — отдельные условия.</span>
            </div>
            <div className="seg" role="group" aria-label="Линейка" style={{ background: "var(--card)", border: "1px solid var(--line)" }}>
              <button type="button" aria-pressed={line === "base"} onClick={() => setLine("base")}>
                Базовая
              </button>
              <button type="button" aria-pressed={line === "cube"} onClick={() => setLine("cube")}>
                CUBE
              </button>
            </div>
          </div>
          <div className={s.priceTable}>
            <div className={s.priceHead}>
              <span>{line === "cube" ? "Линейка CUBE" : "Базовая линейка"}</span>
              <span>Размеры</span>
              <span style={{ textAlign: "right" }}>Розница</span>
            </div>
            {rows.map((r) => (
              <Link key={r.key} href={r.href} className={s.priceRow}>
                <span className={s.priceName}>
                  {r.name} {r.note && <span className={s.priceNote}>· {r.note}</span>}
                </span>
                <span className={s.priceSizes}>{r.sizes || "—"}</span>
                <span className={s.priceVal}>{r.price}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className={s.sideCol}>
          <div className={s.sideCard}>
            <b>Закупаете оптом?</b>
            <span>
              Для спортивных магазинов, хоккейных клубов и спортшкол — отдельная страница: ступени цен, прайс-лист,
              комплектация на игрока и заказ на группу.
            </span>
            <Link href="/opt" className="btnRed" style={{ alignSelf: "flex-start" }}>
              Перейти в опт
            </Link>
            <button type="button" className={s.textLink} onClick={() => setOpen(true)} style={{ alignSelf: "flex-start" }}>
              Или сразу оставить запрос →
            </button>
          </div>
          <a href={priceListUrl} target="_blank" rel="noopener noreferrer" className={s.priceListCard}>
            <b>Оптовый прайс-лист</b>
            <span>Открыть на Яндекс Диске ↗</span>
          </a>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Оптовый запрос">
        <LeadForm
          type="wholesale"
          showOrg
          submitLabel="Отправить запрос"
          commentPlaceholder="Какие позиции, размеры и количество вас интересуют"
        />
      </Modal>
    </section>
  );
}
