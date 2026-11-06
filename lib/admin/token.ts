/**
 * Jeton de session administrateur — **compatible edge et Node**.
 *
 * Le middleware Next s'exécute sur le runtime edge : il ne peut pas importer
 * `node:crypto`. On utilise donc Web Crypto (`globalThis.crypto.subtle`), qui
 * existe dans les deux environnements, pour signer et vérifier un jeton
 * HMAC-SHA256 horodaté.
 *
 * Format : `<issuedAt en secondes>.<signature base64url>`
 * Il n'y a aucun état côté serveur : le jeton est vérifiable par quiconque
 * possède `ADMIN_SESSION_SECRET`, et expire tout seul.
 */

export const ADMIN_COOKIE = "duoplay_admin";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 jours

const PURPOSE = "duoplay-admin-session-v1";

/**
 * `TextEncoder` renvoie un `Uint8Array<ArrayBufferLike>` : TypeScript 5.7
 * refuse de le passer à Web Crypto, qui exige un `BufferSource` adossé à un
 * `ArrayBuffer` (jamais un `SharedArrayBuffer`). On copie donc explicitement.
 */
function toBytes(value: string): Uint8Array<ArrayBuffer> {
  const source = new TextEncoder().encode(value);
  const bytes = new Uint8Array(new ArrayBuffer(source.byteLength));
  bytes.set(source);
  return bytes;
}

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = "";
  const view = new Uint8Array(bytes);
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    toBytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function payload(issuedAt: number): Uint8Array<ArrayBuffer> {
  return toBytes(`${PURPOSE}.${issuedAt}`);
}

export async function createAdminToken(
  secret: string,
  now: number = Date.now(),
): Promise<string> {
  const issuedAt = Math.floor(now / 1000);
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(secret),
    payload(issuedAt),
  );
  return `${issuedAt}.${toBase64Url(signature)}`;
}

export async function verifyAdminToken(
  token: string | undefined,
  secret: string | undefined,
  now: number = Date.now(),
): Promise<boolean> {
  if (!token || !secret) return false;

  const separator = token.indexOf(".");
  if (separator < 1) return false;

  const issuedAt = Number(token.slice(0, separator));
  const signature = token.slice(separator + 1);
  if (!Number.isFinite(issuedAt) || !signature) return false;

  const age = Math.floor(now / 1000) - issuedAt;
  if (age < 0 || age > ADMIN_SESSION_TTL_SECONDS) return false;

  try {
    return await crypto.subtle.verify(
      "HMAC",
      await hmacKey(secret),
      fromBase64Url(signature),
      payload(issuedAt),
    );
  } catch {
    return false;
  }
}
