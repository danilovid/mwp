"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isOptRoute } from "./nav";
import s from "./chrome.module.css";

/**
 * Переключатель «Розница / Опт».
 *
 * Какие маршруты относятся к опту — в ./nav, рядом со ссылками меню: раздел и его
 * меню должны меняться вместе. На страницах вне обоих режимов — о компании, товарный
 * знак, карточка товара — не подсвечивается ничего: переключатель там просто навигация,
 * и подсвечивать «Розницу» значило бы утверждать то, чего на странице нет.
 */
export function ModeSwitch() {
  const pathname = usePathname();
  const isOpt = isOptRoute(pathname);
  const isRetail = pathname === "/";
  return (
    <div className={s.modeSwitch} role="group" aria-label="Розничные или оптовые условия">
      <Link href="/" aria-current={isRetail ? "page" : undefined} data-active={isRetail}>
        Розница
      </Link>
      <Link href="/opt" aria-current={isOpt ? "page" : undefined} data-active={isOpt}>
        Опт
      </Link>
    </div>
  );
}
