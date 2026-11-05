"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  ArrowRight,
  Check,
  Clock,
  Heart,
  Lock,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/surface";
import { useDeviceToken } from "@/lib/game/use-device";
import {
  DEPTH_LABEL,
  DURATION_FILTERS,
  EMPTY_MOMENT,
  FORMATS,
  MOMENT_FILTERS,
  CONTEXT_FILTERS,
  formatRoute,
  formatTitle,
  matchesMoment,
  modalityLabel,
  momentIsActive,
  moodsFor,
  visualFor,
  type ContextSlug,
  type FormatSlug,
  type MoodFilterSlug,
  type MomentState,
} from "@/lib/formats";
import {
  adultUnlocked,
  maxDepthFor,
  saveConsent,
  useConsent,
} from "@/lib/consent";
import { cn } from "@/lib/utils";
import { ExperienceArtwork } from "@/components/formats/experience-artwork";

type CatalogueData = FunctionReturnType<typeof api.formats.catalogue>;
type ExperienceItem = CatalogueData["items"][number];
type PathItem = CatalogueData["paths"][number];
type AnyItem = ExperienceItem | PathItem;

const DEPTH_RANK = { leger: 1, moyen: 2, profond: 3 } as const;

function itemTitle(item: AnyItem) {
  return item.title;
}

function itemAmbiance(item: AnyItem) {
  return "ambiance" in item && item.ambiance
    ? item.ambiance
    : item.category.tagline;
}

function itemSteps(item: AnyItem, format: FormatSlug) {
  if (format === "parcours") return `${item.stepCount} étapes`;
  return `${item.stepCount} question${item.stepCount > 1 ? "s" : ""}`;
}

/* ------------------------------------------------------------------ */
/* Filtres                                                             */
/* ------------------------------------------------------------------ */

