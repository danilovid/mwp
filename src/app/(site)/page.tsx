/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { CardLink, InfoCard } from "@/components/InfoCard";
import { FactoryImg, ProductImg } from "@/components/ProductImg";
import { SiteHeader } from "@/components/SiteChrome";
import { getCatalog, getKit } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { getPublicSettings } from "@/lib/settings";
import { FACTORY_TEASER } from "@/lib/factory";
import { CatalogSection } from "./CatalogSection";
import { KitAndClub } from "./KitAndClub";
import { PricesSection } from "./PricesSection";
import { SupplyCard } from "./SupplyCard";
import s from "./home.module.css";

export default async function HomePage() {
  const [settings, { cards, categories }, kit] = await Promise.all([getPublicSettings(), getCatalog(), getKit()]);

  const heroCard = cards.find((c) => c.slug === "shlem-s-maskoj") ?? cards[0];
  const kitFrom = kit.items.reduce((a, i) => a + Math.min(...i.base), 0);
  const lo = kit.heights[0]?.split("–")[0];
  const hi = kit.heights.at(-1)?.split("–")[1];
  const parts = cards.filter((c) => c.category === "parts");
  const partsFrom = parts.length ? Math.min(...parts.map((p) => p.basePrice ?? Infinity)) : null;
  const cubeCount = cards.filter((c) => c.cubePrice != null).length;
  const baseCount = cards.filter((c) => c.basePrice != null).length;
  const shorts = cards.find((c) => c.slug === "shorty");

  return (
    <>
      <section id="top" className={s.hero}>
        {/* Фон со старого сайта: снимок размытый, поэтому работает как текстура, а не как фото */}
        <div className={s.heroIce} />
        <div className={s.heroScrim} />
        <div className={s.heroStripe} />
        <div className={s.heroGlow} />
        <div className={s.heroLines} />
        <SiteHeader settings={settings} />
        <div className={s.heroGrid}>
          <div className={s.heroText}>
            <span className={s.heroBadge}>
              <span className={s.heroDot} />
              Чебоксары · своё производство
            </span>
            <h1 className={s.heroTitle}>
              Хоккейная экипировка. <em>Сделано в России.</em>
            </h1>
            <p className={s.heroLead}>
              Мы производим хоккейную амуницию MWP: шлемы, нагрудники, налокотники, шорты, щитки, перчатки, подтяжки и
              другие элементы. Заказы отправляем транспортными компаниями по всей России и в другие страны.
            </p>
            <div className={s.heroButtons}>
              <a href="#catalog" className={s.heroBtnWhite}>
                Каталог с ценами
              </a>
              <a href="#prices" className={s.heroBtnRed}>
                Оптовые закупки
              </a>
            </div>
            {/* Розница уходит на маркетплейсы — даём переход сразу с первого экрана */}
            <div className={s.heroShops}>
              <span>Купить поштучно:</span>
              <a href={settings.ozonUrl} target="_blank" rel="noopener noreferrer">
                OZON <i aria-hidden="true">↗</i>
              </a>
              <a href={settings.marketUrl} target="_blank" rel="noopener noreferrer">
                Яндекс Маркет <i aria-hidden="true">↗</i>
              </a>
            </div>
          </div>
          <div className={s.heroVisual}>
            <div className={`${s.heroPhoto} photoBg`}>
              <ProductImg file={heroCard?.image ?? null} alt={heroCard?.name ?? "Шлем MWP"} sizes="(max-width: 760px) 90vw, 560px" eager />
            </div>
            {heroCard?.basePrice != null && (
              <Link href={`/catalog/${heroCard.slug}`} className={s.glass} style={{ left: 0, bottom: 36 }}>
                <span className={s.glassLabel}>{heroCard.name}</span>
                <span className={s.glassPrice}>
                  {formatPrice(heroCard.basePrice)} <small>розн.</small>
                </span>
              </Link>
            )}
            {lo && (
              <div className={s.glass} style={{ right: 0, top: 40 }}>
                <span className={s.glassLabel}>Размеры по росту</span>
                <span className={s.glassBig}>
                  {lo}–{hi} см
                </span>
              </div>
            )}
            <div className={s.chipWhite}>
              <span className={s.checker} />
              <span>
                <b>Линейка CUBE</b>
                <br />
                новая серия 2025–2026
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className={s.stats}>
        <div className={s.statsCard}>
          <div className={s.stat}>
            <span className={s.statLabel}>Комплект на игрока</span>
            <span className={s.statValueMono}>от {formatPrice(kitFrom)}</span>
            <span className={s.statSub}>розн., {kit.items.length} позиций</span>
          </div>
          <div className={s.stat}>
            <span className={s.statLabel}>Опт</span>
            <span className={s.statValue}>Индивидуально</span>
            <span className={s.statSub}>для магазинов и клубов</span>
          </div>
          <div className={s.stat}>
            <span className={s.statLabel}>Размеров</span>
            <span className={s.statValue}>{kit.heights.length}</span>
            <span className={s.statSub}>
              по росту {lo}–{hi} см
            </span>
          </div>
          {partsFrom != null && (
            <div className={s.stat}>
              <span className={s.statLabel}>Запчасти к шлемам</span>
              <span className={s.statValue}>от {formatPrice(partsFrom)}</span>
              <span className={s.statSub}>клипсы, ремкомплекты</span>
            </div>
          )}
        </div>
      </section>

      <CatalogSection cards={cards} categories={categories} />

      <section className={`wrap ${s.lines}`}>
        <Link href="/catalog/shorty" className={s.lineCard}>
          <div className={`${s.linePhoto} photoBg`}>
            <ProductImg file={shorts?.image ?? null} alt="Базовая линейка" sizes="180px" />
          </div>
          <div className={s.lineText}>
            <span className={s.lineTitle}>Базовая</span>
            <span className="muted">Основная линейка экипировки MWP — {baseCount} позиций каталога.</span>
            {shorts?.basePrice != null && (
              <span className="mono" style={{ fontWeight: 600 }}>
                шорты — от {formatPrice(shorts.basePrice)} розн.
              </span>
            )}
          </div>
        </Link>
        <Link href="/catalog/shorty-cube" className={`${s.lineCard} ${s.lineCardCube}`}>
          <div className={`${s.linePhoto} ${s.linePhotoCube}`}>
            <ProductImg file={shorts?.cubeImage ?? null} alt="Линейка CUBE" sizes="180px" />
          </div>
          <div className={s.lineText}>
            <span className={s.lineTitle} style={{ color: "var(--red)" }}>
              CUBE
            </span>
            <span>Новая серия сезона 2025–2026 — {cubeCount} позиций каталога.</span>
            {shorts?.cubePrice != null && (
              <span className="mono" style={{ fontWeight: 600 }}>
                шорты — от {formatPrice(shorts.cubePrice)} розн.
              </span>
            )}
          </div>
        </Link>
      </section>

      <PricesSection cards={cards} priceListUrl={settings.priceListUrl} />

      <KitAndClub kit={kit} />

      <section className={`wrap ${s.trio}`}>
        <SupplyCard />
        {parts.length > 0 && (
          <InfoCard id="parts" title={`Запчасти к шлемам — от ${formatPrice(partsFrom!)}`}>
            <p>Ремкомплекты и наборы клипс для хоккейных шлемов MWP.</p>
            {parts.map((p) => (
              <Link key={p.slug} href={`/catalog/${p.slug}`} className={s.miniRow}>
                <span>{p.name}</span>
                <span>{formatPrice(p.basePrice!)}</span>
              </Link>
            ))}
          </InfoCard>
        )}
        <InfoCard
          id="cert"
          title="Сертификат соответствия"
          media={
            <a href="/files/sertifikat-ROSS-RU-OS02-N00479.pdf">
              <img src="/images/docs/sertifikat-ROSS-RU-OS02-N00479.webp" alt="Сертификат соответствия" loading="lazy" />
            </a>
          }
          actions={
            <CardLink href="/files/sertifikat-ROSS-RU-OS02-N00479.pdf" arrow="down" external>
              Скачать PDF
            </CardLink>
          }
        >
          <p>
            Добровольная сертификация, № РОСС RU.ОС02.Н00479. Действует с 29.09.2026 по 28.09.2029. Продукция по ТУ
            96 14-002-03037400-2005.
          </p>
        </InfoCard>
      </section>

      <section id="factory" className={`wrap ${s.factory}`}>
        <div className="sectionHead" style={{ marginBottom: 20 }}>
          <div>
            <span className="skewBar" />
            <h2>Производство</h2>
            <span className="muted">Литьё, раскрой, пошив и сборка — Чебоксары</span>
          </div>
          <Link href="/about" style={{ fontWeight: 700 }}>
            О компании и производстве →
          </Link>
        </div>
        <div className={s.gallery}>
          {FACTORY_TEASER.map((g, i) => (
            <figure key={g.photo} className={`${s.shot} ${i === 0 ? s.shotLead : ""}`}>
              <FactoryImg
                name={g.photo}
                alt={g.caption}
                sizes={i === 0 ? "(max-width: 900px) 100vw, 640px" : "(max-width: 900px) 50vw, 320px"}
              />
              <figcaption>
                <span>{g.caption}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={`wrap ${s.ctaWrap}`}>
        <div className={s.cta}>
          <div className={s.ctaText}>
            <b>Нужна одна вещь или один комплект?</b>
            <span>Поштучно, по розничной цене — оформите заявку на сайте или купите на маркетплейсе.</span>
          </div>
          <div className={s.ctaButtons}>
            <a href="#catalog" className={s.ctaGlass}>
              Карточки товаров
            </a>
            <a href={settings.ozonUrl} target="_blank" rel="noopener noreferrer" className={s.ctaWhite}>
              OZON →
            </a>
            <a href={settings.marketUrl} target="_blank" rel="noopener noreferrer" className={s.ctaWhite}>
              Яндекс Маркет →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
