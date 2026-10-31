"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import {
  Check,
  CircleDashed,
  PartyPopper,
  Share2,
  Sparkles,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pill, SectionTitle } from "@/components/ui/surface";
import { useDeviceToken } from "@/lib/game/use-device";
import { LOCALE_TAG, useT, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function shortDate(value: number, locale: Locale) {
  return new Date(value).toLocaleDateString(LOCALE_TAG[locale], {
    day: "numeric",
    month: "long",
  });
}

export function JourneyRecap({ slug }: { slug: string }) {
  const deviceToken = useDeviceToken();
  const { t, tp, locale } = useT();
  const ready = deviceToken !== undefined;
  const data = useQuery(
    api.journeys.recap,
    ready ? { deviceToken, slug } : "skip",
  );
  const markSeen = useMutation(api.journeys.markRecapSeen);

  const [origin, setOrigin] = useState("");
  const seenRef = useRef(false);

  useEffect(() => setOrigin(window.location.origin), []);

  useEffect(() => {
    if (!ready || !data || seenRef.current) return;
    seenRef.current = true;
    void markSeen({ deviceToken, slug });
  }, [ready, data, markSeen, deviceToken, slug]);

  if (!ready || data === undefined) {
    return <div className="skel h-64 rounded-xl border border-ivory-200/70" />;
  }

  if (data === null) {
    return (
      <Card tone="ivory" className="p-6 text-sm text-muted-foreground">
        {t("journeyRecap.notFound")}
      </Card>
    );
  }

  const { journey, steps, progress, stats, partnerName } = data;
  const done = steps.filter((step) => step.done);

  if (!progress.completed) {
    return (
      <Card tone="ivory" className="flex flex-col items-center gap-3 p-7 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-lavender-100 to-lavender-200/70 text-lavender-700 ring-1 ring-inset ring-white/[0.10]">
          <Sparkles className="size-6" />
        </div>
        <h2 className="text-lg">{t("journeyRecap.inProgressTitle")}</h2>
        <p className="text-sm text-muted-foreground">
          {tp(
            "journeyRecap.stepsLeft",
            progress.totalDays - progress.completedCount,
          )}
        </p>
        <Link href={`/parcours/${slug}`} className="text-sm font-medium text-primary hover:underline">
          {t("journeyRecap.continue")}
        </Link>
      </Card>
    );
  }

  const shareText = t("journeyRecap.shareText", {
    title: journey.title,
    count: journey.lengthDays,
    url: `${origin}/parcours/${slug}`,
  });

  return (
    <div className="flex flex-col gap-6">
      <Card className="rise overflow-hidden">
        <div className="gradient-tendresse grain top-light relative p-6 text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full bg-white/20 blur-3xl"
          />
          <div className="relative z-10">
            <Pill tone="glass">
              <PartyPopper className="size-3.5" />
              {t("journey.finished")}
            </Pill>
            <p className="mt-3 text-3xl">{journey.emoji}</p>
            <h1 className="mt-2 text-[2rem] leading-[1.1]">{journey.title}</h1>
            <p className="mt-1.5 text-sm text-white/85">
              {t("journeyRecap.stepsCount", { count: journey.lengthDays })}{" "}
              {partnerName
                ? t("journeyRecap.sharedWithPartner", { name: partnerName })
                : t("journeyRecap.sharedTogether")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 p-5 text-center">
          <div className="rounded-xl bg-ivory-100 px-2 py-3">
            <p className="text-xl font-semibold text-coral-600" data-testid="recap-days">
              {stats.days}
            </p>
            <p className="eyebrow mt-0.5">{t("journeyRecap.statSteps")}</p>
          </div>
          <div className="rounded-xl bg-ivory-100 px-2 py-3">
            <p className="text-xl font-semibold text-coral-600">
              {stats.experiences}
            </p>
            <p className="eyebrow mt-0.5">{t("journeyRecap.statGames")}</p>
          </div>
          <div className="rounded-xl bg-ivory-100 px-2 py-3">
            <p className="text-xl font-semibold text-coral-600">
              {stats.missions}
            </p>
            <p className="eyebrow mt-0.5">{t("journeyRecap.statMissions")}</p>
          </div>
        </div>

        {(data.startedAt || data.completedAt) && (
          <p className="px-5 pb-5 text-xs text-muted-foreground">
            {data.startedAt
              ? t("journeyRecap.startedOn", {
                  date: shortDate(data.startedAt, locale),
                })
              : null}
            {data.startedAt && data.completedAt ? " · " : null}
            {data.completedAt
              ? t("journeyRecap.completedOn", {
                  date: shortDate(data.completedAt, locale),
                })
              : null}
          </p>
        )}
      </Card>

      <section className="flex flex-col gap-3">
        <SectionTitle title={t("journeyRecap.recapTitle")} className="mb-0" />

        {done.map((step) => (
          <Card
            key={step.dayIndex}
            data-testid="recap-step"
            className="flex items-start gap-3 p-4"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-lavender-100 text-lavender-700">
              <Check className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-base font-medium leading-tight">
                {step.title}
              </p>
              {step.experienceTitle && (
                <p className="text-xs text-muted-foreground">
                  {t("journeyRecap.gameLabel", {
                    title: step.experienceTitle,
                  })}
                </p>
              )}
              {step.mission && (
                <p className="text-xs text-muted-foreground">{step.mission}</p>
              )}
            </div>
          </Card>
        ))}

        {steps.filter((step) => !step.done).map((step) => (
          <Card
            key={step.dayIndex}
            tone="ivory"
            className="flex items-start gap-3 p-4 opacity-70"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ivory-200 text-muted-foreground">
              <CircleDashed className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-base font-medium leading-tight">
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("journeyRecap.notDone")}
              </p>
            </div>
          </Card>
        ))}
      </section>

      <div className="flex flex-wrap gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="press inline-flex h-10 items-center gap-2 rounded-full border border-ivory-300 bg-card/90 px-4 text-sm font-medium shadow-[var(--shadow-soft)] transition-colors hover:-translate-y-0.5 hover:border-lavender-300 hover:shadow-[var(--shadow-lift)]"
        >
          <Share2 className="size-4" />
          {t("journeyRecap.share")}
        </a>
        <Link
          href="/parcours"
          className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
        >
          {t("journeyRecap.viewOthers")}
        </Link>
      </div>
    </div>
  );
}
