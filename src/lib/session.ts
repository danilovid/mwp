import { jwtVerify, SignJWT } from "jose";

/** Подпись сессии админки. Без зависимостей от БД — используется и в proxy.ts. */

export const SESSION_COOKIE = "mwp_admin";
export const SESSION_DAYS = 14;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET не задан или короче 32 символов");
  return new TextEncoder().encode(s);
}

export type SessionPayload = { uid: number; login: string };

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (typeof payload.uid !== "number" || typeof payload.login !== "string") return null;
    return { uid: payload.uid, login: payload.login };
  } catch {
    return null;
  }
}
