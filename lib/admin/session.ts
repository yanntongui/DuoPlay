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

/** Comparaison à temps constant, tolérante aux longueurs différentes. */
function safeEqual(candidate: string, expected: string) {
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Vérifie un couple identifiant / mot de passe.
 *
 * `ADMIN_USERNAME` est optionnel (défaut : `admin`) ; `ADMIN_PASSWORD` est
 * obligatoire — sans lui, aucune connexion n'est possible. Les deux champs sont
 * toujours comparés (pas de court-circuit) pour ne pas révéler lequel est faux.
 */
export function checkCredentials(username: string, password: string) {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const expectedUsername = process.env.ADMIN_USERNAME ?? "admin";
  if (!expectedPassword) return false;

  const userOk = safeEqual(
    username.trim().toLowerCase(),
    expectedUsername.trim().toLowerCase(),
  );
  const passwordOk = safeEqual(password, expectedPassword);

  return userOk && passwordOk;
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
