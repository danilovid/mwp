/** Соответствие товаров старого сайта на Tilda (uid) и новых адресов, разделов, пар CUBE и комплекта. */
export type Plan = { slug: string; cat: string; cubeOf?: string; cube?: boolean; kit?: number };

/** Ключ — Tilda uid товара. */
export const TILDA_PLAN: Record<string, Plan> = {
  "749532643922": { slug: "shlem", cat: "head" },
  "762685524622": { slug: "shlem-s-maskoj", cat: "head", kit: 1 },
  "760688364852": { slug: "maska", cat: "head" },
  "281459387762": { slug: "zashchita-podborodka", cat: "head" },
  "648498967982": { slug: "nalokotniki", cat: "arms", kit: 6 },
  "474414051252": { slug: "nalokotniki-cube", cat: "arms", cubeOf: "nalokotniki" },
  "199283880792": { slug: "nagrudnik", cat: "body", kit: 3 },
  "354321186132": { slug: "nagrudnik-cube", cat: "body", cubeOf: "nagrudnik" },
  "502801662102": { slug: "perchatki", cat: "arms", kit: 7 },
  "516143980552": { slug: "perchatki-cube", cat: "arms", cubeOf: "perchatki" },
  "170672901262": { slug: "perchatki-detskie-cube", cat: "arms", cube: true },
  "291358792372": { slug: "shorty", cat: "legs", kit: 8 },
  "557467115922": { slug: "shorty-cube", cat: "legs", cubeOf: "shorty" },
  "131814328902": { slug: "shchitki", cat: "legs", kit: 9 },
  "955335653412": { slug: "shchitki-cube", cat: "legs", cubeOf: "shchitki" },
  "539586450182": { slug: "rezinki-dlya-shchitkov", cat: "legs" },
  "154497959032": { slug: "zashchita-paha", cat: "body", kit: 4 },
  "159292527682": { slug: "zashchita-shei", cat: "head", kit: 2 },
  "433958886582": { slug: "zashchita-shei-cube", cat: "head", cubeOf: "zashchita-shei" },
  "685283819032": { slug: "podtyazhki", cat: "body", kit: 5 },
  "673221859732": { slug: "podtyazhki-s-logo", cat: "body" },
  "435987819792": { slug: "remkomplekt-1", cat: "parts" },
  "647860516312": { slug: "remkomplekt-2", cat: "parts" },
  "916331311352": { slug: "remkomplekt-3", cat: "parts" },
  "392619858852": { slug: "klipsy-1", cat: "parts" },
  "798056612972": { slug: "klipsy-2", cat: "parts" },
  "836842674202": { slug: "shlem-vratarya", cat: "goalie" },
  "352189248392": { slug: "shorty-vratarya", cat: "goalie" },
};

/**
 * Карточки товаров на маркетплейсах (найдены 01.10.2026). На OZON большинство карточек продаёт
 * продавец «MWSPORT», часть — «MWP». Карточки часто привязаны к одному размеру; выбран представительный.
 * null — карточки нет, на сайте кнопка ведёт в магазин целиком.
 */
