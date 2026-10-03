import Link from "next/link";
import s from "./infocard.module.css";

/**
 * Карточка-плитка для рядов «Поставляем под заказ», «Документы», «Реквизиты» и т.п.
 * Раньше такие карточки верстались отдельно на главной и на /opt двумя разными
 * стилями и в одном ряду выглядели по-разному, а ссылки вставали на разной высоте.
 * Теперь разметка одна: действия всегда прижаты к низу, поэтому ряд не «сползает».
 */
export function InfoCard({
  id,
  title,
  media,
  actions,
  children,
}: {
  id?: string;
  title: React.ReactNode;
  /** Узкая колонка слева — например, обложка документа */
  media?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div id={id} className={`${s.card} ${media ? s.cardMedia : ""}`}>
      {media && <div className={s.media}>{media}</div>}
      <div className={s.body}>
        <b className={s.title}>{title}</b>
        {children}
        {actions && <div className={s.actions}>{actions}</div>}
      </div>
    </div>
  );
}

type Arrow = "right" | "down";
/** Стрелка клеится к последнему слову неразрывным пробелом — иначе переносится на свою строку */
const withArrow = (children: React.ReactNode, arrow: Arrow) => (
  <>
    {children}
    {" "}
    {arrow === "down" ? "↓" : "→"}
  </>
);

export function CardLink({
  href,
  arrow = "right",
  external,
  children,
}: {
  href: string;
  arrow?: Arrow;
  /** Файл или внешний адрес — обычная ссылка, без клиентской навигации */
  external?: boolean;
  children: React.ReactNode;
}) {
  const content = withArrow(children, arrow);
  if (external) {
    return (
      <a className={s.link} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return (
    <Link className={s.link} href={href}>
      {content}
    </Link>
  );
}

export function CardButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={s.link} onClick={onClick}>
      {withArrow(children, "right")}
    </button>
  );
}
