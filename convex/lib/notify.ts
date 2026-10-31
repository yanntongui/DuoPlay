import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/**
 * Notifications in-app (cf. PRD §13, §14).
 *
 * `ensureNotification` est **idempotent** : une même relance (kind + partie +
 * niveau) n'est jamais créée deux fois, même si le balayage tourne plusieurs
 * fois dans la journée. Fréquence volontairement basse : au total, au plus deux
 * relances par partie (§13.2).
 */
export async function ensureNotification(
  ctx: MutationCtx,
  input: {
    deviceToken: string;
    kind: "differe_relance" | "differe_expiree";
    title: string;
    body: string;
    sessionId: Id<"sessions">;
    level?: number;
  },
  now: number,
): Promise<boolean> {
  const existing = await ctx.db
    .query("notifications")
    .withIndex("by_session", (q) => q.eq("sessionId", input.sessionId))
    .collect();

  const duplicate = existing.some(
    (row) =>
      row.deviceToken === input.deviceToken &&
      row.kind === input.kind &&
      (row.level ?? null) === (input.level ?? null),
  );
  if (duplicate) return false;

  await ctx.db.insert("notifications", {
    deviceToken: input.deviceToken,
    kind: input.kind,
    title: input.title,
    body: input.body,
    sessionId: input.sessionId,
    level: input.level,
    createdAt: now,
  });
  return true;
}

/** Supprime les relances d'une partie devenues caduques (relancée ou clôturée). */
export async function dismissSessionNotifications(
  ctx: MutationCtx,
  sessionId: Id<"sessions">,
): Promise<void> {
  const rows = await ctx.db
    .query("notifications")
    .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
    .collect();
  for (const row of rows) await ctx.db.delete(row._id);
}
