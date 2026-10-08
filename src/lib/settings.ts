import { db } from "./db";

/** Настройки сайта, редактируемые в админке. Значения по умолчанию — со старого сайта и из сертификата. */
export const SETTING_DEFAULTS = {
  phone1: "8 (8352) 50-22-70",
  phone2: "8 (927) 66-88-100",
  messengers: "Viber, WhatsApp, Telegram",
  email1: "zakaz@mwphockey.ru",
  email2: "mwprofi@mail.ru",
  orderEmail: "zakaz@mwphockey.ru",
  company: "ООО «МВСПОРТ»",
  inn: "2124024431",
  ogrn: "1252100008192",
  kpp: "210001001",
  address: "428031, Чувашская Республика, г. Чебоксары, ул. 324 Стрелковой дивизии, д. 28",
  addressShort: "Чебоксары, ул. 324 Стрелковой дивизии, 28",
  /** Где стоит производство. Отличается от адреса в реквизитах. */
  productionAddress: "г. Чебоксары, Мясокомбинатский проезд, 14",
  /** Точка на карте — производство, а не адрес из реквизитов. */
  mapLat: "56.11034",
  mapLon: "47.28630",
  /** Пороги оптовых ступеней, как в прайс-листе производителя */
  optStep1: "30 000 ₽",
  optStep2: "100 000 ₽",
  /** Ссылка на прайс-лист. Сейчас — файл на Яндекс.Диске, как было на старом сайте.
      Если нужен прайс, собираемый из базы и всегда совпадающий с витриной, поставьте "/price.xlsx" */
  priceListUrl: "https://disk.yandex.ru/i/JMAZZEc5ZnyWmw",
  ozonUrl: "https://ozon.ru/s/mwp",
  marketUrl: "https://market.yandex.ru/cc/Axt8sS",
  telegramBotToken: "",
  telegramChatId: "",
  metrikaId: "",
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type Settings = Record<SettingKey, string>;

export async function getSettings(): Promise<Settings> {
  const rows = await db.setting.findMany();
  const out: Settings = { ...SETTING_DEFAULTS };
  for (const r of rows) if (r.key in out) out[r.key as SettingKey] = r.value;
  return out;
}

/** Только то, что можно показывать на витрине (без токенов). */
export type PublicSettings = Omit<Settings, "telegramBotToken" | "telegramChatId">;

export async function getPublicSettings(): Promise<PublicSettings> {
  const all: Partial<Settings> = await getSettings();
  delete all.telegramBotToken;
  delete all.telegramChatId;
  return all as PublicSettings;
}

export const telHref = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return "tel:+7" + digits.slice(-10);
};
