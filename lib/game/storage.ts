"use client";

const PLAYER_PREFIX = "duoplay:player:";
const CURSOR_PREFIX = "duoplay:cursor:";
const NAME_KEY = "duoplay:name";
const DEVICE_KEY = "duoplay:device";
const ACCOUNT_KEY = "duoplay:account";

let memoryDeviceToken: string | null = null;

/**
 * Compte léger (Phase 6). Stocké localement : c'est lui qui décide quelle
 * identité d'appareil utiliser. Le `primaryDeviceToken` est le pivot — toutes
 * les données (historique, favoris, couple, parcours) restent indexées par
 * appareil, donc « Notre espace » suit l'utilisateur sans migration serveur.
 */
export type StoredAccount = {
  accountId: string;
  displayName: string;
  primaryDeviceToken: string;
  recoveryCode?: string;
};

const accountListeners = new Set<() => void>();

function emitAccount(): void {
  for (const listener of accountListeners) listener();
}

/** S'abonner aux changements de compte (connexion / déconnexion). */
export function subscribeAccount(listener: () => void): () => void {
  accountListeners.add(listener);
  return () => accountListeners.delete(listener);
}

function randomHex(bytes: number): string {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  let out = "";
  for (const byte of buffer) out += byte.toString(16).padStart(2, "0");
  return out;
}

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* navigation privée : la reprise est simplement indisponible */
  }
}

/** Secret du joueur pour une partie donnée (preuve d'identité sans compte). */
export function getPlayerToken(token: string): string | null {
  return read(PLAYER_PREFIX + token);
}

export function setPlayerToken(token: string, playerToken: string): void {
  write(PLAYER_PREFIX + token, playerToken);
}

/** Position de lecture, pour reprendre une partie interrompue. */
export function getCursor(token: string): number | null {
  const raw = read(CURSOR_PREFIX + token);
  if (raw === null) return null;
  const index = Number.parseInt(raw, 10);
  return Number.isFinite(index) ? index : null;
}

export function setCursor(token: string, index: number): void {
  write(CURSOR_PREFIX + token, String(index));
}

export function getPlayerName(): string {
  return read(NAME_KEY) ?? "";
}

export function rememberPlayerName(name: string): void {
  write(NAME_KEY, name);
}

const ONBOARDING_KEY = "duoplay:onboarding-dismissed";

/** Le « premier réglage » a-t-il été écarté sur cet appareil ? */
export function isOnboardingDismissed(): boolean {
  return read(ONBOARDING_KEY) === "1";
}

export function dismissOnboarding(): void {
  write(ONBOARDING_KEY, "1");
}

/**
 * Identifiant de l'appareil : porte l'historique, les favoris, le couple et la
 * série de défis avant l'arrivée du compte léger (Phase 6). Conservé en
 * mémoire en secours si le stockage local est indisponible (navigation privée).
 */
export function getDeviceToken(): string {
  if (memoryDeviceToken) return memoryDeviceToken;

  const stored = read(DEVICE_KEY);
  memoryDeviceToken = stored ?? randomHex(16);
  if (!stored) write(DEVICE_KEY, memoryDeviceToken);
  return memoryDeviceToken;
}

/** Compte léger actuellement retenu sur cet appareil, s'il existe. */
export function getAccount(): StoredAccount | null {
  const raw = read(ACCOUNT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredAccount;
    if (!parsed?.primaryDeviceToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setAccount(account: StoredAccount): void {
  write(ACCOUNT_KEY, JSON.stringify(account));
  emitAccount();
}

export function clearAccount(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ACCOUNT_KEY);
  } catch {
    /* stockage indisponible : rien à effacer */
  }
  emitAccount();
}

/**
 * Identité active : le compte léger s'il existe, sinon l'appareil seul.
 * C'est **la** fonction à utiliser pour interroger l'espace personnel.
 */
export function getActiveDeviceToken(): string {
  return getAccount()?.primaryDeviceToken ?? getDeviceToken();
}

/** Clés d'affichage locales, hors identité (gérées par d'autres modules). */
const LOCAL_DISPLAY_PREFIX = "duoplay:";

/**
 * Efface **toutes** les données DuoPlay de cet appareil : identité, secret de
 * reprise, prénom retenu, compte léger, ambiance et état PWA. C'est le bouton
 * « repartir de zéro » des Paramètres — le serveur n'est jamais touché : les
 * parties restent accessibles depuis les autres appareils du couple.
 */
export function clearLocalData(): void {
  if (typeof window === "undefined") return;
  try {
    const doomed: string[] = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key && key.startsWith(LOCAL_DISPLAY_PREFIX)) doomed.push(key);
    }
    for (const key of doomed) window.localStorage.removeItem(key);
  } catch {
    /* stockage indisponible : rien à effacer */
  }
  memoryDeviceToken = null;
  emitAccount();
}
