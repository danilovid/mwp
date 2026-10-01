"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import s from "../../../admin.module.css";

export function Uploader({ productId }: { productId: number }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setMsg(null);
    const form = new FormData();
    form.set("productId", String(productId));
    for (const f of Array.from(files)) form.append("files", f);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = (await res.json()) as { error?: string; errors?: string[] };
      if (!res.ok) throw new Error(data.error || "Ошибка загрузки");
      setMsg(
        data.errors?.length
          ? { ok: false, text: "Часть файлов не загружена: " + data.errors.join("; ") }
          : { ok: true, text: "Фото загружены" },
      );
      router.refresh();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Ошибка загрузки" });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div
      className={s.drop}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        upload(e.dataTransfer.files);
      }}
    >
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => upload(e.target.files)}
      />
      <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => input.current?.click()} disabled={busy}>
        {busy ? "Загружаем…" : "Загрузить фото"}
      </button>
      <span className="muted" style={{ fontSize: 13 }}>
        или перетащите файлы сюда · JPG, PNG, WebP, до 20 МБ
      </span>
      {msg && <span className={msg.ok ? s.msgOk : s.msgErr}>{msg.text}</span>}
    </div>
  );
}
