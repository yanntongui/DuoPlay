import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createAdminToken,
  verifyAdminToken,
} from "./token";

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET manquant dans l'environnement.");
  }
  return secret;
}

/** Vérifie le mot de passe administrateur (comparaison à temps constant). */
export function checkPassword(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminToken(
    store.get(ADMIN_COOKIE)?.value,
    process.env.ADMIN_SESSION_SECRET,
  );
}

export async function startAdminSession() {
  const store = await cookies();
  store.set(ADMIN_COOKIE, await createAdminToken(sessionSecret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
}

export async function endAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}
