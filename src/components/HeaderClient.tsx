"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "./cart";
import s from "./chrome.module.css";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- тему выставил скрипт в <head>, синхронизируем подпись
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem("mwp-theme", next ? "dark" : "light");
    } catch {
      /* без сохранения */
    }
  };
  return (
    <button type="button" onClick={toggle} className={`${s.pillGlass} ${s.themeBtn}`}>
      {dark ? "Светлая тема" : "Тёмная тема"}
    </button>
  );
}

export function CartLink() {
  const { count, ready } = useCart();
  return (
    <Link href="/cart" className={s.pillGlass} aria-label={`Заявка, товаров: ${count}`}>
      Заявка
      {ready && count > 0 && <span className={s.cartCount}>{count}</span>}
    </Link>
  );
}

export function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- закрываем меню при переходе
    setOpen(false);
  }, [pathname]);
  return (
    <>
      <button
        type="button"
        className={s.burger}
        aria-expanded={open}
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden>
          {open ? (
            <path d="M3 1l12 12M15 1L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M1 1h16M1 7h16M1 13h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>
      <nav className={s.mobileMenu} data-open={open} onClick={() => setOpen(false)}>
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
