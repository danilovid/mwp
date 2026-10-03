/**
 * Проверка и смена пароля администратора.
 *
 *   npm run admin -- --list                    — какие админы заведены
 *   npm run admin -- --check                   — подходит ли ADMIN_PASSWORD из .env
 *   NEW_PASSWORD='…' npm run admin -- --set    — задать новый пароль
 *
 * Пароль берётся только из окружения и нигде не печатается.
 * Логин по умолчанию — ADMIN_LOGIN из .env, иначе первый админ в базе.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";

async function main() {
  const args = process.argv.slice(2);
  const users = await db.adminUser.findMany({ orderBy: { id: "asc" } });
  if (!users.length) {
    console.log("Администраторов нет. Создать первого: npm run seed");
    return;
  }

  const wanted = process.env.ADMIN_LOGIN?.trim();
  const user = (wanted && users.find((u) => u.login === wanted)) || users[0];

  if (args.includes("--list") || !args.length) {
    console.log("Администраторы:");
    for (const u of users) console.log(`  • ${u.login} (создан ${u.createdAt.toISOString().slice(0, 10)})`);
    console.log(`\nДействия: --check, --set (пароль в NEW_PASSWORD)`);
    return;
  }

  if (args.includes("--check")) {
    const pass = process.env.ADMIN_PASSWORD ?? "";
    if (!pass) {
      console.log("В окружении нет ADMIN_PASSWORD — сравнивать не с чем.");
      return;
    }
    const ok = await bcrypt.compare(pass, user.passwordHash);
    console.log(`Логин «${user.login}»: пароль из ADMIN_PASSWORD ${ok ? "подходит" : "НЕ подходит"}.`);
    if (!ok) console.log("Значит его меняли в админке. Задать новый: NEW_PASSWORD='…' npm run admin -- --set");
    return;
  }

  if (args.includes("--set")) {
    const pass = process.env.NEW_PASSWORD ?? "";
    if (pass.length < 8) {
      console.log("Задайте NEW_PASSWORD длиной не меньше 8 символов.");
      process.exitCode = 1;
      return;
    }
    await db.adminUser.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(pass, 12) } });
    console.log(`Пароль для «${user.login}» изменён. Войдите и при желании смените его в разделе «Администраторы».`);
    return;
  }

  console.log("Неизвестный аргумент. Доступно: --list, --check, --set");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
