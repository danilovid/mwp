import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { parseOptions, parseValues } from "@/lib/catalog";
import { db } from "@/lib/db";
import { imageUrl } from "@/lib/media";
import { deleteImage, deleteProduct, moveImage, setImageOption } from "../../../actions";
import { ConfirmButton } from "../../../ui";
import { ProductForm } from "./ProductForm";
import { Uploader } from "./Uploader";
import s from "../../../admin.module.css";

export const metadata: Metadata = { title: "Товар" };

export default async function EditProductPage(props: PageProps<"/admin/products/[id]">) {
  const { id } = await props.params;
  const product = await db.product.findUnique({
    where: { id: Number(id) },
    include: {
      images: { orderBy: { sort: "asc" } },
      editions: { orderBy: { sort: "asc" } },
    },
  });
  if (!product) notFound();
  const [categories, baseCandidates] = await Promise.all([
    db.category.findMany({ orderBy: { sort: "asc" } }),
    db.product.findMany({
      where: { line: "base", NOT: { id: product.id } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, cube: { select: { id: true } } },
    }),
  ]);
  const options = parseOptions(product.options);
  const optionValues = options.flatMap((o) => o.values);

  return (
    <>
      <div className={s.head}>
        <div>
          <Link href="/admin/products" className="muted" style={{ fontSize: 13 }}>
            ← Товары
          </Link>
          <h1>{product.name}</h1>
        </div>
        <a href={`/catalog/${product.slug}`} target="_blank" rel="noopener noreferrer" className={s.btn}>
          {product.published ? "Открыть на сайте ↗" : "Предпросмотр недоступен — товар скрыт"}
        </a>
      </div>

      <ProductForm
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          line: product.line,
          baseId: product.baseId,
          note: product.note,
          description: product.description,
          published: product.published,
          sort: product.sort,
          kitSort: product.kitSort,
          ozonUrl: product.ozonUrl,
          marketUrl: product.marketUrl,
          options,
          editions: product.editions.map((e) => ({
            values: parseValues(e.values),
            price: e.price,
            priceOpt1: e.priceOpt1,
            priceOpt2: e.priceOpt2,
          })),
        }}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        baseCandidates={baseCandidates
          .filter((b) => !b.cube || b.cube.id === product.id)
          .map((b) => ({ id: b.id, name: b.name }))}
      />

      <div className={s.card}>
        <h2>Фото</h2>
        <p className={s.cardHint}>
          Первое фото — обложка в каталоге. Фото можно привязать к значению опции (например, к цвету): при выборе цвета на
          сайте покажется это фото. Загружаемые фото переводятся в WebP.
        </p>
        <Uploader productId={product.id} />
        {product.images.length === 0 ? (
          <p className="muted">Фото пока нет.</p>
        ) : (
          <div className={s.images}>
            {product.images.map((img, i) => (
              <div key={img.id} className={s.imgCard}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl(img.file, 480)} alt="" className="photoBg" />
                <div className={s.imgTools}>
                  {optionValues.length > 0 && (
                    <form action={setImageOption} className={s.row} style={{ flexWrap: "nowrap" }}>
                      <input type="hidden" name="id" value={img.id} />
                      <select name="optionValue" defaultValue={img.optionValue} aria-label="Привязка к опции">
                        <option value="">Без привязки</option>
                        {optionValues.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className={`${s.btn} ${s.btnSmall}`}>
                        ✓
                      </button>
                    </form>
                  )}
                  <div className={s.row} style={{ gap: 4 }}>
                    <form action={moveImage}>
                      <input type="hidden" name="id" value={img.id} />
                      <input type="hidden" name="dir" value="up" />
                      <button type="submit" className={`${s.btn} ${s.btnSmall}`} disabled={i === 0} aria-label="Раньше">
                        ←
                      </button>
                    </form>
                    <form action={moveImage}>
                      <input type="hidden" name="id" value={img.id} />
                      <input type="hidden" name="dir" value="down" />
                      <button
                        type="submit"
                        className={`${s.btn} ${s.btnSmall}`}
                        disabled={i === product.images.length - 1}
                        aria-label="Позже"
                      >
                        →
                      </button>
                    </form>
                    <form action={deleteImage} style={{ marginLeft: "auto" }}>
                      <input type="hidden" name="id" value={img.id} />
                      <ConfirmButton message="Удалить фото?" className={`${s.btn} ${s.btnSmall} ${s.btnDanger}`}>
                        Удалить
                      </ConfirmButton>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form action={deleteProduct}>
        <input type="hidden" name="id" value={product.id} />
        <ConfirmButton message={`Удалить «${product.name}» вместе с фото? Это нельзя отменить.`}>Удалить товар</ConfirmButton>
      </form>
    </>
  );
}
