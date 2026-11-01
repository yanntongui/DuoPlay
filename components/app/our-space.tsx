"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { ArrowRight, Heart, Sparkles, Star, Users } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { EmojiTile, Pill, SectionTitle } from "@/components/ui/surface";
import { CoupleCard } from "@/components/app/couple-card";
import { ContextualSuggestions } from "@/components/app/contextual-suggestions";
import { DailyChallengeCard } from "@/components/app/daily-challenge-card";
import { FavoriteButton } from "@/components/app/favorite-button";
import { JourneyTracker } from "@/components/app/journey-tracker";
import { Journal } from "@/components/app/journal";
import { Calendar } from "@/components/app/calendar";
import { NotificationsSection } from "@/components/app/notifications-section";
import { modeTitle } from "@/lib/content";
import { LOCALE_TAG, useT } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/store";
import type { MessageKey } from "@/lib/i18n/messages";
import { useDeviceToken } from "@/lib/game/use-device";
import { useRealTimePresence } from "@/components/app/presence";

function shortDate(value: number, locale: Locale) {
  return new Date(value).toLocaleDateString(LOCALE_TAG[locale], {
    day: "numeric",
    month: "short",
  });
}

export function OurSpace() {
  const { t, locale } = useT();
  const deviceToken = useDeviceToken();
  const ready = deviceToken !== undefined;
  const isOnline = useRealTimePresence();

  const couple = useQuery(
    api.couples.mine,
    ready ? { deviceToken } : "skip",
  );
  const profile = useQuery(
    api.profiles.me,
    ready ? { deviceToken } : "skip",
  );
  const history = useQuery(
    api.history.byDevice,
    ready ? { deviceToken } : "skip",
  );
  const favorites = useQuery(
    api.favorites.list,
    ready ? { deviceToken } : "skip",
  );

  const loading =
    !ready ||
    couple === undefined ||
    history === undefined ||
    favorites === undefined;

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="skel h-32 rounded-xl border border-ivory-200/70"
          />
        ))}
      </div>
    );
  }

  const mePhoto = couple?.me.photo ?? null;
  const partnerPhoto = couple?.partner.photo ?? null;
  const partnerName = couple?.partner.name ?? null;

  function Avatar({ photo, name, size = "md" }: { photo?: string | null; name: string; size?: "sm" | "md" | "lg" }) {
    const sizeClasses = size === "sm" ? "size-8" : size === "md" ? "size-12" : "size-16";
    const textSizes = size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base";
    
    if (photo) {
      return (
        <div className={`${sizeClasses} rounded-full overflow-hidden ring-2 ring-white/20 transition-transform hover:scale-110`}>
          <img src={photo} alt={name} className="size-full object-cover" />
        </div>
      );
    }
    return (
      <div className={`${sizeClasses} rounded-full flex items-center justify-center bg-gradient-to-br from-coral-400 to-coral-600 text-white font-medium ${textSizes} ring-2 ring-white/20 transition-transform hover:scale-110`}>
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Le couple ------------------------------------------------- */}
      {couple ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CoupleCard
            couple={couple}
            profile={profile ?? undefined}
            history={history}
          />
        </motion.div>
      ) : (
        <Card tone="lavender" className="flex flex-col items-center gap-3 p-7 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.08] text-lavender-700 ring-1 ring-inset ring-white/[0.10]">
            <Users className="size-6" />
          </div>
          <h2 className="text-lg">{t("space.coupleTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("space.coupleBody")}
          </p>
          <Link href="/explorer" className="text-sm text-primary hover:underline">
            {t("space.chooseExperience")}
          </Link>
        </Card>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <ContextualSuggestions />
      </motion.div>

      <div className="flex flex-col gap-6 sm:gap-8 lg:grid lg:grid-cols-2">
        <div className="flex min-w-0 flex-1 flex-col gap-6 sm:gap-8">
      {/* Rappels doux ---------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <NotificationsSection id="relances" />
      </motion.div>

      {/* Défi du jour ---------------------------------------------- */}
      <motion.section
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <SectionTitle
          eyebrow={t("space.dailyEyebrow")}
          title={t("space.dailyTitle")}
        />
        <DailyChallengeCard />
      </motion.section>

      {/* Favoris --------------------------------------------------- */}
      <motion.section
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <SectionTitle
          eyebrow={t("space.favoritesEyebrow")}
          title={t("space.favoritesTitle")}
          action={
            favorites && favorites.length > 0 ? (
              <Pill tone="neutral">{favorites.length}</Pill>
            ) : undefined
          }
        />

        {favorites && favorites.length === 0 ? (
          <EmptyState
            icon={<Star className="size-5" />}
            title={t("space.noFavorites")}
            body={t("space.noFavoritesBody")}
            actionLabel={t("space.exploreUniverses")}
            actionHref="/explorer"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {favorites?.map((item, index) => (
              <motion.div
                key={item.favoriteId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.15 + index * 0.05 }}
              >
                <Card
                  className="flex items-center gap-3 p-4"
                >
                  <EmojiTile tone="coral" size="sm">
                    {item.category?.emoji ?? "💞"}
                  </EmojiTile>
                  <div className="min-w-0 flex-1">
                    <p className="eyebrow truncate">
                      {item.category?.title ?? t("space.favoriteFallback")}
                    </p>
                    <p className="truncate font-medium">
                      {item.experience.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.experience.estimatedMinutes} min ·{" "}
                      {item.experience.modes
                        .map((mode) => modeTitle(mode, locale))
                        .join(", ")}
                    </p>
                  </div>
                  <FavoriteButton experienceId={item.experience._id} />
                  <Link
                    href={`/nouvelle/${item.experience.slug}`}
                    className="press gradient-primary top-light inline-flex h-10 shrink-0 items-center rounded-full px-4 text-[13px] font-medium text-white shadow-[var(--shadow-glow)] hover:brightness-[1.06]"
                  >
                    {t("space.launch")}
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-6 sm:gap-8">
      {/* Historique ------------------------------------------------ */}
      <motion.section
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SectionTitle
          eyebrow={t("space.historyEyebrow")}
          title={t("space.historyTitle")}
        />

        {history && history.items.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="size-5" />}
            title={t("space.noGames")}
            body={t("space.noGamesBody")}
            actionLabel={t("action.createGame")}
            actionHref="/explorer"
          />
        ) : (
          <div className="flex flex-col gap-2">
            {history?.items.slice(0, 8).map((item, index) => (
              <motion.div
                key={item.sessionId}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <Card key={item.sessionId} className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {item.experience?.title ?? t("activity.untitled")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {shortDate(item.createdAt, locale)} ·{" "}
                      {modeTitle(item.mode, locale)}
                      {item.partnerName
                        ? ` · ${t("activity.withName", {
                            name: item.partnerName,
                          })}`
                        : ""}
                    </p>
                  </div>
                  <Pill
                    tone={
                      item.status === "terminee"
                        ? "primary"
                        : item.resumable
                          ? "lavender"
                          : "neutral"
                    }
                    className="shrink-0"
                  >
                    {item.status === "terminee"
                      ? t("status.finished")
                      : item.expired
                        ? t("status.expired")
                        : t("status.ongoing")}
                  </Pill>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    {t("space.answered", {
                      mine: item.progress.mine,
                      total: item.progress.total,
                      revealed: item.progress.revealed,
                    })}
                  </span>
                  {item.resumable && (
                    <Link
                      href={`/partie/${item.token}`}
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
                    >
                      {t("activity.resume")}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  )}
                </div>
              </Card>
              </motion.div>
            ))}

            {history && history.items.length > 8 && (
              <p className="text-center text-xs text-muted-foreground">
                {t("space.older", { count: history.items.length - 8 })}
              </p>
            )}
          </div>
        )}
      </motion.section>

      {/* Journal du couple ----------------------------------------- */}
      <Journal />

      {/* Calendrier des moments ------------------------------------ */}
      <Calendar />

      {/* Parcours guidés ------------------------------------------- */}
      <motion.section
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SectionTitle
          eyebrow={t("space.journeysEyebrow")}
          title={t("space.journeysTitle")}
        />
        <JourneyTracker />
      </motion.section>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body,
  actionLabel,
  actionHref,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <Card tone="ivory" className="flex flex-col items-center gap-2 p-6 text-center">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-white/[0.08] text-lavender-700 ring-1 ring-inset ring-white/[0.10]">
        {icon}
      </div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{body}</p>
      <Link href={actionHref} className="text-sm text-primary hover:underline">
        {actionLabel}
      </Link>
    </Card>
  );
}
