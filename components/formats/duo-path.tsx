"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import {
  Check,
  ChevronRight,
  Compass,
  Loader2,
  Pencil,
  Play,
  RefreshCw,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/surface";
import { useDeviceToken } from "@/lib/game/use-device";
import { DEPTH_LABEL, modalityLabel } from "@/lib/formats";
import { cn } from "@/lib/utils";
import { EndOverlay, PauseOverlay, SessionFooter, SessionHeader } from "./session-chrome";
import { SessionConsent } from "./session-consent";

const KIND_META: Record<
  string,
  { label: string; emoji: string }
> = {
  depart: { label: "Départ", emoji: "🚪" },
  connexion: { label: "Connexion", emoji: "🤍" },
  question: { label: "Question", emoji: "💬" },
  carte: { label: "Carte surprise", emoji: "🃏" },
  defi: { label: "Défi", emoji: "🌿" },
  souvenir: { label: "Souvenir", emoji: "📷" },
  surprise: { label: "Surprise", emoji: "✨" },
  pause: { label: "Pause", emoji: "☕" },
  arrivee: { label: "Arrivée", emoji: "🏁" },
};

export function DuoPath({ slug }: { slug: string }) {
  const deviceToken = useDeviceToken();
  const data = useQuery(
    api.journeys.bySlug,
    deviceToken !== undefined ? { slug, deviceToken } : { slug },
  );
  const start = useMutation(api.journeys.start);
  const completeStep = useMutation(api.journeys.completeStep);

  const [consented, setConsented] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [paused, setPaused] = useState(false);
  const [ending, setEnding] = useState(false);
  const [finished, setFinished] = useState(false);
  const started = useRef(false);

  const journey = data?.journey;
  const steps = data?.steps ?? [];
  const firstOpen = steps.findIndex((step) => !step.done);
  const activeIndex =
    selectedIndex ?? (firstOpen >= 0 ? firstOpen : Math.max(0, steps.length - 1));
  const active = steps[activeIndex];

  useEffect(() => {
    if (!consented || !deviceToken || !data || started.current) return;
    if (data.progress.startedAt) return;
    started.current = true;
    void start({ deviceToken, slug }).catch(() => {
      started.current = false;
    });
  }, [consented, data, deviceToken, slug, start]);

  if (data === undefined) {
    return (
      <div className="space-y-4">
        <div className="skel h-10 w-2/3 rounded-xl" />
        <div className="skel h-96 rounded-2xl" />
      </div>
    );
  }

  if (data === null || !journey) {
    return (
      <Card className="mx-auto max-w-xl p-6 text-center">
        <p className="text-sm font-medium">Ce parcours n&apos;est plus disponible.</p>
        <Link href="/explorer?format=parcours" className="mt-2 inline-block text-sm text-primary hover:underline">
          Revenir au catalogue
        </Link>
      </Card>
    );
  }

  const backHref = "/explorer?format=parcours";
  const total = steps.length;
  const completed = data.progress.completedCount;
  const isComplete = data.progress.completed || (total > 0 && completed >= total);

  if (!consented) {
    return (
      <SessionConsent
        title={journey.title}
        adult={false}
        depth={journey.depth ?? "moyen"}
        backHref={backHref}
        onReady={() => setConsented(true)}
      />
    );
  }

  if (finished) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-5">
        <Card className="grain flex flex-col items-center gap-4 p-7 text-center">
          <span className="flex size-16 items-center justify-center rounded-3xl bg-lavender-100 text-3xl">
            {journey.emoji}
          </span>
          <div>
            <p className="eyebrow mb-1">Parcours en pause</p>
            <h1 className="text-2xl leading-tight">Vous pouvez reprendre plus tard.</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {completed} étape{completed > 1 ? "s" : ""} sur {total} terminée
              {completed > 1 ? "s" : ""}. Votre progression est enregistrée sur cet
              appareil.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button className="flex-1" onClick={() => setFinished(false)}>
              <RefreshCw className="size-4" />
              Reprendre le parcours
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

  if (!active) {
    return (
      <Card className="mx-auto max-w-xl p-6 text-center">
        <p className="text-sm font-medium">Ce parcours n&apos;a pas encore d&apos;étapes publiées.</p>
        <Link href={backHref} className="mt-2 inline-block text-sm text-primary hover:underline">
          Choisir un autre parcours
        </Link>
      </Card>
    );
  }

  const kind = KIND_META[active.kind] ?? KIND_META.connexion;
  const prompt = overrides[active._id] ?? active.prompt ?? active.mission ?? "";
  const isDone = active.done;
  const isSkipped = skipped.has(active._id);

  async function complete() {
    if (!deviceToken || pending) return;
    setPending(true);
    setError(null);
    try {
      await start({ deviceToken, slug });
      await completeStep({
        deviceToken,
        slug,
        dayIndex: active.dayIndex,
      });
      setSkipped((current) => {
        const next = new Set(current);
        next.delete(active._id);
        return next;
      });
      setSelectedIndex(Math.min(activeIndex + 1, total - 1));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message.replace(/^.*Uncaught Error:\s*/, "")
          : "Impossible d'enregistrer cette étape. Vous pouvez réessayer.",
      );
    } finally {
      setPending(false);
    }
  }

  function pass() {
    setSkipped((current) => new Set(current).add(active._id));
    setSelectedIndex(Math.min(activeIndex + 1, total - 1));
  }

  if (isComplete) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <SessionHeader
          title={journey.title}
          subtitle={`${journey.ambiance} · ${journey.durationMinutes} min · ${DEPTH_LABEL[journey.depth]}`}
          progress={`${total} étapes terminées`}
          backHref={backHref}
          onEnd={() => setEnding(true)}
        />
        <Card className="grain flex flex-col gap-4 p-6">
          <p className="eyebrow">Arrivée</p>
          <h2 className="text-2xl leading-tight">Le parcours est terminé.</h2>
          <p className="text-sm leading-relaxed text-graphite-300">
            {journey.conclusion ??
              "Vous êtes allés au bout de ce moment. Rien ne vous oblige à recommencer : gardez ce qui vous a plu."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Pill tone="lavender">{total} étapes</Pill>
            <Pill tone="neutral">{journey.durationMinutes} min</Pill>
            <Pill tone="neutral">{DEPTH_LABEL[journey.depth]}</Pill>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={backHref}
              className="press inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full gradient-primary text-sm font-medium text-white shadow-[var(--shadow-glow)]"
            >
              Explorer un autre format
            </Link>
            <Link
              href="/parcours"
              className="press inline-flex h-12 flex-1 items-center justify-center rounded-full border border-ivory-300 bg-card/90 text-sm font-medium hover:border-lavender-300"
            >
              Voir mes parcours
            </Link>
          </div>
        </Card>
        <EndOverlay
          open={ending}
          onCancel={() => setEnding(false)}
          onConfirm={() => {
            setEnding(false);
            setFinished(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <SessionHeader
        title={journey.title}
        subtitle={`${journey.ambiance} · ${journey.durationMinutes} min · ${DEPTH_LABEL[journey.depth]}`}
        progress={`${completed} / ${total} étapes`}
        backHref={backHref}
        onPause={() => setPaused(true)}
        onEnd={() => setEnding(true)}
      />

      <Card className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow mb-1">Contexte</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {journey.context ?? journey.description}
            </p>
          </div>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-lavender-100 text-2xl">
            {journey.emoji}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-ivory-100">
          <div
            className="h-full rounded-full gradient-primary transition-all duration-300"
            style={{ width: `${Math.round((completed / total) * 100)}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-graphite-500">
          <span>{modalityLabel("ensemble")} ou {modalityLabel("a-distance")}</span>
          <span aria-hidden="true">·</span>
          <span>{total} étapes</span>
          {completed > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>Reprise possible à tout moment</span>
            </>
          )}
        </div>
      </Card>

      {/* Chemin visuel */}
      <div className="flex flex-col">
        {steps[0]?.kind !== "depart" && (
          <>
            <div className="flex items-center gap-2 text-xs font-medium text-lavender-300">
              <span className="flex size-7 items-center justify-center rounded-full border border-lavender-300/40 bg-lavender-100 text-sm">
                🚪
              </span>
              Départ
            </div>
            <div className="ml-3.5 h-4 w-px bg-ivory-200" aria-hidden="true" />
          </>
        )}
        <ol className="flex flex-col gap-0">
          {steps.map((step, index) => {
            const meta = KIND_META[step.kind] ?? KIND_META.connexion;
            const current = index === activeIndex;
            const passed = skipped.has(step._id);
            return (
              <li key={step._id} className="relative flex gap-3">
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIndex(index);
                      setEditing(false);
                    }}
                    aria-current={current ? "step" : undefined}
                    aria-label={`Étape ${step.dayIndex} : ${step.title}`}
                    className={cn(
                      "press mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border text-sm transition-all",
                      step.done
                        ? "border-lavender-300/60 bg-lavender-200 text-graphite-900"
                        : current
                          ? "border-coral-300 bg-coral-100 text-coral-600 shadow-[var(--shadow-glow)]"
                          : passed
                            ? "border-ivory-300 bg-ivory-100 text-graphite-500"
                            : "border-ivory-200 bg-card text-graphite-500",
                    )}
                  >
                    {step.done ? (
                      <Check className="size-4" />
                    ) : (
                      <span aria-hidden="true">{meta.emoji}</span>
                    )}
                  </button>
                  {index < steps.length - 1 && (
                    <span
                      className={cn(
                        "my-1 w-px flex-1",
                        step.done ? "bg-lavender-300/40" : "bg-ivory-200",
                      )}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIndex(index);
                    setEditing(false);
                  }}
                  className={cn(
                    "mb-2 flex min-w-0 flex-1 items-start justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-colors",
                    current
                      ? "border-lavender-300/50 bg-lavender-100/40"
                      : "border-transparent hover:border-ivory-200",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-[0.14em] text-graphite-500">
                      {meta.label} · {step.dayIndex}
                    </span>
                    <span className="block truncate text-sm font-medium">
                      {step.title}
                    </span>
                  </span>
                  {current && <ChevronRight className="mt-1 size-4 shrink-0 text-lavender-300" />}
                </button>
              </li>
            );
          })}
        </ol>
        {steps[steps.length - 1]?.kind !== "arrivee" && (
          <>
            <div className="ml-3.5 h-4 w-px bg-ivory-200" aria-hidden="true" />
            <div className="flex items-center gap-2 text-xs font-medium text-lavender-300">
              <span className="flex size-7 items-center justify-center rounded-full border border-lavender-300/40 bg-lavender-100 text-sm">
                🏁
              </span>
              Arrivée
            </div>
          </>
        )}
      </div>

      {/* Étape courante */}
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="lavender">
            <span aria-hidden="true">{kind.emoji}</span>
            {kind.label}
          </Pill>
          <Pill tone="neutral">Étape {active.dayIndex} / {total}</Pill>
          {isDone && <Pill tone="lavender">Terminée</Pill>}
          {isSkipped && !isDone && <Pill tone="neutral">Passée pour cette session</Pill>}
        </div>

        <h2 className="text-xl leading-snug">{active.title}</h2>

        {editing ? (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="step-edit">
              Modifier cette étape pour vous deux
            </label>
            <textarea
              id="step-edit"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
              maxLength={500}
              className="w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 py-3 text-base leading-relaxed outline-none focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setOverrides((current) => ({
                    ...current,
                    [active._id]: draft.trim() || prompt,
                  }));
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
          <p className="text-base leading-relaxed text-graphite-300">{prompt}</p>
        )}

        {active.experience && (
          <Link
            href={`/nouvelle/${active.experience.slug}?journey=${slug}&jour=${active.dayIndex}`}
            className="press flex items-center justify-between gap-3 rounded-xl border border-lavender-300/25 bg-lavender-100/40 px-3.5 py-2.5 text-sm hover:border-lavender-300/50"
          >
            <span>
              <span className="block text-[10px] uppercase tracking-[0.14em] text-graphite-500">
                Expérience liée
              </span>
              <span className="font-medium">{active.experience.title}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-lavender-300" />
          </Link>
        )}

        {active.durationMinutes && (
          <p className="text-xs text-graphite-500">
            Durée indicative : {active.durationMinutes} min · à adapter à votre
            énergie.
          </p>
        )}

        {error && (
          <p className="rounded-xl border border-coral-200/70 bg-coral-100/70 px-3.5 py-2.5 text-sm text-coral-700">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2 border-t border-ivory-200/70 pt-3">
          <Button type="button" size="sm" onClick={complete} disabled={pending || isDone}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
            {isDone ? "Étape terminée" : "Faire"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditing(true);
              setDraft(prompt);
            }}
          >
            <Pencil className="size-4" />
            Modifier
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={pass}>
            Passer
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setPaused(true)}>
            Pause
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setEnding(true)}>
            Terminer
          </Button>
        </div>
      </Card>

      <SessionFooter
        onPause={() => setPaused(true)}
        onEnd={() => setEnding(true)}
        note="Chaque étape peut être faite, modifiée, passée ou reprise plus tard."
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
        Étape {active.dayIndex} sur {total} : {active.title}.
        {isDone ? " Terminée." : ""}
        {isSkipped && !isDone ? " Passée pour cette session." : ""}
      </p>

      <div className="flex items-center justify-center gap-2 text-xs text-graphite-500">
        <Compass className="size-3.5" aria-hidden="true" />
        {completed > 0
          ? `${completed} étape${completed > 1 ? "s" : ""} déjà validée${completed > 1 ? "s" : ""}`
          : "Votre chemin se construit pas à pas."}
      </div>
    </div>
  );
}
