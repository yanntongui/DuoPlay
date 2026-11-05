"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Dices,
  Pencil,
  Play,
  RefreshCw,
  Sparkles,
  Square,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/surface";
import { DEPTH_LABEL, modalityLabel } from "@/lib/formats";
import { EndOverlay, PauseOverlay, SessionFooter, SessionHeader } from "./session-chrome";
import { SessionConsent } from "./session-consent";

type DirectionSlug =
  | "question"
  | "souvenir"
  | "compliment"
  | "defi"
  | "surprise"
  | "discussion";

type Direction = {
  slug: DirectionSlug;
  label: string;
  emoji: string;
  hint: string;
  face: string;
  target: { x: number; y: number };
};

const DIRECTIONS: Direction[] = [
  {
    slug: "question",
    label: "Question",
    emoji: "💬",
    hint: "Une question pour mieux se connaître.",
    face: "translateZ(60px)",
    target: { x: 0, y: 0 },
  },
  {
    slug: "souvenir",
    label: "Souvenir",
    emoji: "📷",
    hint: "Un souvenir à rouvrir ensemble.",
    face: "rotateY(180deg) translateZ(60px)",
    target: { x: 0, y: -180 },
  },
  {
    slug: "compliment",
    label: "Compliment",
    emoji: "💗",
    hint: "Une attention à dire à voix haute.",
    face: "rotateY(90deg) translateZ(60px)",
    target: { x: 0, y: -90 },
  },
  {
    slug: "defi",
    label: "Défi",
    emoji: "🌿",
    hint: "Une petite action réelle, jamais imposée.",
    face: "rotateY(-90deg) translateZ(60px)",
    target: { x: 0, y: 90 },
  },
  {
    slug: "surprise",
    label: "Surprise",
    emoji: "✨",
    hint: "Quelque chose d'inattendu, à adapter.",
    face: "rotateX(90deg) translateZ(60px)",
    target: { x: -90, y: 0 },
  },
  {
    slug: "discussion",
    label: "Discussion",
    emoji: "🫧",
    hint: "Un échange sans bonne réponse.",
    face: "rotateX(-90deg) translateZ(60px)",
    target: { x: 90, y: 0 },
  },
];

const FALLBACK_PROMPTS: Record<DirectionSlug, string[]> = {
  question: [
    "Quelle petite chose avez-vous apprise sur l'autre cette semaine ?",
    "Qu'est-ce qui vous ferait vous sentir plus proches ce soir ?",
  ],
  souvenir: [
    "Quel souvenir vous fait encore sourire quand vous y repensez ?",
    "Quel moment de votre histoire aimeriez-vous revivre une heure ?",
  ],
  compliment: [
    "Dites à l'autre une chose que vous admirez chez elle ou lui, sans plaisanterie.",
    "Quelle qualité de l'autre vous aide au quotidien ?",
  ],
  defi: [
    "Prenez trois minutes pour faire une petite attention réelle à l'autre.",
    "Choisissez ensemble un geste tendre, à la hauteur de votre énergie.",
  ],
  surprise: [
    "Inventez une question que vous n'avez jamais osé poser. L'autre peut passer.",
    "Choisissez une carte au hasard dans votre histoire et racontez-la.",
  ],
  discussion: [
    "Qu'est-ce qui vous aide à vous sentir écouté ?",
    "Quelle différence entre vous deux vous fait sourire aujourd'hui ?",
  ],
};

type Question = {
  _id: string;
  kind: "choice" | "open" | "challenge";
  prompt: string;
  options: string[] | null;
  depth: "leger" | "moyen" | "profond";
  themes: string[];
};

type DiceResult = {
  direction: Direction;
  question?: Question;
  prompt: string;
  options: string[] | null;
  edited: boolean;
  accepted: boolean;
};

