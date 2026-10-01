"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart";
import { ProductImg } from "@/components/ProductImg";
import type { ProductDetail } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import s from "./product.module.css";

/** «рост 180-195+объем» → «180–195 см +объем» */
function heightHint(text: string) {
  const [range, extra] = text.replace(/^рост\s*/, "").split("+");
  return `${range.replace("-", "–")} см${extra ? ` +${extra}` : ""}`;
}

function SizeLabel({ value }: { value: string }) {
  const m = value.match(/^(.*?)\s*\((.*)\)\s*$/);
  if (!m) return <>{value}</>;
  return (
    <>
      <b>{m[1]}</b>
      <small>{heightHint(m[2])}</small>
    </>
  );
}

export function ProductBuy({
  product,
  storeOzon,
  storeMarket,
}: {
  product: ProductDetail;
  storeOzon: string;
  storeMarket: string;
}) {
  const { add } = useCart();
  // Если у опции одно значение — выбираем его сразу
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.filter((o) => o.values.length === 1).map((o) => [o.name, o.values[0]])),
  );
  const [imageIndex, setImageIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [hint, setHint] = useState("");

  const complete = product.options.every((o) => selected[o.name]);
  const edition = useMemo(
    () =>
      complete
        ? (product.editions.find((e) => product.options.every((o) => e.values[o.name] === selected[o.name])) ?? null)
        : product.options.length === 0
          ? product.editions[0]
          : null,
    [complete, product, selected],
  );

  // Цена: точная для выбранного варианта, иначе «от» среди подходящих
  const candidates = product.editions.filter((e) =>
    Object.entries(selected).every(([k, v]) => e.values[k] === v),
  );
  const minCandidate = Math.min(...(candidates.length ? candidates : product.editions).map((e) => e.price));
  const maxCandidate = Math.max(...(candidates.length ? candidates : product.editions).map((e) => e.price));

  const choose = (name: string, value: string) => {
    setSelected((prev) => ({ ...prev, [name]: value }));
    setAdded(false);
    setHint("");
    const img = product.images.findIndex((i) => i.optionValue === value);
    if (img >= 0) setImageIndex(img);
  };

  const addToCart = () => {
    const missing = product.options.find((o) => !selected[o.name]);
    if (missing || !edition) {
      setHint(`Выберите: ${missing?.name.toLowerCase() ?? "вариант"}`);
      return;
    }
    const colorImg = product.images.find((i) => i.optionValue && Object.values(selected).includes(i.optionValue));
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        values: edition.values,
        price: edition.price,
        image: (colorImg ?? product.images[0])?.file ?? null,
      },
      qty,
    );
    setAdded(true);
  };

  const image = product.images[imageIndex] ?? product.images[0];

  return (
    <div className={s.buyGrid}>
      <div className={s.gallery}>
        <div className={`${s.mainPhoto} photoBg`}>
          <ProductImg
            key={image?.file}
            file={image?.file ?? null}
            alt={product.name}
            sizes="(max-width: 900px) 100vw, 640px"
            eager
          />
          {product.line === "cube" && <span className={s.cubeBadge}>CUBE</span>}
        </div>
        {product.images.length > 1 && (
          <div className={s.thumbs}>
            {product.images.map((img, i) => (
              <button
                key={img.file}
                type="button"
                className={`${s.thumb} photoBg`}
                aria-pressed={i === imageIndex}
                aria-label={`Фото ${i + 1}${img.optionValue ? `, ${img.optionValue}` : ""}`}
                onClick={() => setImageIndex(i)}
              >
                <ProductImg file={img.file} alt="" sizes="80px" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={s.info}>
        {product.pair && (
          <div className="seg small" style={{ alignSelf: "flex-start" }} role="group" aria-label="Линейка">
            {(["base", "cube"] as const).map((line) =>
              line === product.line ? (
                <button key={line} type="button" aria-pressed="true">
                  {line === "cube" ? "CUBE" : "Базовая"}
                </button>
              ) : (
                <Link key={line} href={`/catalog/${product.pair!.slug}`} className={s.segLink}>
                  {line === "cube" ? "CUBE" : "Базовая"} · от {formatPrice(product.pair!.minPrice)}
                </Link>
              ),
            )}
          </div>
        )}

        <h1 className={s.title}>{product.name}</h1>
        {product.note && <span className="muted">{product.note}</span>}

        <div className={s.price}>
          {edition ? (
            formatPrice(edition.price)
          ) : (
            <>
              {minCandidate !== maxCandidate && <small>от </small>}
              {formatPrice(minCandidate)}
            </>
          )}
          <small className={s.retail}> розница</small>
        </div>

        {product.options.map((o) => (
          <div key={o.name} className={s.option}>
            <span className={s.optionName}>
              {o.name}
              {selected[o.name] && <span className="muted">: {selected[o.name].replace(/\s*\(.*\)/, "")}</span>}
            </span>
            <div className={s.optionValues}>
              {o.values.map((v) => (
                <button
                  key={v}
                  type="button"
                  className={s.optionBtn}
                  aria-pressed={selected[o.name] === v}
                  onClick={() => choose(o.name, v)}
                >
                  <SizeLabel value={v} />
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className={s.buyRow}>
          <div className={s.qty}>
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Меньше">
              −
            </button>
            <span aria-live="polite">{qty}</span>
            <button type="button" onClick={() => setQty((q) => Math.min(999, q + 1))} aria-label="Больше">
              +
            </button>
          </div>
          <button type="button" className="btnRed" onClick={addToCart}>
            Добавить в заявку
          </button>
        </div>
        {hint && (
          <span className={s.hint} role="alert">
            {hint}
          </span>
        )}
        {added && (
          <div className={s.added} role="status">
            Добавлено в заявку. <Link href="/cart">Перейти к оформлению →</Link>
          </div>
        )}

        <div className={s.markets}>
          <a href={product.ozonUrl || storeOzon} target="_blank" rel="noopener noreferrer" className="btnGhost">
            Купить на OZON ↗
          </a>
          <a href={product.marketUrl || storeMarket} target="_blank" rel="noopener noreferrer" className="btnGhost">
            Яндекс Маркет ↗
          </a>
        </div>

        <ul className={s.facts}>
          <li>Заявку подтвердит менеджер: уточнит наличие, доставку и оплату.</li>
          <li>Заказы отправляем транспортными компаниями по всей России и в другие страны.</li>
          <li>
            Магазинам и клубам — <Link href="/#prices">оптовые цены</Link>.
          </li>
        </ul>
      </div>
    </div>
  );
}
