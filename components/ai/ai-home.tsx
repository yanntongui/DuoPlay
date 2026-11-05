"use client";

import { useState } from "react";
import {
  ArrowRight,
  Clock,
  Heart,
  History,
  MessageCircleHeart,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiBrief } from "@/convex/ai/content";
import {
  DURATIONS,
  LEVELS,
  MOODS,
  LEVEL_LABELS,
  MOOD_LABELS,
} from "@/convex/ai/content";
import type {
  AiOverview,
  AiRecommendation,
  AiSessionSummary,
} from "@/components/ai/types";
import {
  AiBadge,
  AiButton,
  AiCard,
  AiChip,
  AiEmpty,
  AiMeter,
  AiNotice,
  AiSectionTitle,
} from "@/components/ai/ai-ui";

const SUGGESTIONS: {
  label: string;
  action: "compose" | "search" | "communication";
  preset?: Partial<AiBrief>;
  query?: string;
}[] = [
  {
    label: "Créer une session de 15 minutes",
    action: "compose",
    preset: { durationMinutes: 15 },
  },
  {
    label: "Trouver une idée à distance",
    action: "search",
    query: "Trouve une expérience romantique de 15 minutes à distance.",
  },
  {
    label: "Nous aider à formuler une envie",
    action: "communication",
  },
  {
    label: "Proposer un parcours doux",
    action: "search",
    query: "Propose quelque chose de doux pour commencer, avec beaucoup de discussion.",
  },
  {
    label: "Créer une soirée romantique",
    action: "compose",
    preset: { mood: "romantique", durationMinutes: 30 },
  },
  {
    label: "Trouver une expérience sans photo",
    action: "search",
    query: "Trouve une expérience sans photo, pour une soirée à la maison.",
  },
];

const EXCLUSIONS: { value: string; label: string }[] = [
  { value: "photo", label: "Sans photo" },
  { value: "video", label: "Sans vidéo" },
  { value: "contact", label: "Sans contact" },
  { value: "audacieux", label: "Sans audace" },
  { value: "musique", label: "Sans musique" },
];

