"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Loader2, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmojiTile, Pill } from "@/components/ui/surface";
import { IntimacyCrown } from "@/components/game/intimacy-crown";
import { GAME_MODES } from "@/lib/content";
import { localize, useT } from "@/lib/i18n";
import {
  DEPTHS,
  DURATIONS,
  clampDuration,
  findMood,
  type DepthSlug,
} from "@/lib/personalization";
import {
  getActiveDeviceToken,
  getPlayerName,
  rememberPlayerName,
  setPlayerToken,
} from "@/lib/game/storage";
import {
  CONSENT_DECISIONS,
  isStopDecision,
  saveConsent,
  useConsent,
  type ConsentDecision,
} from "@/lib/consent";
import { cn } from "@/lib/utils";

type SetupData = NonNullable<
  FunctionReturnType<typeof api.experiences.publicBySlug>
>;
type Mode = SetupData["experience"]["modes"][number];

export function SetupForm({
  slug,
  journey,
  journeyDayIndex,
  mood,
}: {
  slug: string;
  /** Étape de parcours dont cette partie est l'action (cf. §3.E). */
  journey?: string;
  journeyDayIndex?: number;
  /** Ambiance choisie à l'exploration (cf. §11.2). */
  mood?: string;
}) {
  const { t, tp, locale } = useT();
  const data = useQuery(api.experiences.publicBySlug, { slug });
  const createSession = useMutation(api.sessions.create);
  const router = useRouter();

  const [name, setName] = useState("");
  const [mode, setMode] = useState<Mode | null>(null);
  const [duration, setDuration] = useState(15);
  const [maxDepth, setMaxDepth] = useState<DepthSlug | null>(null);
  const [avoidThemes, setAvoidThemes] = useState<string[]>([]);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentChoice, setConsentChoice] = useState<ConsentDecision | null>(
    null,
  );
  const consent = useConsent();

  // Préférences enregistrées sur cet appareil (cf. §3.F) — chargées une fois.
  const storedPreferences = useQuery(
    api.preferences.get,
    preferencesLoaded ? { deviceToken: getActiveDeviceToken() } : "skip",
  );

  useEffect(() => {
    setPreferencesLoaded(true);
    setName(getPlayerName());
  }, []);

  useEffect(() => {
    if (!data || mode !== null) return;
    setMode(data.experience.modes[0]);
    setDuration(clampDuration(data.experience.estimatedMinutes));
  }, [data, mode]);

  // Les préférences du couple ne s'appliquent que tant que l'utilisateur n'a
  // rien touché : elles pré-remplissent, elles ne verrouillent pas.
  const applied = useRef(false);
  useEffect(() => {
    if (applied.current || !storedPreferences || mode === null) return;
    applied.current = true;
    if (storedPreferences.maxDepth) setMaxDepth(storedPreferences.maxDepth);
    if (storedPreferences.avoidThemes.length > 0) {
      setAvoidThemes(storedPreferences.avoidThemes);
    }
    if (storedPreferences.mode) setMode(storedPreferences.mode);
    if (storedPreferences.durationMinutes) {
      setDuration(clampDuration(storedPreferences.durationMinutes));
    }
  }, [storedPreferences, mode]);

  const preview = useQuery(
    api.experiences.preview,
    data
      ? {
          slug,
          maxDepth: maxDepth ?? undefined,
          avoidThemes: avoidThemes.length > 0 ? avoidThemes : undefined,
          durationMinutes: duration,
        }
      : "skip",
  );

  const themeOptions = useMemo(() => data?.themes ?? [], [data]);

  if (data === undefined) {
    return (
      <div className="h-64 animate-pulse rounded-xl border border-border bg-muted" />
    );
  }

  if (data === null) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        {t("setup.unavailable")}
      </Card>
    );
  }

  const { experience, category, questionCount } = data;
  const selectedMood = findMood(mood);
  const plannedCount = preview?.count ?? questionCount;
  const tooFew = preview !== undefined && preview !== null && preview.count < 3;
  const isAdult = category?.slug === "entre-nous";
  const needsAge = isAdult && !consent.ageConfirmed;
  const consentStopped =
    consentChoice !== null && isStopDecision(consentChoice);
  const canStart =
    name.trim().length >= 2 &&
    Boolean(mode) &&
    plannedCount > 0 &&
    consentChoice !== null &&
    !consentStopped &&
    (!isAdult || consent.ageConfirmed);

  function chooseConsent(value: ConsentDecision) {
    setConsentChoice(value);
    saveConsent(
      isAdult ? { depth: value, adult: value } : { depth: value },
    );
  }

  function toggleTheme(theme: string) {
    setAvoidThemes((current) =>
      current.includes(theme)
        ? current.filter((item) => item !== theme)
        : [...current, theme],
    );
  }

  async function start() {
    if (!mode || !canStart) return;
    setPending(true);
    setError(null);
    try {
      const result = await createSession({
        experienceId: experience._id,
        mode,
        durationMinutes: duration,
        creatorName: name,
        deviceToken: getActiveDeviceToken(),
        journeySlug: journey,
        journeyDayIndex,
        mood,
        maxDepth: maxDepth ?? undefined,
        avoidThemes: avoidThemes.length > 0 ? avoidThemes : undefined,
      });
      setPlayerToken(result.token, result.playerToken);
      rememberPlayerName(name.trim());
      router.push(`/partie/${result.token}`);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message.replace(/^.*Uncaught Error:\s*/, "")
          : t("setup.createError"),
      );
      setPending(false);
    }
  }

  const availableModes = GAME_MODES.filter((item) =>
    (experience.modes as readonly string[]).includes(item.slug),
  );

  const depthCranks = [
    { id: "all", label: t("setup.depthAll"), testId: "depth-all" },
    ...DEPTHS.map((item) => ({
      id: item.slug,
      label: localize(locale, item.title, item.titleEn),
      testId: `depth-${item.slug}`,
    })),
  ];
  const selectedDepth = DEPTHS.find((depth) => depth.slug === maxDepth);

  return (
    <div className="flex flex-col gap-6">
      {journey && journeyDayIndex !== undefined && (
        <div
          data-testid="journey-banner"
          className="flex items-center gap-3 rounded-xl border border-coral-200/70 bg-coral-100/50 px-4 py-3 shadow-[var(--shadow-soft)]"
        >
          <span className="gradient-primary top-light flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold text-white shadow-[var(--shadow-glow)]">
            {journeyDayIndex}
          </span>
          <p className="text-sm">
            {t("setup.journeyBanner", { day: journeyDayIndex })}
          </p>
        </div>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <EmojiTile
            tone={category?.accent === "coral" ? "coral" : "lavender"}
            size="sm"
          >
            {category?.emoji ?? "💞"}
          </EmojiTile>
          <span className="eyebrow">
            {category?.title ?? t("setup.experienceFallback")}
          </span>
          {selectedMood && (
            <Pill tone="lavender">
              <span aria-hidden="true">{selectedMood.emoji}</span>
              {localize(locale, selectedMood.title, selectedMood.titleEn)}
            </Pill>
          )}
        </div>
        <h1 className="text-[1.75rem] leading-tight">{experience.title}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {experience.description}
        </p>
        <p className="text-xs font-medium text-graphite-500">
          {experience.type === "cartes" ? ` cartes` : t("setup.questionsMinutes", {
            count: questionCount,
            minutes: experience.estimatedMinutes,
          })}
        </p>
      </section>

      <Card className="flex flex-col gap-6 p-5">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">{t("setup.firstName")}</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={24}
            autoComplete="given-name"
            placeholder={t("setup.namePlaceholder")}
            className="h-12 w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 text-base outline-none transition-shadow focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60"
          />
          <span className="text-xs text-muted-foreground">
            {t("setup.nameHint")}
          </span>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">
            {t("setup.modeLabel")}
          </legend>
          <div className="flex flex-col gap-2">
            {availableModes.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => setMode(item.slug as Mode)}
                className={cn(
                  "press rounded-xl border px-4 py-3 text-left",
                  mode === item.slug
                    ? "border-coral-300 bg-coral-100/70 shadow-[var(--shadow-soft)]"
                    : "border-ivory-200 bg-white/[0.04] hover:border-lavender-300",
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-2 rounded-full transition-colors",
                      mode === item.slug ? "bg-coral-500" : "bg-ivory-300",
                    )}
                  />
                  <span className="block text-sm font-medium">
                    {localize(locale, item.title, item.titleEn)}
                  </span>
                </span>
                <span className="mt-1 block pl-4 text-xs leading-relaxed text-muted-foreground">
                  {localize(locale, item.description, item.descriptionEn)}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">
            {t("setup.durationLabel")}
          </legend>
          <div className="flex gap-2">
            {DURATIONS.map((value) => (
              <button
                key={value}
                type="button"
                data-testid={`duration-${value}`}
                onClick={() => setDuration(value)}
                className={cn(
                  "press h-11 flex-1 rounded-xl border text-sm font-medium",
                  duration === value
                    ? "border-coral-300 bg-coral-100/80 text-coral-700 shadow-[var(--shadow-soft)]"
                    : "border-ivory-200 bg-white/[0.04] text-graphite-600 hover:border-lavender-300",
                )}
              >
                {value} {t("common.minutes")}
              </button>
            ))}
          </div>
        </fieldset>

        <section
          data-testid="adjust"
          className="flex flex-col gap-5 rounded-xl border border-ivory-200/90 bg-ivory-100/70 p-4"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-lavender-600" />
            <h2 className="text-base leading-tight">{t("setup.adjust")}</h2>
            <span
              data-testid="planned-count"
              className="ml-auto rounded-full bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-graphite-600 shadow-[var(--shadow-soft)]"
            >
              {tp("setup.plannedCount", plannedCount)}
            </span>
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="announce">{t("setup.depthLabel")}</legend>
            <IntimacyCrown
              label={t("setup.depthLabel")}
              options={depthCranks}
              value={maxDepth ?? "all"}
              onChange={(id) => setMaxDepth(id === "all" ? null : (id as DepthSlug))}
              description={
                selectedDepth
                  ? localize(
                      locale,
                      selectedDepth.description,
                      selectedDepth.descriptionEn,
                    )
                  : t("setup.depthNoLimit")
              }
            />
          </fieldset>

          {themeOptions.length > 0 && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-xs font-medium text-muted-foreground">
                {t("onboarding.themesLabel")}
              </legend>
              <div className="flex flex-wrap gap-2">
                {themeOptions.map((theme) => {
                  const active = avoidThemes.includes(theme);
                  return (
                    <button
                      key={theme}
                      type="button"
                      data-testid={`theme-${theme}`}
                      aria-pressed={active}
                      onClick={() => toggleTheme(theme)}
                      className={cn(
                        "press min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-medium",
                        active
                          ? "border-graphite-700 bg-graphite-800 text-white line-through decoration-coral-400 decoration-2"
                          : "border-ivory-200 bg-white/[0.04] text-graphite-600 hover:border-lavender-300",
                      )}
                    >
                      {theme}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("setup.avoidHint")}
              </p>
            </fieldset>
          )}

          {tooFew && (
            <p
              data-testid="too-few"
              className="rounded-xl border border-coral-200/70 bg-coral-100/70 px-3.5 py-2.5 text-xs text-coral-700"
            >
              {tp("setup.tooFew", plannedCount)}
            </p>
          )}

          {plannedCount === 0 && (
            <p
              data-testid="empty-selection"
              className="rounded-xl border border-coral-200/70 bg-coral-100/70 px-3.5 py-2.5 text-xs text-coral-700"
            >
              {t("setup.noneMatch")}
            </p>
          )}
        </section>

        <section
          data-testid="setup-consent"
          className="flex flex-col gap-3 rounded-xl border border-ivory-200/90 bg-ivory-100/70 p-4"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-lavender-100 text-lavender-700">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h2 className="text-base leading-tight">
                {t("session.consentTitle")}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {t("session.consentIntro")}
              </p>
            </div>
          </div>

          {isAdult && needsAge && (
            <div className="rounded-xl border border-coral-200/60 bg-coral-100/50 p-3.5">
              <p className="text-sm font-medium">
                {t("session.adultTitle")}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-graphite-600">
                {t("session.adultBody")}
              </p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="mt-2"
                onClick={() => saveConsent({ ageConfirmed: true })}
              >
                {t("session.ageConfirm")}
              </Button>
            </div>
          )}

          <div
            role="group"
            aria-label={t("session.consentLabel")}
            className="grid gap-2 sm:grid-cols-2"
          >
            {CONSENT_DECISIONS.map((item) => {
              const active = consentChoice === item.slug;
              return (
                <button
                  key={item.slug}
                  type="button"
                  data-testid={`consent-${item.slug}`}
                  aria-pressed={active}
                  onClick={() => chooseConsent(item.slug)}
                  className={cn(
                    "press min-h-14 rounded-xl border px-3.5 py-2.5 text-left transition-all",
                    active
                      ? "border-lavender-300 bg-lavender-200/50 shadow-[var(--shadow-soft)]"
                      : "border-ivory-200 bg-white/[0.03] hover:border-lavender-300/70",
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-2 rounded-full",
                        active ? "bg-lavender-400" : "bg-ivory-300",
                      )}
                    />
                    {item.label}
                  </span>
                  <span className="mt-0.5 block pl-4 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </span>
                </button>
              );
            })}
          </div>

          {consentStopped && (
            <p
              data-testid="consent-stopped"
              className="rounded-xl border border-ivory-200 bg-card/80 px-3.5 py-2.5 text-sm leading-relaxed text-muted-foreground"
            >
              {t("session.consentStopped")}
            </p>
          )}

          {isAdult && needsAge && consentChoice !== null && !consentStopped && (
            <p className="text-xs leading-relaxed text-coral-600">
              {t("session.ageRequired")}
            </p>
          )}
        </section>

        {error && (
          <p
            data-testid="setup-error"
            className="rounded-xl border border-coral-200/70 bg-coral-100/70 px-3.5 py-2.5 text-sm text-coral-700"
          >
            {error}
          </p>
        )}

        {consentStopped ? (
          <Link
            href="/explorer"
            className="press inline-flex h-12 w-full items-center justify-center rounded-full border border-ivory-300 bg-card/90 text-sm font-medium text-foreground hover:border-lavender-300"
          >
            {t("setup.backToCatalogue")}
          </Link>
        ) : (
          <Button
            type="button"
            size="lg"
            onClick={start}
            disabled={pending || !canStart}
            className="w-full"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {t("setup.create")}
          </Button>
        )}
        <p className="text-center text-xs text-muted-foreground">
          {t("setup.footerHint")}
        </p>
      </Card>
    </div>
  );
}
