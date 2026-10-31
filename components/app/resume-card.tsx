"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowRight, PlayCircle } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { useDeviceToken } from "@/lib/game/use-device";
import { useT } from "@/lib/i18n";

/**
 * Reprise d'une partie interrompue (§11.6, §13.2) : la plus récente partie
 * encore en cours pour cet appareil.
 */
export function ResumeCard() {
  const { t } = useT();
  const deviceToken = useDeviceToken();
  const history = useQuery(
    api.history.byDevice,
    deviceToken !== undefined ? { deviceToken } : "skip",
  );

  if (deviceToken === undefined || history === undefined) {
    return <div className="skel h-20 rounded-xl border border-ivory-200/70" />;
  }

  const resumable = history?.items.find((item) => item.resumable) ?? null;

  if (!resumable) {
    return (
      <Card tone="ivory" className="rise flex items-center gap-4 p-4">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-lavender-100 to-lavender-200/70 text-lavender-700 ring-1 ring-inset ring-white/[0.08]">
          <PlayCircle className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{t("home.noResumeTitle")}</p>
          <p className="truncate text-sm text-muted-foreground">
            {t("home.noResumeBody")}
          </p>
        </div>
      </Card>
    );
  }

  const waiting = resumable.partnerName
    ? t("home.waitingFor", { name: resumable.partnerName })
    : t("home.resumeWhere");

  return (
    <Link href={`/partie/${resumable.token}`} className="press block rounded-xl">
      <Card interactive className="flex items-center gap-4 p-4">
        <div className="gradient-primary top-light flex size-11 items-center justify-center rounded-2xl text-white shadow-[var(--shadow-glow)]">
          <PlayCircle className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">
            {resumable.experience?.title ?? t("home.ongoingGame")}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {waiting} ·{" "}
            {t("home.questionsCount", {
              mine: resumable.progress.mine,
              total: resumable.progress.total,
            })}
          </p>
        </div>
        <ArrowRight className="size-5 shrink-0 text-lavender-600" />
      </Card>
    </Link>
  );
}
