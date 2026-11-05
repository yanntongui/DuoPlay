"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
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
    <motion.button
      type="button"
      data-testid="favorite"
      aria-pressed={active}
      aria-label={active ? t("favorites.remove") : t("favorites.add")}
      onClick={onClick}
      disabled={!ready}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-ivory-200 bg-card text-graphite-500 shadow-[var(--shadow-soft)] transition-colors hover:border-coral-300 hover:text-coral-600 disabled:opacity-50",
        active && "border-coral-200 bg-coral-100 text-coral-600",
        className,
      )}
      initial={{ scale: 1 }}
      animate={active ? { scale: 1 } : { scale: 1 }}
      whileTap={!pending ? { scale: 0.9, rotate: 15 } : {}}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <motion.div
        animate={active ? { rotate: 0 } : { rotate: 0 }}
        transition={{ duration: 0.1 }}
      >
        <Star className={cn("size-4", active && "fill-current")} />
      </motion.div>
    </motion.button>
  );
}
