"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Check, Route, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { EmojiTile } from "@/components/ui/surface";
import { useDeviceToken } from "@/lib/game/use-device";
import { useT } from "@/lib/i18n";

/** Parcours suivis, dans « Notre espace » (cf. PRD §11.8). */
export function JourneyTracker() {
  const { t } = useT();
  const deviceToken = useDeviceToken();
  const mine = useQuery(
    api.journeys.mine,
    deviceToken !== undefined ? { deviceToken } : "skip",
  );

  if (deviceToken === undefined || mine === undefined) {
    return <div className="skel h-24 rounded-xl border border-ivory-200/70" />;
  }

  const empty = mine.active.length === 0 && mine.completed.length === 0;

  if (empty) {
    return (
      <Card tone="ivory" className="flex flex-col items-center gap-2.5 p-7 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-lavender-100 to-lavender-200/70 text-lavender-700 ring-1 ring-inset ring-white/[0.10]">
          <Route className="size-6" />
        </div>
        <p className="font-medium">{t("journey.noneTrackedTitle")}</p>
        <p className="text-sm text-muted-foreground">
          {t("journey.noneTrackedBody")}
        </p>
        <Link
          href="/parcours"
          className="text-sm font-medium text-primary hover:underline"
        >
          {t("journey.discoverJourneys")}
        </Link>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {mine.active.map((item) => (
        <Link
          key={item.journeyId}
          href={`/parcours/${item.slug}`}
          className="press block rounded-xl"
        >
          <Card interactive className="flex flex-col gap-2 p-4">
            <div className="flex items-center gap-3">
              <EmojiTile tone="lavender" size="md">
                {item.emoji}
              </EmojiTile>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {t("journey.steps", {
                    done: item.progress.completedCount,
                    total: item.progress.totalDays,
                  })}
                  {item.nextStepTitle ? ` · ${item.nextStepTitle}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-[11px] font-medium text-primary">
                {t("journey.continue")}
              </span>
            </div>
          </Card>
        </Link>
      ))}

      {mine.completed.map((item) => (
        <Link
          key={item.journeyId}
          href={`/parcours/${item.slug}/recapitulatif`}
          className="press block rounded-xl"
        >
          <Card interactive className="flex items-center gap-3 p-4">
            <EmojiTile tone="coral" size="md">
              {item.emoji}
            </EmojiTile>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {t("journey.finished")}
              </p>
            </div>
            <Check className="size-4 shrink-0 text-lavender-600" />
          </Card>
        </Link>
      ))}

      <Link
        href="/parcours"
        className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary hover:underline"
      >
        <Sparkles className="size-4" />
        {t("journey.exploreOther")}
      </Link>
    </div>
  );
}
