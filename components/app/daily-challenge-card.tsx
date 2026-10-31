"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Check, Flame, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tilt } from "@/components/ui/tilt";
import { useDeviceToken } from "@/lib/game/use-device";
import { useT } from "@/lib/i18n";

type DailyToday = NonNullable<FunctionReturnType<typeof api.daily.today>>;

export function DailyChallengeCard({ compact }: { compact?: boolean }) {
  const { t } = useT();
  const deviceToken = useDeviceToken();
  const today = useQuery(
    api.daily.today,
    deviceToken !== undefined ? { deviceToken } : "skip",
  );

  if (deviceToken === undefined || today === undefined) {
    return <div className="skel h-40 rounded-xl border border-ivory-200/70" />;
  }

  if (today === null) {
    return (
      <Card tone="ivory" className="rise p-5">
        <p className="text-sm text-muted-foreground">
          {t("daily.comingSoon")}
        </p>
      </Card>
    );
  }

  return <DailyCardBody today={today} compact={Boolean(compact)} />;
}

function DailyCardBody({
  today,
  compact,
}: {
  today: DailyToday;
  compact: boolean;
}) {
  const { t, tp } = useT();
  const streakValue =
    today.streakScope === "couple" ? today.coupleStreakDays : today.streakDays;
  const done = Boolean(today.mine) && !today.mine?.skipped;
  const partnerDone = Boolean(today.partner) && !today.partner?.skipped;

  return (
    <Tilt max={4}>
      <Card className="rise top-light overflow-hidden">
        <div className="gradient-tendresse grain relative p-5 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full bg-white/20 blur-3xl"
        />
        <div className="relative z-10 mb-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
            <Sparkles className="size-3.5" />
            {today.challenge.title}
          </span>
          {streakValue > 0 && (
            <span
              data-testid="streak"
              data-scope={today.streakScope}
              className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium backdrop-blur-sm"
            >
              <Flame className="size-3.5" />
              {tp("daily.streakShort", streakValue)}
            </span>
          )}
        </div>
        <p
          className="relative z-10 text-xl leading-snug"
          data-testid="daily-prompt"
        >
          {today.challenge.prompt}
        </p>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {!compact && today.mine && (
          <div className="flex flex-col gap-1 rounded-xl bg-ivory-100 px-3.5 py-2.5">
            <span className="eyebrow">
              {t("room.yourAnswer")}
            </span>
            <span className="text-sm">
              {today.mine.skipped
                ? t("daily.skippedTodayFeminine")
                : today.mine.value}
            </span>
          </div>
        )}

        {!compact && today.partner && today.partnerName && (
          <div className="flex flex-col gap-1 rounded-xl bg-lavender-100/70 px-3.5 py-2.5">
            <span className="eyebrow text-lavender-700">{today.partnerName}</span>
            <span className="text-sm">
              {today.partner.skipped
                ? t("daily.partnerSkipped")
                : today.partner.value}
            </span>
          </div>
        )}

        {!compact && today.partnerName && !today.partner && done && (
          <p className="text-xs text-muted-foreground">
            {t("room.waitingFor", { name: today.partnerName })}
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {done
              ? partnerDone
                ? t("daily.bothParticipated")
                : t("daily.youParticipated")
              : t("daily.participationDuo")}
          </span>

          {done && compact ? (
            <Link
              href="/defi"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <Check className="size-4" />
              {t("journey.see")}
            </Link>
          ) : (
            <Link href="/defi">
              <Button
                size={done ? "sm" : "default"}
                variant={done ? "outline" : "default"}
              >
                {done ? t("daily.review") : t("daily.participate")}
              </Button>
            </Link>
          )}
        </div>
      </div>
      </Card>
    </Tilt>
  );
}
