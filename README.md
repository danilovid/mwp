# MWP — сайт mwphockey.ru

Витрина и админка производителя хоккейной экипировки MWP (Чебоксары).
Дизайн — вариант 12 «Градиент красный» из Claude Design; товары, цены, тексты и контакты перенесены со старого сайта на Tilda и из документов в `materials/docs`.

## Что внутри

- **Next.js 16** (React 19, TypeScript, App Router). Главная, «О компании» и страницы товаров собираются в готовый HTML при сборке и обновляются автоматически после правок в админке.
- **Prisma 7 + SQLite** — база одним файлом `data/mwp.db`: товары, разделы, варианты с ценами, фото, заявки, настройки, администраторы.
- **sharp** — загруженные фото переводятся в WebP двух размеров (1200 и 480 px) и лежат в `data/uploads`.
- **Админка** `/admin`: заявки, товары (опции, цены по вариантам, фото, пара «Базовая — CUBE», ссылки на маркетплейсы), разделы, настройки (контакты, реквизиты, ссылки, Telegram, Яндекс Метрика), администраторы.
- **Заявки** (корзина, заказ для клуба, оптовый запрос) сохраняются в базу и уходят на почту (SMTP) и в Telegram.

```
src/app/(site)/        витрина: главная, /catalog/[slug], /cart, /about
src/app/admin/         админка (вход /admin/login)
src/app/api/leads      приём заявок с сайта
src/app/media/[file]   отдача загруженных фото
src/lib/               база, каталог, настройки, уведомления, авторизация
scripts/               импорт с Tilda, создание первого админа, подготовка статики
prisma/                схема и миграции
materials/             исходные фото производства и PDF документов
public/                статические фото производства и PDF для скачивания
data/                  база и загруженные фото (не в git)
```

## Локальный запуск

Нужен **Node.js 24** (Prisma 7 не работает на нечётных версиях вроде 23).

```bash
npm install
cp .env.example .env        # заполнить SESSION_SECRET и ADMIN_PASSWORD
npx prisma migrate deploy   # создать базу data/mwp.db
npm run seed                # создать первого администратора из .env
npm run import:tilda        # загрузить 28 товаров и фото со старого сайта
npm run dev                 # http://localhost:3000, админка — /admin
```

Повторный импорт с удалением текущих товаров: `npm run import:tilda -- --force`.
Фото производства и PDF в `public/` пересобираются из `materials/` командой `npx tsx scripts/prepare-static.ts`.

## Размещение на VPS

Пример для Ubuntu 24.04, сайт в `/var/www/mwp`, пользователь `mwp`.

1. **Node.js 24 и PM2**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
   sudo apt install -y nodejs nginx sqlite3
   sudo npm install -g pm2
   ```
2. **Код и настройки**
   ```bash
   git clone <репозиторий> /var/www/mwp && cd /var/www/mwp
   cp .env.example .env && nano .env
   ```
   В `.env` обязательно: `SESSION_SECRET` (`openssl rand -hex 32`), `ADMIN_PASSWORD`, `SITE_URL=https://mwphockey.ru`, параметры SMTP для писем.
3. **База, первый админ, товары, сборка**
   ```bash
   npm ci
   npx prisma migrate deploy
   npm run seed
   npm run import:tilda      # только при первом запуске
   npm run build             # сборке нужна заполненная база
   ```
4. **Запуск** — `pm2 start deploy/ecosystem.config.cjs && pm2 save && pm2 startup`
5. **nginx и HTTPS** — пример в `deploy/nginx.conf.example`, сертификат: `sudo certbot --nginx -d mwphockey.ru -d www.mwphockey.ru`.
6. **Домен** — в DNS направить `mwphockey.ru` и `www` на IP сервера (сейчас домен указывает на Tilda). Старые адреса товаров Tilda (`/tproduct/…`) автоматически перенаправляются на новые страницы.
7. **Бэкапы** — `deploy/backup.sh` (база + фото), например ежедневно через cron:
   `0 3 * * * /var/www/mwp/deploy/backup.sh /var/backups/mwp`

### Обновление

```bash
cd /var/www/mwp && git pull && npm ci && npx prisma migrate deploy && npm run build && pm2 reload mwp
```

## После запуска

- Админка: `https://mwphockey.ru/admin` — сразу сменить пароль в разделе «Администраторы».
- «Настройки»: токен Telegram-бота и ID чата (кнопка «Проверить Telegram»), номер счётчика Метрики, почта для заявок.
- Открытые вопросы к заказчику — в `OPEN_QUESTIONS.md`.
