import { ConvexError } from "convex/values";

/**
 * Message d'erreur lisible pour l'utilisateur.
 *
 * Convex masque les messages des `Error` classiques en production ; seuls les
 * `ConvexError` transportent un message jusqu'au client.
 */
export function readableError(error: unknown, fallback: string): string {
  if (error instanceof ConvexError) {
    if (typeof error.data === "string" && error.data.trim()) return error.data;
    if (
      error.data &&
      typeof error.data === "object" &&
      "message" in error.data &&
      typeof (error.data as { message?: unknown }).message === "string"
    ) {
      return (error.data as { message: string }).message;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
