"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "./cart";
import s from "./chrome.module.css";

type Theme = "auto" | "light" | "dark";
const THEMES: Theme[] = ["auto", "light", "dark"];
const THEME_LABEL: Record<Theme, string> = { auto: "Авто", light: "Светлая", dark: "Тёмная" };

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("auto");
  useEffect(() => {
    // Тему уже выставил скрипт в <head>; здесь только синхронизируем подпись кнопки
    const t = document.documentElement.dataset.theme;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- значение известно только в браузере
    setTheme(t === "dark" || t === "light" ? t : "auto");
  }, []);

  const next = () => {
    const value = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setTheme(value);
    if (value === "auto") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = value;
    try {
      // «Авто» — это отсутствие записи: тему начинает задавать настройка устройства
      if (value === "auto") localStorage.removeItem("mwp-theme");
      else localStorage.setItem("mwp-theme", value);
    } catch {
      /* без сохранения */
    }
  };

  return (
    <button
      type="button"
      onClick={next}
      className={`${s.pillGlass} ${s.themeBtn}`}
      aria-label={`Тема оформления: ${THEME_LABEL[theme].toLowerCase()}${theme === "auto" ? " — как на устройстве" : ""}. Нажмите, чтобы сменить`}
      title={theme === "auto" ? "Тема как на устройстве" : "Тема выбрана вручную"}
    >
      Тема: {THEME_LABEL[theme].toLowerCase()}
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
