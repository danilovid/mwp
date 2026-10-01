import type { Metadata } from "next";
import { PageBand } from "@/components/SiteChrome";
import { getPublicSettings } from "@/lib/settings";
import { CartView } from "./CartView";

export const metadata: Metadata = { title: "Заявка", robots: { index: false } };

export default async function CartPage() {
  const settings = await getPublicSettings();
  return (
    <>
      <PageBand
        settings={settings}
        crumbs={[{ href: "/", label: "Главная" }, { label: "Заявка" }]}
        title="Заявка на заказ"
        lead="Соберите нужные позиции и отправьте заявку — менеджер подтвердит наличие, стоимость доставки и способ оплаты."
      />
      <CartView />
    </>
  );
}
