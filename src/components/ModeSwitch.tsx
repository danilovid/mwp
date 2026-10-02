"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import s from "./chrome.module.css";

/** Переключатель «Розница / Опт». Розница живёт на главной, опт — на /opt. */
export function ModeSwitch() {
  const pathname = usePathname();
  const isOpt = pathname.startsWith("/opt");
  return (
    <div className={s.modeSwitch} role="group" aria-label="Розничные или оптовые условия">
      <Link href="/" aria-current={isOpt ? undefined : "page"} data-active={!isOpt}>
        Розница
      </Link>
      <Link href="/opt" aria-current={isOpt ? "page" : undefined} data-active={isOpt}>
        Опт
      </Link>
    </div>
  );
}
