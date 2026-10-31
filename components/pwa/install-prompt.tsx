"use client";

import { useT } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  dismissInstall,
  hasPlayed,
  isInstallDismissed,
  subscribePwa,
} from "@/lib/pwa/state";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Invitation à installer l'application (cf. PRD §16.3).
 *
 * Règle : proposé **au bon moment**, après une première partie jouée, jamais
 * avant, jamais de façon répétée, et refusable en un tap.
 */
export function InstallPrompt() {
  const { t } = useT();
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [eligible, setEligible] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      setEligible(hasPlayed() && !isInstallDismissed());
    };
    evaluate();
    return subscribePwa(evaluate);
  }, []);

  useEffect(() => {
    const capture = (incoming: Event) => {
      incoming.preventDefault();
      setEvent(incoming as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", capture);
    return () => window.removeEventListener("beforeinstallprompt", capture);
  }, []);

  if (!event || !eligible || hidden) return null;

  async function install() {
    if (!event) return;
    setHidden(true);
    try {
      await event.prompt();
      await event.userChoice;
    } catch {
      /* l'utilisateur a fermé la boîte système */
    }
    setEvent(null);
  }

  function later() {
    setHidden(true);
    setEvent(null);
    dismissInstall();
  }

  return (
    <Card
      data-testid="install-prompt"
      className="flex items-center gap-3 border-primary/30 bg-secondary/60 p-4"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Download className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{t("install.title")}</p>
        <p className="text-xs text-muted-foreground">{t("install.body")}</p>
        <button
          type="button"
          onClick={install}
          className="mt-2 text-xs font-medium text-primary hover:underline"
        >
          {t("install.action")}
        </button>
      </div>
      <button
        type="button"
        onClick={later}
        aria-label={t("install.dismiss")}
        className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted"
      >
        <X className="size-4" />
      </button>
    </Card>
  );
}