export function AiHome({
  overview,
  recommendations,
  onCompose,
  onSearch,
  onCommunication,
  onOpenSession,
  onDeleteSession,
  onClearHistory,
  onToggleConsent,
  onDismissRecommendation,
  onRestoreRecommendations,
}: {
  overview: AiOverview;
  recommendations: AiRecommendation[];
  onCompose: (preset?: Partial<AiBrief>) => void;
  onSearch: (query: string) => void;
  onCommunication: () => void;
  onOpenSession: (id: AiSessionSummary["id"]) => void;
  onDeleteSession: (id: AiSessionSummary["id"]) => void;
  onClearHistory: () => void;
  onToggleConsent: (granted: boolean) => void;
  onDismissRecommendation: (kind: "theme" | "experience", value: string) => void;
  onRestoreRecommendations: () => void;
}) {
  const [query, setQuery] = useState("");
  const [duration, setDuration] = useState<number>(15);
  const [mood, setMood] = useState<AiBrief["mood"]>("tendre");
  const [level, setLevel] = useState<AiBrief["level"]>("moyen");
  const [mode, setMode] = useState<AiBrief["mode"]>("ensemble");
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const granted = overview.consent.granted;
  const available = overview.availability;

  function toggleExclusion(value: string) {
    setExclusions((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function submitFree() {
    const value = query.trim();
    if (!value) return;
    onSearch(value);
  }

  return (
    <div className="flex flex-col gap-7 pb-16">
      <section className="ai-rise">
        <div className="flex flex-wrap items-center gap-2">
          <AiBadge />
          <span className="rounded-full border border-[#d9a7c9]/20 px-2.5 py-1 text-[11px] text-[#d9cbbf]/75">
            {overview.version}
          </span>
          {!available ? (
            <span className="rounded-full border border-[#e2b887]/30 px-2.5 py-1 text-[11px] text-[#efd9bd]">
              En pause
            </span>
          ) : null}
        </div>
        <h1 className="mt-3 font-display text-[2.4rem] leading-[1.05] text-[#f6efe7] sm:text-[2.9rem]">
          Votre moment à deux
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#d9cbbf]/80">
          Dites-nous où vous en êtes. DuoPlay AI vous propose une session, des
          idées ou une formulation — vous décidez toujours. Rien n’est imposé,
          et chaque étape peut être passée.
        </p>
        <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-[#d9cbbf]/55">
          Une IA ne remplace pas le consentement, un professionnel de santé ou
          un thérapeute. DuoPlay AI ne pose aucun diagnostic.
        </p>
      </section>

      {!granted ? (
        <AiCard className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-xl text-[#f6efe7]">
                Activer DuoPlay AI
              </p>
              <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-[#d9cbbf]/75">
                Votre accord est nécessaire pour générer une session ou
                reformuler un message. Il est révocable en un tap, à tout
                moment. Aucune réponse intime n’est envoyée à un modèle.
              </p>
            </div>
            <AiButton
              variant="primary"
              onClick={() => onToggleConsent(true)}
              className="shrink-0"
            >
              <Sparkles className="size-4" />
              J’active DuoPlay AI
            </AiButton>
          </div>
        </AiCard>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <AiMeter used={overview.quota.used} limit={overview.quota.limit} />
            <button
              type="button"
              onClick={() => onToggleConsent(false)}
              className="text-[12px] text-[#d9cbbf]/60 underline-offset-4 hover:text-[#f6efe7] hover:underline"
            >
              Désactiver DuoPlay AI
            </button>
          </div>
          {!available ? (
            <AiNotice tone="quota" title="DuoPlay AI est momentanément en pause">
              Le catalogue et toutes les expériences restent disponibles. Vous
              pouvez réessayer plus tard.
            </AiNotice>
          ) : null}
        </div>
      )}

      <AiCard className="p-5 sm:p-6">
        <label
          htmlFor="ai-free-request"
          className="font-display text-xl text-[#f6efe7]"
        >
          Que voulez-vous vivre ce soir ?
        </label>
        <p className="mt-1 text-[13px] text-[#d9cbbf]/70">
          Une phrase suffit. La recherche ne contourne jamais vos limites
          enregistrées.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            id="ai-free-request"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submitFree();
            }}
            placeholder="Ex. : une expérience douce de 10 minutes, à distance, sans photo"
            className="ai-input"
            maxLength={300}
          />
          <AiButton
            variant="primary"
            onClick={submitFree}
            disabled={!granted || !query.trim()}
            className="shrink-0 sm:px-6"
          >
            <Search className="size-4" />
            Chercher
          </AiButton>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d9a7c9]/70">
            Suggestions
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <AiChip
                key={suggestion.label}
                onClick={() => {
                  if (suggestion.action === "compose") {
                    onCompose({
                      durationMinutes: duration,
                      ...suggestion.preset,
                    });
                  } else if (suggestion.action === "search") {
                    onSearch(suggestion.query ?? suggestion.label);
                  } else {
                    onCommunication();
                  }
                }}
                disabled={!granted}
              >
                {suggestion.label}
              </AiChip>
            ))}
          </div>
        </div>
      </AiCard>

      <section>
        <AiSectionTitle
          eyebrow="Composer"
          title="Créer une session sur mesure"
          action={
            <span className="text-[11px] text-[#d9cbbf]/55">
              Aucune étape obligatoire
            </span>
          }
        />
        <AiCard className="p-5 sm:p-6">
          <div className="grid gap-5">
            <div>
              <p className="mb-2 text-[12px] font-medium text-[#d9cbbf]/80">
                Durée
              </p>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map((value) => (
                  <AiChip
                    key={value}
                    active={duration === value}
                    onClick={() => setDuration(value)}
                  >
                    <Clock className="size-3.5" />
                    {value} min
                  </AiChip>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[12px] font-medium text-[#d9cbbf]/80">
                Humeur
              </p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((entry) => (
                  <AiChip
                    key={entry.value}
                    active={mood === entry.value}
                    onClick={() => setMood(entry.value)}
                  >
                    {entry.label}
                  </AiChip>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[12px] font-medium text-[#d9cbbf]/80">
                Niveau
              </p>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map((entry) => (
                  <AiChip
                    key={entry.value}
                    active={level === entry.value}
                    onClick={() => setLevel(entry.value)}
                  >
                    {entry.label}
                  </AiChip>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[12px] font-medium text-[#d9cbbf]/80">
                Contexte
              </p>
              <div className="flex flex-wrap gap-2">
                <AiChip active={mode === "ensemble"} onClick={() => setMode("ensemble")}>
                  <Heart className="size-3.5" />
                  Au même endroit
                </AiChip>
                <AiChip
                  active={mode === "a-distance"}
                  onClick={() => setMode("a-distance")}
                >
                  À distance
                </AiChip>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[12px] font-medium text-[#d9cbbf]/80">
                À exclure
              </p>
              <div className="flex flex-wrap gap-2">
                {EXCLUSIONS.map((entry) => (
                  <AiChip
                    key={entry.value}
                    active={exclusions.includes(entry.value)}
                    onClick={() => toggleExclusion(entry.value)}
                  >
                    {entry.label}
                  </AiChip>
                ))}
              </div>
            </div>
          </div>

          <div className="ai-rule my-5" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] leading-relaxed text-[#d9cbbf]/60">
              {MOOD_LABELS[mood]} · {LEVEL_LABELS[level]} · {mode === "a-distance" ? "À distance" : "Au même endroit"} ·{" "}
              {duration} min
              {exclusions.length > 0
                ? ` · ${exclusions.length} exclusion${exclusions.length > 1 ? "s" : ""}`
                : ""}
            </p>
            <AiButton
              variant="primary"
              disabled={!granted || !available}
              onClick={() => onCompose({ mood, level, mode, durationMinutes: duration, exclusions })}
            >
              Continuer
              <ArrowRight className="size-4" />
            </AiButton>
          </div>
        </AiCard>
      </section>

      <section>
        <AiSectionTitle
          eyebrow="Pour vous"
          title="Recommandations expliquées"
          action={
            overview.dismissals.length > 0 ? (
              <button
                type="button"
                onClick={onRestoreRecommendations}
                className="text-[12px] text-[#d9cbbf]/60 hover:text-[#f6efe7]"
              >
                Réactiver
              </button>
            ) : null
          }
        />
        {recommendations.length === 0 ? (
          <AiEmpty
            icon={<Heart className="size-6" />}
            title="Pas de recommandation pour l’instant"
          >
            Explorez quelques expériences, ou créez une session : les
            propositions s’appuieront sur vos préférences, jamais sur vos
            réponses intimes.
          </AiEmpty>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {recommendations.map((item) => (
              <AiCard key={item.slug} className="flex flex-col p-4" soft>
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-lg">
                    {item.emoji}
                  </span>
                  <span className="text-[11px] text-[#d9cbbf]/55">
                    {item.category} · {item.durationMinutes} min
                  </span>
                </div>
                <p className="mt-2 font-display text-lg leading-tight text-[#f6efe7]">
                  {item.title}
                </p>
                <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[#d9cbbf]/65">
                  {item.description}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {item.reasons.map((reason: string) => (
                    <li
                      key={reason}
                      className="flex gap-1.5 text-[11.5px] leading-snug text-[#e8d6e2]/80"
                    >
                      <Sparkles className="mt-0.5 size-3 shrink-0 text-[#d9a7c9]" />
                      {reason}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      onCompose({
                        mood: item.mood,
                        durationMinutes: item.durationMinutes,
                        level: item.depth as AiBrief["level"],
                      })
                    }
                    className="text-[12px] font-medium text-[#f6efe7] underline-offset-4 hover:underline"
                  >
                    Créer cette session
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onDismissRecommendation(
                        "theme",
                        item.themes[0] ?? item.slug,
                      )
                    }
                    className="text-[10.5px] leading-tight text-[#d9cbbf]/45 hover:text-[#d9cbbf]/80"
                  >
                    Ne plus me recommander ce type de contenu
                  </button>
                </div>
              </AiCard>
            ))}
          </div>
        )}
      </section>

      <section>
        <AiSectionTitle
          eyebrow="Historique"
          title="Vos sessions IA"
          action={
            overview.sessions.length > 0 ? (
              <button
                type="button"
                onClick={() => setHistoryOpen((value) => !value)}
                className="inline-flex items-center gap-1.5 text-[12px] text-[#d9cbbf]/65 hover:text-[#f6efe7]"
              >
                <History className="size-3.5" />
                {historyOpen ? "Réduire" : "Tout voir"}
              </button>
            ) : null
          }
        />
        {overview.sessions.length === 0 ? (
          <AiEmpty
            icon={<History className="size-6" />}
            title="Aucune session enregistrée"
          >
            Vos sessions apparaîtront ici. Vous pourrez les supprimer une par
            une, ou tout effacer en un tap.
          </AiEmpty>
        ) : (
          <>
            <ul className="grid gap-2">
              {(historyOpen ? overview.sessions : overview.sessions.slice(0, 3)).map(
                (session: any) => (
                  <li key={session.id}>
                    <div className="ai-surface-soft flex items-center gap-3 p-3.5">
                      <button
                        type="button"
                        onClick={() => onOpenSession(session.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-sm font-medium text-[#f6efe7]">
                          {session.title}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-[#d9cbbf]/55">
                          {new Date(session.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          · {session.durationMinutes} min ·{" "}
                          {MOOD_LABELS[session.mood as AiBrief["mood"]] ?? session.mood} ·{" "}
                          {session.status === "completed"
                            ? "terminée"
                            : session.status === "active"
                              ? "en cours"
                              : session.status === "paused"
                                ? "en pause"
                                : "à découvrir"}
                        </p>
                      </button>
                      <button
                        type="button"
                        aria-label={`Supprimer ${session.title}`}
                        onClick={() => onDeleteSession(session.id)}
                        className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#d9cbbf]/55 hover:bg-white/5 hover:text-[#f0b6c9]"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </li>
                ),
              )}
            </ul>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[11px] text-[#d9cbbf]/45">
                Conservation : 30 jours. Suppression immédiate sur demande.
              </p>
              {confirmClear ? (
                <span className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      onClearHistory();
                      setConfirmClear(false);
                    }}
                    className="text-[#f0b6c9] underline-offset-4 hover:underline"
                  >
                    Confirmer
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="text-[#d9cbbf]/60 hover:text-[#f6efe7]"
                  >
                    Annuler
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex items-center gap-1.5 text-[11px] text-[#d9cbbf]/55 hover:text-[#f0b6c9]"
                >
                  <Trash2 className="size-3" />
                  Tout effacer
                </button>
              )}
            </div>
          </>
        )}
      </section>

      <section className="ai-surface-soft p-5">
        <div className="flex items-start gap-3">
          <MessageCircleHeart className="mt-0.5 size-5 shrink-0 text-[#d9a7c9]" />
          <div>
            <p className="font-display text-lg text-[#f6efe7]">
              Besoin d’aider à formuler ?
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#d9cbbf]/70">
              Une envie, une limite, un besoin d’attention : DuoPlay AI propose
              une formulation douce, sans reproche et sans prendre parti.
            </p>
            <AiButton
              variant="soft"
              className="mt-3"
              onClick={onCommunication}
              disabled={!granted}
            >
              Ouvrir l’assistant
              <ArrowRight className="size-4" />
            </AiButton>
          </div>
        </div>
      </section>

      <p className={cn("text-center text-[11px] text-[#d9cbbf]/40")}>
        DuoPlay AI propose, vous décidez. Chaque partenaire peut dire non,
        modifier une étape ou arrêter la session.
      </p>
    </div>
  );
}
