"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  ArrowRight,
  Check,
  Clock,
  Copy,
  Flag,
  HandHeart,
  Loader2,
  Lock,
  MessageCircle,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useTrack } from "@/lib/analytics";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Aura, EmojiTile, Pill } from "@/components/ui/surface";
import { Logo } from "@/components/brand/logo";
import { modeTitle } from "@/lib/content";
import { useT, type MessageKey, type Translator } from "@/lib/i18n";
import {
  getCursor,
  getActiveDeviceToken,
  getPlayerName,
  getPlayerToken,
  setCursor as persistCursor,
  setPlayerToken,
} from "@/lib/game/storage";
import { markGamePlayed } from "@/lib/pwa/state";
import { cn } from "@/lib/utils";
import { ResultCard } from "./result-card";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type RoomState = FunctionReturnType<typeof api.sessions.roomState>;
type JoinState = Extract<RoomState, { needsJoin: true }>;
type PlayState = Extract<RoomState, { needsJoin: false }>;
type GameQuestion = PlayState["questions"][number];

const DEPTH_LABEL: Record<string, MessageKey> = {
  leger: "room.depthLeger",
  moyen: "room.depthMoyen",
  profond: "room.depthProfond",
};

type RevealOutcomeKind =
  | "meme_reponse"
  | "a_discuter"
  | "envie"
  | "prive"
  | "supprime";

const REVEAL_OUTCOMES: Array<{
  kind: RevealOutcomeKind;
  labelKey: MessageKey;
  icon: typeof Check;
  destructive?: boolean;
}> = [
  { kind: "meme_reponse", labelKey: "room.outcomeSame", icon: Check },
  { kind: "a_discuter", labelKey: "room.outcomeDiscuss", icon: MessageCircle },
  { kind: "envie", labelKey: "room.outcomeDesire", icon: Sparkles },
  { kind: "prive", labelKey: "room.outcomePrivate", icon: Lock },
  {
    kind: "supprime",
    labelKey: "room.outcomeDelete",
    icon: Trash2,
    destructive: true,
  },
];

/**
 * Rappel des préférences appliquées à cette partie (cf. PRD §3.F) —
 * et de la liberté de passer une question, sans justification.
 */
function personalizationLabel(
  t: Translator["t"],
  tp: Translator["tp"],
  session: PlayState["session"],
) {
  const avoided = session.avoidedThemeCount ?? 0;
  const parts: string[] = [];

  if (session.maxDepth) {
    parts.push(
      t("room.personalizationDepth", {
        depth: t(DEPTH_LABEL[session.maxDepth]),
      }),
    );
  }
  if (avoided > 0) {
    parts.push(tp("room.personalizationThemes", avoided));
  }
  if (parts.length === 0) return null;

  return t("room.personalization", { parts: parts.join(" · ") });
}

function followUp(t: Translator["t"], question: GameQuestion) {
  if (question.kind === "challenge") {
    return t("room.followUpChallenge");
  }
  if (question.same === true) {
    return t("room.followUpSame");
  }
  if (question.same === false) {
    return t("room.followUpDifferent");
  }
  return t("room.followUpDefault");
}

/* ------------------------------------------------------------------ */
/* Écrans de cadre                                                     */
/* ------------------------------------------------------------------ */

function Step({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background px-5 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="gradient-dawn absolute inset-x-0 top-0 h-96 opacity-70" />
        <Aura
          tone="lavender"
          drift="slower"
          className="absolute -left-24 top-0 size-72"
        />
        <Aura
          tone="coral"
          drift="slow"
          className="absolute -right-20 top-32 size-64"
        />
      </div>
      <div className="mx-auto w-full max-w-md">{children}</div>
    </div>
  );
}

function Splash() {
  return (
    <Step>
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Logo />
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    </Step>
  );
}

function NotFound() {
  const { t } = useT();
  return (
    <Step>
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <Logo />
        <h1 className="text-2xl">{t("room.notFoundTitle")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("room.notFoundBody")}
        </p>
        <Link href="/explorer" className="text-sm text-primary hover:underline">
          {t("space.exploreUniverses")}
        </Link>
      </div>
    </Step>
  );
}

