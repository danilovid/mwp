import type { Metadata } from "next";
import Link from "next/link";
import { PageBand } from "@/components/SiteChrome";
import { getConstructorCatalog, getConstructorExtras } from "@/lib/constructor";
import { getPublicSettings } from "@/lib/settings";
import { Constructor } from "./Constructor";

export const metadata: Metadata = {
  title: "Собери свой комплект",
  description: "Подберите хоккейную экипировку MWP: размеры, линейка и комплект в одной корзине.",
};

export const dynamic = "force-dynamic";

export default async function ConstructorPage() {
  const [settings, catalog] = await Promise.all([getPublicSettings(), getConstructorCatalog()]);
  if (!catalog.length) {
    return <section className="wrap" style={{ paddingBlock: 48 }}>
      <h1>Экипировка пока недоступна</h1>
      <p>Вернитесь в каталог или уточните наличие у MWP.</p>
      <Link href="/#catalog">Открыть каталог</Link>
    </section>;
  }
  const extras = await getConstructorExtras(catalog);
  return (
    <>
      <PageBand
        settings={settings}
        crumbs={[{ href: "/", label: "Главная" }, { label: "Подбор экипировки" }]}
        title="Собери комплект"
        lead="Укажите рост, выберите снаряжение на фигуре — и комплект уйдёт в заявку целиком."
      />
      <Constructor catalog={catalog} extras={extras} />
    </>
  );
}
