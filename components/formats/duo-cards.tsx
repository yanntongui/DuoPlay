"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Heart,
  Pencil,
  RefreshCw,
  Repeat2,
  Sparkles,
  Star,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/surface";
import { useDeviceToken } from "@/lib/game/use-device";
import { DEPTH_LABEL, modalityLabel } from "@/lib/formats";
import { cn } from "@/lib/utils";
import { ExperienceArtwork } from "./experience-artwork";
import {
  EndOverlay,
  PauseOverlay,
  SessionFooter,
  SessionHeader,
} from "./session-chrome";
import { SessionConsent } from "./session-consent";

/* ------------------------------------------------------------------ */
/* Construction du jeu de cartes                                       */
/* ------------------------------------------------------------------ */

export type CardCategory =
  | "Connexion"
  | "Éclat de rire"
  | "Souvenir"
  | "Discussion"
  | "Compliment"
  | "Défi réel"
  | "Surprise"
  | "Envie à discuter"
  | "Joker"
  | "Pause";

const CATEGORY_META: Record<
  CardCategory,
  { emoji: string; tone: "coral" | "lavender" | "neutral" }
> = {
  Connexion: { emoji: "🤍", tone: "lavender" },
  "Éclat de rire": { emoji: "😄", tone: "coral" },
  Souvenir: { emoji: "📷", tone: "lavender" },
  Discussion: { emoji: "💬", tone: "neutral" },
  Compliment: { emoji: "💗", tone: "coral" },
  "Défi réel": { emoji: "🌿", tone: "neutral" },
  Surprise: { emoji: "✨", tone: "lavender" },
  "Envie à discuter": { emoji: "🔥", tone: "coral" },
  Joker: { emoji: "🃏", tone: "neutral" },
  Pause: { emoji: "☕", tone: "neutral" },
};

type Question = {
  _id: string;
  kind: "choice" | "open" | "challenge";
  prompt: string;
  options: string[] | null;
  depth: "leger" | "moyen" | "profond";
  themes: string[];
  order: number;
};

type DeckCard = {
  id: string;
  category: CardCategory;
  depth: "leger" | "moyen" | "profond";
  prompt: string;
  reveal: string;
  options: string[] | null;
  kind: "choice" | "open" | "challenge" | "action";
  durationMinutes: number;
};

const ROTATION: CardCategory[] = [
  "Connexion",
  "Discussion",
  "Surprise",
  "Compliment",
  "Discussion",
  "Connexion",
];

function categoryFor(question: Question, index: number): CardCategory {
  if (question.kind === "challenge") return "Défi réel";
  const themes = question.themes.map((theme) => theme.toLowerCase());
  if (themes.some((theme) => theme.includes("humour"))) return "Éclat de rire";
  if (themes.some((theme) => theme.includes("souvenir"))) return "Souvenir";
  if (
    themes.some(
      (theme) => theme.includes("tendresse") || theme.includes("affection"),
    )
  ) {
    return "Compliment";
  }
  if (themes.some((theme) => theme.includes("séduction"))) {
    return "Envie à discuter";
  }
  if (
    themes.some(
      (theme) =>
        theme.includes("relation") ||
        theme.includes("préférences") ||
        theme.includes("écoute"),
    )
  ) {
    return "Discussion";
  }
  return ROTATION[index % ROTATION.length];
}

function revealFor(category: CardCategory, question: Question): string {
  if (question.kind === "choice") {
    return "Chacun choisit en secret, puis vous comparez vos réponses sans vous juger.";
  }
  if (question.kind === "challenge") {
    return "Faites-le maintenant, à la hauteur de votre énergie. Vous pouvez adapter le défi.";
  }
  if (category === "Souvenir") {
    return "Prenez trente secondes chacun pour retrouver une image précise, puis partagez-la.";
  }
  if (category === "Compliment") {
    return "Dites-le à voix haute, en regardant l'autre. Un compliment sincère, pas une performance.";
  }
  if (category === "Envie à discuter") {
    return "Parlez-en comme d'une envie, pas d'une attente. L'autre peut dire oui, non, ou peut-être.";
  }
  return "Prenez trente secondes chacun, puis partagez une phrase. L'écoute compte plus que la réponse.";
}

