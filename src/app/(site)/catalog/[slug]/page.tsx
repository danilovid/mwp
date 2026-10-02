import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BackButton } from "@/components/BackButton";
import { ProductImg } from "@/components/ProductImg";
import { PageBand } from "@/components/SiteChrome";
import { getProductBySlug, getPublishedSlugs, getRelated, sizeShort } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { imageUrl } from "@/lib/media";
import { getPublicSettings } from "@/lib/settings";
import { ProductBuy } from "./ProductBuy";
import s from "./product.module.css";

export async function generateStaticParams() {
  const rows = await getPublishedSlugs();
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata(props: PageProps<"/catalog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getProductBySlug(slug);
  if (!p) return {};
  const description =
    (p.description || `${p.name} MWP — российская хоккейная экипировка.`).slice(0, 180) +
    ` Цена от ${formatPrice(p.minPrice)}.`;
  return {
    title: p.name,
    description,
    alternates: { canonical: `/catalog/${p.slug}` },
    openGraph: {
      title: `${p.name} — MWP`,
      description,
      images: p.images[0] ? [{ url: imageUrl(p.images[0].file, 1200) }] : undefined,
    },
  };
}

export default async function ProductPage(props: PageProps<"/catalog/[slug]">) {
  const { slug } = await props.params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getPublicSettings()]);
  if (!product) notFound();
  const related = await getRelated(product.category.slug, [product.slug, product.pair?.slug ?? ""]);

  // Таблица «размер — цена» без учёта цвета
  const sizeOpt = product.options.find((o) => o.name === "Размер");
  const sizeRows = sizeOpt
    ? sizeOpt.values.map((v) => {
        const prices = product.editions.filter((e) => e.values["Размер"] === v).map((e) => e.price);
        const m = v.match(/\((.*)\)/);
        return { size: sizeShort(v), hint: m ? m[1] : "", price: prices.length ? Math.min(...prices) : null };
      })
    : [];
  const prices = product.editions.map((e) => e.price);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    brand: { "@type": "Brand", name: "MWP" },
    image: product.images.map((i) => imageUrl(i.file, 1200)),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "RUB",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: product.editions.length,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <PageBand
        settings={settings}
        crumbs={[
          { href: "/#catalog", label: "Каталог" },
          { href: "/#catalog", label: product.category.name },
          { label: product.name },
        ]}
      />

      <div className={`wrap ${s.backRow}`}>
        <BackButton label="Назад в каталог" />
      </div>

      <section className={`wrap ${s.main}`}>
        <ProductBuy product={product} storeOzon={settings.ozonUrl} storeMarket={settings.marketUrl} />
      </section>

      <section className={`wrap ${s.details}`}>
        <div className={s.descr}>
          <h2>Описание</h2>
          {product.description ? (
            product.description.split("\n").map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p className="muted">Описание уточняйте у менеджера.</p>
          )}
          {product.note && <p className={s.noteLine}>{product.note}</p>}
        </div>
        {sizeRows.length > 0 && (
          <div className={s.sizeTable}>
            <div className={s.sizeHead}>
              <span>Размер</span>
              <span>Розница</span>
            </div>
            {sizeRows.map((r) => (
              <div key={r.size} className={s.sizeRow}>
                <span>
                  <b className="mono">{r.size}</b> {r.hint && <span className="muted">{r.hint}</span>}
                </span>
                <span className="mono">{r.price != null ? formatPrice(r.price) : "—"}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className={`wrap ${s.related}`}>
          <div className="sectionHead">
            <div>
              <span className="skewBar" />
              <h2>{product.category.name}: ещё</h2>
            </div>
            <Link href="/#catalog" style={{ fontWeight: 700 }}>
              Весь каталог →
            </Link>
          </div>
          <div className={s.relatedGrid}>
            {related.map((c) => (
              <Link key={c.slug} href={`/catalog/${c.slug}`} className={s.relCard}>
                <div className={`${s.relPhoto} photoBg`}>
                  <ProductImg file={c.image} alt={c.name} sizes="(max-width: 760px) 50vw, 300px" />
                </div>
                <div className={s.relBody}>
                  <b>{c.name}</b>
                  <span className="priceChip" style={{ alignSelf: "flex-start" }}>
                    {(c.basePrice ?? c.cubePrice) != null &&
                      ((c.basePrice != null ? c.baseHasRange : c.cubeHasRange) ? "от " : "") +
                        formatPrice((c.basePrice ?? c.cubePrice)!)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
