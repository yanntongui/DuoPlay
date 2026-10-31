"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Cookie } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useDeviceToken } from "@/lib/game/use-device";
import { useT } from "@/lib/i18n";

/**
 * Bannière cookies & analytics (cf. PRD §15.6).
 *
 * Affichée tant qu'aucun choix n'a été fait sur cet appareil. Deux issues
 * claires, un tap chacune : **Tout accepter** ou **Tout refuser**. Rien n'est
 * collecté avant un choix ; refuser n'enlève aucune fonctionnalité. Le choix
 * peut être modifié à tout moment depuis « Mon profil ».
 */
export function ConsentBanner() {
  const pathname = usePathname();
  const deviceToken = useDeviceToken();
  const consent = useQuery(
    api.consents.get,
    deviceToken ? { deviceToken } : "skip",
  );
  const setConsent = useMutation(api.consents.set);
  const { t } = useT();
  const [busy, setBusy] = useState(false);

  // Jamais au milieu d'une action : on ne demande pas son consentement à
  // quelqu'un qui est en train de jouer, et jamais côté back-office.
  const hidden =
    !pathname ||
    [
      "/admin",
      "/partie",
      "/nouvelle",
      "/join",
      "/hors-ligne",
    ].some((prefix) => pathname.startsWith(prefix));
  if (hidden) return null;
  if (!deviceToken || consent === undefined) return null;
  if (consent && consent.current) return null;

  async function decide(analytics: boolean, notifications: boolean) {
    if (!deviceToken) return;
    setBusy(true);
    try {
      await setConsent({ deviceToken, analytics, notifications });
    } catch {
      /* on laisse la bannière visible : l'utilisateur pourra réessayer */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      data-testid="consent-banner"
      role="dialog"
      aria-label={t("consent.label")}
      className="reveal-veil fixed inset-x-3 bottom-24 z-50 mx-auto max-w-xl rounded-2xl border border-white/[0.10] bg-[#0b0710]/95 p-4 shadow-[var(--shadow-lift)] backdrop-blur-xl md:bottom-6"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-lavender-500/15 text-lavender-300 ring-1 ring-inset ring-lavender-500/25">
          <Cookie className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{t("consent.title")}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t("consent.body")}{" "}
            <Link href="/confidentialite" className="text-primary hover:underline">
              {t("consent.more")}
            </Link>
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={busy}
              onClick={() => decide(true, true)}
              className="press gradient-primary top-light inline-flex h-9 items-center justify-center rounded-full px-4 text-[13px] font-medium text-white shadow-[var(--shadow-glow)] hover:brightness-[1.06] disabled:opacity-60"
            >
              {t("consent.accept")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => decide(false, false)}
              className="press inline-flex h-9 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.03] px-4 text-[13px] font-medium text-foreground hover:bg-white/[0.06] disabled:opacity-60"
            >
              {t("consent.refuse")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
