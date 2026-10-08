/**
 * Ссылки главного меню.
 *
 * В оптовом разделе пункты ведут на оптовые страницы, а не на розничную главную:
 * иначе из «Опта» любой пункт меню выбрасывал обратно в розницу, и переключатель
 * сам собой возвращался на «Розницу».
 *
 * «Контакты» ведут на блок контактов страницы «О компании»: на главной контактов
 * нет, и прежний якорь просто прокручивал страницу до подвала.
 *
 * Режим определяется только адресом и нигде не запоминается — это решение заказчика.
 * Поэтому вне оптового раздела (о компании, товарный знак, карточка товара, корзина)
 * меню розничное, и из опта туда уйдя, контекст опта теряется: возвращаются
 * переключателем в шапке или ссылкой в подвале. Запоминать выбор в браузере значило бы
 * мигание подписей при загрузке, в куке — потерю статической сборки страниц.
 */
export type NavLink = { href: string; label: string };

const RETAIL: NavLink[] = [
  { href: "/#catalog", label: "Каталог" },
  { href: "/#prices", label: "Цены" },
  { href: "/constructor", label: "Комплект" },
  { href: "/#order", label: "Для клуба" },
  { href: "/about", label: "О компании" },
  { href: "/about#address", label: "Контакты" },
];

const OPT: NavLink[] = [
  { href: "/opt#catalog", label: "Каталог" },
  { href: "/opt#prices", label: "Цены" },
  { href: "/opt#kit", label: "Комплект" },
  { href: "/zakupki", label: "Закупки" },
  { href: "/about", label: "О компании" },
  { href: "/about#address", label: "Контакты" },
];

/** Оптовый раздел задан списком, а не префиксом: /zakupki относится к опту, хотя с /opt не начинается. */
const OPT_ROUTES = ["/opt", "/zakupki"];

export const isOptRoute = (pathname: string) =>
  OPT_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

export const navLinks = (pathname: string): NavLink[] => (isOptRoute(pathname) ? OPT : RETAIL);
