"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowRight, Route } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { EmojiTile } from "@/components/ui/surface";
import { useDeviceToken } from "@/lib/game/use-device";
import { useT } from "@/lib/i18n";

/** Parcours en cours, mis en avant sur l'accueil (cf. PRD §5). */
export function JourneyActiveCard() {
  const { t } = useT();
  const deviceToken = useDeviceToken();
  const mine = useQuery(
    api.journeys.mine,
    deviceToken !== undefined ? { deviceToken } : "skip",
  );

  if (deviceToken === undefined || mine === undefined) {
    return <div className="skel h-24 rounded-xl border border-ivory-200/70" />;
  }

  const current = mine.active[0] ?? null;

  if (!current) {
    return (
      <Card tone="ivory" className="flex items-center gap-4 p-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-lavender-100 to-lavender-200/70 text-lavender-700 ring-1 ring-inset ring-white/[0.08]">
          <Route className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{t("journey.activeEmptyTitle")}</p>
          <p className="text-sm text-muted-foreground">
            {t("journey.activeEmptyBody")}
          </p>
        </div>
        <Link
          href="/parcours"
          className="shrink-0 text-sm font-medium text-primary hover:underline"
        >
          {t("journey.see")}
        </Link>
      </Card>
    );
  }

  const { progress } = current;
  const ratio =
    progress.totalDays > 0
      ? Math.round((progress.completedCount / progress.totalDays) * 100)
      : 0;

  return (
    <Link
      href={`/parcours/${current.slug}`}
      className="press block rounded-xl"
    >
      <Card interactive className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <EmojiTile tone="lavender" size="md">
            {current.emoji}
          </EmojiTile>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{current.title}</p>
            <p className="truncate text-sm text-muted-foreground">
              {progress.currentDay !== null
                ? [
                    t("journey.day", { day: progress.currentDay }),
                    current.nextStepTitle ?? "",
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : t("journey.finished")}
            </p>
          </div>
          <ArrowRight className="size-5 shrink-0 text-lavender-600" />
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-ivory-200/80">
          <div
            data-testid="journey-active-progress"
            className="gradient-primary h-full rounded-full transition-all motion-reduce:transition-none"
            style={{ width: `${ratio}%` }}
          />
        </div>
        <span className="text-xs font-medium text-graphite-500">
          {t("journey.steps", {
            done: progress.completedCount,
            total: progress.totalDays,
          })}
        </span>
      </Card>
    </Link>
  );
}
