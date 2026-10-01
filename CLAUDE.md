@AGENTS.md

# Проект MWP (mwphockey.ru)

- Node.js 24 обязателен (Prisma 7). На этой машине: `export PATH=/opt/homebrew/opt/node@24/bin:$PATH` — системный node 23 не подходит (better-sqlite3 собран под 24).
- Dev-сервер: `.claude/launch.json` → `mwp-dev` (порт 3000).
- После правки схемы: `npx prisma migrate dev --name <имя>` и `npx prisma generate` (в Prisma 7 migrate не генерирует клиент сам).
- Типы маршрутов (`PageProps`, `LayoutProps`, `RouteContext`) генерирует `npx next typegen`.
- Данные товаров — только со старого сайта (Tilda) или из PDF в `materials/docs`; из макета берётся только внешний вид.
- Открытые вопросы к заказчику — `OPEN_QUESTIONS.md`.
