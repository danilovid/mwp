import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "https://mwphockey.ru"),
  title: {
    default: "MWP — российская хоккейная экипировка",
    template: "%s — MWP",
  },
  description:
    "Производитель хоккейной экипировки в России. Шлемы, нагрудники, налокотники, шорты, щитки, перчатки, подтяжки и другие элементы. Отправляем по всей России.",
  openGraph: { siteName: "MWP", locale: "ru_RU", type: "website" },
};

/** Тема выставляется до отрисовки, чтобы не было вспышки светлой темы. */
const themeScript = `try{if(localStorage.getItem('mwp-theme')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${manrope.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
