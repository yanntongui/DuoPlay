"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Star } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useDeviceToken } from "@/lib/game/use-device";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  experienceId,
  className,
}: {
  experienceId: Id<"experiences">;
  className?: string;
}) {
  const { t } = useT();
  const deviceToken = useDeviceToken();
  const ready = deviceToken !== undefined;
  const favorites = useQuery(
    api.favorites.idsForDevice,
    ready ? { deviceToken } : "skip",
  );
  const toggle = useMutation(api.favorites.toggle);
  const [pending, setPending] = useState(false);

  const active = Boolean(favorites?.includes(experienceId));

  async function onClick() {
    if (deviceToken === undefined || pending) return;
    setPending(true);
    try {
      await toggle({ deviceToken, experienceId });
    } catch {
      /* le bouton reste dans son état précédent */
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      data-testid="favorite"
      aria-pressed={active}
      aria-label={active ? t("favorites.remove") : t("favorites.add")}
      onClick={onClick}
      disabled={!ready}
      className={cn(
        "press inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-ivory-200 bg-card text-graphite-500 shadow-[var(--shadow-soft)] transition-colors hover:border-coral-300 hover:text-coral-600 disabled:opacity-50",
        active && "border-coral-200 bg-coral-100 text-coral-600",
        className,
      )}
    >
      <Star className={cn("size-4", active && "fill-current")} />
    </button>
  );
}
