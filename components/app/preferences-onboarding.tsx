"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, SlidersHorizontal, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { EmojiTile } from "@/components/ui/surface";
import { GAME_MODES, modeTitle } from "@/lib/content";
import { localize, useT } from "@/lib/i18n";
import { DEPTHS, DURATIONS, type DepthSlug } from "@/lib/personalization";
import { dismissOnboarding, isOnboardingDismissed } from "@/lib/game/storage";
import { useDeviceToken } from "@/lib/game/use-device";
import { cn } from "@/lib/utils";

/**
 * « Premier réglage » (§4, §3.F) — onboarding **non bloquant**.
 *
 * Au premier passage sur l'accueil (ou l'explorateur), quand l'appareil n'a
 * encore **aucune préférence** enregistrée, une carte discrète propose de
 * déduire profondeur, durée, mode et thèmes à éviter. Elle pré-remplit les
 * parties suivantes sans jamais rien imposer : on peut l'écarter d'un geste, et
 * les réglages restent modifiables dans le formulaire ou les Paramètres.
 */

type Mode = (typeof GAME_MODES)[number]["slug"];

const MAX_THEMES = 10;

export function PreferencesOnboarding() {
  const { t, locale } = useT();
  const deviceToken = useDeviceToken();
  const ready = deviceToken !== undefined;

  const preferences = useQuery(
    api.preferences.get,
    ready ? { deviceToken } : "skip",
  );
  const themes = useQuery(api.experiences.themes, {});
  const save = useMutation(api.preferences.save);

  const [dismissed, setDismissed] = useState(true);
  const [maxDepth, setMaxDepth] = useState<DepthSlug>("moyen");
  const [duration, setDuration] = useState<number>(15);
  const [mode, setMode] = useState<Mode>("ensemble");
  const [avoidThemes, setAvoidThemes] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDismissed(isOnboardingDismissed());
  }, []);

  // Rien à proposer : préférences déjà posées (ou en cours de chargement),
  // carte écartée, ou appareil pas encore prêt.
  if (
    !ready ||
    dismissed ||
    preferences === undefined ||
    preferences !== null
  ) {
    return null;
  }

  const themeOptions = (themes ?? []).slice(0, MAX_THEMES);

  function toggleTheme(theme: string) {
    setAvoidThemes((current) =>
      current.includes(theme)
        ? current.filter((item) => item !== theme)
        : [...current, theme],
    );
  }

  async function onSave() {
    if (!deviceToken) return;
    setPending(true);
    setError(null);
    try {
      await save({
        deviceToken,
        maxDepth,
        avoidThemes,
        durationMinutes: duration,
        mode,
      });
    } catch {
      setError(t("onboarding.error"));
      setPending(false);
    }
  }

  return (
    <section
      data-testid="onboarding"
      data-loaded="true"
      className="liquid-glass top-light rise flex flex-col gap-5 rounded-xl p-5"
    >
      <div className="flex items-start gap-3">
        <EmojiTile tone="lavender" size="sm">
          <Sparkles className="size-4" />
        </EmojiTile>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">{t("onboarding.eyebrow")}</p>
          <h2 className="text-lg leading-tight">{t("onboarding.title")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {t("onboarding.body")}
          </p>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 flex items-center gap-1.5 text-sm font-medium">
          <SlidersHorizontal className="size-3.5 text-lavender-600" />
          {t("onboarding.depthLabel")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {DEPTHS.map((depth) => (
            <button
              key={depth.slug}
              type="button"
              data-testid={`onboarding-depth-${depth.slug}`}
              aria-pressed={maxDepth === depth.slug}
              onClick={() => setMaxDepth(depth.slug)}
              className={cn(
                "press rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
                maxDepth === depth.slug
                  ? "border-lavender-400 bg-lavender-100 text-lavender-700"
                  : "border-ivory-300 text-muted-foreground hover:border-lavender-300",
              )}
            >
              {localize(locale, depth.title, depth.titleEn)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-6">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">
            {t("onboarding.durationLabel")}
          </legend>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((value) => (
              <button
                key={value}
                type="button"
                data-testid={`onboarding-duration-${value}`}
                aria-pressed={duration === value}
                onClick={() => setDuration(value)}
                className={cn(
                  "press rounded-full border px-3 py-1.5 text-[13px] transition-colors",
                  duration === value
                    ? "border-lavender-400 bg-lavender-100 text-lavender-700"
                    : "border-ivory-300 text-muted-foreground hover:border-lavender-300",
                )}
              >
                {value} min
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">
            {t("onboarding.modeLabel")}
          </legend>
          <div className="flex flex-wrap gap-2">
            {GAME_MODES.map((item) => (
              <button
                key={item.slug}
                type="button"
                data-testid={`onboarding-mode-${item.slug}`}
                aria-pressed={mode === item.slug}
                onClick={() => setMode(item.slug)}
                className={cn(
                  "press rounded-full border px-3 py-1.5 text-[13px] transition-colors",
                  mode === item.slug
                    ? "border-lavender-400 bg-lavender-100 text-lavender-700"
                    : "border-ivory-300 text-muted-foreground hover:border-lavender-300",
                )}
              >
                {modeTitle(item.slug, locale)}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {themeOptions.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">
            {t("onboarding.themesLabel")}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              {t("journal.optional")}
            </span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {themeOptions.map((theme) => {
              const active = avoidThemes.includes(theme);
              return (
                <button
                  key={theme}
                  type="button"
                  data-testid={`onboarding-theme-${theme}`}
                  aria-pressed={active}
                  onClick={() => toggleTheme(theme)}
                  className={cn(
                    "press rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-graphite-700 bg-graphite-800 text-white line-through decoration-coral-400 decoration-2"
                      : "border-ivory-300 text-muted-foreground hover:border-lavender-300",
                  )}
                >
                  {theme}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {error && (
        <p data-testid="onboarding-error" className="text-xs text-coral-600">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          data-testid="onboarding-save"
          disabled={pending}
          onClick={onSave}
          className="gap-1.5"
        >
          <Check className="size-4" />
          {t("onboarding.save")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          data-testid="onboarding-dismiss"
          onClick={() => {
            dismissOnboarding();
            setDismissed(true);
          }}
        >
          {t("onboarding.later")}
        </Button>
      </div>
    </section>
  );
}
