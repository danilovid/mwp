"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import s from "../admin.module.css";

const LINKS = [
  { href: "/admin/leads", label: "Заявки" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/categories", label: "Разделы" },
  { href: "/admin/settings", label: "Настройки" },
  { href: "/admin/users", label: "Администраторы" },
];

export function AdminNav({ newLeads }: { newLeads: number }) {
  const path = usePathname();
  return (
    <>
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={s.navLink}
          aria-current={path.startsWith(l.href) ? "page" : undefined}
        >
          {l.label}
          {l.href === "/admin/leads" && newLeads > 0 && <span className={s.badge}>{newLeads}</span>}
        </Link>
      ))}
    </>
  );
}
