"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { EmojiTile, Pill } from "@/components/ui/surface";
import { FavoriteButton } from "@/components/app/favorite-button";
import { modeTitle } from "@/lib/content";
import { DEPTHS } from "@/lib/personalization";
import { localize, useT } from "@/lib/i18n";

function depthLabel(slug: string, locale: "fr" | "en") {
  const depth = DEPTHS.find((item) => item.slug === slug);
  if (!depth) return slug;
  return localize(locale, depth.title, depth.titleEn);
}

export function ExperienceList({
  slug,
  mood = null,
}: {
  slug: string;
  /** Ambiance choisie à l'exploration, transmise jusqu'à la configuration. */
  mood?: string | null;
}) {
  const { locale, t } = useT();
  const data = useQuery(api.experiences.listByCategorySlug, { slug });

  if (data === undefined) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="skel h-32 rounded-xl border border-ivory-200/70"
          />
        ))}
      </div>
    );
  }

  if (data === null) {
    return (
      <Card tone="lavender" className="p-6 text-center">
        <p className="text-sm font-medium">
          {t("explore.universeUnavailable")}
        </p>
        <Link
          href="/explorer"
          className="mt-2 inline-block text-sm text-primary hover:underline"
        >
          {t("explore.otherUniverses")}
        </Link>
      </Card>
    );
  }

  const { category, items } = data;

  return (
    <>
      <section className="flex flex-col gap-3">
        <EmojiTile
          tone={category.accent === "coral" ? "coral" : "lavender"}
          size="lg"
        >
          {category.emoji}
        </EmojiTile>
        <h1 className="text-[1.75rem] leading-tight">{category.title}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {category.description}
        </p>
      </section>

      {items.length === 0 ? (
        <Card tone="lavender" className="p-6 text-center">
          <p className="text-sm font-medium">
            {t("explore.noExperiences")}
          </p>
          <Link
            href="/explorer"
            className="mt-2 inline-block text-sm text-primary hover:underline"
          >
            {t("explore.otherUniverse")}
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((experience) => (
            <Card key={experience._id} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg leading-tight">{experience.title}</h2>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Pill tone="lavender">
                    {depthLabel(experience.depth, locale)}
                  </Pill>
                  <FavoriteButton experienceId={experience._id} />
                </div>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {experience.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {experience.modes.map((mode) => (
                  <Pill key={mode} tone="neutral">
                    {modeTitle(mode, locale)}
                  </Pill>
                ))}
              </div>

              <div className="hairline my-1" />

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-graphite-500">
                  {experience.type === "cartes"
                    ? `${experience.cardCount} cartes`
                    : t("explore.questionsMinutes", {
                        count: experience.questionCount,
                        minutes: experience.estimatedMinutes,
                      })}
                </span>
                <Link
                  href={
                    mood
                      ? `/nouvelle/${experience.slug}?ambiance=${mood}`
                      : `/nouvelle/${experience.slug}`
                  }
                  className="press gradient-primary top-light inline-flex h-10 items-center rounded-full px-5 text-[13px] font-medium text-white shadow-[var(--shadow-glow)] hover:brightness-[1.06]"
                >
                  {t("explore.launch")}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
