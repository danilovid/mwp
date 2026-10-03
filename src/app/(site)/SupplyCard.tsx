"use client";

import { useState } from "react";
import { CardButton, InfoCard } from "@/components/InfoCard";
import { LeadForm, Modal } from "@/components/LeadForm";

export function SupplyCard() {
  const [open, setOpen] = useState(false);
  return (
    <InfoCard title="Поставляем под заказ" actions={<CardButton onClick={() => setOpen(true)}>Запросить поставку</CardButton>}>
      <p>
        Вратарская экипировка, клюшки, коньки, баулы — есть возможность поставки под заказ. Можем укомплектовать
        заявку целиком.
      </p>
      <Modal open={open} onClose={() => setOpen(false)} title="Запрос на поставку">
        <LeadForm
          type="wholesale"
          showOrg
          submitLabel="Отправить запрос"
          commentPlaceholder="Что нужно поставить: позиции, размеры, количество, сроки"
        />
      </Modal>
    </InfoCard>
  );
}