function ShareCard({ token, compact }: { token: string; compact?: boolean }) {
  const { t } = useT();
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const inviteUrl = origin ? `${origin}/partie/${token}` : "";
  const message = t("invite.message", { url: inviteUrl });

  async function copy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Card className={cn("flex flex-col gap-3 p-5", compact && "p-4")}>
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-xl bg-coral-100 text-coral-600">
          <Share2 className="size-4" />
        </span>
        <h2 className="text-base leading-tight">{t("room.invitePartner")}</h2>
      </div>

      <p className="break-all rounded-xl border border-ivory-200 bg-ivory-100/70 px-3.5 py-2.5 font-mono text-[11px] text-graphite-600">
        {inviteUrl || "…"}
      </p>

      <div className="flex gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="press gradient-primary top-light inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-white shadow-[var(--shadow-glow)] hover:brightness-[1.06]"
        >
          <HandHeart className="size-4" />
          WhatsApp
        </a>
        <Button
          type="button"
          variant="outline"
          onClick={copy}
          disabled={!inviteUrl}
          className="flex-1"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? t("invite.copied") : t("room.copy")}
        </Button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Rejoindre                                                           */
/* ------------------------------------------------------------------ */

function JoinGate({
  token,
  state,
  onJoined,
}: {
  token: string;
  state: JoinState;
  onJoined: (playerToken: string) => void;
}) {
  const { t, locale } = useT();
  const join = useMutation(api.sessions.join);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(getPlayerName());
  }, []);

  if (!state.canJoin) {
    const reason = state.session.expired
      ? {
          title: t("room.expiredTitle"),
          body: t("room.expiredBody"),
        }
      : state.session.status === "terminee"
        ? {
            title: t("room.finishedTitle"),
            body: t("room.finishedBody"),
          }
        : {
            title: t("room.fullTitle"),
            body: t("room.fullBody"),
          };

    return (
      <Step>
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <Logo />
          <h1 className="text-xl font-semibold">{reason.title}</h1>
          <p className="text-sm text-muted-foreground">{reason.body}</p>
          <Link href="/explorer" className="text-sm text-primary hover:underline">
            {t("space.exploreUniverses")}
          </Link>
        </div>
      </Step>
    );
  }

  async function submit() {
    setPending(true);
    setError(null);
    try {
      const result = await join({
        token,
        name,
        deviceToken: getActiveDeviceToken(),
      });
      setPlayerToken(token, result.playerToken);
      onJoined(result.playerToken);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message.replace(/^.*Uncaught Error:\s*/, "")
          : t("room.joinError"),
      );
      setPending(false);
    }
  }

  return (
    <Step>
      <div className="flex flex-col items-center gap-6 py-12">
        <Logo />

        <Card className="flex w-full flex-col gap-5 p-6 text-center">
          <div className="gradient-tendresse top-light mx-auto flex size-14 items-center justify-center rounded-2xl text-white shadow-[var(--shadow-glow-lavender)]">
            <HandHeart className="size-7" />
          </div>

          <div>
            <h1 className="text-2xl">
              {state.experience?.title ?? t("room.invitationTitle")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {state.players[0]?.name
                ? t("room.invitedBy", { name: state.players[0].name })
                : t("room.invitedByUnknown")}{" "}
              {t("room.noInstall")}
            </p>
          </div>

          <label className="flex flex-col gap-1.5 text-left text-sm">
            <span className="font-medium">{t("room.firstName")}</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={24}
              autoComplete="given-name"
              placeholder={t("room.namePlaceholder")}
              className="h-12 w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 text-base outline-none transition-shadow focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60"
            />
          </label>

          {error && (
            <p className="rounded-xl border border-coral-200/70 bg-coral-100/70 px-3.5 py-2.5 text-sm text-coral-700">
              {error}
            </p>
          )}

          <Button
            type="button"
            size="lg"
            onClick={submit}
            disabled={pending || name.trim().length < 2}
            className="w-full"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowRight className="size-4" />
            )}
            {t("room.join")}
          </Button>

          <p className="text-xs text-muted-foreground">
            {modeTitle(state.session.mode, locale)} ·{" "}
            {state.session.durationMinutes} {t("common.minutes")}
          </p>
        </Card>
      </div>
    </Step>
  );
}

