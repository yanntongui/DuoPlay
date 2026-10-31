"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import {
  getAmbiance,
  subscribeAmbiance,
  toggleAmbiance,
  type Ambiance,
} from "@/lib/ambiance";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type { Ambiance };

/**
 * Bascule d'ambiance « Soirée aux chandelles ↔ Douceur du jour ».
 * Ce n'est pas un thème clair : la nuit reste la nuit, seule la chaleur du
 * fond change (obsidienne froide ↔ ambre). Le choix est posé sur `<html>`
 * avant la première peinture (cf. script du layout) et retenu sur l'appareil.
 * Le stockage vit dans `lib/ambiance`, partagé avec la page Paramètres.
 */
export function AmbianceToggle({ className }: { className?: string }) {
  const { t } = useT();
  const [ambiance, setAmbiance] = useState<Ambiance>("chandelles");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setAmbiance(getAmbiance());
    setMounted(true);
    return subscribeAmbiance(() => setAmbiance(getAmbiance()));
  }, []);

  function toggle() {
    setAmbiance(toggleAmbiance());
  }

  const isDay = ambiance === "douceur";

  return (
    <button
      type="button"
      data-testid="ambiance-toggle"
      data-ambiance={ambiance}
      onClick={toggle}
      aria-pressed={isDay}
      aria-label={
        isDay ? t("ambiance.toEvening") : t("ambiance.toDay")
      }
      title={isDay ? t("ambiance.evening") : t("ambiance.day")}
      className={cn(
        "press inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-lavender-300 transition-colors hover:bg-white/[0.08] hover:text-lavender-200",
        className,
      )}
    >
      <span suppressHydrationWarning className="inline-flex">
        {mounted && isDay ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )}
      </span>
    </button>
  );
}
