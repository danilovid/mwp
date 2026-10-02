import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { PageBand } from "@/components/SiteChrome";
import { getCatalog, getKit } from "@/lib/catalog";
import { getPublicSettings, telHref } from "@/lib/settings";
import { CatalogSection } from "../CatalogSection";
import { KitAndClub } from "../KitAndClub";
import { SupplyCard } from "../SupplyCard";
import s from "./opt.module.css";

export const metadata: Metadata = {
  title: "Оптовые закупки хоккейной экипировки",
  description:
    "MWP — производитель хоккейной экипировки в Чебоксарах. Оптовые поставки спортивным магазинам, клубам и спортшколам: прайс-лист, комплектация на игрока, заказ на группу.",
  alternates: { canonical: "/opt" },
};

export default async function OptPage() {
  const [settings, { cards, categories }, kit] = await Promise.all([getPublicSettings(), getCatalog(), getKit()]);

  return (
    <>
      <PageBand
        settings={settings}
        crumbs={[{ href: "/", label: "Розница" }, { label: "Опт" }]}
        title="Оптовые закупки"
        lead="Спортивным магазинам, хоккейным клубам и спортшколам. Производим сами, в Чебоксарах — поэтому работаем напрямую, без посредников."
      />

      <section className={`wrap ${s.steps}`}>
        <div className={s.step}>
          <span className={s.stepLabel}>Ступень 1</span>
          <b>от 30 000 ₽</b>
          <span className="muted">Оптовая цена для заказа от тридцати тысяч рублей.</span>
        </div>
        <div className={s.step}>
          <span className={s.stepLabel}>Ступень 2</span>
          <b>от 100 000 ₽</b>
          <span className="muted">Цена для крупных закупок — магазинам и спортшколам.</span>
        </div>
        <a href={settings.priceListUrl} target="_blank" rel="noopener noreferrer" className={`${s.step} ${s.stepFile}`}>
          <span className={s.stepLabel}>Документ</span>
          <b>Прайс-лист</b>
          <span>Цены по ступеням и бланк заказа ↗</span>
        </a>
      </section>

      <section className={`wrap ${s.note}`}>
        <p>
          Точная цена по каждой позиции зависит от суммы заказа и указана в прайс-листе. Окончательные условия для
          спортивных магазинов и крупных закупок обговариваем индивидуально — оставьте заявку или позвоните.
        </p>
      </section>

      <CatalogSection cards={cards} categories={categories} mode="opt" />

      <KitAndClub kit={kit} />

      <section className={`wrap ${s.trio}`}>
        <SupplyCard />
        <div className={s.tint}>
          <b>Документы</b>
          <p>Сертификат соответствия и свидетельство на товарный знак — можно скачать и приложить к закупке.</p>
          <a href="/files/sertifikat-ROSS-RU-OS02-N00479.pdf">Сертификат соответствия, PDF ↓</a>
          <Link href="/tovarnyj-znak">Товарный знак Masters World MWP →</Link>
        </div>
        <div className={s.tint}>
          <b>Реквизиты</b>
          <p className="mono">
            {settings.company}
            <br />
            ИНН {settings.inn} · КПП {settings.kpp}
            <br />
            ОГРН {settings.ogrn}
          </p>
          <Link href="/about#address">Адрес и карта →</Link>
        </div>
      </section>

      <section id="request" className={`wrap ${s.formWrap}`}>
        <div className={s.formText}>
          <span className="skewBar" />
          <h2>Оставьте заявку</h2>
          <p className="muted">
            Напишите, какие позиции, размеры и количество вас интересуют — рассчитаем стоимость и сроки.
          </p>
          <div className={s.contacts}>
            <a href={telHref(settings.phone1)} className="mono">
              {settings.phone1}
            </a>
            <a href={telHref(settings.phone2)} className="mono">
              {settings.phone2}
            </a>
            {settings.messengers && <span className="muted">{settings.messengers}</span>}
            <a href={`mailto:${settings.email1}`} className="mono">
              {settings.email1}
            </a>
          </div>
        </div>
        <div className={s.formCard}>
          <LeadForm
            type="wholesale"
            showOrg
            submitLabel="Отправить запрос"
            commentPlaceholder="Какие позиции, размеры и количество вас интересуют"
          />
        </div>
      </section>
    </>
  );
}
