/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { PageBand } from "@/components/SiteChrome";
import { getPublicSettings } from "@/lib/settings";
import s from "./trademark.module.css";

export const metadata: Metadata = {
  title: "Товарный знак Masters World MWP",
  description:
    "Свидетельство на товарный знак № 1265239 «Masters World MWP». Зарегистрирован в Государственном реестре товарных знаков РФ, срок действия — до 14.10.2035.",
  alternates: { canonical: "/tovarnyj-znak" },
};

/** Данные со свидетельства № 1265239 (materials/docs/1265239.eod.pdf). */
const MARK = {
  file: "tovarnyj-znak-1265239",
  rows: [
    ["Товарный знак", "Masters World · MWP"],
    ["Номер свидетельства", "1265239"],
    ["Номер заявки", "2025814748"],
    ["Приоритет товарного знака", "14 октября 2025 г."],
    ["Дата регистрации", "20 сентября 2026 г."],
    ["Срок действия регистрации", "до 14 октября 2035 г."],
    ["Правообладатель", "ООО «КВГ», г. Чебоксары"],
    ["Реестр", "Государственный реестр товарных знаков и знаков обслуживания Российской Федерации"],
  ],
};

export default async function TrademarkPage() {
  const settings = await getPublicSettings();

  return (
    <>
      <PageBand
        settings={settings}
        crumbs={[{ href: "/", label: "Главная" }, { href: "/about", label: "О компании" }, { label: "Товарный знак" }]}
        title="Товарный знак Masters World MWP"
        lead="MWP расшифровывается как Masters World. Марка зарегистрирована в Государственном реестре товарных знаков Российской Федерации."
      />

      <section className={`wrap ${s.main}`}>
        <a href={`/files/${MARK.file}.pdf`} className={s.sheet} aria-label="Открыть свидетельство в PDF">
          <img src={`/images/docs/${MARK.file}.webp`} alt="Свидетельство на товарный знак № 1265239" />
        </a>

        <div className={s.side}>
          <div className={s.card}>
            <span className="skewBar" />
            <h2>Свидетельство № 1265239</h2>
            <dl className={s.rows}>
              {MARK.rows.map(([k, v]) => (
                <div key={k} className={s.row}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <a href={`/files/${MARK.file}.pdf`} className="btnRed">
              Скачать свидетельство, PDF ↓
            </a>
          </div>

          <div className={s.note}>
            <b>Почему в свидетельстве другая компания</b>
            <p>
              Правообладателем знака указано ООО «КВГ» — прежнее название компании. Производство и продажи сегодня
              ведёт {settings.company}, её реквизиты указаны в контактах.
            </p>
          </div>

          <div className={s.note}>
            <b>Зачем это нужно знать</b>
            <p>
              Знак «Masters World MWP» принадлежит нам, и экипировку под ним выпускаем только мы. Если марка встретилась
              вам у стороннего продавца — напишите на{" "}
              <a href={`mailto:${settings.email1}`}>{settings.email1}</a>, мы проверим.
            </p>
          </div>
        </div>
      </section>

      <section className={`wrap ${s.more}`}>
        <Link href="/about#documents" className={s.moreLink}>
          Все документы компании →
        </Link>
        <a href="/files/sertifikat-ROSS-RU-OS02-N00479.pdf" className={s.moreLink}>
          Сертификат соответствия, PDF ↓
        </a>
        <Link href="/#catalog" className={s.moreLink}>
          Каталог с ценами →
        </Link>
      </section>
    </>
  );
}
