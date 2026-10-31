"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  ArrowRight,
  Award,
  Compass,
  Gamepad2,
  Heart,
  Sparkles,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmojiTile, Pill, SectionTitle } from "@/components/ui/surface";
import { modeTitle } from "@/lib/content";
import { LOCALE_TAG, useT } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/store";
import type { MessageKey } from "@/lib/i18n/messages";
import { useDeviceToken } from "@/lib/game/use-device";
import { cn } from "@/lib/utils";

type Range = "7d" | "30d" | "all";
type Overview = FunctionReturnType<typeof api.activity.overview>;
type RecentItem = Overview["recent"][number];
type ActiveJourney = NonNullable<
  FunctionReturnType<typeof api.journeys.mine>
>["active"][number];

const RANGES: { value: Range; labelKey: MessageKey }[] = [
  { value: "7d", labelKey: "activity.range7d" },
  { value: "30d", labelKey: "activity.range30d" },
  { value: "all", labelKey: "activity.rangeAll" },
];

const PERIOD_KEY: Record<Range, MessageKey> = {
  "7d": "activity.period7d",
  "30d": "activity.period30d",
  all: "activity.periodAll",
};

const CARDS = [
  { key: "sessions", labelKey: "activity.cardSessions", icon: Gamepad2 },
  { key: "shared", labelKey: "activity.cardShared", icon: Heart },
  { key: "experiences", labelKey: "activity.cardExperiences", icon: Compass },
  { key: "challenges", labelKey: "activity.cardChallenges", icon: Award },
] as const;

function shortDate(value: number, locale: Locale) {
  return new Date(value).toLocaleDateString(LOCALE_TAG[locale], {
    day: "numeric",
    month: "short",
  });
}

/**
 * « Mon activité » (§5) — lecture seule, honnête et non culpabilisante :
 * uniquement l'activité de l'appareil (ou du compte léger), jamais celle du
 * partenaire, sans classement ni comparaison. Les compteurs proviennent de
 * parties réellement terminées, jamais des parties abandonnées.
 */
export function ActivityStats() {
  const { t } = useT();
  const deviceToken = useDeviceToken();
  const [range, setRange] = useState<Range>("all");

  const overview = useQuery(
    api.activity.overview,
    deviceToken !== undefined ? { deviceToken, range } : "skip",
  );
  const journeys = useQuery(
    api.journeys.mine,
    deviceToken !== undefined ? { deviceToken } : "skip",
  );

  const loading = deviceToken === undefined || overview === undefined;

  return (
    <section data-testid="activity" data-loaded={!loading}>
      <SectionTitle
        eyebrow={t("activity.eyebrow")}
        title={t("activity.title")}
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {CARDS.map((card) => (
            <div
              key={card.key}
              className="skel h-24 rounded-xl border border-ivory-200/70"
            />
          ))}
        </div>
      ) : (
        <ActivityBody
          overview={overview}
          range={range}
          onRange={setRange}
          activeJourney={
            journeys?.active[0] ?? null
          }
        />
      )}
    </section>
  );
}

