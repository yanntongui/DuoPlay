/**
 * Cible des portails de la console.
 *
 * Les variables CSS (`--ad-*`) et les classes `.ad-*` sont définies sous
 * `.admin-shell`. Un portail vers `document.body` sortirait de cette portée :
 * la modale et le menu s'afficheraient sans fond, sans bordure et sans ombre.
 *
 * On monte donc les couches flottantes **dans** `.admin-shell`, qui n'a ni
 * `transform` ni `filter` : `position: fixed` y reste relatif à la fenêtre.
 * (Le conteneur `.ad-enter`, lui, porte une animation avec `fill-mode: both`,
 * ce qui en fait un repère de positionnement et décalerait les menus.)
 */
export function adminPortalHost(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(".admin-shell") ?? document.body;
}
