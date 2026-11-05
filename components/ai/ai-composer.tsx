"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Heart,
  Pause,
  RefreshCw,
  Sparkles,
  Wand2,
} from "lucide-react";
import type { AiBrief } from "@/convex/ai/content";
import {
  DURATIONS,
  LEVELS,
  LEVEL_LABELS,
  MOODS,
  MOOD_LABELS,
} from "@/convex/ai/content";
import type { AiGenerated, AiGenerateResult } from "@/components/ai/types";
import {
  AiBadge,
  AiButton,
  AiCard,
  AiChip,
  AiNotice,
  AiSectionTitle,
  AiSkeleton,
} from "@/components/ai/ai-ui";

const STEPS = ["Humeur", "Durée", "Niveau", "Contexte", "Envie", "Récapitulatif"];

const EXCLUSIONS: { value: string; label: string }[] = [
  { value: "photo", label: "Photo" },
  { value: "video", label: "Vidéo" },
  { value: "contact", label: "Contact physique" },
  { value: "audacieux", label: "Contenu audacieux" },
  { value: "musique", label: "Musique" },
  { value: "public", label: "Lieu public" },
];

export function AiComposer({
  initial,
  onCancel,
  onGenerate,
  onStart,
  onLater,
}: {
  initial?: Partial<AiBrief>;
  onCancel: () => void;
  onGenerate: (brief: AiBrief) => Promise<AiGenerateResult>;
  onStart: (sessionId: string) => void;
  onLater: () => void;
}) {
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState<AiBrief["mood"]>(initial?.mood ?? "tendre");
  const [duration, setDuration] = useState(initial?.durationMinutes ?? 15);
  const [level, setLevel] = useState<AiBrief["level"]>(initial?.level ?? "moyen");
  const [mode, setMode] = useState<AiBrief["mode"]>(initial?.mode ?? "ensemble");
  const [exclusions, setExclusions] = useState<string[]>(initial?.exclusions ?? []);
  const [wish, setWish] = useState(initial?.wish ?? "");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<AiGenerated | null>(null);
  const [error, setError] = useState<Extract<AiGenerateResult, { ok: false }> | null>(null);

  const brief: AiBrief = {
    mood,
    level,
    mode,
    durationMinutes: duration,
    exclusions,
    wish,
  };

  function toggleExclusion(value: string) {
    setExclusions((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  async function generate() {
    setGenerating(true);
    setError(null);
    setResult(null);
    try {
      const [response] = await Promise.all([
        onGenerate(brief),
        new Promise((resolve) => setTimeout(resolve, 750)),
      ]);
      if (response.ok) {
        setResult(response);
      } else {
        setError(response);
      }
    } catch {
      setError({
        ok: false,
        reason: "indisponible",
        message:
          "La génération n’a pas abouti. Vérifiez votre connexion et réessayez — le catalogue reste disponible.",
        alternative: "Explorer le catalogue",
      });
    } finally {
      setGenerating(false);
    }
  }

  if (generating) {
    return (
      <div className="flex flex-col gap-5 pb-16">
        <ComposerHeader step={5} onBack={onCancel} title="Créer une session" />
        <AiCard className="p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="relative flex size-10 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-[#d9a7c9]/25 blur-md ai-pulse" />
              <Sparkles className="relative size-5 text-[#e8c8dd]" />
            </span>
            <div>
              <p className="font-display text-2xl text-[#f6efe7]">
                On prépare votre moment…
              </p>
              <p className="text-[13px] text-[#d9cbbf]/65">
                Quelques secondes. Vous pouvez annuler à tout moment.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <AiSkeleton lines={2} />
            <div className="ai-rule" />
            <AiSkeleton lines={3} />
          </div>
          <div className="mt-6">
            <AiButton variant="ghost" onClick={onCancel}>
              Annuler
            </AiButton>
          </div>
        </AiCard>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex flex-col gap-5 pb-16">
        <ComposerHeader step={6} onBack={onCancel} title="Aperçu de la session" />
        <AiCard className="ai-rise p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <AiBadge />
            <span className="text-[11px] text-[#d9cbbf]/55">
              {result.session.durationMinutes} min ·{" "}
              {MOOD_LABELS[result.session.mood as AiBrief["mood"]]} ·{" "}
              {result.session.mode === "a-distance" ? "À distance" : "Au même endroit"}
            </span>
          </div>
          <h2 className="mt-3 font-display text-[2rem] leading-tight text-[#f6efe7]">
            {result.session.title}
          </h2>
          <p className="mt-1 text-[14px] leading-relaxed text-[#d9cbbf]/75">
            {result.session.subtitle}
          </p>

          <ol className="mt-5 space-y-2">
            {result.session.steps.map((item: any, index: number) => (
              <li
                key={`${item.title}-${index}`}
                className="ai-surface-soft flex items-start gap-3 p-3.5"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-[#d9a7c9]/30 text-[11px] text-[#e8c8dd]">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#f6efe7]">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#d9cbbf]/65">
                    {item.body}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-[#d9cbbf]/45">
                  {item.minutes} min
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-4 rounded-2xl border border-[#d9a7c9]/16 bg-white/[0.025] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d9a7c9]/70">
              Question finale
            </p>
            <p className="mt-1 text-sm text-[#f6efe7]">
              {result.session.finalQuestion}
            </p>
          </div>

          <div className="mt-4">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d9a7c9]/70">
              Pourquoi cette session
            </p>
            <ul className="space-y-1.5">
              {result.session.rationale.map((reason: string) => (
                <li
                  key={reason}
                  className="flex gap-1.5 text-[12px] leading-snug text-[#d9cbbf]/70"
                >
                  <Check className="mt-0.5 size-3.5 shrink-0 text-[#d9a7c9]" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {result.session.alternatives.map((alternative: any) => (
              <span
                key={alternative.label}
                className="rounded-full border border-[#d9a7c9]/18 px-2.5 py-1 text-[11px] text-[#d9cbbf]/65"
                title={alternative.description}
              >
                {alternative.label}
              </span>
            ))}
          </div>

          <div className="ai-rule my-5" />

          <div className="flex flex-col gap-2 sm:flex-row">
            <AiButton variant="primary" onClick={() => onStart(result.sessionId)}>
              Commencer
              <ArrowRight className="size-4" />
            </AiButton>
            <AiButton
              variant="soft"
              onClick={() => {
                setResult(null);
                setStep(5);
              }}
            >
              Modifier
            </AiButton>
            <AiButton variant="soft" onClick={generate}>
              <RefreshCw className="size-4" />
              Régénérer
            </AiButton>
            <AiButton variant="ghost" onClick={onLater}>
              Plus tard
            </AiButton>
          </div>

          <p className="mt-4 text-[11.5px] leading-relaxed text-[#d9cbbf]/50">
            Chaque étape propose Accepter · Modifier · Passer · Remplacer ·
            Pause · Terminer. Vous pouvez arrêter sans justification.
          </p>
        </AiCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-16">
      <ComposerHeader
        step={step}
        onBack={() => (step === 0 ? onCancel() : setStep((value) => value - 1))}
        title="Créer une session"
      />

      <AiCard className="p-5 sm:p-7">
        {step === 0 ? (
          <div className="ai-rise">
            <AiSectionTitle
              eyebrow="Étape 1 · Humeur"
              title="Quelle est votre humeur ?"
            />
            <p className="mb-4 text-[13px] text-[#d9cbbf]/65">
              Une humeur se choisit à deux. Vous pourrez l’ajuster, ou tout
              arrêter.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {MOODS.map((entry) => (
                <AiChip
                  key={entry.value}
                  active={mood === entry.value}
                  onClick={() => setMood(entry.value)}
                  className="min-h-12 justify-start"
                >
                  {entry.label}
                </AiChip>
              ))}
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="ai-rise">
            <AiSectionTitle
              eyebrow="Étape 2 · Durée"
              title="Combien de temps avez-vous ?"
            />
            <p className="mb-4 text-[13px] text-[#d9cbbf]/65">
              Aucun compte à rebours ne s’imposera. La durée est une intention,
              pas une contrainte.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DURATIONS.map((value) => (
                <AiChip
                  key={value}
                  active={duration === value}
                  onClick={() => setDuration(value)}
                  className="min-h-14 justify-center text-sm"
                >
                  <Clock className="size-4" />
                  {value} min
                </AiChip>
              ))}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="ai-rise">
            <AiSectionTitle
              eyebrow="Étape 3 · Niveau"
              title="Jusqu’où souhaitez-vous aller ?"
            />
            <p className="mb-4 text-[13px] text-[#d9cbbf]/65">
              Le niveau décrit la profondeur des questions. Il ne vaut jamais
              consentement pour la suite.
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {LEVELS.map((entry) => (
                <button
                  key={entry.value}
                  type="button"
                  onClick={() => setLevel(entry.value)}
                  aria-pressed={level === entry.value}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    level === entry.value
                      ? "border-[#d9a7c9]/55 bg-[#d9a7c9]/12"
                      : "border-[#d9a7c9]/18 bg-white/[0.025] hover:border-[#d9a7c9]/35"
                  }`}
                >
                  <span className="block text-sm font-medium text-[#f6efe7]">
                    {entry.label}
                  </span>
                  <span className="mt-1 block text-[12px] leading-snug text-[#d9cbbf]/60">
                    {entry.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="ai-rise">
            <AiSectionTitle
              eyebrow="Étape 4 · Contexte"
              title="Où et comment ?"
            />
            <div className="mb-4 flex flex-wrap gap-2">
              <AiChip active={mode === "ensemble"} onClick={() => setMode("ensemble")}>
                <Heart className="size-3.5" />
                Au même endroit
              </AiChip>
              <AiChip active={mode === "a-distance"} onClick={() => setMode("a-distance")}>
                À distance
              </AiChip>
            </div>
            <p className="mb-2 text-[12px] font-medium text-[#d9cbbf]/80">
              À exclure avant génération
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
            <p className="mt-3 text-[12px] leading-relaxed text-[#d9cbbf]/55">
              Ces choix sont vérifiés après génération. Une exclusion ne peut
              pas être retirée par une étape.
            </p>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="ai-rise">
            <AiSectionTitle
              eyebrow="Étape 5 · Envie"
              title="Un mot sur ce que vous aimeriez ?"
            />
            <p className="mb-3 text-[13px] text-[#d9cbbf]/65">
              Facultatif. Ce texte sert uniquement à orienter la proposition ;
              il n’est pas enregistré comme une réponse intime.
            </p>
            <textarea
              value={wish}
              onChange={(event) => setWish(event.target.value)}
              maxLength={300}
              rows={4}
              placeholder="Ex. : une conversation profonde et une petite surprise, sans photo."
              className="ai-input resize-none"
            />
            <p className="mt-2 text-right text-[11px] text-[#d9cbbf]/40">
              {wish.length} / 300
            </p>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="ai-rise">
            <AiSectionTitle
              eyebrow="Étape 6 · Récapitulatif"
              title="Voici ce que nous avons compris"
            />
            <dl className="mt-4 space-y-2 rounded-2xl border border-[#d9a7c9]/16 bg-white/[0.025] p-4 text-sm">
              <Row label="Humeur" value={MOOD_LABELS[mood]} />
              <Row label="Durée" value={`${duration} minutes`} />
              <Row
                label="Contexte"
                value={mode === "a-distance" ? "À distance" : "Au même endroit"}
              />
              <Row label="Niveau" value={LEVEL_LABELS[level]} />
              <Row
                label="Exclusions"
                value={
                  exclusions.length > 0
                    ? exclusions
                        .map(
                          (value) =>
                            EXCLUSIONS.find((entry) => entry.value === value)
                              ?.label ?? value,
                        )
                        .join(" · ")
                    : "Aucune"
                }
              />
              <Row label="Envie" value={wish.trim() || "Non précisée"} />
            </dl>

            {error ? (
              <div className="mt-4">
                <AiNotice
                  tone={error.reason === "securite" ? "safety" : "quota"}
                  title={
                    error.reason === "consentement"
                      ? "Votre accord est nécessaire"
                      : error.reason === "quota"
                        ? "Limite mensuelle atteinte"
                        : error.reason === "securite"
                          ? "Je ne peux pas créer cette session"
                          : "Génération indisponible"
                  }
                >
                  <p>{error.message}</p>
                  <p className="mt-2 opacity-90">{error.alternative}</p>
                </AiNotice>
              </div>
            ) : null}

            <p className="mt-4 text-[11.5px] leading-relaxed text-[#d9cbbf]/55">
              Vous pourrez modifier chaque étape, en passer une ou terminer à
              tout moment. Une proposition n’est pas une attente.
            </p>
          </div>
        ) : null}

        <div className="ai-rule my-5" />

        <div className="flex items-center justify-between gap-3">
          <AiButton
            variant="ghost"
            onClick={() => (step === 0 ? onCancel() : setStep((value) => value - 1))}
          >
            <ArrowLeft className="size-4" />
            Retour
          </AiButton>
          {step < 5 ? (
            <AiButton variant="primary" onClick={() => setStep((value) => value + 1)}>
              Continuer
              <ArrowRight className="size-4" />
            </AiButton>
          ) : (
            <AiButton variant="primary" onClick={generate}>
              <Wand2 className="size-4" />
              Générer la session
            </AiButton>
          )}
        </div>
      </AiCard>

      <div className="flex items-start gap-2 px-1 text-[11.5px] leading-relaxed text-[#d9cbbf]/45">
        <Pause className="mt-0.5 size-3.5 shrink-0" />
        <p>
          DuoPlay AI ne remplace ni le consentement, ni un professionnel de
          santé. Chaque partenaire peut refuser une étape sans motif.
        </p>
      </div>
    </div>
  );
}

function ComposerHeader({
  step,
  onBack,
  title,
}: {
  step: number;
  onBack: () => void;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] text-[#d9cbbf]/70 hover:text-[#f6efe7]"
        >
          <ArrowLeft className="size-4" />
          Retour
        </button>
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#d9a7c9]/65">
          {step >= 6 ? "Aperçu" : `Étape ${Math.min(step + 1, 6)} / 6`}
        </p>
      </div>
      <div>
        <h1 className="font-display text-[1.8rem] leading-tight text-[#f6efe7]">
          {title}
        </h1>
        <div className="mt-3 flex gap-1.5" aria-hidden="true">
          {STEPS.map((label, index) => (
            <span
              key={label}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= Math.min(step, 5)
                  ? "bg-[#d9a7c9]/70"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-[12px] text-[#d9cbbf]/55">{label}</dt>
      <dd className="text-right text-[13px] text-[#f6efe7]">{value}</dd>
    </div>
  );
}
