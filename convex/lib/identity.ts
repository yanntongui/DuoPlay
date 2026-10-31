/**
 * Identités sans compte (Phase 3)
 *
 * Avant le compte léger (§14.1), deux secrets suffisent :
 *  - `playerToken` : le joueur dans **une** partie (boucle de jeu) ;
 *  - `deviceToken` : l'appareil, donc l'historique, les favoris, le couple
 *    et la série de défis.
 *
 * Les deux sont des chaînes aléatoires générées côté client et jamais
 * exposées à l'autre joueur.
 */

const MIN_LENGTH = 8;
const MAX_LENGTH = 64;

export function cleanDeviceToken(token: string): string {
  const value = token.trim();
  if (value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
    throw new Error("Identifiant d'appareil invalide.");
  }
  return value;
}

export function optionalDeviceToken(
  token: string | undefined,
): string | undefined {
  if (!token || token.trim().length < MIN_LENGTH) return undefined;
  return token.trim().slice(0, MAX_LENGTH);
}
