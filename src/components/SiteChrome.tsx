import Link from "next/link";
import { telHref, type PublicSettings } from "@/lib/settings";
import { CartLink, MobileMenu, ThemeToggle } from "./HeaderClient";
import s from "./chrome.module.css";

const NAV = [
  { href: "/#catalog", label: "Каталог" },
  { href: "/#prices", label: "Цены и опт" },
  { href: "/#kit", label: "Комплект" },
  { href: "/#order", label: "Для клуба" },
  { href: "/about", label: "О компании" },
  { href: "#contacts", label: "Контакты" },
];

export function Logo() {
  return (
    <Link href="/" className={s.logo} aria-label="MWP — на главную">
      <span className={s.logoBar} />
      <span className={s.logoText}>MWP</span>
    </Link>
  );
}

export function SiteHeader({ settings }: { settings: PublicSettings }) {
  return (
    <header className={s.header}>
      <Logo />
      <nav className={s.nav} aria-label="Основное меню">
        {NAV.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className={s.headerTools}>
        <ThemeToggle />
        <CartLink />
        <a href={telHref(settings.phone2)} className={s.phonePill}>
          {settings.phone2.replace(/^8 /, "+7 ")}
        </a>
        <MobileMenu links={NAV} />
      </div>
    </header>
  );
}

/** Градиентная полоса с шапкой для внутренних страниц. */
export function PageBand({
  settings,
  crumbs,
  title,
  lead,
}: {
  settings: PublicSettings;
  crumbs?: { href?: string; label: string }[];
  title?: string;
  lead?: string;
}) {
  return (
    <section className={s.band}>
      <div className={s.bandStripe} />
      <SiteHeader settings={settings} />
      <div className={s.bandBody}>
        {crumbs && (
          <nav className={s.crumbs} aria-label="Навигация">
            {crumbs.map((c, i) => (
              <span key={i}>
                {c.href ? <Link href={c.href}>{c.label}</Link> : c.label}
                {i < crumbs.length - 1 && " /"}
              </span>
            ))}
          </nav>
        )}
        {title && <h1 className={s.bandTitle}>{title}</h1>}
        {lead && <p className={s.bandLead}>{lead}</p>}
      </div>
    </section>
  );
}

export function SiteFooter({ settings }: { settings: PublicSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer id="contacts" className={s.footer}>
      <div className={s.footerGrid}>
        <div className={s.footerCol}>
          <span className={s.footerLogo}>MWP</span>
          <span>{settings.company}</span>
          <span>{settings.address}</span>
          <span className={s.footerMono}>ИНН {settings.inn}</span>
          <span className={s.footerMono}>ОГРН {settings.ogrn}</span>
        </div>
        <div className={`${s.footerCol} ${s.footerMono}`}>
          <a href={telHref(settings.phone1)}>{settings.phone1}</a>
          <a href={telHref(settings.phone2)}>{settings.phone2}</a>
          {settings.messengers && (
            <span className={s.footerSmall} style={{ fontFamily: "var(--font)" }}>
              {settings.messengers} — {settings.phone2}
            </span>
          )}
        </div>
        <div className={s.footerCol}>
          <a href={`mailto:${settings.email1}`} className={s.footerAccent}>
            {settings.email1}
          </a>
          {settings.email2 && (
            <a href={`mailto:${settings.email2}`} className={s.footerMono}>
              {settings.email2}
            </a>
          )}
          <a href={settings.priceListUrl} target="_blank" rel="noopener noreferrer">
            Оптовый прайс-лист
          </a>
          <a href="/files/sertifikat-ROSS-RU-OS02-N00479.pdf">Сертификат, PDF</a>
        </div>
        <div className={s.footerCol}>
          <Link href="/#catalog">Каталог</Link>
          <Link href="/about">О компании и производстве</Link>
          <a href={settings.ozonUrl} target="_blank" rel="noopener noreferrer">
            Магазин на OZON
          </a>
          <a href={settings.marketUrl} target="_blank" rel="noopener noreferrer">
            Магазин на Яндекс Маркете
          </a>
        </div>
        <div className={s.footerLegal}>
          <span>Masters World и MWP — зарегистрированные товарные знаки, свидетельство № 1265239.</span>
          <span>MWP, {year}</span>
        </div>
      </div>
    </footer>
  );
}
