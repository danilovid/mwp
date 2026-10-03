"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import s from "./chrome.module.css";

/**
 * Переключатель «Розница / Опт».
 *
 * Режим определяется явными списками, а не префиксом: /zakupki относится к опту,
 * хотя с /opt не начинается. На страницах вне обоих режимов — о компании, товарный
 * знак, карточка товара — не подсвечивается ничего: переключатель там просто навигация,
 * и подсвечивать «Розницу» значило бы утверждать то, чего на странице нет.
 */
const RETAIL = ["/"];
const OPT = ["/opt", "/zakupki"];
const inSection = (pathname: string, routes: string[]) =>
  routes.some((r) => pathname === r || (r !== "/" && pathname.startsWith(r + "/")));

export function ModeSwitch() {
  const pathname = usePathname();
  const isOpt = inSection(pathname, OPT);
  const isRetail = inSection(pathname, RETAIL);
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
