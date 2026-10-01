import { CartProvider } from "@/components/cart";
import { Metrika } from "@/components/Metrika";
import { SiteFooter } from "@/components/SiteChrome";
import { getPublicSettings } from "@/lib/settings";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getPublicSettings();
  return (
    <CartProvider>
      <main>{children}</main>
      <SiteFooter settings={settings} />
      <Metrika id={settings.metrikaId} />
    </CartProvider>
  );
}
