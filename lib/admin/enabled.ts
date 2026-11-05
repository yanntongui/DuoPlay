/**
 * Interrupteur de la console d'administration.
 *
 * La console `/admin` est encore une **maquette** : le login accepte n'importe
 * quel couple e-mail / mot de passe et le jeton est posé côté navigateur. Elle
 * ne doit donc jamais être exposée telle quelle sur Internet.
 *
 * - Développement : ouverte par défaut (pratique pour itérer).
 * - Production : fermée, sauf `ADMIN_ENABLED=1` explicite — à ne faire que
 *   lorsque l'authentification réelle sera branchée.
 */
export function isAdminConsoleEnabled(): boolean {
  const flag = process.env.ADMIN_ENABLED;
  if (flag === "1") return true;
  if (flag === "0") return false;
  return process.env.NODE_ENV !== "production";
}
