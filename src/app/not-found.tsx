import Link from "next/link";
import { CartProvider } from "@/components/cart";
import { PageBand, SiteFooter } from "@/components/SiteChrome";
import { getPublicSettings } from "@/lib/settings";

export default async function NotFound() {
  const settings = await getPublicSettings();
  return (
    <CartProvider>
      <main>
        <PageBand
          settings={settings}
          title="Страница не найдена"
          lead="Возможно, товар переехал или адрес набран с ошибкой."
        />
        <section className="wrap" style={{ paddingTop: 40, paddingBottom: 72, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/#catalog" className="btnRed">
            Перейти в каталог
          </Link>
          <Link href="/" className="btnGhost">
            На главную
          </Link>
        </section>
      </main>
      <SiteFooter settings={settings} />
    </CartProvider>
  );
}
