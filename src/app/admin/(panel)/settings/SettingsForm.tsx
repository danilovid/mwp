"use client";

import { useActionState } from "react";
import type { Settings, SettingKey } from "@/lib/settings";
import { saveSettings, testTelegram } from "../../actions";
import { Message, Submit } from "../../ui";
import s from "../../admin.module.css";

type Field = { key: SettingKey; label: string; hint?: string; type?: string; wide?: boolean };

const GROUPS: { title: string; hint?: string; fields: Field[] }[] = [
  {
    title: "Контакты",
    fields: [
      { key: "phone1", label: "Телефон 1" },
      { key: "phone2", label: "Телефон 2 (в шапке сайта)" },
      { key: "messengers", label: "Мессенджеры на телефоне 2", hint: "Например: Viber, WhatsApp, Telegram. Пусто — не показывать" },
      { key: "email1", label: "Почта 1", type: "email" },
      { key: "email2", label: "Почта 2", type: "email" },
      { key: "address", label: "Адрес полностью", wide: true },
      { key: "addressShort", label: "Адрес коротко" },
      { key: "productionAddress", label: "Адрес производства", hint: "Показывается под картой на странице «О компании»", wide: true },
      { key: "mapLat", label: "Карта: широта", hint: "Координаты метки на Яндекс Карте — сейчас это производство" },
      { key: "mapLon", label: "Карта: долгота" },
    ],
  },
  {
    title: "Реквизиты",
    fields: [
      { key: "company", label: "Компания" },
      { key: "inn", label: "ИНН" },
      { key: "kpp", label: "КПП" },
      { key: "ogrn", label: "ОГРН" },
    ],
  },
  {
    title: "Ссылки",
    fields: [
      { key: "priceListUrl", label: "Оптовый прайс-лист", type: "url", wide: true },
      { key: "ozonUrl", label: "Магазин на OZON", type: "url" },
      { key: "marketUrl", label: "Магазин на Яндекс Маркете", type: "url" },
    ],
  },
  {
    title: "Заявки и аналитика",
    hint: "Куда приходят заявки с сайта. Все заявки также сохраняются в разделе «Заявки».",
    fields: [
      { key: "orderEmail", label: "Почта для заявок", type: "email" },
      { key: "metrikaId", label: "Яндекс Метрика: номер счётчика", hint: "Только цифры. Пусто — счётчик не подключён" },
      { key: "telegramBotToken", label: "Telegram: токен бота", hint: "Выдаёт @BotFather", type: "password" },
      { key: "telegramChatId", label: "Telegram: ID чата", hint: "Чат или группа, куда бот присылает заявки" },
    ],
  },
];

export function SettingsForm({ settings, smtp }: { settings: Settings; smtp: boolean }) {
  const [state, action] = useActionState(saveSettings, null);
  const [tgState, tgAction] = useActionState(testTelegram, null);
  return (
    <form action={action}>
      {GROUPS.map((g) => (
        <div key={g.title} className={s.card}>
          <h2>{g.title}</h2>
          {g.hint && <p className={s.cardHint}>{g.hint}</p>}
          <div className={s.grid2}>
            {g.fields.map((f) => (
              <label key={f.key} className="field" style={f.wide ? { gridColumn: "1 / -1" } : undefined}>
                {f.label}
                <input name={f.key} type={f.type ?? "text"} defaultValue={settings[f.key]} autoComplete="off" />
                {f.hint && <span className="muted" style={{ fontWeight: 400, fontSize: 12 }}>{f.hint}</span>}
              </label>
            ))}
          </div>
          {g.title === "Заявки и аналитика" && (
            <div className={s.row} style={{ marginTop: 14 }}>
              <button type="submit" formAction={tgAction} className={s.btn}>
                Проверить Telegram
              </button>
              <Message state={tgState} />
              {!smtp && (
                <span className="muted" style={{ fontSize: 13 }}>
                  Отправка писем выключена: на сервере не заданы параметры SMTP (.env).
                </span>
              )}
            </div>
          )}
        </div>
      ))}
      <div className={`${s.row} ${s.saveBar}`}>
        <Submit>Сохранить настройки</Submit>
        <Message state={state} />
      </div>
    </form>
  );
}
