import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { SESSION_COOKIE, SESSION_DAYS, signSession, verifySession } from "./session";

export const hashPassword = (password: string) => bcrypt.hash(password, 12);

export async function getSession() {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  // Пользователь мог быть удалён — сессия больше не действует
  const user = await db.adminUser.findUnique({ where: { id: session.uid }, select: { id: true, login: true } });
  return user ? { uid: user.id, login: user.login } : null;
}

/** Для страниц и серверных действий админки. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Для route handlers: null, если не авторизован. */
export const adminOrNull = getSession;

const attempts = new Map<string, number[]>();
let dummy: string | null = null;
const dummyHash = () => (dummy ??= bcrypt.hashSync("not-a-real-password", 12));

export async function login(loginName: string, password: string, ip: string) {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < 15 * 60_000);
  if (recent.length >= 10) return { error: "Слишком много попыток. Подождите 15 минут." };
  recent.push(now);
  attempts.set(ip, recent);

  const user = await db.adminUser.findUnique({ where: { login: loginName.trim().toLowerCase() } });
  // Сравниваем хэш даже для несуществующего логина, чтобы время ответа не выдавало логины
  const ok = await bcrypt.compare(password, user?.passwordHash ?? dummyHash());
  if (!user || !ok) return { error: "Неверный логин или пароль" };

  attempts.delete(ip);
  const token = await signSession({ uid: user.id, login: user.login });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: (process.env.SITE_URL ?? "").startsWith("https://"),
    path: "/",
    maxAge: SESSION_DAYS * 24 * 3600,
  });
  return { ok: true as const };
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
