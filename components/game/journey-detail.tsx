"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import {
  Check,
  Loader2,
  PartyPopper,
  Play,
  Sparkles,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmojiTile, Pill, SectionTitle } from "@/components/ui/surface";
import { useDeviceToken } from "@/lib/game/use-device";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function errorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error
    ? cause.message.replace(/^.*Uncaught Error:\s*/, "")
    : fallback;
}

export function JourneyDetail({ slug }: { slug: string }) {
  const deviceToken = useDeviceToken();
  const { t } = useT();
  const data = useQuery(
    api.journeys.bySlug,
    deviceToken !== undefined ? { slug, deviceToken } : { slug },
  );
  const start = useMutation(api.journeys.start);
  const completeStep = useMutation(api.journeys.completeStep);

  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (data === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <div className="skel h-24 rounded-xl border border-ivory-200/70" />
        <div className="skel h-56 rounded-xl border border-ivory-200/70" />
      </div>
    );
  }

  if (data === null) {
    return (
      <Card tone="ivory" className="p-6 text-sm text-muted-foreground">
        {t("journeyDetail.notAvailable")}
      </Card>
    );
  }

  const { journey, steps, progress } = data;
  const started = progress.startedAt !== null;
  const ratio =
    progress.totalDays > 0
      ? Math.round((progress.completedCount / progress.totalDays) * 100)
      : 0;

  async function begin() {
    if (deviceToken === undefined || pending) return;
    setPending("start");
    setError(null);
    try {
      await start({ deviceToken, slug });
    } catch (cause) {
      setError(errorMessage(cause, t("journeyDetail.genericError")));
    } finally {
      setPending(null);
    }
  }

  async function markDone(dayIndex: number) {
    if (deviceToken === undefined || pending) return;
    setPending(`step-${dayIndex}`);
    setError(null);
    try {
      await completeStep({ deviceToken, slug, dayIndex });
    } catch (cause) {
      setError(errorMessage(cause, t("journeyDetail.genericError")));
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <section className="pt-2">
        <EmojiTile tone="lavender" size="lg" className="mb-4">
          {journey.emoji}
        </EmojiTile>
        <p className="eyebrow mb-1.5">
          {t("journey.daysAndTagline", {
            days: journey.lengthDays,
            tagline: journey.tagline,
          })}
        </p>
        <h1 className="text-[2rem] leading-[1.1]">{journey.title}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          {journey.description}
        </p>
      </section>

      {!started && (
        <Card tone="ivory" className="flex flex-col gap-3 p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("journeyDetail.pace")}
          </p>
          <Button
            type="button"
            size="lg"
            className="w-full gap-2"
            data-testid="journey-start"
            disabled={pending === "start"}
            onClick={begin}
          >
            {pending === "start" && <Loader2 className="size-4 animate-spin" />}
            {t("journeyDetail.start")}
          </Button>
        </Card>
      )}

      {started && (
        <Card className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">
              {t("journeyDetail.progress", {
                done: progress.completedCount,
                total: progress.totalDays,
              })}
            </span>
            {progress.completed ? (
              <Pill tone="primary">
                <PartyPopper className="size-3.5" />
                {t("journey.done")}
              </Pill>
            ) : (
              <span className="text-xs text-muted-foreground">
                {t("journey.day", { day: progress.currentDay ?? "" })}
              </span>
            )}
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-ivory-200/80">
            <div
              data-testid="journey-progress"
              className="gradient-primary h-full rounded-full transition-all motion-reduce:transition-none"
              style={{ width: `${ratio}%` }}
            />
          </div>

          {progress.completed && (
            <Link
              href={`/parcours/${slug}/recapitulatif`}
              className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary hover:underline"
            >
              <Sparkles className="size-4" />
              {t("journeyDetail.viewRecap")}
            </Link>
          )}
        </Card>
      )}

      <section className="flex flex-col gap-3">
        <SectionTitle title={t("journeyDetail.stepsTitle")} className="mb-0" />

        {steps.map((step) => {
          const isCurrent =
            progress.currentDay !== null && step.dayIndex === progress.currentDay;
          const busy = pending === `step-${step.dayIndex}`;

          return (
            <Card
              key={step._id}
              data-testid="journey-step"
              tone={isCurrent && !step.done ? "coral" : "default"}
              className={cn("flex flex-col gap-3 p-4")}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    step.done
                      ? "bg-lavender-100 text-lavender-700"
                      : isCurrent
                        ? "gradient-primary top-light text-white shadow-[var(--shadow-glow)]"
                        : "bg-ivory-200 text-muted-foreground",
                  )}
                >
                  {step.done ? <Check className="size-4" /> : step.dayIndex}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base leading-tight">
                      {step.title}
                    </h3>
                    {isCurrent && !step.done && (
                      <Pill tone="primary" className="shrink-0">
                        {t("journeyDetail.today")}
                      </Pill>
                    )}
                  </div>

                  {step.experience && (
                    <p className="text-xs text-muted-foreground">
                      {step.experience.categoryEmoji} {step.experience.title} ·{" "}
                      {step.experience.estimatedMinutes} {t("common.minutes")}
                    </p>
                  )}
                  {step.prompt && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {step.prompt}
                    </p>
                  )}
                  {step.mission && (
                    <p className="mt-1 text-sm">{step.mission}</p>
                  )}
                </div>
              </div>

              {!step.done && (
                <div className="flex flex-wrap items-center gap-2">
                  {step.experience && (
                    <Link
                      href={`/nouvelle/${step.experience.slug}?journey=${slug}&jour=${step.dayIndex}`}
                      data-testid="journey-launch"
                      className="press gradient-primary top-light inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium text-white shadow-[var(--shadow-glow)] hover:brightness-[1.06]"
                    >
                      <Play className="size-3.5" />
                      {t("journeyDetail.launch")}
                    </Link>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant={step.experience ? "ghost" : "secondary"}
                    data-testid="journey-done"
                    disabled={busy || deviceToken === undefined}
                    onClick={() => markDone(step.dayIndex)}
                    className={cn("gap-1.5", step.experience && "text-muted-foreground")}
                  >
                    {busy && <Loader2 className="size-3.5 animate-spin" />}
                    {step.experience
                      ? t("journeyDetail.alreadyDone")
                      : t("journeyDetail.markDoneLabel")}
                  </Button>
                </div>
              )}

              {step.done && (
                <span
                  data-testid="journey-step-complete"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-coral-700"
                >
                  <Check className="size-3.5" />
                  {t("journeyDetail.stepDone")}
                </span>
              )}
            </Card>
          );
        })}
      </section>

      {error && (
        <p className="rounded-lg bg-coral-100 px-3 py-2 text-sm text-coral-700">
          {error}
        </p>
      )}
    </div>
  );
}
