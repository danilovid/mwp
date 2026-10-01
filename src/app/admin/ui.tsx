"use client";

import { useFormStatus } from "react-dom";
import type { FormState } from "./actions";
import s from "./admin.module.css";

export function Submit({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className ?? `${s.btn} ${s.btnPrimary}`} disabled={pending}>
      {pending ? "Сохраняем…" : children}
    </button>
  );
}

export function Message({ state }: { state: FormState }) {
  if (!state) return null;
  if (state.error)
    return (
      <span className={s.msgErr} role="alert">
        {state.error}
      </span>
    );
  if (state.message)
    return (
      <span className={s.msgOk} role="status">
        {state.message}
      </span>
    );
  return null;
}

/** Кнопка в форме с подтверждением (удаление и т. п.). */
export function ConfirmButton({
  children,
  message,
  className,
}: {
  children: React.ReactNode;
  message: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className ?? `${s.btn} ${s.btnDanger}`}
      disabled={pending}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
