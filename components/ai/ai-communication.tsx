"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  MessageCircleHeart,
  Pencil,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  COMM_INTENTS,
  COMM_TONES,
  directMessage,
  softenMessage,
  type CommIntent,
  type CommTone,
} from "@/convex/ai/communication";
import {
  AiBadge,
  AiButton,
  AiCard,
  AiChip,
  AiNotice,
  AiSectionTitle,
  AiSkeleton,
} from "@/components/ai/ai-ui";

export function AiCommunication({
  deviceToken,
  onBack,
}: {
  deviceToken: string;
  onBack: () => void;
}) {
  const generate = useMutation(api.ai.communication);
  const [intent, setIntent] = useState<CommIntent>("envie");
  const [tone, setTone] = useState<CommTone>("doux");
  const [draft, setDraft] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    setCopied(false);
    setEditing(false);
    try {
      const [response] = await Promise.all([
        generate({ deviceToken, intent, tone }),
        new Promise((resolve) => setTimeout(resolve, 450)),
      ]);
      if (response.ok) {
        setDraft(response.draft);
      } else {
        setError(response.message);
        setDraft(null);
      }
    } catch {
      setError(
        "La formulation n’a pas abouti. Vérifiez votre connexion et réessayez.",
      );
      setDraft(null);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 pb-16">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] text-[#d9cbbf]/70 hover:text-[#f6efe7]"
        >
          <ArrowLeft className="size-4" />
          DuoPlay AI
        </button>
        <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[#d9a7c9]/65">
          <MessageCircleHeart className="size-3.5" />
          Aide à formuler
        </span>
      </div>

      <div>
        <h1 className="font-display text-[2rem] leading-tight text-[#f6efe7]">
          Dire les choses, sans reproche
        </h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[#d9cbbf]/65">
          Choisissez ce que vous aimeriez exprimer, puis un ton. DuoPlay AI
          propose une formulation ; vous pouvez la modifier, la copier ou
          l’effacer. Rien n’est envoyé à votre partenaire.
        </p>
      </div>

      <AiCard className="p-5 sm:p-6">
        <AiSectionTitle eyebrow="Votre intention" title="Que voulez-vous dire ?" />
        <div className="flex flex-wrap gap-2">
          {COMM_INTENTS.map((entry) => (
            <AiChip
              key={entry.value}
              active={intent === entry.value}
              onClick={() => setIntent(entry.value)}
              title={entry.hint}
            >
              {entry.label}
            </AiChip>
          ))}
        </div>

        <div className="ai-rule my-5" />

        <p className="mb-2 text-[12px] font-medium text-[#d9cbbf]/80">Ton</p>
        <div className="flex flex-wrap gap-2">
          {COMM_TONES.map((entry) => (
            <AiChip
              key={entry.value}
              active={tone === entry.value}
              onClick={() => setTone(entry.value)}
            >
              {entry.label}
            </AiChip>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <AiButton variant="primary" onClick={submit} disabled={loading}>
            <Sparkles className="size-4" />
            Proposer une formulation
          </AiButton>
          <p className="text-[11px] text-[#d9cbbf]/45">
            Aucun message n’est enregistré. Vous restez libre de l’envoyer ou
            non.
          </p>
        </div>
      </AiCard>

      {error ? (
        <AiNotice tone="quota" title="Formulation indisponible">
          {error}
        </AiNotice>
      ) : null}

      {loading ? (
        <AiCard className="p-5">
          <p className="flex items-center gap-2 text-[13px] text-[#d9cbbf]/70">
            <RefreshCw className="size-3.5 animate-spin" />
            On cherche les mots justes…
          </p>
          <div className="mt-4">
            <AiSkeleton lines={3} />
          </div>
        </AiCard>
      ) : null}

      {draft && !loading ? (
        <AiCard className="ai-rise p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <AiBadge />
            <span className="text-[11px] text-[#d9cbbf]/45">
              Proposition · à adapter avec vos mots
            </span>
          </div>

          {editing ? (
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={6}
              className="ai-input mt-3 resize-none"
              aria-label="Modifier la formulation"
            />
          ) : (
            <blockquote className="mt-3 rounded-2xl border-l-2 border-[#d9a7c9]/50 bg-white/[0.03] px-4 py-3 font-display text-[1.15rem] leading-relaxed text-[#f6efe7]">
              « {draft} »
            </blockquote>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <AiButton variant="primary" onClick={copy}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copié" : "Copier"}
            </AiButton>
            <AiButton variant="soft" onClick={() => setEditing((value) => !value)}>
              <Pencil className="size-4" />
              {editing ? "Terminer" : "Modifier"}
            </AiButton>
            <AiButton
              variant="soft"
              onClick={() => setDraft((value) => (value ? softenMessage(value) : value))}
            >
              Plus doux
            </AiButton>
            <AiButton
              variant="soft"
              onClick={() => setDraft((value) => (value ? directMessage(value) : value))}
            >
              Plus direct
            </AiButton>
            <AiButton
              variant="ghost"
              onClick={() => {
                setDraft(null);
                setEditing(false);
              }}
            >
              <Trash2 className="size-4" />
              Supprimer
            </AiButton>
          </div>

          <p className="mt-4 text-[11.5px] leading-relaxed text-[#d9cbbf]/50">
            DuoPlay AI ne prend pas parti et ne désigne aucun responsable. Ce
            n’est ni un conseil thérapeutique, ni une vérité sur votre couple.
          </p>
        </AiCard>
      ) : null}

      <AiCard className="p-5" soft>
        <p className="font-display text-lg text-[#f6efe7]">
          Quelques repères
        </p>
        <ul className="mt-2 space-y-1.5 text-[12.5px] leading-relaxed text-[#d9cbbf]/65">
          <li>· Une proposition n’est pas une attente.</li>
          <li>· Chacun peut dire non, sans avoir à se justifier.</li>
          <li>· Une limite doit être respectée immédiatement.</li>
          <li>· Le consentement est libre, explicite et réversible.</li>
        </ul>
      </AiCard>
    </div>
  );
}
