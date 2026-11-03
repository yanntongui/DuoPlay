"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Coffee,
  Heart,
  Pause,
  Pencil,
  Play,
  RefreshCw,
  SkipForward,
  Sparkles,
  Square,
} from "lucide-react";
import type { AiSessionDoc } from "@/components/ai/types";
import { AiBadge, AiButton, AiCard, AiNotice } from "@/components/ai/ai-ui";

type Step = AiSessionDoc["steps"][number];
type Action =
  | "accept"
  | "modify"
  | "skip"
  | "replace"
  | "pause"
  | "resume"
  | "finish"
  | "revoke";

export function AiLive({
  session,
  onRecord,
  onAlternative,
  onExit,
}: {
  session: AiSessionDoc;
  onRecord: (action: Action, stepIndex?: number) => Promise<void>;
  onAlternative: (stepIndex: number) => Promise<Step | null>;
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [steps, setSteps] = useState<Step[]>(session.steps);
  const [paused, setPaused] = useState(false);
  const [closed, setClosed] = useState<null | "completed" | "revoked">(null);
  const [sheet, setSheet] = useState<null | "replace" | "modify">(null);
  const [editText, setEditText] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const current = steps[index];
  const total = steps.length;

  function next() {
    if (index + 1 >= total) {
      setClosed("completed");
      void onRecord("finish", index);
    } else {
      setIndex((value) => value + 1);
    }
  }

  async function accept() {
    setBusy(true);
    await onRecord("accept", index);
    setBusy(false);
    next();
  }

  async function skip() {
    setBusy(true);
    await onRecord("skip", index);
    setBusy(false);
    setSheet(null);
    next();
  }

  async function pause() {
    setBusy(true);
    await onRecord("pause", index);
    setBusy(false);
    setPaused(true);
    setSheet(null);
  }

  async function resume() {
    setBusy(true);
    await onRecord("resume", index);
    setBusy(false);
    setPaused(false);
  }

  async function finish() {
    setBusy(true);
    await onRecord("finish", index);
    setBusy(false);
    setSheet(null);
    setPaused(false);
    setClosed("completed");
  }

  async function revoke() {
    setBusy(true);
    await onRecord("revoke", index);
    setBusy(false);
    setSheet(null);
    setPaused(false);
    setClosed("revoked");
  }

  async function soften() {
    setBusy(true);
    const alternative = await onAlternative(index);
    setBusy(false);
    if (alternative) {
      setSteps((current) =>
        current.map((step, stepIndex) =>
          stepIndex === index ? alternative : step,
        ),
      );
      setNotice("Une version plus douce a remplacé cette étape.");
      setSheet(null);
    } else {
      setNotice("L’alternative n’est pas disponible. Vous pouvez passer l’étape.");
    }
  }

  async function saveEdit() {
    const value = editText.trim();
    if (!value) return;
    setSteps((current) =>
      current.map((step, stepIndex) =>
        stepIndex === index ? { ...step, body: value } : step,
      ),
    );
    setBusy(true);
    await onRecord("modify", index);
    setBusy(false);
    setSheet(null);
    setNotice("Votre formulation est conservée pour cette session.");
  }

  function backToQuestion() {
    setSheet(null);
    setIndex(0);
  }

  if (closed) {
    return (
      <div className="flex flex-col gap-5 pb-16">
        <AiCard className="ai-rise p-6 sm:p-8">
          <div className="flex size-12 items-center justify-center rounded-full border border-[#d9a7c9]/30 bg-[#d9a7c9]/12">
            <Heart className="size-5 text-[#e8c8dd]" />
          </div>
          <h1 className="mt-4 font-display text-[2rem] leading-tight text-[#f6efe7]">
            {closed === "completed"
              ? "Merci d’avoir pris ce moment."
              : "La session s’arrête ici."}
          </h1>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-[#d9cbbf]/75">
            {closed === "completed"
              ? "Il n’y a rien à réussir ni à noter. Ce que vous avez vécu vous appartient."
              : "Aucune justification n’est nécessaire. Vous pouvez reprendre quand le moment vous conviendra."}
          </p>

          {closed === "completed" ? (
            <div className="mt-5 rounded-2xl border border-[#d9a7c9]/18 bg-white/[0.03] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d9a7c9]/70">
                Une dernière question, si vous en avez envie
              </p>
              <p className="mt-1.5 font-display text-xl leading-snug text-[#f6efe7]">
                {session.finalQuestion}
              </p>
              <p className="mt-2 text-[12px] text-[#d9cbbf]/55">
                Aucune réponse n’est enregistrée ici. Parlez-en ensemble, ou
                laissez la question tranquille.
              </p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <AiButton variant="primary" onClick={onExit}>
              Revenir à DuoPlay AI
            </AiButton>
            <AiButton variant="ghost" onClick={onExit}>
              Voir l’historique
            </AiButton>
          </div>
          <p className="mt-4 text-[11.5px] text-[#d9cbbf]/45">
            Cette session reste dans votre historique 30 jours, et peut être
            supprimée en un tap.
          </p>
        </AiCard>
      </div>
    );
  }

  if (paused) {
    return (
      <div className="flex flex-col gap-5 pb-16">
        <AiCard className="ai-rise p-6 sm:p-8">
          <div className="flex size-12 items-center justify-center rounded-full border border-[#d9a7c9]/30 bg-[#d9a7c9]/12">
            <Coffee className="size-5 text-[#e8c8dd]" />
          </div>
          <h1 className="mt-4 font-display text-[2rem] leading-tight text-[#f6efe7]">
            Session en pause
          </h1>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-[#d9cbbf]/75">
            Rien ne se perd. Vous pouvez reprendre quand vous le souhaitez, ou
            terminer ici sans explication.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <AiButton variant="primary" onClick={resume} disabled={busy}>
              <Play className="size-4" />
              Reprendre
            </AiButton>
            <AiButton variant="ghost" onClick={finish} disabled={busy}>
              Terminer la session
            </AiButton>
          </div>
        </AiCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-16">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-[13px] text-[#d9cbbf]/70 hover:text-[#f6efe7]"
        >
          <ArrowLeft className="size-4" />
          Quitter
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-[0.16em] text-[#d9a7c9]/65">
            Étape {index + 1} / {total}
          </span>
          <button
            type="button"
            onClick={pause}
            aria-label="Mettre la session en pause"
            className="flex size-9 items-center justify-center rounded-full border border-[#d9a7c9]/22 text-[#d9cbbf]/75 hover:bg-white/5 hover:text-[#f6efe7]"
          >
            <Pause className="size-4" />
          </button>
        </div>
      </div>

      <AiCard className="p-5 sm:p-7">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {steps.map((step, stepIndex) => (
            <span
              key={`${step.title}-${stepIndex}`}
              className={`h-1 flex-1 rounded-full ${
                stepIndex < index
                  ? "bg-[#d9a7c9]/45"
                  : stepIndex === index
                    ? "bg-[#d9a7c9]/85"
                    : "bg-white/10"
              }`}
            />
          ))}
        </div>

        <div className="mt-5">
          <AiBadge />
          <h1 className="mt-3 font-display text-[1.9rem] leading-tight text-[#f6efe7]">
            {current.title}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-[#e8d6e2]/85">
            {current.body}
          </p>
          <p className="mt-3 text-[11.5px] text-[#d9cbbf]/45">
            Proposition · {current.minutes} min indicative · rien n’est obligatoire
          </p>
        </div>

        {notice ? (
          <div className="mt-4">
            <AiNotice tone="success" title="C’est noté">
              {notice}
            </AiNotice>
          </div>
        ) : null}

        <div className="ai-rule my-5" />

        <div className="grid gap-2 sm:grid-cols-3">
          <AiButton variant="primary" onClick={accept} disabled={busy}>
            <Check className="size-4" />
            Accepter
          </AiButton>
          <AiButton
            variant="soft"
            onClick={() => {
              setEditText(current.body);
              setSheet("modify");
            }}
            disabled={busy}
          >
            <Pencil className="size-4" />
            Modifier
          </AiButton>
          <AiButton variant="soft" onClick={skip} disabled={busy}>
            <SkipForward className="size-4" />
            Passer
          </AiButton>
          <AiButton variant="soft" onClick={() => setSheet("replace")} disabled={busy}>
            <RefreshCw className="size-4" />
            Remplacer
          </AiButton>
          <AiButton variant="soft" onClick={pause} disabled={busy}>
            <Pause className="size-4" />
            Pause
          </AiButton>
          <AiButton variant="danger" onClick={finish} disabled={busy}>
            <Square className="size-4" />
            Terminer
          </AiButton>
        </div>

        <p className="mt-4 text-[11.5px] leading-relaxed text-[#d9cbbf]/50">
          Chaque partenaire peut dire non. Une limite posée s’applique
          immédiatement et pour toute la session.
        </p>

        <button
          type="button"
          onClick={revoke}
          disabled={busy}
          className="mt-2 text-[11.5px] text-[#d9cbbf]/45 underline-offset-4 hover:text-[#f0b6c9] hover:underline"
        >
          Arrêter immédiatement, sans terminer le moment
        </button>
      </AiCard>

      {sheet ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-3 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={
            sheet === "replace" ? "Que souhaitez-vous faire ?" : "Modifier l’étape"
          }
        >
          <div className="ai-surface ai-rise w-full max-w-lg p-5">
            {sheet === "replace" ? (
              <>
                <h2 className="font-display text-2xl text-[#f6efe7]">
                  Que souhaitez-vous faire ?
                </h2>
                <p className="mt-1 text-[12.5px] text-[#d9cbbf]/60">
                  Aucune de ces options n’a besoin d’être justifiée.
                </p>
                <div className="mt-4 grid gap-2">
                  <AiButton variant="soft" onClick={() => setSheet(null)}>
                    Continuer cette étape
                    <ArrowRight className="size-4" />
                  </AiButton>
                  <AiButton variant="soft" onClick={soften} disabled={busy}>
                    <Sparkles className="size-4" />
                    Choisir une alternative plus douce
                  </AiButton>
                  <AiButton variant="soft" onClick={skip} disabled={busy}>
                    <SkipForward className="size-4" />
                    Passer cette étape
                  </AiButton>
                  <AiButton variant="soft" onClick={backToQuestion}>
                    Revenir à une question
                  </AiButton>
                  <AiButton variant="soft" onClick={pause} disabled={busy}>
                    <Pause className="size-4" />
                    Mettre en pause
                  </AiButton>
                  <AiButton variant="danger" onClick={finish} disabled={busy}>
                    Terminer la session
                  </AiButton>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl text-[#f6efe7]">
                  Modifier cette étape
                </h2>
                <p className="mt-1 text-[12.5px] text-[#d9cbbf]/60">
                  Reformulez-la avec vos mots. La modification ne s’applique
                  qu’à cette session.
                </p>
                <textarea
                  value={editText}
                  onChange={(event) => setEditText(event.target.value)}
                  rows={5}
                  maxLength={600}
                  className="ai-input mt-4 resize-none"
                />
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <AiButton
                    variant="primary"
                    onClick={saveEdit}
                    disabled={busy || !editText.trim()}
                  >
                    Enregistrer
                  </AiButton>
                  <AiButton variant="ghost" onClick={() => setSheet(null)}>
                    Annuler
                  </AiButton>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
