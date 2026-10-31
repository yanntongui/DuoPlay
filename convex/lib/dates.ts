/**
 * Fuseau de référence DuoPlay : Africa/Lagos (UTC+1, WAT) — Bénin, Nigeria,
 * Cameroun. Un « jour » de défi bascule à minuit heure locale.
 */
const WAT_OFFSET_MS = 60 * 60 * 1000;

export function dayKey(now: number = Date.now()): string {
  return new Date(now + WAT_OFFSET_MS).toISOString().slice(0, 10);
}

export function dayKeyMinus(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

/** Instant (ms, epoch UTC) du début — 00:00 heure locale WAT — d'un `jour`. */
export function dayStart(dateKey: string): number {
  return Date.parse(`${dateKey}T00:00:00.000Z`) - WAT_OFFSET_MS;
}

/** Hash stable (FNV-1a) — sert à tirer un contenu de façon déterministe. */
export function stableHash(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}
