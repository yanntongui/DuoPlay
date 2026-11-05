/**
 * Copie dans le presse-papiers sans jamais lever d'exception.
 *
 * `navigator.clipboard` peut être indisponible (contexte non sécurisé) ou
 * refusé par l'utilisateur : on renvoie simplement `false` pour que l'appelant
 * adapte son retour visuel au lieu de laisser une promesse rejetée.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      return false;
    }
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
