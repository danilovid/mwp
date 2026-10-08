import type { Metadata } from "next";
import Link from "next/link";
import { getConstructorCatalog } from "@/lib/constructor";
import { Constructor } from "./Constructor";

export const metadata: Metadata = {
  title: "Собери свой комплект",
  description: "Подберите хоккейную экипировку MWP: размеры, линейка и комплект в одной корзине.",
};

export const dynamic = "force-dynamic";

export default async function ConstructorPage() {
  const catalog = await getConstructorCatalog();
  if (!catalog.length) {
    return <section className="wrap" style={{ paddingBlock: 48 }}>
      <h1>Экипировка пока недоступна</h1>
      <p>Вернитесь в каталог или уточните наличие у MWP.</p>
      <Link href="/#catalog">Открыть каталог</Link>
    </section>;
  }
  return <Constructor catalog={catalog} />;
}
