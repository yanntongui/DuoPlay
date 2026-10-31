"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Bell } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useDeviceToken } from "@/lib/game/use-device";
import { useT } from "@/lib/i18n";

/**
 * Cloche de rappels (§14) : un compteur discret qui mène à « Notre espace ».
 * Aucune notification n'est poussée sans consentement (cf. `consents`).
 */
export function NotificationsBell() {
  const { t, tp } = useT();
  const deviceToken = useDeviceToken();
  const data = useQuery(
    api.notifications.list,
    deviceToken ? { deviceToken } : "skip",
  );
  const unread = data?.unread ?? 0;

  return (
    <Link
      href="/notre-espace"
      data-testid="notifications-bell"
      aria-label={
        unread > 0
          ? tp("notifications.pending", unread)
          : t("notifications.title")
      }
      className="press relative inline-flex size-9 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.03] text-muted-foreground transition-colors hover:bg-white/[0.07] hover:text-foreground"
    >
      <Bell className="size-4" />
      {unread > 0 && (
        <span
          data-testid="notifications-count"
          className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-coral-500 px-1 text-[10px] font-semibold leading-4 text-white shadow-[var(--shadow-glow)]"
        >
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