/* ------------------------------------------------------------------ */
/* Salle d'attente                                                     */
/* ------------------------------------------------------------------ */

function Lobby({
  token,
  state,
  onStart,
}: {
  token: string;
  state: PlayState;
  onStart: () => void;
}) {
  const { t, locale } = useT();
  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col items-center gap-3 text-center">
        <EmojiTile tone="lavender" size="lg" className="rise">
          {state.category?.emoji ?? "💞"}
        </EmojiTile>
        <h1 className="text-2xl">{state.experience?.title}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("room.lobbyReady", { name: state.me.name })}
        </p>
      </section>

      <ShareCard token={token} />

      <Card tone="ivory" className="flex items-center gap-3 p-4">
        <span
          aria-hidden="true"
          className="relative flex size-2.5"
        >
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-lavender-400 opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-lavender-500" />
        </span>
        <p className="text-sm text-muted-foreground">
          {t("room.waitingPartner")}
        </p>
      </Card>

      <Button type="button" variant="outline" size="lg" onClick={onStart}>
        {t("room.startAnswering")}
        <ArrowRight className="size-4" />
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        {t("room.lobbyHint", { mode: modeTitle(state.session.mode, locale) })}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Réponses révélées                                                   */
/* ------------------------------------------------------------------ */

function AnswerBubble({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | null;
  tone: "mine" | "theirs" | "skipped";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3.5",
        tone === "mine" && "border-ivory-200 bg-white/[0.04] shadow-[var(--shadow-soft)]",
        tone === "theirs" &&
          "border-lavender-200 bg-gradient-to-br from-lavender-100 to-lavender-200/60",
        tone === "skipped" && "border-dashed border-ivory-300 bg-ivory-100/60",
      )}
    >
      <p className={cn("eyebrow mb-1.5", tone === "theirs" && "text-lavender-700")}>
        {label}
      </p>
      <p className="text-sm leading-relaxed">{value ?? "—"}</p>
    </div>
  );
}

const REPORT_REASONS: MessageKey[] = [
  "room.reportInappropriate",
  "room.reportMalformed",
  "room.reportSeen",
];

function ReportBlock({ questionId }: { questionId: Id<"questions"> }) {
  const { t } = useT();
  const report = useMutation(api.reports.create);
  const [sent, setSent] = useState(false);

  async function send(reason: string) {
    try {
      await report({ targetType: "question", targetId: questionId, reason });
      setSent(true);
    } catch {
      setSent(false);
    }
  }

  return (
    <details className="mt-1">
      <summary className="flex min-h-8 cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
        <Flag className="size-3" />
        {t("room.report")}
      </summary>
      {sent ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {t("room.reportThanks")}
        </p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => send(t(reason))}
              className="press min-h-9 rounded-full border border-ivory-200 bg-white/[0.04] px-3.5 py-1.5 text-xs transition-colors hover:border-lavender-300"
            >
              {t(reason)}
            </button>
          ))}
        </div>
      )}
    </details>
  );
}

/* ------------------------------------------------------------------ */
/* Carte question                                                      */
/* ------------------------------------------------------------------ */

