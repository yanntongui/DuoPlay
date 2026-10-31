"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Flame, Loader2, Lock, Share2, SkipForward, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tilt } from "@/components/ui/tilt";
import { Pill, SectionTitle } from "@/components/ui/surface";
import { useDeviceToken } from "@/lib/game/use-device";
import { LOCALE_TAG, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function todayLabel(dateKey: string, tag: string) {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  return date.toLocaleDateString(tag, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function DailyChallenge() {
  const { t, tp, locale } = useT();
  const deviceToken = useDeviceToken();
  const ready = deviceToken !== undefined;
  const today = useQuery(
    api.daily.today,
    ready ? { deviceToken } : "skip",
  );
  const history = useQuery(
    api.daily.history,
    ready ? { deviceToken, limit: 7 } : "skip",
  );
  const complete = useMutation(api.daily.complete);

  // Série affichée : **à deux** dès qu'un partenaire est relié (ce qui compte
  // quand on joue ensemble), sinon la série solitaire.
  const streak = today
    ? today.streakScope === "couple"
      ? { scope: "couple" as const, value: today.coupleStreakDays }
      : { scope: "solo" as const, value: today.streakDays }
    : { scope: "solo" as const, value: 0 };

  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  if (!ready || today === undefined) {
    return <div className="skel h-56 rounded-xl border border-ivory-200/70" />;
  }

  if (!today) {
    return (
      <Card tone="ivory" className="p-6 text-sm text-muted-foreground">
        {t("daily.notPublished")}
      </Card>
    );
  }

  const participated = Boolean(today.mine) && !today.mine?.skipped;
  const skippedToday = Boolean(today.mine?.skipped);
  const partnerDone = Boolean(today.partner) && !today.partner?.skipped;
  const bothDone = participated && partnerDone;

  async function send(value: string, skipped: boolean) {
    if (deviceToken === undefined) return;
    setPending(true);
    setError(null);
    try {
      await complete({ deviceToken, value, skipped });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message.replace(/^.*Uncaught Error:\s*/, "")
          : t("daily.saveFailed"),
      );
    } finally {
      setPending(false);
    }
  }

  const shareText = t("daily.shareText", {
    prompt: today.challenge.prompt,
    url: `${origin}/defi`,
  });

  return (
    <div className="flex flex-col gap-6">
      <Tilt>
        <Card className="rise top-light overflow-hidden shadow-[var(--shadow-lift)]">
          <div className="gradient-tendresse grain relative p-6 text-white">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full bg-white/20 blur-3xl"
            />
            <div className="relative z-10 mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium capitalize backdrop-blur-sm">
                {todayLabel(today.date, LOCALE_TAG[locale])}
              </span>
              {streak.value > 0 && (
                <span
                  data-testid="streak"
                  data-scope={streak.scope}
                  className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium backdrop-blur-sm"
                >
                  <Flame className="size-3.5" />
                  {tp(
                    streak.scope === "couple"
                      ? "daily.streakCouple"
                      : "daily.streak",
                    streak.value,
                  )}
                </span>
              )}
            </div>
            <p className="eyebrow relative z-10 text-white/75">
              {today.challenge.title}
            </p>
            <p
              className="relative z-10 mt-1 text-2xl leading-snug"
              data-testid="daily-prompt"
            >
              {today.challenge.prompt}
            </p>
          </div>

          <div className="flex flex-col gap-4 p-5">
            {!today.mine && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3.5 shrink-0" aria-hidden="true" />
                {today.partnerName
                  ? t("daily.sealedUntilPartner", { name: today.partnerName })
                  : t("daily.sealedUntilReveal")}
              </p>
            )}

            {!today.mine && today.challenge.options && (
              <div className="flex flex-col gap-2">
                {today.challenge.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    data-testid="daily-option"
                    disabled={pending}
                    onClick={() => send(option, false)}
                    className="press rounded-xl border border-ivory-200/80 bg-ivory-100/60 px-4 py-3.5 text-left text-sm font-medium transition-colors hover:border-coral-300 hover:bg-coral-100/70 disabled:opacity-50"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {!today.mine && !today.challenge.options && (
              <div className="flex flex-col gap-2">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={3}
                  maxLength={600}
                  data-testid="daily-answer"
                  placeholder={t("room.answerPlaceholder")}
                  className="w-full rounded-xl border border-ivory-200/80 bg-ivory-100/60 px-4 py-3 text-sm leading-relaxed outline-none transition-colors placeholder:text-graphite-400 focus-visible:border-coral-300 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button
                  type="button"
                  data-testid="daily-submit"
                  onClick={() => send(draft, false)}
                  disabled={pending || draft.trim().length === 0}
                  className="sheen"
                >
                  {pending && <Loader2 className="size-4 animate-spin" />}
                  {today.challenge.kind === "mission"
                    ? t("daily.submitMission")
                    : t("daily.submit")}
                </Button>
              </div>
            )}

            {today.mine && (
              <div
                className={cn(
                  "flex flex-col gap-3",
                  bothDone && "reveal-veil",
                )}
              >
                {bothDone && (
                  <div
                    data-testid="daily-reveal"
                    className="pop relative flex flex-col items-center gap-1 overflow-hidden rounded-xl border border-lavender-300/25 bg-lavender-100 px-4 py-3 text-center"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-6 -top-8 h-16 rounded-full bg-lavender-300/25 blur-2xl"
                    />
                    <span className="relative text-xl" aria-hidden="true">
                      🥂
                    </span>
                    <span className="relative font-display text-lg leading-tight">
                      {t("daily.bothParticipated")}
                    </span>
                    <span className="relative text-xs text-muted-foreground">
                      {t("daily.revealHint")}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-1 rounded-xl bg-ivory-100 px-3.5 py-2.5">
                  <span className="eyebrow">{t("daily.you")}</span>
                  <span className="text-sm leading-relaxed">
                    {today.mine.skipped
                      ? t("daily.skippedToday")
                      : today.mine.value}
                  </span>
                </div>

                {today.partner && today.partnerName ? (
                  <div
                    data-testid="daily-partner"
                    className="flex flex-col gap-1 rounded-xl bg-lavender-100/70 px-3.5 py-2.5"
                  >
                    <span className="eyebrow text-lavender-700">
                      {today.partnerName}
                    </span>
                    <span className="text-sm leading-relaxed">
                      {today.partner.skipped
                        ? t("daily.partnerSkipped")
                        : today.partner.value}
                    </span>
                  </div>
                ) : today.partnerName ? (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="size-3.5 shrink-0" aria-hidden="true" />
                    {t("daily.waitingSealed", { name: today.partnerName })}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t("daily.invitePartner")}
                  </p>
                )}

                {(participated || skippedToday) && (
                  <span data-testid="daily-done" className="self-start">
                    <Pill tone="primary">
                      <Check className="size-3.5" />
                      {skippedToday
                        ? t("daily.skippedToday")
                        : bothDone
                          ? t("daily.crossChallenge")
                          : t("daily.registered")}
                    </Pill>
                  </span>
                )}
              </div>
            )}

            {error && (
              <p className="rounded-xl bg-coral-100 px-3.5 py-2.5 text-sm text-coral-700">
                {error}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="press inline-flex h-11 items-center gap-2 rounded-full border border-ivory-300 bg-card/90 px-4 text-sm font-medium shadow-[var(--shadow-soft)] transition-colors hover:border-lavender-300 hover:shadow-[var(--shadow-lift)]"
              >
                <Share2 className="size-4" />
                {t("daily.share")}
              </a>

              {!today.mine && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-testid="daily-skip"
                  disabled={pending}
                  onClick={() => send("", true)}
                  className="gap-1.5 text-muted-foreground"
                >
                  <SkipForward className="size-4" />
                  {t("daily.skip")}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </Tilt>

      {history && history.length > 0 && (
        <section>
          <SectionTitle
            eyebrow={t("daily.historyEyebrow")}
            title={t("daily.historyTitle")}
          />
          <div className="flex flex-col gap-2.5">
            {history.map((entry) => (
              <Card key={entry.date} tone="ivory" className="flex flex-col gap-1 p-4">
                <span className="eyebrow capitalize">
                  {todayLabel(entry.date, LOCALE_TAG[locale])}
                </span>
                <span className="text-sm font-medium leading-snug">
                  {entry.prompt}
                </span>
                <span className="text-sm text-muted-foreground">
                  {entry.skipped ? t("daily.historySkipped") : entry.value}
                </span>
              </Card>
            ))}
          </div>
        </section>
      )}

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Sparkles className="size-3.5" aria-hidden="true" />
        {t("daily.footer")}
      </p>
    </div>
  );
}
