"use client";

import { useRouter } from "next/navigation";

/**
 * Возврат с карточки товара. Если пользователь пришёл по сайту — назад по истории
 * (так сохраняется позиция прокрутки в каталоге), если открыл карточку по прямой
 * ссылке — в каталог.
 */
export function BackButton({ fallback = "/#catalog", label = "Назад" }: { fallback?: string; label?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="backBtn"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) router.back();
        else router.push(fallback);
      }}
    >
      <span aria-hidden="true">←</span> {label}
    </button>
  );
}