function QuestionCard({
  token,
  playerToken,
  question,
  partnerName,
  isLast,
  onNext,
}: {
  token: string;
  playerToken: string;
  question: GameQuestion;
  partnerName: string | null;
  isLast: boolean;
  onNext: () => void;
}) {
  const { t } = useT();
  const submit = useMutation(api.sessions.submitAnswer);
  const skip = useMutation(api.sessions.skipQuestion);
  const confirmReveal = useMutation(api.sessions.confirmReveal);
  const setRevealOutcome = useMutation(api.sessions.setRevealOutcome);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [revealPending, setRevealPending] = useState(false);
  const [outcomePending, setOutcomePending] = useState(false);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outcomeError, setOutcomeError] = useState<string | null>(null);

  async function send(value: string) {
    setPending(true);
    setError(null);
    try {
      await submit({
        token,
        playerToken,
        questionId: question.id,
        value,
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message.replace(/^.*Uncaught Error:\s*/, "")
          : t("room.answerError"),
      );
    } finally {
      setPending(false);
    }
  }

  async function pass() {
    setPending(true);
    setError(null);
    try {
      await skip({
        token,
        playerToken,
        questionId: question.id,
      });
    } catch {
      setError(t("room.skipError"));
    } finally {
      setPending(false);
    }
  }

  async function reveal() {
    setRevealPending(true);
    setError(null);
    try {
      await confirmReveal({
        token,
        playerToken,
        questionId: question.id,
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message.replace(/^.*Uncaught Error:\s*/, "")
          : "La révélation n'a pas pu se faire. Vous pouvez réessayer.",
      );
    } finally {
      setRevealPending(false);
    }
  }

  async function chooseOutcome(kind: RevealOutcomeKind) {
    setOutcomePending(true);
    setOutcomeError(null);
    try {
      await setRevealOutcome({
        token,
        playerToken,
        questionId: question.id,
        kind,
      });
      setDeleteArmed(false);
    } catch (cause) {
      setOutcomeError(
        cause instanceof Error
          ? cause.message.replace(/^.*Uncaught Error:\s*/, "")
          : "Impossible d'enregistrer ce choix. Vous pouvez réessayer.",
      );
    } finally {
      setOutcomePending(false);
    }
  }

  function handleOutcome(kind: RevealOutcomeKind) {
    if (outcomePending) return;
    if (kind === "supprime" && !deleteArmed) {
      setDeleteArmed(true);
      return;
    }
    void chooseOutcome(kind);
  }

  const answered = question.myValue !== null || question.mySkipped;
  const revealed = question.status === "revelee";
  const locked = question.status === "passee";

  // DuoReveal : on ne passe pas à la suite avant que le couple ait choisi
  // ce qu'il fait de la question révélée.
  const canContinue = locked
    ? true
    : !answered
      ? false
      : !partnerName
        ? true
        : revealed
          ? question.outcome !== null
          : false;

  const announcement = locked
    ? t("room.announcePassed")
    : revealed && partnerName
      ? question.same === true
        ? t("room.announceSame")
        : question.same === false
          ? t("room.announceDifferent")
          : t("room.announceReveal")
      : answered && partnerName
        ? question.bothAnswered
          ? question.myRevealReady
            ? t("room.revealWaiting", { name: partnerName })
            : t("room.revealBody")
          : t("room.announceAnswered", { name: partnerName })
        : "";

  return (
    <Card className="rise grain flex flex-col gap-5 p-5">
      <div className="relative z-10 flex items-center justify-between gap-2">
        <Pill tone="neutral">
          {t(DEPTH_LABEL[question.depth])} ·{" "}
          {question.kind === "challenge"
            ? t("room.kindChallenge")
            : question.kind === "choice"
              ? t("room.kindChoice")
              : t("room.kindOpen")}
        </Pill>
        {question.mySkipped && !locked && (
          <span className="text-[11px] text-muted-foreground">
            {t("room.skippedLower")}
          </span>
        )}
      </div>

      <p className="relative z-10 text-xl leading-snug">{question.prompt}</p>

      {/* Saisie ------------------------------------------------------ */}
      {!answered && question.kind === "choice" && question.options && (
        <div className="relative z-10 flex flex-col gap-2.5">
          {question.options.map((option, optionIndex) => (
            <button
              key={option}
              type="button"
              data-testid="option"
              disabled={pending}
              onClick={() => send(option)}
              className="press group flex min-h-13 items-center gap-3 rounded-xl border border-ivory-200 bg-white/[0.04] px-3.5 py-3 text-left text-sm shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:border-lavender-300 hover:shadow-[var(--shadow-lift)] disabled:opacity-50"
            >
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ivory-100 text-xs font-semibold text-graphite-500 transition-colors group-hover:bg-lavender-100 group-hover:text-lavender-700"
              >
                {String.fromCharCode(65 + optionIndex)}
              </span>
              <span className="leading-snug">{option}</span>
            </button>
          ))}
        </div>
      )}

      {!answered && question.kind === "open" && (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="announce">{t("room.yourAnswer")}</span>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
              maxLength={600}
              aria-label={t("room.yourAnswer")}
              placeholder={t("room.answerPlaceholder")}
              className="w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 py-3 text-base leading-relaxed outline-none transition-shadow focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60"
            />
          </label>
          <Button
            type="button"
            onClick={() => send(draft)}
            disabled={pending || draft.trim().length === 0}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {t("room.sendAnswer")}
          </Button>
        </div>
      )}

      {!answered && question.kind === "challenge" && (
        <Button
          type="button"
          size="lg"
          data-testid="challenge"
          onClick={() => send(t("room.challengeDone"))}
          disabled={pending}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {t("room.acceptChallenge")}
        </Button>
      )}

      {/* Ma réponse enregistrée ------------------------------------- */}
      {answered && (
        <AnswerBubble
          label={question.mySkipped ? t("room.youSkipped") : t("room.you")}
          value={question.mySkipped ? null : question.myValue}
          tone={question.mySkipped ? "skipped" : "mine"}
        />
      )}

      {/* DuoReveal : rien ne s'affiche avant l'accord explicite des deux. */}
      {answered && !revealed && !locked && partnerName && question.bothAnswered && (
        <div
          data-testid="reveal-gate"
          className="flex flex-col gap-3 rounded-xl border border-lavender-300/25 bg-lavender-100/50 p-4"
        >
          <div>
            <p className="text-sm font-medium">{t("room.revealTitle")}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {t("room.revealBody")}
            </p>
          </div>
          {question.myRevealReady ? (
            <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Clock className="size-4 shrink-0 text-lavender-600" />
              <span data-testid="reveal-waiting">
                {t("room.revealWaiting", { name: partnerName })}
              </span>
            </p>
          ) : (
            <Button
              type="button"
              size="sm"
              data-testid="reveal"
              onClick={reveal}
              disabled={revealPending}
            >
              {revealPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {t("room.revealButton")}
            </Button>
          )}
        </div>
      )}

      {/* Révélation : le voile givré se lève, une lueur champagne diffuse. */}
      {revealed && partnerName && (
        <div className="flex flex-col gap-3">
          <div className="reveal-veil relative">
            <span
              aria-hidden="true"
              className="reveal-halo pointer-events-none absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lavender-300/30 blur-2xl"
            />
            <AnswerBubble
              label={partnerName}
              value={question.partnerValue}
              tone="theirs"
            />
          </div>
          {question.same !== null && (
            <span
              data-testid="verdict"
              className={cn(
                "pop top-light self-start rounded-full px-3.5 py-1.5 text-xs font-semibold text-white",
                question.same
                  ? "gradient-primary shadow-[var(--shadow-glow)]"
                  : "gradient-tendresse shadow-[var(--shadow-glow-lavender)]",
              )}
            >
              {question.same
                ? t("room.sameAnswer")
                : t("room.differentAnswers")}
            </span>
          )}
          <p className="rounded-xl border border-ivory-200/80 bg-ivory-100/70 px-3.5 py-2.5 text-sm leading-relaxed text-graphite-600">
            {followUp(t, question)}
          </p>

          <div
            data-testid="reveal-outcomes"
            className="flex flex-col gap-3 rounded-xl border border-ivory-200/80 bg-ivory-100/60 p-4"
          >
            <div>
              <p className="text-sm font-medium">{t("room.outcomeTitle")}</p>
              <p className="mt-1 text-xs leading-relaxed text-graphite-500">
                {t("room.outcomeBody")}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {REVEAL_OUTCOMES.map((entry) => {
                const active = question.outcome === entry.kind;
                const Icon = entry.icon;
                const arming = entry.destructive && deleteArmed && !active;
                return (
                  <button
                    key={entry.kind}
                    type="button"
                    data-testid={`outcome-${entry.kind}`}
                    aria-pressed={active}
                    onClick={() => handleOutcome(entry.kind)}
                    disabled={outcomePending}
                    className={cn(
                      "press flex min-h-11 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all disabled:opacity-60",
                      active
                        ? entry.destructive
                          ? "border-coral-300 bg-coral-100 text-coral-700"
                          : "border-lavender-300 bg-lavender-200/60 text-lavender-700"
                        : arming
                          ? "border-coral-300 bg-coral-100/60 text-coral-700"
                          : "border-ivory-200 bg-white/[0.03] text-foreground hover:border-lavender-300/70",
                    )}
                  >
                    {outcomePending && active ? (
                      <Loader2 className="size-4 shrink-0 animate-spin" />
                    ) : (
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                    )}
                    {arming ? "Confirmer la suppression" : t(entry.labelKey)}
                  </button>
                );
              })}
            </div>
            {question.outcome === "supprime" ? (
              <p className="text-xs leading-relaxed text-graphite-500">
                {t("room.outcomeDeleted")}
              </p>
            ) : question.outcome ? (
              <p className="text-xs leading-relaxed text-graphite-500">
                {t("room.outcomeSaved")}
              </p>
            ) : null}
            {outcomeError && (
              <p className="rounded-xl border border-coral-200/70 bg-coral-100/70 px-3 py-2 text-xs text-coral-700">
                {outcomeError}
              </p>
            )}
          </div>
        </div>
      )}

      {locked && (
        <p
          data-testid="passed"
          className="rounded-xl border border-ivory-200/80 bg-ivory-100/70 px-3.5 py-2.5 text-sm leading-relaxed text-muted-foreground"
        >
          {t("room.passedNotice")}
        </p>
      )}

      {answered && !revealed && !locked && partnerName && !question.bothAnswered && (
        <p className="flex items-center gap-2.5 rounded-xl border border-ivory-200/80 bg-ivory-100/70 px-3.5 py-3 text-sm text-muted-foreground">
          <Clock className="size-4 shrink-0 text-lavender-600" />
          <span data-testid="waiting">
            {t("room.waitingFor", { name: partnerName })}
          </span>
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-coral-200/70 bg-coral-100/70 px-3.5 py-2.5 text-sm text-coral-700">
          {error}
        </p>
      )}

      <div className="relative z-10 flex items-center justify-between gap-2 border-t border-ivory-200/80 pt-4">
        {!answered ? (
          <button
            type="button"
            data-testid="skip"
            onClick={pass}
            disabled={pending}
            className="press min-h-9 rounded-full px-2 text-xs text-muted-foreground underline decoration-ivory-300 underline-offset-4 transition-colors hover:text-foreground disabled:opacity-50"
          >
            {t("room.pass")}
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">
            {revealed && partnerName
              ? question.outcome
                ? t("room.outcomeSaved")
                : t("room.outcomeChooseNext")
              : !revealed && partnerName && question.bothAnswered
                ? t("room.revealLocked", { name: partnerName })
                : t("room.revealedForBoth")}
          </span>
        )}

        {canContinue && (
          <Button type="button" size="sm" data-testid="next" onClick={onNext}>
            {isLast ? t("room.seeRecap") : t("room.nextQuestion")}
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>

      {/* Annonces vocales : jamais d'information portée par la couleur seule. */}
      <p
        role="status"
        aria-live="polite"
        data-testid="announce"
        className="announce"
      >
        {announcement}
      </p>

      <ReportBlock questionId={question.id} />
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Bilan                                                              */
/* ------------------------------------------------------------------ */

function Recap({ token, state }: { token: string; state: PlayState }) {
  const { t, tp } = useT();
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  // Une partie terminée rend l'installation légitime (cf. PRD §16.3).
  const finishedForInstall = state.session.status === "terminee";
  useEffect(() => {
    if (finishedForInstall) markGamePlayed();
  }, [finishedForInstall]);

  const revealed = state.questions.filter(
    (question) => question.status === "revelee",
  );
  const sameCount = revealed.filter((question) => question.same === true).length;
  const comparable = revealed.filter((question) => question.same !== null);
  const percentage =
    state.similarity === null ? null : Math.round(state.similarity * 100);

  const finished = state.session.status === "terminee";

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col items-center gap-3 text-center">
        <EmojiTile tone="coral" size="lg" className="rise text-3xl">
          {finished ? "✨" : "⏳"}
        </EmojiTile>
        <h1 className="text-2xl leading-tight">
          {finished ? t("room.thanksTitle") : t("room.almostTitle")}
        </h1>
        <p className="leading-relaxed text-muted-foreground">
          {finished
            ? tp("room.recapFinished", revealed.length, {
                me: state.me.name,
                partner: state.partner?.name ?? t("room.partnerFallback"),
              })
            : t("room.recapPending", {
                partner: state.partner?.name ?? t("room.partnerFallbackCap"),
              })}
        </p>
      </section>

      {percentage !== null && comparable.length > 0 && (
        <Card tone="dark" className="grain rise p-6 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-10 -top-12 size-40 rounded-full bg-coral-500/40 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 bottom-0 size-36 rounded-full bg-lavender-500/40 blur-3xl"
          />
          <div className="relative z-10 flex flex-col items-center gap-1">
            <p className="eyebrow text-white/60">{t("room.similarity")}</p>
            <p className="text-[3.25rem] leading-none text-white">
              {percentage}
              <span className="text-2xl align-top text-white/70"> %</span>
            </p>
            <p className="text-sm text-white/75">
              {tp("room.identicalAnswers", comparable.length)}
            </p>
            {sameCount === comparable.length && (
              <p className="mt-2 rounded-full bg-white/12 px-3 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm">
                {t("room.youKnowByHeart")}
              </p>
            )}
          </div>
        </Card>
      )}

      {finished && comparable.length > 0 && state.partner && (
        <ResultCard
          meName={state.me.name}
          partnerName={state.partner.name}
          percentage={percentage}
          comparable={comparable.length}
          sameCount={sameCount}
          experienceTitle={state.experience?.title ?? null}
        />
      )}

      <div className="flex flex-col gap-3">
        <p className="eyebrow pt-2">{t("room.detailTitle")}</p>
        {state.questions.map((question) => (
          <Card key={question.id} className="flex flex-col gap-3 p-4">
            <p className="text-base leading-snug">{question.prompt}</p>
            <div className="grid gap-2">
              <AnswerBubble
                label={state.me.name}
                value={question.mySkipped ? null : question.myValue}
                tone={question.mySkipped ? "skipped" : "mine"}
              />
              {state.partner && (
                <AnswerBubble
                  label={state.partner.name}
                  value={question.partnerValue}
                  tone="theirs"
                />
              )}
            </div>
            {question.same !== null && (
              <Pill tone={question.same ? "primary" : "lavender"}>
                {question.same
                  ? t("room.sameAnswer")
                  : t("room.differentAnswers")}
              </Pill>
            )}
          </Card>
        ))}
      </div>

      {!finished && !state.partner && (
        <ShareCard token={token} compact />
      )}

      <div className="flex flex-col gap-2.5 pt-1">
        <Link
          href="/explorer"
          className={cn(buttonVariants({ size: "lg" }), "w-full")}
        >
          {t("room.chooseOther")}
        </Link>
        <Link
          href="/notre-espace"
          className={cn(
            buttonVariants({ size: "lg", variant: "outline" }),
            "w-full",
          )}
        >
          {t("room.seeSpace")}
        </Link>
        <Link
          href="/accueil"
          className="pt-1 text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {t("room.backHome")}
        </Link>
      </div>

      {!finished && (
        <p className="text-center text-xs text-muted-foreground">
          {t("room.gameLink")}{" "}
          <span className="font-mono">{origin ? `${origin}/partie/${token}` : ""}</span>
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Orchestrateur                                                       */
/* ------------------------------------------------------------------ */

function Play({
  token,
  state,
  playerToken,
}: {
  token: string;
  state: PlayState;
  playerToken: string;
}) {
  const { t, tp } = useT();
  const finish = useMutation(api.sessions.finish);
  const track = useTrack();
  const [cursor, setCursor] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const trackedEntry = useRef(false);

  const questions = state.questions;

  useEffect(() => {
    if (cursor !== null || questions.length === 0) return;
    const saved = getCursor(token);
    const firstOpen = questions.findIndex(
      (question) => question.status === "a_repondre",
    );
    const initial =
      saved !== null
        ? Math.min(saved, questions.length - 1)
        : firstOpen >= 0
          ? firstOpen
          : 0;
    setCursor(initial);
  }, [cursor, questions, token]);

  // Entrée dans une partie (§19.1) : reprise si un curseur existait déjà,
  // sinon démarrage. Émis une seule fois par visite de salle.
  useEffect(() => {
    if (trackedEntry.current || cursor === null) return;
    trackedEntry.current = true;
    track(getCursor(token) !== null ? "session_resumed" : "game_started");
  }, [cursor, token, track]);

  function goTo(index: number) {
    const clamped = Math.max(0, Math.min(index, questions.length - 1));
    setCursor(clamped);
    persistCursor(token, clamped);
  }

  async function complete() {
    try {
      await finish({ token, playerToken });
    } catch {
      /* le bilan réactif prend le relais */
    }
  }

  if (state.session.status === "terminee" || state.me.finished) {
    return <Recap token={token} state={state} />;
  }

  const waitingForPartner =
    state.session.mode !== "defi-individuel" && !state.partner;
  const showQuestions =
    !waitingForPartner || started || state.progress.mine > 0;

  if (!showQuestions) {
    return <Lobby token={token} state={state} onStart={() => setStarted(true)} />;
  }

  const index = Math.min(cursor ?? 0, Math.max(0, questions.length - 1));
  const question = questions[index];

  if (!question) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <EmojiTile tone="lavender" size="lg">
          🌱
        </EmojiTile>
        <p className="text-sm text-muted-foreground">
          {t("room.noQuestions")}
        </p>
        <Link href="/explorer" className="text-sm text-primary hover:underline">
          {t("space.exploreUniverses")}
        </Link>
      </div>
    );
  }

  const isLast = index >= questions.length - 1;
  const answeredCount = questions.filter(
    (item) => item.myValue !== null || item.mySkipped,
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow truncate">
              {state.experience?.title}
            </p>
            <p className="text-lg leading-tight" data-testid="counter">
              {t("room.counter", {
                current: index + 1,
                total: questions.length,
              })}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs font-medium text-graphite-500">
              {state.partner
                ? t("room.partnerProgress", {
                    name: state.partner.name,
                    done: state.progress.partner,
                    total: state.progress.total,
                  })
                : t("room.playingAlone")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("room.youProgress", {
                done: answeredCount,
                total: questions.length,
              })}
            </p>
          </div>
        </div>

        <div
          role="progressbar"
          aria-label={t("room.progressLabel")}
          aria-valuemin={1}
          aria-valuemax={questions.length}
          aria-valuenow={index + 1}
          aria-valuetext={t("room.counter", {
            current: index + 1,
            total: questions.length,
          })}
          className="h-2 overflow-hidden rounded-full bg-ivory-200/80"
        >
          <div
            className="gradient-primary top-light h-full rounded-full transition-all motion-reduce:transition-none"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>

        {personalizationLabel(t, tp, state.session) !== null && (
          <p
            data-testid="personalization"
            className="rounded-xl border border-ivory-200/80 bg-ivory-100/60 px-3.5 py-2 text-xs leading-relaxed text-graphite-600"
          >
            {personalizationLabel(t, tp, state.session)}
          </p>
        )}
      </div>

      <QuestionCard
        key={question.id}
        token={token}
        playerToken={playerToken}
        question={question}
        partnerName={state.partner?.name ?? null}
        isLast={isLast}
        onNext={() => (isLast ? complete() : goTo(index + 1))}
      />

      <div className="flex items-center justify-between gap-3 px-1">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="press min-h-10 rounded-full px-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
        >
          {t("room.previous")}
        </button>

        <Link
          href="/accueil"
          className="press min-h-10 inline-flex items-center px-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("room.leave")}
        </Link>
      </div>

      {waitingForPartner && <ShareCard token={token} compact />}
    </div>
  );
}

export function GameRoom({ token }: { token: string }) {
  const [playerToken, setLocalPlayerToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const track = useTrack();
  const trackedOpen = useRef(false);

  useEffect(() => {
    setLocalPlayerToken(getPlayerToken(token));
    setHydrated(true);
  }, [token]);

  const state = useQuery(
    api.sessions.roomState,
    hydrated ? { token, playerToken: playerToken ?? "" } : "skip",
  );

  // Ouverture d'un lien d'invitation par le partenaire (§19.1).
  const needsJoin = state && state.found ? state.needsJoin : false;
  useEffect(() => {
    if (!needsJoin || trackedOpen.current) return;
    trackedOpen.current = true;
    track("invite_opened");
  }, [needsJoin, track]);

  if (!hydrated || state === undefined) return <Splash />;
  if (!state.found) return <NotFound />;

  if (state.needsJoin) {
    return (
      <JoinGate token={token} state={state} onJoined={setLocalPlayerToken} />
    );
  }

  return <Play token={token} state={state} playerToken={playerToken ?? ""} />;
}
