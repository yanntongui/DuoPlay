import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/**
 * Journal d'événements produit (cf. docs/PRD.md §19.1).
 * Une seule écriture, quel que soit le rattachement disponible.
 */
export async function logEvent(
  ctx: MutationCtx,
  name: string,
  at: number,
  refs: {
    sessionId?: Id<"sessions">;
    coupleId?: Id<"couples">;
    userId?: Id<"users">;
    props?: Record<string, unknown>;
  } = {},
): Promise<void> {
  await ctx.db.insert("analyticsEvents", {
    name,
    sessionId: refs.sessionId,
    coupleId: refs.coupleId,
    userId: refs.userId,
    props: refs.props,
    at,
  });
}