function directionFor(question: Question): DirectionSlug {
  if (question.kind === "challenge") return "defi";
  const themes = question.themes.map((theme) => theme.toLowerCase());
  if (themes.some((theme) => theme.includes("humour"))) return "surprise";
  if (themes.some((theme) => theme.includes("souvenir"))) return "souvenir";
  if (
    themes.some(
      (theme) => theme.includes("tendresse") || theme.includes("affection"),
    )
  ) {
    return "compliment";
  }
  if (
    themes.some(
      (theme) =>
        theme.includes("relation") ||
        theme.includes("écoute") ||
        theme.includes("préférences"),
    )
  ) {
    return "discussion";
  }
  return "question";
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/* ------------------------------------------------------------------ */
/* Dé 3D                                                               */
/* ------------------------------------------------------------------ */

function Dice({
  rolling,
  direction,
  reducedMotion,
}: {
  rolling: boolean;
  direction: Direction | null;
  reducedMotion: boolean;
}) {
  const target = direction?.target ?? { x: -12, y: 18 };

  return (
    <div
      className="relative flex size-36 items-center justify-center [perspective:700px]"
      aria-hidden="true"
    >
      <motion.div
        className="relative size-28 [transform-style:preserve-3d]"
        initial={false}
        animate={
          rolling
            ? {
                rotateX: [0, 360, 720],
                rotateY: [0, 360, 720],
              }
            : { rotateX: target.x, rotateY: target.y }
        }
        transition={
          rolling
            ? { duration: reducedMotion ? 0.01 : 0.65, ease: "easeInOut" }
            : { duration: reducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }
        }
      >
        {DIRECTIONS.map((item) => (
          <div
            key={item.slug}
            className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-2xl border border-lavender-300/30 bg-gradient-to-br from-graphite-800 via-graphite-900 to-graphite-700 shadow-[0_18px_50px_-20px_rgba(225,29,72,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] [backface-visibility:hidden]"
            style={{ transform: item.face }}
          >
            <span className="text-3xl">{item.emoji}</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-lavender-300">
              {item.label}
            </span>
          </div>
        ))}
      </motion.div>
      <span className="pointer-events-none absolute inset-x-4 bottom-0 h-6 rounded-full bg-coral-500/20 blur-xl" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Écran                                                               */
/* ------------------------------------------------------------------ */

export function DuoDice({
  slug,
  mood,
}: {
  slug: string;
  mood?: string | null;
}) {
  const data = useQuery(api.formats.content, { slug });
  const reducedMotion = useReducedMotion();
  const [consented, setConsented] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<DiceResult | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [paused, setPaused] = useState(false);
  const [ending, setEnding] = useState(false);
  const [finished, setFinished] = useState(false);
  const [explored, setExplored] = useState(0);
  const [passed, setPassed] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pools = useMemo(() => {
    const map = new Map<DirectionSlug, Question[]>();
    for (const direction of DIRECTIONS) map.set(direction.slug, []);
    if (data) {
      for (const question of data.questions as Question[]) {
        const list = map.get(directionFor(question)) ?? [];
        list.push(question);
        map.set(directionFor(question), list);
      }
    }
    return map;
  }, [data]);

  if (data === undefined) {
    return (
      <div className="space-y-4">
        <div className="skel h-10 w-2/3 rounded-xl" />
        <div className="skel h-72 rounded-2xl" />
      </div>
    );
  }

  if (data === null) {
    return (
      <Card className="mx-auto max-w-xl p-6 text-center">
        <p className="text-sm font-medium">Cette expérience n&apos;est plus disponible.</p>
        <Link href="/explorer?format=des" className="mt-2 inline-block text-sm text-primary hover:underline">
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
        backHref="/explorer?format=des"
        onReady={() => setConsented(true)}
      />
    );
  }

  const backHref = mood
    ? `/explorer?format=des&ambiance=${encodeURIComponent(mood)}`
    : "/explorer?format=des";

  if (finished) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-5">
        <Card className="grain flex flex-col items-center gap-4 p-7 text-center">
          <span className="flex size-16 items-center justify-center rounded-3xl bg-lavender-100 text-3xl">
            🎲
          </span>
          <div>
            <p className="eyebrow mb-1">Session terminée</p>
            <h1 className="text-2xl leading-tight">Le dé s&apos;arrête ici.</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {explored} direction{explored > 1 ? "s" : ""} explorée
              {explored > 1 ? "s" : ""}, {passed} passée
              {passed > 1 ? "s" : ""}. Vous pouvez relancer quand vous voulez.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              className="flex-1"
              onClick={() => {
                setFinished(false);
                setExplored(0);
                setPassed(0);
                setResult(null);
              }}
            >
              <RefreshCw className="size-4" />
              Recommencer
            </Button>
            <Link
              href={backHref}
              className="press inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-ivory-300 bg-card/90 text-sm font-medium hover:border-lavender-300"
            >
              Retour au catalogue
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  function cancel() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setRolling(false);
  }

  function roll() {
    if (rolling) {
      cancel();
      return;
    }
    setRolling(true);
    setResult(null);
    setEditing(false);
    setDraft("");
    const delay = reducedMotion ? 60 : 620;
    timer.current = setTimeout(() => {
      const direction = pick(DIRECTIONS);
      const pool = pools.get(direction.slug) ?? [];
      const question = pool.length > 0 ? pick(pool) : undefined;
      const fallback = pick(FALLBACK_PROMPTS[direction.slug]);
      setResult({
        direction,
        question,
        prompt: question?.prompt ?? fallback,
        options: question?.options ?? null,
        edited: false,
        accepted: false,
      });
      setRolling(false);
      setExplored((value) => value + 1);
      timer.current = null;
    }, delay);
  }

  function pass() {
    setResult(null);
    setEditing(false);
    setPassed((value) => value + 1);
    setRolling(false);
  }

  function accept() {
    setResult((current) => (current ? { ...current, accepted: true } : current));
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <SessionHeader
        title={data.experience.title}
        subtitle={`${modalityLabel(data.experience.modes[0] ?? "ensemble")} · ${DEPTH_LABEL[data.experience.depth]}`}
        progress={`${explored} direction${explored > 1 ? "s" : ""} explorée${explored > 1 ? "s" : ""}`}
        backHref={backHref}
        onPause={() => setPaused(true)}
        onEnd={() => setEnding(true)}
      />

      <Card className="grain flex flex-col items-center gap-5 p-6">
        <Dice
          rolling={rolling}
          direction={result?.direction ?? null}
          reducedMotion={Boolean(reducedMotion)}
        />

        <div className="text-center">
          <p className="eyebrow mb-1">Le hasard, sans obligation</p>
          <h2 className="text-xl leading-tight">
            {rolling
              ? "Le dé tourne…"
              : result
                ? "Le dé vous propose une direction."
                : "Lancez le dé quand vous êtes prêts."}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Le dé ne choisit jamais un geste intime à votre place. Il propose
            une direction ; vous gardez le dernier mot.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button type="button" size="lg" onClick={roll}>
            {rolling ? <Square className="size-4" /> : <Dices className="size-5" />}
            {rolling ? "Annuler le lancer" : result ? "Relancer" : "Lancer le dé"}
          </Button>
          {rolling && (
            <span className="text-xs text-graphite-500">
              Vous pouvez annuler à tout moment.
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {result && !rolling && (
            <motion.div
              key={`${result.direction.slug}-${result.prompt}`}
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reducedMotion ? 0 : 0.25 }}
              className="w-full rounded-xl border border-lavender-300/25 bg-lavender-100/40 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="lavender">
                  <span aria-hidden="true">{result.direction.emoji}</span>
                  {result.direction.label}
                </Pill>
                <span className="text-xs text-graphite-500">
                  {result.direction.hint}
                </span>
              </div>

              {editing ? (
                <div className="mt-3 flex flex-col gap-2">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="dice-edit">
                    Modifier la proposition
                  </label>
                  <textarea
                    id="dice-edit"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    rows={3}
                    maxLength={400}
                    className="w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 py-3 text-sm leading-relaxed outline-none focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setResult((current) =>
                          current
                            ? {
                                ...current,
                                prompt: draft.trim() || current.prompt,
                                edited: true,
                              }
                            : current,
                        );
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
                <p className="mt-3 text-lg leading-snug">{result.prompt}</p>
              )}

              {result.accepted && result.options && result.options.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.options.map((option) => (
                    <span key={option} className="rounded-full border border-ivory-200 bg-card/80 px-3 py-1 text-xs text-graphite-600">
                      {option}
                    </span>
                  ))}
                </div>
              )}

              {result.accepted && (
                <p className="mt-3 flex items-center gap-2 text-sm text-graphite-300">
                  <Sparkles className="size-4 text-lavender-400" />
                  Direction acceptée. Prenez le temps qu&apos;il faut.
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2 border-t border-ivory-200/70 pt-3">
                {!result.accepted && (
                  <Button size="sm" onClick={accept}>
                    <Play className="size-4" />
                    Accepter
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(true);
                    setDraft(result.prompt);
                  }}
                >
                  <Pencil className="size-4" />
                  Modifier
                </Button>
                <Button size="sm" variant="outline" onClick={roll}>
                  <RefreshCw className="size-4" />
                  Relancer
                </Button>
                <Button size="sm" variant="ghost" onClick={pass}>
                  Passer
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPaused(true)}>
                  Pause
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p role="status" aria-live="polite" className="announce">
          {rolling
            ? "Le dé tourne. Vous pouvez annuler."
            : result
              ? `Direction ${result.direction.label}. ${result.prompt}`
              : ""}
        </p>
      </Card>

      <SessionFooter
        onPause={() => setPaused(true)}
        onEnd={() => setEnding(true)}
        note={`${passed} proposition${passed > 1 ? "s" : ""} passée${passed > 1 ? "s" : ""}. Passer ne bloque rien.`}
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
          cancel();
          setResult(null);
          setFinished(true);
        }}
      />
    </div>
  );
}