export const MARKETPLACE_LINKS: Record<string, { ozon: string | null; market: string | null }> = {
  shlem: {
    ozon: "https://www.ozon.ru/product/mwp-shlem-zashchitnyy-razmer-l-4834024429/",
    market: "https://market.yandex.ru/card/shlem-igroka-khokkeynyy-chernyy-mwp-m/102503561661",
  },
  "shlem-s-maskoj": {
    ozon: "https://www.ozon.ru/product/mwp-shlem-zashchitnyy-razmer-s-4882370440/",
    market: "https://market.yandex.ru/card/shlem-igroka-khokkeynyy-s-maskoy-mwp-belyy-s/102484186939",
  },
  maska: {
    ozon: "https://www.ozon.ru/product/hokkeynaya-maska-reshetka-dlya-shlema-igroka-razmer-s-1787924156/",
    market: "https://market.yandex.ru/card/khokkeynaya-maska-reshetka-dlya-shlema-igroka/103699044633",
  },
  "zashchita-podborodka": {
    ozon: "https://www.ozon.ru/product/mwp-aksessuary-dlya-hokkeya-4834057152/",
    market: "https://market.yandex.ru/card/smennyy-podborodok-dlya-khokkeynogo-shlema-igroka/103699051762",
  },
  nalokotniki: { ozon: null, market: null },
  "nalokotniki-cube": {
    ozon: "https://www.ozon.ru/product/mwp-nalokotniki-hokkeynye-razmer-1-5275455370/",
    market: "https://market.yandex.ru/card/nalokotniki-khokkeynyye-detskiye-mwp-cube-2-razmer/4782121689",
  },
  nagrudnik: { ozon: "https://www.ozon.ru/product/mwp-nagrudnik-hokkeynyy-razmer-3-4834045976/", market: null },
  "nagrudnik-cube": {
    ozon: "https://www.ozon.ru/product/mwp-nagrudnik-hokkeynyy-razmer-2-5055456642/",
    market: "https://market.yandex.ru/card/nagrudnik-khokkeynyy-mwp-cube-detskiy-razmer-2/4739415447",
  },
  perchatki: { ozon: "https://www.ozon.ru/product/perchatki-hokkeynye-mwp-vzroslye-razmer-13-5-2921123057/", market: null },
  "perchatki-cube": {
    ozon: "https://www.ozon.ru/product/perchatki-hokkeynye-mwp-cube-vzroslye-13-5-3671403333/",
    market: null,
  },
  "perchatki-detskie-cube": {
    ozon: "https://www.ozon.ru/product/perchatki-hokkeynye-mwp-cube-detskie-8-3129631511/",
    market: "https://market.yandex.ru/card/perchatki-khokkeynyye-mwp-cube-detskiye-8/4773963554",
  },
  shorty: {
    ozon: "https://www.ozon.ru/product/mwp-trusy-dlya-hokkeya-razmer-36-5261528030/",
    market: "https://market.yandex.ru/card/shorty-khokkeynyye-mwp-detskiye-razmer-36/103626492377",
  },
  "shorty-cube": {
    ozon: "https://www.ozon.ru/product/mwp-trusy-dlya-hokkeya-razmer-46-5262598763/",
    market: "https://market.yandex.ru/card/shorty-khokkeynyye-mwp-cube-detskiye-razmer-38/4782120599",
  },
  shchitki: { ozon: null, market: null },
  "shchitki-cube": {
    ozon: "https://www.ozon.ru/product/mwp-shchitki-hokkeynye-razmer-14-5202802623/",
    market: "https://market.yandex.ru/card/shchitki-khokkeynyye-mwp-cube-jr-12-yuniorskiye/4758127553",
  },
  "rezinki-dlya-shchitkov": {
    ozon: "https://www.ozon.ru/product/lipuchki-dlya-hokkeynyh-shchitkov-mwp-vzroslye-sr-3119681995/",
    market: "https://market.yandex.ru/card/lipuchki-dlya-khokkeynykh-shchitkov-mwp-vzroslyye-sr/4769411022",
  },
  "zashchita-paha": {
    ozon: "https://www.ozon.ru/product/zashchita-paha-hokkeynaya-detskaya-mwp-razmer-s-1866205194/",
    market: "https://market.yandex.ru/card/zashchita-pakha-igroka-khokkeynaya-yuniorskaya-mwp-rakovina-igroka/103524578047",
  },
  "zashchita-shei": {
    ozon: "https://www.ozon.ru/product/mwp-zashchita-korpusa-razmer-sr-4834007824/",
    market: "https://market.yandex.ru/card/zashchita-shei-igroka-khokkeynaya-yuniorskaya-mwp-protektor-shei/103524766135",
  },
  "zashchita-shei-cube": {
    ozon: "https://www.ozon.ru/product/mwp-zashchita-korpusa-razmer-yth-5096734818/",
    market: "https://market.yandex.ru/card/zashchita-shei-igroka-khokkeynaya-detskaya-cube/5146241273",
  },
  podtyazhki: {
    ozon: "https://www.ozon.ru/product/podtyazhki-hokkeynye-detskie-mwp-841189177/",
    market: "https://market.yandex.ru/card/podtyazhki-khokkeynyye-yuniorskiye-mwp/102484186932",
  },
  "podtyazhki-s-logo": {
    ozon: "https://www.ozon.ru/product/podtyazhki-dlya-hokkeynyh-short-detskie-mwp-1704451999/",
    market: "https://market.yandex.ru/card/podtyazhki-junior-mwp-dlya-khokkeya-i-khokkeya-s-myachom/103522496786",
  },
  "remkomplekt-1": {
    ozon: "https://www.ozon.ru/product/mwp-aksessuary-dlya-hokkeya-4834044744/",
    market: "https://market.yandex.ru/card/nabor-zapchastey-dlya-khokkeynogo-shlema/103522388250",
  },
  "remkomplekt-2": {
    ozon: "https://www.ozon.ru/product/mwp-proushiny-dlya-shlema-4833954655/",
    market: "https://market.yandex.ru/card/proushiny-s-remeshkom-dlya-shlema-khokkeynogo/103536224368",
  },
  "remkomplekt-3": {
    ozon: "https://www.ozon.ru/product/mwp-aksessuary-dlya-hokkeya-4834026182/",
    market: "https://market.yandex.ru/card/zapchasti-dlya-shlema-j-clips-ogranichiteli/103522388251",
  },
  "klipsy-1": {
    ozon: "https://www.ozon.ru/product/nabor-klips-dlya-vratarskogo-shlema-8-sht-1314313908/",
    market: "https://market.yandex.ru/card/nabor-klips-dlya-vratarskogo-shlema-5-sht/103522520760",
  },
  "klipsy-2": {
    ozon: "https://www.ozon.ru/product/nabor-klips-dlya-vratarskogo-shlema-6-sht-1637787492/",
    market: "https://market.yandex.ru/card/nabor-klips-dlya-vratarskogo-shlema-6-sht/103522457700",
  },
  "shlem-vratarya": {
    ozon: "https://www.ozon.ru/product/mwp-shlem-zashchitnyy-razmer-s-5172492878/",
    market: "https://market.yandex.ru/card/shlem-vratarya-khokkeynyy-mwp-s-maskoy-koshachiy-glaz-razmer-s/103590455411",
  },
  "shorty-vratarya": { ozon: null, market: null },
};
