"use client";

import { useEffect, useRef, useState } from "react";
import s from "./lead.module.css";

export type LeadItem = {
  name: string;
  details?: string;
  qty: number;
  price?: number;
  productId?: number;
  values?: Record<string, string>;
};
export type LeadType = "order" | "club" | "wholesale" | "tender";

type Props = {
  type: LeadType;
  items?: LeadItem[];
  total?: number | null;
  showOrg?: boolean;
  showAddress?: boolean;
  submitLabel?: string;
  commentPlaceholder?: string;
  onSent?: () => void;
};

export function LeadForm({
  type,
  items = [],
  total = null,
  showOrg,
  showAddress,
  submitLabel = "Отправить заявку",
  commentPlaceholder,
  onSent,
}: Props) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email"),
          org: form.get("org") ?? "",
          address: form.get("address") ?? "",
          comment: form.get("comment"),
          website: form.get("website"),
          items,
          total,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Не удалось отправить заявку");
      setState("sent");
      onSent?.();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Не удалось отправить заявку");
    }
  }

  if (state === "sent") {
    return (
      <div className={s.done} role="status">
        <b>Заявка отправлена</b>
        <span>Менеджер свяжется с вами в рабочее время, чтобы уточнить детали.</span>
      </div>
    );
  }

  return (
    <form className={s.form} onSubmit={submit}>
      <div className={s.cols}>
        <label className="field">
          Имя *
          <input name="name" required maxLength={120} autoComplete="name" />
        </label>
        <label className="field">
          Телефон *
          <input name="phone" required maxLength={40} type="tel" autoComplete="tel" placeholder="+7" />
        </label>
        <label className="field">
          Электронная почта
          <input name="email" type="email" maxLength={120} autoComplete="email" />
        </label>
        {showOrg && (
          <label className="field">
            Организация или клуб
            <input name="org" maxLength={200} autoComplete="organization" />
          </label>
        )}
      </div>
      {showAddress && (
        <label className="field">
          Адрес доставки
          <input name="address" maxLength={300} autoComplete="street-address" placeholder="Город, улица, дом" />
        </label>
      )}
      <label className="field">
        Комментарий
        <textarea name="comment" maxLength={3000} placeholder={commentPlaceholder} />
      </label>
      {/* ловушка для ботов */}
      <label className="visuallyHidden" aria-hidden>
        Сайт
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {state === "error" && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}
      <div className={s.actions}>
        <button type="submit" className="btnRed" disabled={state === "sending"}>
          {state === "sending" ? "Отправляем…" : submitLabel}
        </button>
        <span className={s.hint}>Оплата и доставка — после подтверждения заказа менеджером.</span>
      </div>
    </form>
  );
}

/** Модальное окно на базе <dialog>. */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={s.dialog}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className={s.dialogBody}>
        <div className={s.dialogHead}>
          <h2>{title}</h2>
          <button type="button" className={s.close} onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