function FilterChip({
  active,
  onClick,
  children,
  adult,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  adult?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "press inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? adult
            ? "border-coral-300 bg-coral-100 text-coral-700 shadow-[var(--shadow-glow)]"
            : "border-lavender-300 bg-lavender-100 text-lavender-700 shadow-[var(--shadow-soft)]"
          : "border-ivory-200 bg-card/70 text-graphite-500 hover:border-lavender-300 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Carte expérience / parcours                                         */
/* ------------------------------------------------------------------ */

function ExperienceCard({
  item,
  format,
  favorite,
  locked,
  onToggleFavorite,
  onDetails,
  onUnlock,
}: {
  item: AnyItem;
  format: FormatSlug;
  favorite: boolean;
  locked: boolean;
  onToggleFavorite: () => void;
  onDetails: () => void;
  onUnlock: () => void;
}) {
  const visual = visualFor(item);
  const href = formatRoute(format, item.slug);
  const moods = moodsFor(item);

  return (
    <Card
      tone={locked ? "lavender" : "default"}
      interactive={false}
      className="flex h-full flex-col gap-3 p-4"
    >
      <div className="relative">
        <ExperienceArtwork
          emoji={visual.emoji}
          className={visual.className}
          adult={item.adult}
          formatLabel={formatTitle(format)}
          size="md"
        />
        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-graphite-900/80 p-3 text-center backdrop-blur-[2px]">
            <Lock className="size-5 text-coral-300" />
            <p className="text-xs font-medium text-white">
              Contenu réservé aux adultes
            </p>
            <button
              type="button"
              onClick={onUnlock}
              className="press rounded-full border border-coral-300/40 bg-coral-500/20 px-3 py-1 text-[11px] font-medium text-coral-100 hover:bg-coral-500/30"
            >
              J&apos;ai 18 ans ou plus
            </button>
          </div>
        )}
        {!item.available && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-graphite-900/75 p-3 text-center backdrop-blur-[2px]">
            <p className="text-xs font-medium text-graphite-200">
              Bientôt disponible
            </p>
          </div>
        )}
        {item.kind === "experience" && (
          <button
            type="button"
            aria-pressed={favorite}
            aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            onClick={onToggleFavorite}
            className={cn(
              "press absolute right-2.5 top-2.5 inline-flex size-8 items-center justify-center rounded-full border border-white/10 bg-graphite-900/70 text-white backdrop-blur transition-colors hover:border-coral-300",
              favorite && "border-coral-300/50 bg-coral-500/30 text-coral-100",
            )}
          >
            <Star className={cn("size-4", favorite && "fill-current")} />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg leading-tight">{itemTitle(item)}</h3>
          {item.adult && (
            <Pill tone="primary" className="shrink-0">
              18+
            </Pill>
          )}
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {locked ? "Confirmez votre âge pour découvrir cette expérience." : item.benefit}
        </p>

        <p className="text-xs font-medium text-graphite-400">
          {item.estimatedMinutes} min · {item.players} joueurs ·{" "}
          {formatTitle(format)}
        </p>

        <div className="flex flex-wrap gap-1.5">
          <Pill tone="lavender">{itemAmbiance(item)}</Pill>
          <Pill tone="neutral">{DEPTH_LABEL[item.depth] ?? item.depth}</Pill>
          {moods.slice(0, 2).map((mood) => (
            <Pill key={mood} tone="neutral">
              {MOMENT_FILTERS.find((entry) => entry.slug === mood)?.label ?? mood}
            </Pill>
          ))}
        </div>

        <p className="text-[11px] text-graphite-500">
          {itemSteps(item, format)} ·{" "}
          {item.modes.map((mode) => modalityLabel(mode)).join(" ou ")}
        </p>
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-ivory-200/70 pt-3">
        <button
          type="button"
          onClick={onDetails}
          className="press inline-flex min-h-10 flex-1 items-center justify-center rounded-full border border-ivory-300 bg-card/80 px-3 text-xs font-medium text-foreground hover:border-lavender-300"
        >
          Voir les détails
        </button>
        {item.available && !locked ? (
          <Link
            href={href}
            className="press inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full gradient-primary px-3 text-xs font-medium text-white shadow-[var(--shadow-glow)] hover:brightness-[1.06]"
          >
            Commencer
            <ArrowRight className="size-3.5" />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full border border-ivory-200 px-3 text-xs font-medium text-graphite-500 opacity-60"
          >
            {locked ? "18+" : "Bientôt"}
          </button>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Détails                                                             */
/* ------------------------------------------------------------------ */

function DetailsDialog({
  item,
  format,
  locked,
  favorite,
  onClose,
  onToggleFavorite,
  onUnlock,
}: {
  item: AnyItem;
  format: FormatSlug;
  locked: boolean;
  favorite: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
  onUnlock: () => void;
}) {
  const visual = visualFor(item);
  const href = formatRoute(format, item.slug);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-graphite-900/80 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-title"
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-ivory-200/80 bg-card p-5 shadow-[var(--shadow-lift)] sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow mb-1">{item.category.title}</p>
            <h2 id="details-title" className="text-2xl leading-tight">
              {item.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer les détails"
            className="press inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-ivory-200 bg-card text-graphite-500 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4">
          <ExperienceArtwork
            emoji={visual.emoji}
            className={visual.className}
            adult={item.adult}
            formatLabel={formatTitle(format)}
            size="lg"
          />
        </div>

        {locked ? (
          <div className="mt-4 rounded-xl border border-coral-200/50 bg-coral-100/40 p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Lock className="size-4 text-coral-300" />
              Contenu réservé aux adultes
            </p>
            <p className="mt-1 text-sm leading-relaxed text-graphite-600">
              Cette expérience parle de sensualité et d&apos;intimité. Elle
              reste masquée tant que vous n&apos;avez pas confirmé votre âge et
              donné votre consentement.
            </p>
            <Button type="button" size="sm" className="mt-3" onClick={onUnlock}>
              J&apos;ai 18 ans ou plus
            </Button>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm leading-relaxed text-graphite-300">
              {item.description}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl border border-ivory-200/70 bg-ivory-100/60 p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-graphite-500">
                  Durée
                </p>
                <p className="mt-0.5 font-medium">{item.estimatedMinutes} min</p>
              </div>
              <div className="rounded-xl border border-ivory-200/70 bg-ivory-100/60 p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-graphite-500">
                  Joueurs
                </p>
                <p className="mt-0.5 font-medium">2 joueurs</p>
              </div>
              <div className="rounded-xl border border-ivory-200/70 bg-ivory-100/60 p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-graphite-500">
                  Format
                </p>
                <p className="mt-0.5 font-medium">{formatTitle(format)}</p>
              </div>
              <div className="rounded-xl border border-ivory-200/70 bg-ivory-100/60 p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-graphite-500">
                  Niveau
                </p>
                <p className="mt-0.5 font-medium">
                  {DEPTH_LABEL[item.depth] ?? item.depth}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <Pill tone="lavender">{itemAmbiance(item)}</Pill>
              <Pill tone="neutral">
                {item.modes.map((mode) => modalityLabel(mode)).join(" ou ")}
              </Pill>
              <Pill tone="neutral">{itemSteps(item, format)}</Pill>
              {item.themes.slice(0, 3).map((theme) => (
                <Pill key={theme} tone="neutral">
                  {theme}
                </Pill>
              ))}
            </div>

            {item.kind === "path" && item.context && (
              <p className="mt-3 rounded-xl border border-lavender-300/25 bg-lavender-100/40 p-3 text-sm leading-relaxed text-graphite-300">
                {item.context}
              </p>
            )}
          </>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {item.available && !locked ? (
            <Link
              href={href}
              className="press inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full gradient-primary text-sm font-medium text-white shadow-[var(--shadow-glow)]"
            >
              Commencer
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <Button type="button" className="flex-1" disabled>
              {locked ? "Autorisation requise" : "Bientôt disponible"}
            </Button>
          )}
          <button
            type="button"
            onClick={onToggleFavorite}
            className={cn(
              "press inline-flex h-12 items-center justify-center gap-2 rounded-full border border-ivory-300 bg-card/90 px-4 text-sm font-medium hover:border-lavender-300",
              favorite && "border-coral-200 bg-coral-100 text-coral-600",
            )}
          >
            <Star className={cn("size-4", favorite && "fill-current")} />
            {favorite ? "Dans mes favoris" : "Favori"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

export function Catalogue({ initialFormat }: { initialFormat?: string | null }) {
  const deviceToken = useDeviceToken();
  const data = useQuery(
    api.formats.catalogue,
    deviceToken ? { deviceToken } : {},
  );
  const toggleFavorite = useMutation(api.favorites.toggle);
  const consent = useConsent();

  const [format, setFormat] = useState<FormatSlug | null>(
    (initialFormat as FormatSlug | null) ?? null,
  );
  const [moment, setMoment] = useState<MomentState>(EMPTY_MOMENT);
  const [details, setDetails] = useState<AnyItem | null>(null);

  const allowedMax = maxDepthFor(consent.depth);
  const depthLimited = consent.updatedAt > 0 && consent.depth !== "oui";
  const adultExplicitStop =
    consent.adult === "non" || consent.adult === "pas-maintenant";
  const adultOk = adultUnlocked(consent);
  const sensuelFilter = moment.mood === "sensuel";

  const source = useMemo<AnyItem[]>(() => {
    if (!data || !format) return [];
    if (format === "parcours") return data.paths;
    return data.items;
  }, [data, format]);

  const { visible, hiddenDepth, hiddenAdult } = useMemo(() => {
    let depth = 0;
    let adult = 0;
    const out: AnyItem[] = [];

    for (const item of source) {
      if (depthLimited && allowedMax) {
        const rank =
          DEPTH_RANK[item.depth as keyof typeof DEPTH_RANK] ??
          item.depthRank ??
          2;
        if (rank > DEPTH_RANK[allowedMax]) {
          depth += 1;
          continue;
        }
      }
      if (item.adult && !adultOk) {
        const explicitRefusal = adultExplicitStop;
        if (explicitRefusal || !sensuelFilter) {
          adult += 1;
          continue;
        }
      }
      if (!matchesMoment(item, moment)) continue;
      out.push(item);
    }

    return { visible: out, hiddenDepth: depth, hiddenAdult: adult };
  }, [
    source,
    depthLimited,
    allowedMax,
    adultOk,
    adultExplicitStop,
    sensuelFilter,
    moment,
  ]);

  function selectFormat(next: FormatSlug) {
    setFormat(next);
    setDetails(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("format", next);
      window.history.replaceState(null, "", url);
    }
  }

  function resetMoment() {
    setMoment(EMPTY_MOMENT);
  }

  function unlockAdult() {
    saveConsent({ ageConfirmed: true, adult: "oui" });
  }

  const formatCount = (slug: FormatSlug) => {
    if (!data) return null;
    return slug === "parcours" ? data.paths.length : data.items.length;
  };

  return (
    <div className="flex flex-col gap-7">
      <section className="pt-1">
        <p className="eyebrow mb-2">Catalogue jouable</p>
        <h1 className="text-[2rem] leading-[1.1]">Explorer</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Choisissez d&apos;abord comment vous voulez jouer, puis le moment que
          vous vivez. Le catalogue s&apos;adapte sans jamais vous imposer un
          contenu.
        </p>
      </section>

      {/* Étape 1 — format */}
      <section className="flex flex-col gap-3" aria-labelledby="format-title">
        <div>
          <p className="eyebrow mb-1">Étape 1</p>
          <h2 id="format-title" className="text-xl leading-tight">
            Comment souhaitez-vous jouer ?
          </h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {FORMATS.map((entry) => {
            const active = format === entry.slug;
            const count = formatCount(entry.slug);
            return (
              <button
                key={entry.slug}
                type="button"
                aria-pressed={active}
                onClick={() => selectFormat(entry.slug)}
                className={cn(
                  "press flex min-h-[78px] items-center gap-3 rounded-2xl border p-3.5 text-left transition-all",
                  active
                    ? "border-lavender-300/60 bg-lavender-100/70 shadow-[var(--shadow-soft)]"
                    : "border-ivory-200 bg-card/70 hover:border-lavender-300/60 hover:bg-card",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl text-2xl",
                    entry.accent === "coral" ? "bg-coral-100" : "bg-lavender-100",
                  )}
                >
                  {entry.emoji}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {entry.title}
                    {active && <Check className="size-3.5 text-lavender-300" />}
                    {count !== null && (
                      <span className="text-[10px] font-normal text-graphite-500">
                        {count} {entry.slug === "parcours" ? "parcours" : "expériences"}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                    {entry.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {!format ? (
        <Card tone="lavender" className="p-5">
          <p className="text-sm font-medium">
            Choisissez un format ci-dessus pour voir les expériences.
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            DuoCards pour une carte à la fois, DuoDice pour laisser le hasard
            proposer une direction, DuoPath pour un parcours complet, DuoReveal
            pour répondre séparément et découvrir ensemble.
          </p>
        </Card>
      ) : (
        <>
          {/* Étape 2 — moment */}
          <section className="flex flex-col gap-4" aria-labelledby="moment-title">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="eyebrow mb-1">Étape 2</p>
                <h2 id="moment-title" className="text-xl leading-tight">
                  Quel moment vivez-vous ?
                </h2>
              </div>
              {momentIsActive(moment) && (
                <button
                  type="button"
                  onClick={resetMoment}
                  className="press inline-flex min-h-9 items-center gap-1.5 rounded-full px-2 text-xs text-muted-foreground underline decoration-ivory-300 underline-offset-4 hover:text-foreground"
                >
                  <X className="size-3.5" />
                  Effacer les filtres
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-16 shrink-0 text-[10px] font-medium uppercase tracking-[0.14em] text-graphite-500">
                  Durée
                </span>
                {DURATION_FILTERS.map((value) => (
                  <FilterChip
                    key={value}
                    active={moment.duration === value}
                    onClick={() =>
                      setMoment((current) => ({
                        ...current,
                        duration: current.duration === value ? null : value,
                      }))
                    }
                  >
                    <Clock className="size-3.5" />
                    {value} min
                  </FilterChip>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="w-16 shrink-0 text-[10px] font-medium uppercase tracking-[0.14em] text-graphite-500">
                  Contexte
                </span>
                {CONTEXT_FILTERS.map((entry) => (
                  <FilterChip
                    key={entry.slug}
                    active={moment.contexts.includes(entry.slug)}
                    onClick={() =>
                      setMoment((current) => ({
                        ...current,
                        contexts: current.contexts.includes(entry.slug)
                          ? current.contexts.filter((item) => item !== entry.slug)
                          : [...current.contexts, entry.slug as ContextSlug],
                      }))
                    }
                  >
                    <span aria-hidden="true">{entry.emoji}</span>
                    {entry.label}
                  </FilterChip>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="w-16 shrink-0 text-[10px] font-medium uppercase tracking-[0.14em] text-graphite-500">
                  Ambiance
                </span>
                {MOMENT_FILTERS.map((entry) => (
                  <FilterChip
                    key={entry.slug}
                    adult={entry.adult}
                    active={moment.mood === entry.slug}
                    onClick={() =>
                      setMoment((current) => ({
                        ...current,
                        mood:
                          current.mood === entry.slug
                            ? null
                            : (entry.slug as MoodFilterSlug),
                      }))
                    }
                  >
                    <span aria-hidden="true">{entry.emoji}</span>
                    {entry.label}
                  </FilterChip>
                ))}
              </div>
            </div>

            {momentIsActive(moment) && (
              <p className="text-xs text-graphite-500">
                Filtre actif :{" "}
                {[
                  moment.duration ? `${moment.duration} min ou moins` : null,
                  ...moment.contexts.map(
                    (value) =>
                      CONTEXT_FILTERS.find((entry) => entry.slug === value)?.label,
                  ),
                  moment.mood
                    ? MOMENT_FILTERS.find((entry) => entry.slug === moment.mood)
                        ?.label
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </section>

          {/* Résultats */}
          <section className="flex flex-col gap-3" aria-live="polite">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="eyebrow mb-1">
                  {formatTitle(format)}
                  {format === "parcours" ? " · 5 à 12 étapes" : " · 2 joueurs"}
                </p>
                <h2 className="text-xl leading-tight">
                  {data === undefined
                    ? "Chargement du catalogue…"
                    : `${visible.length} ${
                        format === "parcours"
                          ? "parcours"
                          : `expérience${visible.length > 1 ? "s" : ""}`
                      }`}
                </h2>
              </div>
              <SlidersHorizontal className="size-4 text-graphite-500" aria-hidden="true" />
            </div>

            {data === undefined && (
              <div className="grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="skel h-[22rem] rounded-2xl border border-ivory-200/70"
                  />
                ))}
              </div>
            )}

            {data && visible.length === 0 && (
              <Card tone="lavender" className="flex flex-col items-center gap-3 p-6 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-lavender-200/40 text-2xl">
                  🫧
                </span>
                <div>
                  <p className="text-sm font-medium">
                    Aucun {format === "parcours" ? "parcours" : "résultat"} ne
                    correspond à ce moment.
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {sensuelFilter && adultExplicitStop
                      ? "Vous avez indiqué ne pas vouloir de contenus sensuels. Nous les masquons, sans jugement. Vous pouvez revoir ce choix quand vous voulez."
                      : hiddenAdult > 0
                        ? "Certaines expériences sont masquées par vos limites. Vous pouvez les revoir ou élargir le moment."
                        : "Essayez une autre durée, un autre contexte ou une autre ambiance. Rien n'est verrouillé."}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={resetMoment}>
                    Effacer les filtres
                  </Button>
                  {sensuelFilter && adultExplicitStop && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => saveConsent({ adult: "peut-etre" })}
                    >
                      Revoir mes limites
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {visible.length > 0 && (
              <div className="grid gap-4 lg:grid-cols-2">
                {visible.map((item) => {
                  const locked = item.adult && !adultOk;
                  const favorite =
                    item.kind === "experience" ? item.favorite : false;
                  return (
                    <ExperienceCard
                      key={`${item.kind}-${item._id}`}
                      item={item}
                      format={format}
                      favorite={favorite}
                      locked={locked}
                      onDetails={() => setDetails(item)}
                      onUnlock={unlockAdult}
                      onToggleFavorite={() => {
                        if (!deviceToken || item.kind !== "experience") return;
                        void toggleFavorite({
                          deviceToken,
                          experienceId: item._id as Id<"experiences">,
                        });
                      }}
                    />
                  );
                })}
              </div>
            )}

            {(hiddenDepth > 0 || hiddenAdult > 0) && visible.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ivory-200/70 bg-card/60 px-3.5 py-2.5 text-xs text-graphite-500">
                <Lock className="size-3.5" />
                {hiddenDepth > 0 && (
                  <span>
                    {hiddenDepth} contenu{hiddenDepth > 1 ? "s" : ""} masqué
                    {hiddenDepth > 1 ? "s" : ""} par vos limites de profondeur.
                  </span>
                )}
                {hiddenAdult > 0 && (
                  <span>
                    {hiddenAdult} contenu{hiddenAdult > 1 ? "s" : ""} 18+ masqué
                    {hiddenAdult > 1 ? "s" : ""} (ambiance Sensuel 18+).
                  </span>
                )}
                {hiddenDepth > 0 && (
                  <button
                    type="button"
                    onClick={() => saveConsent({ depth: "oui" })}
                    className="underline decoration-ivory-300 underline-offset-4 hover:text-foreground"
                  >
                    Élargir la profondeur
                  </button>
                )}
              </div>
            )}

            {!momentIsActive(moment) &&
              format !== "parcours" &&
              data?.unavailable &&
              data.unavailable.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {data.unavailable.map((category) => (
                    <div
                      key={category.slug}
                      className="flex items-center gap-3 rounded-xl border border-dashed border-ivory-300/70 bg-card/40 p-3.5"
                    >
                      <span className="flex size-10 items-center justify-center rounded-xl bg-ivory-100 text-xl">
                        {category.emoji}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{category.title}</p>
                        <p className="text-xs text-graphite-500">
                          Bientôt · {category.tagline}
                        </p>
                      </div>
                      <Pill tone="neutral" className="ml-auto shrink-0">
                        Indisponible
                      </Pill>
                    </div>
                  ))}
                </div>
              )}
          </section>
        </>
      )}

      {details && (
        <DetailsDialog
          item={details}
          format={format ?? "cartes"}
          locked={Boolean(details.adult && !adultOk)}
          favorite={details.kind === "experience" ? details.favorite : false}
          onClose={() => setDetails(null)}
          onUnlock={unlockAdult}
          onToggleFavorite={() => {
            if (!deviceToken || details.kind !== "experience") return;
            void toggleFavorite({
              deviceToken,
              experienceId: details._id as Id<"experiences">,
            });
          }}
        />
      )}

      <p className="flex items-center justify-center gap-2 text-center text-xs text-graphite-500">
        <Heart className="size-3.5" aria-hidden="true" />
        Tous les contenus peuvent être passés. Un refus n&apos;est jamais un
        échec.
      </p>
    </div>
  );
}
