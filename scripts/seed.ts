/**
 * Создаёт первого администратора из ADMIN_LOGIN / ADMIN_PASSWORD (.env), если админов ещё нет.
 *   npm run seed
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";

async function main() {
  const count = await db.adminUser.count();
  if (count) {
    console.log(`Администраторы уже есть (${count}) — ничего не делаю.`);
    return;
  }
  const login = (process.env.ADMIN_LOGIN ?? "admin").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 8 || password === "change-me") {
    throw new Error("Задайте в .env ADMIN_PASSWORD длиной от 8 символов");
  }
  await db.adminUser.create({ data: { login, passwordHash: await bcrypt.hash(password, 12) } });
  console.log(`Создан администратор «${login}». Пароль — из ADMIN_PASSWORD в .env; смените его в админке.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
