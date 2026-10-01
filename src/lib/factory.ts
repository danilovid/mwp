/** Фото производства (public/images/factory) — подписи описывают, что на снимке. */

export const FACTORY_TEASER = [
  { photo: "molding-shell-hand", caption: "Скорлупа шлема сразу после пресс-формы" },
  { photo: "molding-machine", caption: "Литьё под давлением" },
  { photo: "molding-removal", caption: "Съём отливок" },
  { photo: "laser-table", caption: "Лазерный раскрой" },
  { photo: "sewing-cube", caption: "Пошив деталей CUBE" },
  { photo: "sewing-stitch", caption: "Прострочка" },
  { photo: "assembly-black-cage", caption: "Сборка шлема" },
  { photo: "assembly-logo", caption: "Маркировка" },
  { photo: "ready-elbow-cube", caption: "Готовая продукция" },
];

export const FACTORY_STAGES = [
  {
    title: "Литьё",
    text: "Скорлупы шлемов и пластиковые элементы защиты отливаются на термопластавтомате.",
    photos: [
      { photo: "molding-shell-closeup", caption: "Скорлупа шлема в пресс-форме" },
      { photo: "molding-machine", caption: "Термопластавтомат" },
      { photo: "molding-removal", caption: "Съём отливки" },
      { photo: "molding-shells-row", caption: "Отлитые скорлупы" },
    ],
  },
  {
    title: "Раскрой",
    text: "Материалы и ударопоглощающая пена раскраиваются на лазерном станке по лекалам.",
    photos: [
      { photo: "laser-table", caption: "Раскрой по лекалам" },
      { photo: "laser-head", caption: "Лазерная головка" },
      { photo: "laser-foam", caption: "Раскрой пены" },
      { photo: "laser-sheet", caption: "Детали после раскроя" },
    ],
  },
  {
    title: "Пошив",
    text: "Нагрудники, налокотники, шорты, щитки и перчатки шьются на промышленных машинах.",
    photos: [
      { photo: "sewing-cube", caption: "Пошив деталей CUBE" },
      { photo: "sewing-cube-closeup", caption: "Строчка" },
      { photo: "sewing-stitch", caption: "Прострочка канта" },
      { photo: "sewing-machine", caption: "Швейный участок" },
    ],
  },
  {
    title: "Сборка",
    text: "Шлемы собираются вручную: подкладка, ремешки, крепление маски, маркировка.",
    photos: [
      { photo: "assembly-padding", caption: "Установка подкладки" },
      { photo: "assembly-cage", caption: "Крепление маски" },
      { photo: "assembly-black-tag", caption: "Регулировка ремешка" },
      { photo: "ready-elbow-cube", caption: "Готовая продукция" },
    ],
  },
];
