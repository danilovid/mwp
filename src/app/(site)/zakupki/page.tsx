import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { PageBand } from "@/components/SiteChrome";
import { getCatalog } from "@/lib/catalog";
import { getPublicSettings, telHref } from "@/lib/settings";
import s from "./zakupki.module.css";

export const metadata: Metadata = {
  title: "Закупки и тендеры: экипировка для клубов и спортшкол",
  description:
    "MWP — производитель хоккейной защиты в Чебоксарах. Комплектуем заявку целиком: своя защита игрока плюс поставка клюшек, вратарской экипировки, коньков и баулов. Документы для закупки, коммерческое предложение, работа по 44-ФЗ и 223-ФЗ.",
  alternates: { canonical: "/zakupki" },
};

/** Факт, которого я пока не знаю. Виден в вёрстке, чтобы не уехал в прод незамеченным. */
function Todo({ children }: { children: React.ReactNode }) {
  return <mark className={s.todo}>Уточнить: {children}</mark>;
}

export default async function ZakupkiPage() {
  const [settings, { categories }] = await Promise.all([getPublicSettings(), getCatalog()]);

  return (
    <>
      <PageBand
        settings={settings}
        crumbs={[{ href: "/opt", label: "Опт" }, { label: "Закупки и тендеры" }]}
        title="Закупки для клубов и спортшкол"
        lead="Закроем заявку целиком — от защиты собственного производства до клюшек, вратарской экипировки и баулов. Один поставщик, один договор, один комплект документов."
      />

      <section className={`wrap ${s.lead}`}>
        <div className={s.leadMain}>
          <p>
            Пришлите спецификацию или техническое задание — ответим, что закроем своим производством, что поставим
            под заказ, и в какой срок. Работаем с прямыми закупками клубов, по 44-ФЗ и 223-ФЗ, а также с компаниями,
            которые участвуют в процедурах и ищут поставщика.
          </p>
          <div className={s.leadActions}>
            <a href="#request" className="btnRed">
              Прислать спецификацию
            </a>
            <a href="#kp" className="btnGhost">
              Запросить коммерческое предложение
            </a>
          </div>
        </div>
        <div className={s.leadAside}>
          <b>Отвечаем</b>
          <Todo>за какой срок отвечаете на спецификацию — это сильный аргумент, если он короткий</Todo>
          <a href={telHref(settings.phone1)} className="mono">
            {settings.phone1}
          </a>
          <a href={`mailto:${settings.email1}`} className="mono">
            {settings.email1}
          </a>
          {settings.messengers && <span className="muted">{settings.messengers}</span>}
        </div>
      </section>

      <section className={`wrap ${s.split}`}>
        <div className={s.col}>
          <span className="skewBar" />
          <h2>Производим сами</h2>
          <p className="muted">
            Защита игрока собственного производства в Чебоксарах. На неё есть сертификат соответствия и своя размерная
            сетка по росту.
          </p>
          <ul className={s.list}>
            {categories.map((c) => (
              <li key={c.slug}>
                {c.name} <span className="muted">· {c.count}</span>
              </li>
            ))}
          </ul>
          <Link href="/opt" className={s.colLink}>
            Каталог и оптовые цены →
          </Link>
        </div>

        <div className={`${s.col} ${s.colAlt}`}>
          <span className="skewBar" />
          <h2>Поставляем под заказ</h2>
          <p className="muted">
            Это не наше производство — мы закупаем и привозим вместе с основным заказом, чтобы вам не нужен был второй
            поставщик.
          </p>
          <ul className={s.list}>
            <li>Клюшки</li>
            <li>Вратарская экипировка</li>
            <li>Коньки</li>
            <li>Баулы и сумки</li>
            <li>
              <Todo>какие ещё категории комплектуете — форма, гамаши, аксессуары?</Todo>
            </li>
          </ul>
          <p className={s.small}>
            Конкретные марки называем в ответ на спецификацию — подбираем под ваше задание и бюджет.
          </p>
        </div>
      </section>

      <section className={`wrap ${s.equal}`}>
        <div>
          <span className="skewBar" />
          <h2>Если в задании указана марка</h2>
          <p>
            В техническом задании обычно стоит конкретная модель с оговоркой «или эквивалент». Пришлите задание — мы
            подберём эквивалент и приложим обоснование соответствия по характеристикам: материал, конструкция,
            размерный ряд, класс защиты. По своей продукции прикладываем сертификат соответствия.
          </p>
        </div>
      </section>

      <section id="kp" className={`wrap ${s.kp}`}>
        <div className={s.kpText}>
          <span className="skewBar" />
          <h2>Коммерческое предложение для обоснования цены</h2>
          <p>
            Если вы обосновываете начальную максимальную цену контракта и собираете предложения поставщиков — пришлите
            перечень позиций, подготовим коммерческое предложение на бланке с реквизитами и сроком действия цены.
          </p>
          <p className={s.small}>
            <Todo>срок действия цены в КП — 30 дней? и готовы ли ставить цены с НДС</Todo>
          </p>
        </div>
        <a href="#request" className="btnRed">
          Запросить КП
        </a>
      </section>

      <section className={`wrap ${s.docs}`}>
        <div className="sectionHead">
          <div>
            <span className="skewBar" />
            <h2>Документы для закупки</h2>
            <span className="muted">Можно скачать и приложить к делу</span>
          </div>
        </div>
        <div className={s.docGrid}>
          <a href="/files/sertifikat-ROSS-RU-OS02-N00479.pdf" className={s.doc}>
            <b>Сертификат соответствия</b>
            <span>№ РОСС RU.ОС02.Н00479, действует с 29.09.2026 по 28.09.2029</span>
            <span className="muted">Система добровольной сертификации, ТУ 96 14-002-03037400-2005</span>
            <span className={s.docLink}>Скачать PDF ↓</span>
          </a>
          <Link href="/tovarnyj-znak" className={s.doc}>
            <b>Свидетельство на товарный знак</b>
            <span>№ 1265239 «Masters World MWP», до 14.10.2035</span>
            <span className="muted">Подтверждает, что марка принадлежит нам</span>
            <span className={s.docLink}>Открыть →</span>
          </Link>
          <div className={s.doc}>
            <b>Карточка предприятия</b>
            <span className="mono">
              {settings.company}
              <br />
              ИНН {settings.inn} · КПП {settings.kpp}
              <br />
              ОГРН {settings.ogrn}
              <br />
              {settings.address}
            </span>
            <Todo>выложить карточку файлом с банковскими реквизитами, и нужны ли устав и выписка ЕГРЮЛ</Todo>
          </div>
        </div>
      </section>

      <section className={`wrap ${s.terms}`}>
        <div className="sectionHead">
          <div>
            <span className="skewBar" />
            <h2>Условия</h2>
          </div>
        </div>
        <dl className={s.termsList}>
          <div>
            <dt>Срок изготовления</dt>
            <dd>
              <Todo>сколько от подтверждения заказа до отгрузки, и что бывает в наличии</Todo>
            </dd>
          </div>
          <div>
            <dt>Налогообложение</dt>
            <dd>
              <Todo>работаете с НДС или на упрощёнке — первый вопрос бюджетного закупщика</Todo>
            </dd>
          </div>
          <div>
            <dt>Оптовые цены</dt>
            <dd>
              Ступени от {settings.optStep1} и от {settings.optStep2}. Для крупных закупок цена обсуждается
              индивидуально.
            </dd>
          </div>
          <div>
            <dt>Оплата и договор</dt>
            <dd>
              <Todo>работаете по договору поставки, возможна ли отсрочка, нужен ли аванс</Todo>
            </dd>
          </div>
          <div>
            <dt>Доставка</dt>
            <dd>Транспортными компаниями по России и в другие страны. Самовывоз с производства в Чебоксарах.</dd>
          </div>
        </dl>
      </section>

      <section className={`wrap ${s.agents}`}>
        <div>
          <b>Участвуете в процедуре и ищете поставщика?</b>
          <p>
            Работаем с компаниями, которые выходят на площадки сами. Дадим цены, сроки, документы и отгрузим под ваш
            контракт. Напишите, что требуется по заданию.
          </p>
        </div>
      </section>

      <section id="request" className={`wrap ${s.formWrap}`}>
        <div className={s.formText}>
          <span className="skewBar" />
          <h2>Прислать спецификацию</h2>
          <p className="muted">
            Опишите, что требуется: позиции, количество, размеры, сроки поставки. Если есть техническое задание —
            вставьте его текстом или напишите, что пришлёте файлом на почту.
          </p>
          <p className={s.small}>
            <Todo>
              форма пока не принимает файлы — приём xlsx и pdf нужно делать отдельно, это день работы с ограничениями
              по размеру, типам и защитой от спама
            </Todo>
          </p>
        </div>
        <div className={s.formCard}>
          <LeadForm
            type="tender"
            showOrg
            submitLabel="Отправить запрос"
            commentPlaceholder="Позиции, количество, размеры, сроки поставки. Или вставьте текст техзадания."
          />
        </div>
      </section>
    </>
  );
}
