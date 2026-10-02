"use client";

import { useState } from "react";
import { LeadForm, Modal } from "@/components/LeadForm";
import s from "./home.module.css";

export function SupplyCard() {
  const [open, setOpen] = useState(false);
  return (
    <div className={s.tint}>
      <b>Поставляем под заказ</b>
      <p>
        Вратарская экипировка, клюшки, коньки, баулы — есть возможность поставки под заказ. Можем укомплектовать
        заявку целиком.
      </p>
      <button type="button" className={s.textLink} onClick={() => setOpen(true)}>
        Запросить поставку →
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Запрос на поставку">
        <LeadForm
          type="wholesale"
          showOrg
          submitLabel="Отправить запрос"
          commentPlaceholder="Что нужно поставить: позиции, размеры, количество, сроки"
        />
      </Modal>
    </div>
  );
}
