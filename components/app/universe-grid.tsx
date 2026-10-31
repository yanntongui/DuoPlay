"use client";

import { motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowRight, Clock } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/components/convex-client-provider";
import { Card } from "@/components/ui/card";
import { EmojiTile, Pill } from "@/components/ui/surface";
import { MOODS, findMood, type Mood } from "@/lib/personalization";
import { UNIVERSES, type Universe } from "@/lib/content";
import { localize, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const INTENSITY_KEY: Record<Universe["intensity"], "intensity.leger" | "intensity.moyen" | "intensity.profond"> = {
  leger: "intensity.leger",
  moyen: "intensity.moyen",
  profond: "intensity.profond",
};

type CategoryRow = {
  _id: string;
  slug: string;
  title: string;
  titleEn?: string;
  tagline: string;
  taglineEn?: string;
  description: string;
  descriptionEn?: string;
  emoji: string;
  accent: Universe["accent"];
  mvp: boolean;
  durationMinutes: number;
  intensity: Universe["intensity"];
};

function MoodFilter({ mood }: { mood: string | null }) {
  const { t, locale } = useT();
  const chip = (active: boolean) =>
    cn(
      "press inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 active:scale-95",
      active
        ? "gradient-primary top-light border-transparent text-white shadow-[var(--shadow-glow)] scale-105"
        : "border-ivory-200/90 bg-card/80 text-graphite-600 shadow-[var(--shadow-soft)] hover:border-lavender-300 hover:text-foreground hover:bg-card",
    );

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label={t("explorer.filterLabel")}
    >
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Link
          href="/explorer"
          data-testid="mood-all"
          aria-pressed={mood === null}
          className={chip(mood === null)}
        >
          {t("explorer.allUniverses")}
        </Link>
      </motion.div>
      {MOODS.map((item, index) => (
        <motion.div
          key={item.slug}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 + index * 0.05 }}
        >
          <Link
            href={`/explorer?ambiance=${item.slug}`}
            data-testid={`mood-${item.slug}`}
            aria-pressed={mood === item.slug}
            aria-label={localize(locale, item.title, item.titleEn)}
            title={localize(locale, item.description, item.descriptionEn)}
            className={chip(mood === item.slug)}
          >
            <span aria-hidden="true">{item.emoji}</span>
            {localize(locale, item.title, item.titleEn)}
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

function UniverseCard({
  universe,
  mood,
  featured = false,
}: {
  universe: Universe;
  mood: string | null;
  featured?: boolean;
}) {
  const { t, locale } = useT();
  const title = localize(locale, universe.title, universe.titleEn);
  const description = localize(
    locale,
    universe.description,
    universe.descriptionEn,
  );

  function track(event: React.PointerEvent<HTMLDivElement>) {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty(
      "--mx",
      `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`,
    );
    el.style.setProperty(
      "--my",
      `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`,
    );
  }

  const body = (
    <Card
      interactive={universe.mvp}
      onPointerMove={track}
      className={cn(
        "spotlight top-light flex flex-col p-5 h-full",
        !universe.mvp && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <EmojiTile
          tone={universe.accent === "coral" ? "coral" : "lavender"}
          size={featured ? "lg" : "md"}
        >
          {universe.emoji}
        </EmojiTile>
        {universe.mvp ? (
          <Pill tone="primary">{t("universe.available")}</Pill>
        ) : (
          <Pill tone="neutral">{t("nav.soon")}</Pill>
        )}
      </div>

      <div className="mt-auto">
        <h3
          className={cn(
            "mb-1 leading-tight",
            featured ? "text-2xl sm:text-3xl" : "text-lg",
          )}
        >
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-graphite-300">
            <Clock className="size-3" aria-hidden="true" />
            {universe.durationMinutes} min
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-lavender-300/20 bg-lavender-100 px-2.5 py-1 text-[11px] font-medium text-lavender-700">
            {t(INTENSITY_KEY[universe.intensity])}
          </span>
        </div>

        {featured && (
          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-lavender-300/25 bg-lavender-100 px-3 py-1 text-[11px] font-medium text-lavender-700">
            <span aria-hidden="true">✦</span>
            {localize(locale, universe.tagline, universe.taglineEn)}
          </span>
        )}

        {universe.mvp && (
          <span className="mt-4 flex w-fit items-center gap-1.5 text-sm font-medium text-coral-600 transition-colors group-hover:text-coral-300">
            {t("universe.launch")}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        )}
      </div>
    </Card>
  );

  if (!universe.mvp) return body;

  const href = mood
    ? `/explorer/${universe.slug}?ambiance=${mood}`
    : `/explorer/${universe.slug}`;

  return (
    <Link
      href={href}
      aria-label={t("universe.launchAria", { title })}
      className={cn(
        "press group block rounded-xl",
        featured && "sm:col-span-2 lg:row-span-2",
      )}
    >
      {body}
    </Link>
  );
}

/**
 * Carousel pour mobile, grid pour desktop
 */
function CarouselGrid({ items, mood }: { items: Universe[]; mood: string | null }) {
  const { t } = useT();
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card tone="lavender" className="p-6 text-center">
          <p className="text-sm font-medium">{t("universe.none")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("universe.noneHint")}
          </p>
        </Card>
      </motion.div>
    );
  }

  const featuredSlug = items.find((item) => item.mvp)?.slug;

  return (
    <div className="relative">
      {/* Carousel pour mobile */}
      <motion.div
        className="no-scrollbar flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:hidden"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {items.map((universe, index) => (
          <motion.div
            key={universe.slug}
            className="snap-center shrink-0 w-[85vw] max-w-[340px]"
            style={{ height: "320px" }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: index * 0.1 }}
          >
            <UniverseCard
              universe={universe}
              mood={mood}
              featured={universe.slug === featuredSlug}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Grid pour desktop */}
      <motion.div
        className="hidden grid auto-rows-[minmax(11rem,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-3 md:grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {items.map((universe, index) => (
          <motion.div
            key={universe.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
          >
            <UniverseCard
              universe={universe}
              mood={mood}
              featured={universe.slug === featuredSlug}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function Loading() {
  return (
    <div className="grid auto-rows-[minmax(11rem,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="skel rounded-xl border border-ivory-200/70 sm:col-span-2 lg:row-span-2" />
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="skel rounded-xl border border-ivory-200/70"
        />
      ))}
    </div>
  );
}

function categoriesToUniverses(categories: CategoryRow[]): Universe[] {
  if (categories.length === 0) return UNIVERSES;
  return categories.map((category) => ({
    slug: category.slug as Universe["slug"],
    title: category.title,
    titleEn: category.titleEn ?? category.title,
    tagline: category.tagline,
    taglineEn: category.taglineEn ?? category.tagline,
    description: category.description,
    descriptionEn: category.descriptionEn ?? category.description,
    emoji: category.emoji,
    accent: category.accent,
    mvp: category.mvp,
    durationMinutes: category.durationMinutes ?? 10,
    intensity: category.intensity ?? "moyen",
  }));
}

function filterByMood(items: Universe[], mood: Mood | null) {
  if (!mood) return items;
  return items.filter((item) =>
    mood.universes.includes(item.slug as Universe["slug"]),
  );
}

function UniverseGridFromConvex({ mood }: { mood: Mood | null }) {
  const categories = useQuery(api.categories.list);

  if (categories === undefined) return <Loading />;

  return (
    <CarouselGrid
      items={filterByMood(categoriesToUniverses(categories), mood)}
      mood={mood?.slug ?? null}
    />
  );
}

export function UniverseGrid({ mood = null }: { mood?: string | null }) {
  const { locale } = useT();
  const selected = findMood(mood);

  return (
    <div className="flex flex-col gap-4">
      <MoodFilter mood={selected?.slug ?? null} />
      {selected && (
        <p className="text-sm text-muted-foreground">
          {selected.emoji}{" "}
          <span className="font-medium">
            {localize(locale, selected.title, selected.titleEn)}
          </span>{" "}
          — {localize(locale, selected.description, selected.descriptionEn)}
        </p>
      )}
      {isConvexConfigured ? (
        <UniverseGridFromConvex mood={selected} />
      ) : (
        <CarouselGrid items={filterByMood(UNIVERSES, selected)} mood={selected?.slug ?? null} />
      )}
    </div>
  );
}