function buildDeck(questions: Question[]): DeckCard[] {
  const content: DeckCard[] = questions.map((question, index) => {
    const category = categoryFor(question, index);
    return {
      id: question._id,
      category,
      depth: question.depth,
      prompt: question.prompt,
      reveal: revealFor(category, question),
      options: question.options,
      kind: question.kind,
      durationMinutes: 2,
    };
  });

  if (content.length === 0) return [];

  const withActions: DeckCard[] = [];
  content.forEach((card, index) => {
    withActions.push(card);
    if ((index + 1) % 4 === 0 && index < content.length - 1) {
      withActions.push({
        id: `joker-${index}`,
        category: index % 8 === 3 ? "Pause" : "Joker",
        depth: card.depth,
        prompt:
          index % 8 === 3
            ? "Pause. Respirez, regardez-vous, puis reprenez quand vous voulez."
            : "Joker : inventez une carte à votre façon, ou choisissez une carte déjà passée.",
        reveal:
          "Le joker ne s'explique pas. Il sert à alléger, à rire, ou à changer de rythme.",
        options: null,
        kind: "action",
        durationMinutes: 1,
      });
    }
  });

  return withActions.slice(0, 24);
}

/* ------------------------------------------------------------------ */
/* Écran                                                               */
/* ------------------------------------------------------------------ */

