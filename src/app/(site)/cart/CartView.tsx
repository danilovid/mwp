"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart";
import { LeadForm } from "@/components/LeadForm";
import { ProductImg } from "@/components/ProductImg";
import { formatPrice } from "@/lib/format";
import s from "./cart.module.css";

export function CartView() {
  const { items, total, ready, setQty, remove, clear } = useCart();
  const [sent, setSent] = useState(false);

  if (!ready) return <section className={`wrap ${s.page}`} />;

  if (sent) {
    return (
      <section className={`wrap ${s.page}`}>
        <div className={s.empty}>
          <b>Спасибо! Заявка отправлена.</b>
          <span>Менеджер свяжется с вами в рабочее время, чтобы подтвердить заказ.</span>
          <Link href="/#catalog" className="btnRed" style={{ alignSelf: "flex-start" }}>
            Вернуться в каталог
          </Link>
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className={`wrap ${s.page}`}>
        <div className={s.empty}>
          <b>В заявке пока ничего нет</b>
          <span>Выберите товары в каталоге: размер, цвет и количество — и нажмите «Добавить в заявку».</span>
          <Link href="/#catalog" className="btnRed" style={{ alignSelf: "flex-start" }}>
            Перейти в каталог
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={`wrap ${s.page} ${s.grid}`}>
      <div className={s.list}>
        {items.map((i) => (
          <div key={i.key} className={s.item}>
            <Link href={`/catalog/${i.slug}`} className={`${s.thumb} photoBg`}>
              <ProductImg file={i.image} alt={i.name} sizes="96px" />
            </Link>
            <div className={s.itemInfo}>
              <Link href={`/catalog/${i.slug}`} className={s.itemName}>
                {i.name}
              </Link>
              <span className="muted" style={{ fontSize: 13 }}>
                {Object.entries(i.values)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(" · ")}
              </span>
              <span className="mono" style={{ fontSize: 13 }}>
                {formatPrice(i.price)} за шт.
              </span>
            </div>
            <div className={s.itemQty}>
              <button type="button" onClick={() => setQty(i.key, i.qty - 1)} aria-label="Меньше">
                −
              </button>
              <span>{i.qty}</span>
              <button type="button" onClick={() => setQty(i.key, i.qty + 1)} aria-label="Больше">
                +
              </button>
            </div>
            <div className={s.itemSum}>
              <b className="mono">{formatPrice(i.price * i.qty)}</b>
              <button type="button" className={s.remove} onClick={() => remove(i.key)}>
                Удалить
              </button>
            </div>
          </div>
        ))}
        <div className={s.total}>
          <span>Итого по розничным ценам</span>
          <b className="mono">{formatPrice(total)}</b>
        </div>
        <button type="button" className={s.clear} onClick={clear}>
          Очистить заявку
        </button>
      </div>

      <div className={s.formCard}>
        <h2>Контакты для связи</h2>
        <LeadForm
          type="order"
          showAddress
          items={items.map((i) => ({
            name: i.name,
            qty: i.qty,
            price: i.price,
            productId: i.productId,
            values: i.values,
          }))}
          total={total}
          onSent={() => {
            clear();
            setSent(true);
          }}
        />
      </div>
    </section>
  );
}
