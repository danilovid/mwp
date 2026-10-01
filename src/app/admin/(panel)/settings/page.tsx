import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";
import s from "../../admin.module.css";

export const metadata: Metadata = { title: "Настройки" };

export default async function SettingsPage() {
  const settings = await getSettings();
  const smtp = Boolean(process.env.SMTP_HOST);
  return (
    <>
      <div className={s.head}>
        <h1>Настройки сайта</h1>
      </div>
      <SettingsForm settings={settings} smtp={smtp} />
    </>
  );
}