export function DuoCards({
  slug,
  mood,
}: {
  slug: string;
  mood?: string | null;
}) {
  const data = useQuery(api.formats.content, { slug });
  const deviceToken = useDeviceToken();
  const favorites = useQuery(
    api.favorites.idsForDevice,
    deviceToken ? { deviceToken } : "skip",
  );
  const toggleFavorite = useMutation(api.favorites.toggle);
  const reducedMotion = useReducedMotion();

  const [consented, setConsented] = useState(false);
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [draft, setDraft] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState("");
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [seen, setSeen] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ending, setEnding] = useState(false);
  const [finished, setFinished] = useState(false);

  const deck = useMemo(
    () => (data ? buildDeck(data.questions as Question[]) : []),
    [data],
  );

  if (data === undefined) {
    return (
      <div className="space-y-4">
        <div className="skel h-10 w-2/3 rounded-xl" />
        <div className="skel h-80 rounded-2xl" />
      </div>
    );
  }

  if (data === null) {
    return (
      <Card className="mx-auto max-w-xl p-6 text-center">
        <p className="text-sm font-medium">Cette expérience n&apos;est plus disponible.</p>
        <Link href="/explorer?format=cartes" className="mt-2 inline-block text-sm text-primary hover:underline">
          Revenir au catalogue
        </Link>
      </Card>
    );
  }

  if (!consented) {
    return (
      <SessionConsent
        title={data.experience.title}
        adult={data.adult}
        depth={data.experience.depth}
        backHref="/explorer?format=cartes"
        onReady={() => setConsented(true)}
      />
    );
  }

  const backHref = mood
    ? `/explorer?format=cartes&ambiance=${encodeURIComponent(mood)}`
    : "/explorer?format=cartes";
  const current = deck[index];
  const favorite = favorites?.includes(data.experience._id as Id<"experiences">) ?? false;
  const total = deck.length;

  function resetCard() {
    setAnswered(false);
    setRevealed(false);
    setDraft("");
    setResponse(null);
    setEditing(false);
    setEdited("");
  }

  function next() {
    if (index >= total - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSeen((value) => value + 1);
    resetCard();
  }

  function pass() {
    setPassedCount((value) => value + 1);
    next();
  }

  function answer(value: string) {
    const clean = value.trim();
    if (!clean) return;
    setResponse(clean);
    setAnswered(true);
    setAnsweredCount((value) => value + 1);
  }

  function replaceCard() {
    if (total <= 1) return;
    setIndex((value) => (value + 1 >= total ? 0 : value + 1));
    resetCard();
  }

  if (finished) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-5">
        <Card className="grain flex flex-col items-center gap-4 p-7 text-center">
          <span className="flex size-16 items-center justify-center rounded-3xl bg-coral-100 text-3xl">
            🃏
          </span>
          <div>
            <p className="eyebrow mb-1">Session terminée</p>
            <h1 className="text-2xl leading-tight">Merci d&apos;avoir joué.</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {answeredCount} carte{answeredCount > 1 ? "s" : ""} explorée
              {answeredCount > 1 ? "s" : ""}, {passedCount} passée
              {passedCount > 1 ? "s" : ""}. Ce qui a été passé n&apos;est pas un
              échec : c&apos;est un choix.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button className="flex-1" onClick={() => {
              setIndex(0);
              setSeen(0);
              setAnsweredCount(0);
              setPassedCount(0);
              setFinished(false);
              resetCard();
            }}>
              <RefreshCw className="size-4" />
              Recommencer
            </Button>
            <Link href={backHref} className="press inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-ivory-300 bg-card/90 text-sm font-medium hover:border-lavender-300">
              Retour au catalogue
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!current) {
    return (
      <Card className="mx-auto max-w-xl p-6 text-center">
        <p className="text-sm font-medium">
          Cette expérience ne contient pas encore de cartes publiées.
        </p>
        <Link href={backHref} className="mt-2 inline-block text-sm text-primary hover:underline">
          Choisir une autre expérience
        </Link>
      </Card>
    );
  }

  const meta = CATEGORY_META[current.category];
  const prompt = overrides[current.id] ?? current.prompt;
  const canReveal = current.kind !== "action";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <SessionHeader
        title={data.experience.title}
        subtitle={`${modalityLabel(data.experience.modes[0] ?? "ensemble")} · ${DEPTH_LABEL[data.experience.depth]}`}
        progress={`Carte ${index + 1} / ${total}`}
        backHref={backHref}
        onPause={() => setPaused(true)}
        onEnd={() => setEnding(true)}
      />

      <div className="h-1.5 overflow-hidden rounded-full bg-ivory-100">
        <div
          className="h-full rounded-full gradient-primary transition-all duration-300"
          style={{ width: `${Math.round(((index + 1) / total) * 100)}%` }}
        />
      </div>

      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute inset-x-6 top-2 h-full rounded-2xl border border-ivory-200/60 bg-card/40"
        />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            initial={
              reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, rotateX: -5 }
            }
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: reducedMotion ? 0 : 0.28 }}
            className="relative"
          >
            <Card className="flex flex-col gap-4 p-5 sm:p-6">
              <ExperienceArtwork
                emoji={meta.emoji}
                adult={data.adult}
                formatLabel="DuoCards"
                size="sm"
                className="bg-gradient-to-br from-lavender-100/40 via-blush-200/20 to-coral-100/30"
              />

              <div className="flex flex-wrap items-center gap-2">
                <Pill
                  tone={
                    meta.tone === "coral"
                      ? "primary"
                      : meta.tone === "lavender"
                        ? "lavender"
                        : "neutral"
                  }
                >
                  <span aria-hidden="true">{meta.emoji}</span>
                  {current.category}
                </Pill>
                <Pill tone="lavender">{DEPTH_LABEL[current.depth]}</Pill>
                <Pill tone="neutral">{current.durationMinutes} min</Pill>
                <span className="ml-auto text-xs text-graphite-500">
                  #{String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div aria-live="polite" className="min-h-24">
                {editing ? (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="card-edit">
                      Modifier cette carte pour la session
                    </label>
                    <textarea
                      id="card-edit"
                      value={edited}
                      onChange={(event) => setEdited(event.target.value)}
                      rows={3}
                      maxLength={400}
                      className="w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 py-3 text-base leading-relaxed outline-none focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setOverrides((value) => ({ ...value, [current.id]: edited.trim() || current.prompt }));
                          setEditing(false);
                        }}
                      >
                        <Check className="size-4" />
                        Enregistrer
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xl leading-snug sm:text-2xl">{prompt}</p>
                )}
              </div>

              {revealed && canReveal && (
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0, rotateX: -8 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.3 }}
                  className="rounded-xl border border-lavender-300/25 bg-lavender-100/60 p-4"
                >
                  <p className="eyebrow mb-1">Pour aller plus loin</p>
                  <p className="text-sm leading-relaxed text-graphite-300">
                    {current.reveal}
                  </p>
                  {current.options && current.options.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {current.options.map((option) => (
                        <span key={option} className="rounded-full border border-ivory-200 bg-card/80 px-3 py-1 text-xs text-graphite-600">
                          {option}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {answered && (
                <div className="rounded-xl border border-ivory-200/80 bg-ivory-100/70 p-4">
                  <p className="eyebrow mb-1">Votre réponse</p>
                  <p className="text-sm leading-relaxed text-graphite-300">{response}</p>
                </div>
              )}

              {!answered && current.kind === "choice" && current.options && (
                <div className="flex flex-col gap-2">
                  {current.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => answer(option)}
                      className="press min-h-12 rounded-xl border border-ivory-200 bg-white/[0.04] px-4 py-3 text-left text-sm hover:border-lavender-300"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {!answered && current.kind === "open" && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="card-answer">
                    Votre réponse
                  </label>
                  <textarea
                    id="card-answer"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    rows={3}
                    maxLength={600}
                    placeholder="Quelques mots suffisent…"
                    className="w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 py-3 text-base leading-relaxed outline-none focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60"
                  />
                  <Button size="sm" onClick={() => answer(draft)} disabled={!draft.trim()}>
                    Enregistrer ma réponse
                  </Button>
                </div>
              )}

              {!answered && current.kind === "challenge" && (
                <Button size="sm" onClick={() => answer("Défi accepté")}>
                  <Sparkles className="size-4" />
                  J&apos;ai fait le défi
                </Button>
              )}

              <div className="flex flex-wrap gap-2 border-t border-ivory-200/70 pt-3">
                {canReveal && !revealed && (
                  <Button size="sm" variant="secondary" onClick={() => setRevealed(true)}>
                    <Sparkles className="size-4" />
                    Révéler
                  </Button>
                )}
                {canReveal && !answered && current.kind !== "choice" && current.kind !== "open" && current.kind !== "challenge" && (
                  <span className="text-xs text-muted-foreground">
                    Cette carte se vit à voix haute.
                  </span>
                )}
                <Button size="sm" variant="outline" onClick={pass}>
                  Passer
                </Button>
                <Button size="sm" variant="ghost" onClick={() => {
                  setEditing(true);
                  setEdited(prompt);
                }}>
                  <Pencil className="size-4" />
                  Modifier
                </Button>
                <Button size="sm" variant="ghost" onClick={replaceCard}>
                  <Repeat2 className="size-4" />
                  Remplacer
                </Button>
                <button
                  type="button"
                  aria-pressed={favorite}
                  onClick={() => {
                    if (!deviceToken) return;
                    void toggleFavorite({
                      deviceToken,
                      experienceId: data.experience._id as Id<"experiences">,
                    });
                  }}
                  className={cn(
                    "press ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-full border border-ivory-200 px-3 text-xs font-medium text-graphite-500 hover:border-coral-300 hover:text-coral-600",
                    favorite && "border-coral-200 bg-coral-100 text-coral-600",
                  )}
                >
                  <Star className={cn("size-3.5", favorite && "fill-current")} />
                  Favori
                </button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <SessionFooter
        onPause={() => setPaused(true)}
        onEnd={() => setEnding(true)}
        note="Une carte à la fois. Vous pouvez passer, modifier, mettre en pause ou terminer."
      />

      <PauseOverlay
        open={paused}
        onResume={() => setPaused(false)}
        onEnd={() => {
          setPaused(false);
          setEnding(true);
        }}
      />
      <EndOverlay
        open={ending}
        onCancel={() => setEnding(false)}
        onConfirm={() => {
          setEnding(false);
          setFinished(true);
        }}
      />

      <p role="status" aria-live="polite" className="announce">
        Carte {index + 1} sur {total}. Catégorie {current.category}.
        {answered ? " Réponse enregistrée." : ""}
        {revealed ? " Indication révélée." : ""}
      </p>

      <div className="flex items-center justify-center gap-2 text-xs text-graphite-500">
        <Heart className="size-3.5" aria-hidden="true" />
        {seen > 0 ? `${seen} carte${seen > 1 ? "s" : ""} déjà parcourue${seen > 1 ? "s" : ""}` : "Votre rythme, votre moment."}
      </div>
    </div>
  );
}
