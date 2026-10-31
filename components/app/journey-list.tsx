"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Route } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { JourneyCard } from "@/components/app/journey-card";
import { useDeviceToken } from "@/lib/game/use-device";
import { useT } from "@/lib/i18n";

export function JourneyList() {
  const { t } = useT();
  const deviceToken = useDeviceToken();
  const journeys = useQuery(
    api.journeys.list,
    deviceToken !== undefined ? { deviceToken } : {},
  );

  if (journeys === undefined) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="skel h-40 rounded-xl border border-ivory-200/70"
          />
        ))}
      </div>
    );
  }

  if (journeys.length === 0) {
    return (
      <Card tone="lavender" className="flex flex-col items-center gap-3 p-7 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.08] text-lavender-700 ring-1 ring-inset ring-white/[0.10]">
          <Route className="size-6" />
        </div>
        <h2 className="text-lg">{t("journey.noneTitle")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("journey.noneBody")}
        </p>
        <Link
          href="/explorer"
          className="text-sm font-medium text-primary hover:underline"
        >
          {t("journey.exploreUniverses")}
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {journeys.map((journey) => (
        <JourneyCard
          key={journey._id}
          _slug={journey.slug}
          title={journey.title}
          description={journey.description}
          emoji={journey.emoji}
          lengthDays={journey.lengthDays}
          intensity="moyen"
          progress={journey.progress?.completed ? 100 : 0}
          onOpen={() => {}}
        />
      ))}
    </div>
  );
}
