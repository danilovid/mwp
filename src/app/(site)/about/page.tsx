/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { FactoryImg } from "@/components/ProductImg";
import { PageBand } from "@/components/SiteChrome";
import { FACTORY_STAGES } from "@/lib/factory";
import { getPublicSettings, telHref } from "@/lib/settings";
import s from "./about.module.css";

export const metadata: Metadata = {
  title: "О компании и производстве",
  description:
    "MWP — российский производитель хоккейной экипировки из Чебоксар. Литьё, раскрой, пошив и сборка на собственном производстве.",
  alternates: { canonical: "/about" },
};

const DOCS: { title: string; lines: string[]; file: string; page?: string }[] = [
  {
    title: "Сертификат соответствия",
    lines: [
      "№ РОСС RU.ОС02.Н00479",
      "Система добровольной сертификации «Единая экспертная система»",
      "Действует с 29.09.2026 по 28.09.2029",
      "Хоккейная экипировка по ТУ 96 14-002-03037400-2005 «Элементы экипировочные хоккеистов»",
    ],
    file: "sertifikat-ROSS-RU-OS02-N00479",
  },
  {
    title: "Свидетельство на товарный знак",
    lines: [
      "№ 1265239 — «Masters World MWP»",
      "Зарегистрировано в Государственном реестре товарных знаков 20.09.2026",
      "Срок действия регистрации — до 14.10.2035",
    ],
    file: "tovarnyj-znak-1265239",
    page: "/tovarnyj-znak",
  },
];

export default async function AboutPage() {
  const settings = await getPublicSettings();
  const mapPoint = `${settings.mapLon},${settings.mapLat}`;

  return (
    <>
      <PageBand
        settings={settings}
        crumbs={[{ href: "/", label: "Главная" }, { label: "О компании" }]}
        title="О компании MWP"
        lead="Мы — российский производитель хоккейной экипировки. Работаем уже более 25 лет и находимся в городе Чебоксары."
      />

      <section className={`wrap ${s.intro}`}>
        <div className={s.introText}>
          <p className={s.lead}>
            Мы производим хоккейную амуницию MWP: шлемы, нагрудники, налокотники, шорты, щитки, перчатки, подтяжки и
            другие элементы.
          </p>
          <p>
            Отправляем заказы транспортными компаниями по всей России и в другие страны. Вы можете оформить заказ у нас
            на сайте или в наших магазинах на маркетплейсах.
          </p>
          <div className={s.facts}>
            <div>
              <b>25+ лет</b>
              <span>производим хоккейную экипировку</span>
            </div>
            <div>
              <b>Чебоксары</b>
              <span>собственное производство</span>
            </div>
            <div>
              <b>Вся Россия</b>
              <span>и другие страны — доставка транспортными компаниями</span>
            </div>
          </div>
          <div className={s.introLinks}>
            <Link href="/#catalog" className="btnRed">
              Каталог и цены
            </Link>
            <Link href="/#prices" className="btnGhost">
              Оптовые продажи
            </Link>
          </div>
        </div>
        <figure className={s.storefront}>
          <FactoryImg name="storefront" alt="Вход в офис Masters World — хоккейная экипировка" sizes="(max-width: 900px) 100vw, 480px" eager />
        </figure>
      </section>

      <section id="factory" className={`wrap ${s.stages}`}>
        <div className="sectionHead">
          <div>
            <span className="skewBar" />
            <h2>Производство</h2>
            <span className="muted">Литьё, раскрой, пошив и сборка — в Чебоксарах</span>
          </div>
        </div>
        {FACTORY_STAGES.map((stage, n) => (
          <article key={stage.title} className={s.stage}>
            <div className={s.stageText}>
              <span className={s.stageNum}>0{n + 1}</span>
              <h3>{stage.title}</h3>
              <p>{stage.text}</p>
            </div>
            <div className={s.stagePhotos}>
              {stage.photos.map((p) => (
                <figure key={p.photo} className={s.photo}>
                  <FactoryImg name={p.photo} alt={p.caption} sizes="(max-width: 900px) 50vw, 240px" />
                  <figcaption>
                    <span>{p.caption}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section id="documents" className={`wrap ${s.docs}`}>
        <div className="sectionHead">
          <div>
            <span className="skewBar" />
            <h2>Документы</h2>
          </div>
        </div>
        <div className={s.docGrid}>
          {DOCS.map((d) => (
            <a key={d.file} href={d.page ?? `/files/${d.file}.pdf`} className={s.doc}>
              <span className={s.docThumb}>
                <img src={`/images/docs/${d.file}.webp`} alt={d.title} loading="lazy" />
              </span>
              <span className={s.docText}>
                <b>{d.title}</b>
                {d.lines.map((l) => (
                  <span key={l}>{l}</span>
                ))}
                <span className={s.docLink}>{d.page ? "Подробнее о знаке →" : "Скачать PDF ↓"}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section id="address" className={`wrap ${s.contacts}`}>
        <div className={s.contactCard}>
          <span className="skewBar" />
          <h2>Контакты</h2>
          <p className="muted">Мы с удовольствием ответим на ваши вопросы.</p>
          <dl>
            <dt>Адрес</dt>
            <dd>{settings.address}</dd>
            <dt>Телефон</dt>
            <dd className="mono">
              <a href={telHref(settings.phone1)}>{settings.phone1}</a>
              <br />
              <a href={telHref(settings.phone2)}>{settings.phone2}</a>
              {settings.messengers && <span className={s.small}>{settings.messengers}</span>}
            </dd>
            <dt>Электронная почта</dt>
            <dd className="mono">
              <a href={`mailto:${settings.email1}`}>{settings.email1}</a>
              {settings.email2 && (
                <>
                  <br />
                  <a href={`mailto:${settings.email2}`}>{settings.email2}</a>
                </>
              )}
            </dd>
            <dt>Реквизиты</dt>
            <dd>
              {settings.company}
              <br />
              <span className="mono">
                ИНН {settings.inn} · КПП {settings.kpp}
                <br />
                ОГРН {settings.ogrn}
              </span>
            </dd>
          </dl>
        </div>
        <div className={s.map}>
          <iframe
            title={`Карта: ${settings.addressShort}`}
            src={`https://yandex.ru/map-widget/v1/?ll=${encodeURIComponent(mapPoint)}&z=16&pt=${encodeURIComponent(mapPoint + ",pm2rdm")}`}
            loading="lazy"
            allowFullScreen
          />
          <p className={s.mapNote}>
            Производство находится по адресу: <b>{settings.productionAddress}</b>
          </p>
        </div>
      </section>
    </>
  );
}
