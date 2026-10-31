"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDeviceToken } from "@/lib/game/use-device";
import { useT } from "@/lib/i18n";

/**
 * Aura de connexion — remplace la flamme de série.
 *
 * Un orbe de lumière organique (dégradés en maille, floutés à 64px) dont la
 * respiration s'accélère à mesure que le couple se rapproche de son rythme.
 * Aucun chiffre criard : la régularité se lit dans la lumière.
 */
export function ConnectionAura() {
  const { t, tp } = useT();
  const deviceToken = useDeviceToken();
  const today = useQuery(
    api.daily.today,
    typeof deviceToken === "string" ? { deviceToken } : "skip",
  );

  const days = today?.streakDays ?? 0;
  const proximity = Math.min(days / 21, 1);
  const period = `${(7.2 - proximity * 3).toFixed(2)}s`;
  const lit = days > 0;

  return (
    <div className="flex items-center gap-4">
      <div aria-hidden="true" className="relative size-14 shrink-0">
        <span
          className="absolute inset-0 rounded-full bg-coral-500/55 blur-[18px] breathe"
          style={{ animationDuration: period }}
        />
        <span
          className="absolute inset-1.5 rounded-full bg-lavender-300/50 blur-[14px] breathe"
          style={{ animationDuration: period, animationDelay: "-1.4s" }}
        />
        <span className="absolute inset-[36%] rounded-full bg-white/90 shadow-[0_0_18px_5px_rgb(226_184_135_/_0.55)]" />
      </div>

      <div className="min-w-0">
        <p className="eyebrow">{t("space.auraTitle")}</p>
        <p className="text-sm leading-snug">
          {lit ? (
            <>
              <span data-testid="streak" className="font-display text-xl">
                {days}
              </span>{" "}
              {tp("space.auraDay", days)}
            </>
          ) : (
            t("space.auraEmpty")
          )}
        </p>
      </div>
    </div>
  );
}
