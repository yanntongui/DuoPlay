"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useT } from "@/lib/i18n";

/**
 * Bandeau hors ligne (cf. PRD §16.2).
 *
 * Il ne bloque rien : les réponses déjà envoyées sont conservées côté Convex et
 * la reprise repart de la dernière question non terminée. On informe, on
 * n'alarme pas.
 */
export function OfflineBanner() {
  const { t } = useT();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="offline-banner"
      className="flex items-center justify-center gap-2 bg-graphite-800 px-4 py-2 text-center text-xs font-medium text-white"
    >
      <WifiOff className="size-3.5 shrink-0" />
      {t("offline.banner")}
    </div>
  );
}