function ActivityBody({
  overview,
  range,
  onRange,
  activeJourney,
}: {
  overview: Overview;
  range: Range;
  onRange: (range: Range) => void;
  activeJourney: ActiveJourney | null;
}) {
  const { t } = useT();
  const startHere =
    overview.allTime.sessions === 0 &&
    overview.allTime.challenges === 0 &&
    overview.recent.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {!startHere && (
        <div
          className="flex items-center gap-2"
          role="group"
          aria-label={t("activity.periodLabel")}
        >
          {RANGES.map((option) => (
            <button
              key={option.value}
              type="button"
              data-testid={`activity-range-${option.value}`}
              aria-pressed={range === option.value}
              onClick={() => onRange(option.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                range === option.value
                  ? "bg-lavender-100 text-lavender-700 ring-1 ring-inset ring-lavender-300/50"
                  : "bg-white/[0.04] text-muted-foreground ring-1 ring-inset ring-white/[0.08] hover:text-foreground",
              )}
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {CARDS.map((card) => (
          <StatCard
            key={card.key}
            id={card.key}
            label={t(card.labelKey)}
            icon={card.icon}
            value={overview.counts[card.key]}
            previous={overview.previous?.[card.key] ?? null}
            range={range}
          />
        ))}
      </div>

      {startHere ? (
        <Card
          data-testid="activity-empty"
          className="flex flex-col items-center gap-3 p-6 text-center"
        >
          <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-lavender-100 to-lavender-200/70 text-lavender-700 ring-1 ring-inset ring-white/[0.08]">
            <Sparkles className="size-5" />
          </span>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Votre histoire DuoPlay commence ici. Lancez votre première
            expérience pour voir votre activité apparaître.
          </p>
          <Link
            href="/explorer"
            data-testid="activity-empty-cta"
            className={cn(buttonVariants({ size: "lg" }), "gap-2")}
          >
            Créer une partie
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
            <ActivityChart chart={overview.chart} />
            <Regularity
              activeDays={overview.activeDays}
              range={range}
              journey={activeJourney}
            />
          </div>

          {overview.recent.length > 0 && (
            <div>
              <SectionTitle
                eyebrow={t("activity.recentEyebrow")}
                title={t("activity.recentTitle")}
              />
              <div className="flex flex-col gap-3">
                {overview.recent.map((item) => (
                  <ActivityRow key={item.sessionId} item={item} />
                ))}
                <Link
                  href="/mes-parties"
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
                >
                  {t("activity.seeAll")}
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  id,
  label,
  icon: Icon,
  value,
  previous,
  range,
}: {
  id: (typeof CARDS)[number]["key"];
  label: string;
  icon: typeof Gamepad2;
  value: number;
  previous: number | null;
  range: Range;
}) {
  const { t } = useT();
  const grew = previous !== null && previous > 0 && value > previous;

  return (
    <Card data-testid={`activity-card-${id}`} className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-lavender-300 ring-1 ring-inset ring-white/[0.08]">
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 text-xs leading-tight text-muted-foreground">
          {label}
        </span>
      </div>
      <p
        data-testid={`activity-value-${id}`}
        className="font-display text-3xl leading-none tabular-nums"
      >
        {value}
      </p>
      {grew && (
        <p className="text-[11px] font-medium text-lavender-300">
          +{value - (previous ?? 0)} {t(PERIOD_KEY[range])}
        </p>
      )}
    </Card>
  );
}

function ActivityChart({ chart }: { chart: Overview["chart"] }) {
  const { t, tp } = useT();
  const total = chart.reduce((sum, day) => sum + day.count, 0);
  const max = Math.max(1, ...chart.map((day) => day.count));

  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium">{t("activity.last7days")}</p>
        <span className="text-xs text-muted-foreground">
          {total} {tp("activity.gamesFinished", total)}
        </span>
      </div>

      <div
        data-testid="activity-chart"
        className="flex h-28 items-stretch justify-between gap-1.5"
      >
        {chart.map((day) => (
          <div
            key={day.date}
            data-testid="activity-chart-day"
            data-count={day.count}
            className="flex h-full flex-1 flex-col items-center gap-1.5"
          >
            <span
              className={cn(
                "text-[11px] leading-none tabular-nums",
                day.count > 0 ? "text-foreground" : "text-transparent",
              )}
            >
              {day.count}
            </span>
            <div className="flex w-full flex-1 items-end">
              <span
                className={cn(
                  "w-full rounded-t-md transition-[height] duration-500 motion-reduce:transition-none",
                  day.count > 0 ? "gradient-primary" : "bg-white/[0.06]",
                )}
                style={{
                  height: day.count > 0 ? `${Math.max(10, (day.count / max) * 100)}%` : "4px",
                }}
              />
            </div>
            <span className="text-[10px] uppercase tracking-wide text-graphite-400">
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Regularity({
  activeDays,
  range,
  journey,
}: {
  activeDays: number;
  range: Range;
  journey: ActiveJourney | null;
}) {
  const { t, tp } = useT();
  const ratio =
    journey && journey.progress.totalDays > 0
      ? Math.round(
          (journey.progress.completedCount / journey.progress.totalDays) * 100,
        )
      : 0;

  return (
    <Card className="flex flex-col justify-between gap-4 p-4">
      <div>
        <p className="text-sm font-medium">{t("activity.consistency")}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {t("activity.consistencyHint", { period: t(PERIOD_KEY[range]) })}
        </p>
      </div>

      <div className="flex items-end gap-2">
        <span
          data-testid="activity-active-days"
          className="font-display text-4xl leading-none tabular-nums"
        >
          {activeDays}
        </span>
        <span className="pb-1 text-xs text-muted-foreground">
          {tp("activity.activeDays", activeDays)}
        </span>
      </div>

      {journey ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-muted-foreground">
              {journey.emoji} {journey.title}
            </span>
            <span className="shrink-0 font-medium text-graphite-500">
              {journey.progress.completedCount}/{journey.progress.totalDays}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="gradient-primary h-full rounded-full"
              style={{ width: `${ratio}%` }}
            />
          </div>
        </div>
      ) : (
        <Link
          href="/parcours"
          className="text-xs font-medium text-primary hover:underline"
        >
          {t("activity.startJourney")}
        </Link>
      )}
    </Card>
  );
}

function ActivityRow({ item }: { item: RecentItem }) {
  const { t, locale } = useT();
  const closed = item.status === "abandonnee";
  const statusLabel = closed
    ? t("status.closed")
    : item.expired
      ? t("status.expired")
      : item.status === "terminee"
        ? t("status.finished")
        : item.partnerName
          ? t("status.ongoing")
          : t("status.waiting");

  const tone = closed
    ? "neutral"
    : item.expired
      ? "neutral"
      : item.status === "terminee"
        ? "primary"
        : item.partnerName
          ? "lavender"
          : "neutral";

  const resumable =
    !item.expired && item.status !== "terminee" && item.status !== "abandonnee";
  const at = item.completedAt ?? item.createdAt;
  const canReplay = Boolean(item.experience?.slug) && !resumable;

  return (
    <Card
      data-testid="activity-recent-item"
      data-status={item.status}
      className="flex items-center gap-3 p-4"
    >
      <EmojiTile tone="coral" size="sm">
        {item.category?.emoji ?? "💞"}
      </EmojiTile>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {item.experience?.title ?? t("activity.untitled")}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {shortDate(at, locale)} ·{" "}
          {item.category?.title ?? modeTitle(item.mode, locale)}
          {item.partnerName
            ? ` · ${t("activity.withName", { name: item.partnerName })}`
            : ""}
        </p>
      </div>

      <Pill tone={tone} className="shrink-0">
        {statusLabel}
      </Pill>

      {resumable ? (
        <Link
          href={`/partie/${item.token}`}
          className="shrink-0 text-[13px] font-medium text-primary hover:underline"
        >
          {t("activity.resume")}
        </Link>
      ) : item.status === "terminee" ? (
        <Link
          href={`/partie/${item.token}`}
          className="shrink-0 text-[13px] font-medium text-primary hover:underline"
        >
          {t("activity.seeResult")}
        </Link>
      ) : canReplay ? (
        <Link
          href={`/nouvelle/${item.experience?.slug}`}
          className="shrink-0 text-[13px] font-medium text-primary hover:underline"
        >
          {t("activity.replay")}
        </Link>
      ) : null}
    </Card>
  );
}
