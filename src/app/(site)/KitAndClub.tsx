"use client";

import Link from "next/link";
import { useState } from "react";
import { LeadForm, Modal, type LeadItem } from "@/components/LeadForm";
import leadStyles from "@/components/lead.module.css";
import type { KitData } from "@/lib/catalog";
import { formatPrice, plural } from "@/lib/format";
import s from "./home.module.css";

type LineId = "base" | "cube";

function LineSeg({ value, onChange }: { value: LineId; onChange: (v: LineId) => void }) {
  return (
    <div className="seg small" role="group" aria-label="Линейка">
      <button type="button" aria-pressed={value === "base"} onClick={() => onChange("base")}>
        Базовая
      </button>
      <button type="button" aria-pressed={value === "cube"} onClick={() => onChange("cube")}>
        CUBE
      </button>
    </div>
  );
}

/** Цена позиции комплекта для роста h в выбранной линейке (если CUBE-версии нет — базовая). */
const priceAt = (item: KitData["items"][number], line: LineId, h: number) =>
  (line === "cube" && item.cube ? item.cube : item.base)[h];

const kitSum = (kit: KitData, line: LineId, h: number) => kit.items.reduce((a, i) => a + priceAt(i, line, h), 0);

export function KitAndClub({ kit, kitPanel = "table" }: { kit: KitData; kitPanel?: "table" | "constructor" }) {
  const [kitLine, setKitLine] = useState<LineId>("base");
  const [height, setHeight] = useState(Math.min(3, kit.heights.length - 1));
  const [orderLine, setOrderLine] = useState<LineId>("base");
  const [qty, setQty] = useState<number[]>(() => kit.heights.map(() => 0));
  const [open, setOpen] = useState(false);

  const anyApprox = kit.items.some((i) => i.approx);
  const players = qty.reduce((a, b) => a + b, 0);
  const total = qty.reduce((a, q, h) => a + q * kitSum(kit, orderLine, h), 0);
  const lineLabel = orderLine === "cube" ? "CUBE" : "Базовая";
  const lo = kit.heights[0]?.split("–")[0];
  const hi = kit.heights.at(-1)?.split("–")[1];

  const leadItems: LeadItem[] = kit.heights
    .map((h, i) => ({
      name: `Комплект на игрока, линейка «${lineLabel}», рост ${h} см`,
      details: kit.items.map((it) => it.name).join(", "),
      qty: qty[i],
      price: kitSum(kit, orderLine, i),
    }))
    .filter((i) => i.qty > 0);

  const change = (i: number, d: number) => setQty((q) => q.map((v, j) => (j === i ? Math.max(0, Math.min(999, v + d)) : v)));

  return (
    <section className={`wrap ${s.duo}`}>
      {kitPanel === "constructor" ? (
        <div id="kit" className={s.panel}>
          <div className={s.panelHead}>
            <div>
              <h2>Собери комплект на фигуре</h2>
              <span className={s.panelSub}>
                {kit.items.length} {plural(kit.items.length, "позиция", "позиции", "позиций")}, рост {lo}–{hi} см
              </span>
            </div>
          </div>
          <p className={s.panelText}>
            Укажите рост и выбирайте снаряжение прямо на хоккеисте: шлем, нагрудник, перчатки и остальное. Цвет и размер
            подбираются на месте, собранный комплект уходит в заявку целиком.
          </p>
          <div className={s.kitTotal}>
            <div className={s.kitSum}>
              <span>Комплект целиком, от</span>
              <span>{formatPrice(kit.items.reduce((a, i) => a + Math.min(...i.base), 0))}</span>
            </div>
          </div>
          <Link href="/constructor" className="btnRed">
            Открыть конструктор
          </Link>
        </div>
      ) : (
      <div id="kit" className={s.panel}>
        <div className={s.panelHead}>
          <div>
            <h2>Комплект на игрока</h2>
            <span className={s.panelSub}>
              {kit.items.length} {plural(kit.items.length, "позиция", "позиции", "позиций")} — каждая ведёт на карточку
            </span>
          </div>
          <LineSeg value={kitLine} onChange={setKitLine} />
        </div>
        <div className={s.kitList}>
          {kit.items.map((i) => {
            const cube = kitLine === "cube" && i.cube;
            return (
              <Link key={i.slug} href={`/catalog/${cube && i.cubeSlug ? i.cubeSlug : i.slug}`} className={s.kitRow}>
                <span>
                  {i.name}
                  {cube && <span className="cubeWord"> CUBE</span>}
                </span>
                <span>
                  {i.approx ? "от " : ""}
                  {formatPrice(priceAt(i, kitLine, height))}
                </span>
              </Link>
            );
          })}
        </div>
        <div className={s.kitTotal}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>Рост игрока, см</span>
          <div className={s.kitHeights} role="group" aria-label="Рост игрока">
            {kit.heights.map((h, i) => (
              <button key={h} type="button" aria-pressed={height === i} onClick={() => setHeight(i)}>
                {h}
              </button>
            ))}
          </div>
          <div className={s.kitSum}>
            <span>Розничная цена комплекта{anyApprox ? ", от" : ""}</span>
            <span>{formatPrice(kitSum(kit, kitLine, height))}</span>
          </div>
        </div>
      </div>
      )}

      <div id="order" className={s.panel}>
        <div className={s.panelHead}>
          <div>
            <h2>Заказ для клуба</h2>
            <span className={s.panelSub}>
              Размер по росту: {kit.heights.length} {plural(kit.heights.length, "размер", "размера", "размеров")}, {lo}–{hi} см
            </span>
          </div>
          <LineSeg value={orderLine} onChange={setOrderLine} />
        </div>
        <div className={s.sizes}>
          {kit.heights.map((h, i) => (
            <div key={h} className={s.size} data-on={qty[i] > 0}>
              <span className={s.sizeRange}>{h}</span>
              <span className={s.sizeQty} aria-live="polite">
                {qty[i]}
              </span>
              <div className={s.sizeBtns}>
                <button type="button" onClick={() => change(i, -1)} aria-label={`Меньше игроков ростом ${h} см`}>
                  −
                </button>
                <button type="button" onClick={() => change(i, 1)} aria-label={`Больше игроков ростом ${h} см`}>
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className={s.orderSummary}>
          {players > 0 ? (
            <span>
              {players} {plural(players, "игрок", "игрока", "игроков")} × комплект «{lineLabel}» ={" "}
              <b>{formatPrice(total)}</b> по рознице{anyApprox ? ", от" : ""}
            </span>
          ) : (
            <span>Укажите, сколько игроков каждого роста нужно экипировать.</span>
          )}
          <span className="muted">Для клубов действует оптовая скидка — менеджер рассчитает итоговую цену.</span>
        </div>
        <div className={s.orderFoot}>
          <span className={s.orderTotal}>{formatPrice(total)}</span>
          <div className={s.orderActions}>
            <button type="button" className={s.linkBtn} onClick={() => setQty(kit.heights.map(() => 0))}>
              обнулить
            </button>
            <button type="button" className="btnRed" onClick={() => setOpen(true)}>
              Отправить заявку
            </button>
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Заявка для клуба">
        {players > 0 && (
          <div className={leadStyles.summary}>
            {leadItems.map((i) => (
              <span key={i.name}>
                Рост {i.name.split("рост ")[1]} — {i.qty} шт.
              </span>
            ))}
            <b>
              {players} {plural(players, "игрок", "игрока", "игроков")}, линейка «{lineLabel}»: {formatPrice(total)} по рознице
            </b>
          </div>
        )}
        <LeadForm
          type="club"
          items={leadItems}
          total={total || null}
          showOrg
          commentPlaceholder={players ? "Цвет шлемов, сроки, вопросы" : "Сколько комплектов и каких размеров нужно"}
        />
      </Modal>
    </section>
  );
}
