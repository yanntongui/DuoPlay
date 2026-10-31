"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import {
  Check,
  Download,
  HardDrive,
  Loader2,
  Moon,
  Palette,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IntimacyCrown } from "@/components/game/intimacy-crown";
import { GAME_MODES } from "@/lib/content";
import {
  DEPTHS,
  DURATIONS,
  clampDuration,
  type DepthSlug,
} from "@/lib/personalization";
import {
  getAmbiance,
  saveAmbiance,
  subscribeAmbiance,
  type Ambiance,
} from "@/lib/ambiance";
import { useDeviceToken } from "@/lib/game/use-device";
import {
  LOCALE_LABELS,
  LOCALES,
  localize,
  useLanguage,
  useT,
  type MessageKey,
} from "@/lib/i18n";
import { Languages } from "lucide-react";
import { clearLocalData, getAccount, getPlayerName } from "@/lib/game/storage";
import {
  allowInstallPrompt,
  isInstallDismissed,
  subscribePwa,
} from "@/lib/pwa/state";
import { cn } from "@/lib/utils";

type Mode = (typeof GAME_MODES)[number]["slug"];
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
type SaveState = "idle" | "saving" | "saved";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";

/**
 * Paramètres (cf. PRD §6, §15.6). Une page, cinq décisions, aucune
 * redirection : l'ambiance d'affichage, les préférences de tirage, les
 * consentements, l'installation de l'application et les données locales.
 * Tout ce qui vit sur l'appareil s'efface ici, jamais ce qui vit au serveur.
 */
export function Parametres() {
  const deviceToken = useDeviceToken();

  return (
    <div className="flex flex-col gap-5">
      <AmbianceSection />
      <LanguageSection />
      <PreferencesSection deviceToken={deviceToken} />
      <PrivacySection deviceToken={deviceToken} />
      <AppSection />
      <DeviceSection deviceToken={deviceToken} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Coquille de section                                                 */
/* ------------------------------------------------------------------ */

function Section({
  testid,
  icon,
  eyebrow,
  title,
  description,
  loaded,
  children,
}: {
  testid: string;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description?: string;
  /** `true` une fois les données serveur chargées (repère pour les tests). */
  loaded?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card
      data-testid={testid}
      data-loaded={loaded === undefined ? undefined : loaded}
      className="p-5"
    >
      <header className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-lavender-300 ring-1 ring-inset ring-white/10">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="text-lg leading-tight">{title}</h2>
          {description && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </header>
      {children}
    </Card>
  );
}

function StatusLine({
  state,
  idle,
  testid = "settings-status",
}: {
  state: SaveState;
  idle: string;
  testid?: string;
}) {
  const { t } = useT();
  return (
    <p
      data-testid={testid}
      aria-live="polite"
      className="flex items-center gap-2 text-xs text-muted-foreground"
    >
      {state === "saving" && <Loader2 className="size-3.5 animate-spin" />}
      {state === "saved" && <Check className="size-3.5 text-lavender-300" />}
      {state === "idle"
        ? idle
        : state === "saving"
          ? t("settings.saving")
          : t("settings.saved")}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Ambiance                                                         */
/* ------------------------------------------------------------------ */

const AMBIANCE_CHOICES: {
  value: Ambiance;
  labelKey: MessageKey;
  hintKey: MessageKey;
  icon: typeof Moon;
}[] = [
  {
    value: "chandelles",
    labelKey: "ambiance.evening",
    hintKey: "settings.ambianceEveningHint",
    icon: Moon,
  },
  {
    value: "douceur",
    labelKey: "ambiance.day",
    hintKey: "settings.ambianceDayHint",
    icon: Sun,
  },
];

function AmbianceSection() {
  const { t } = useT();
  const [ambiance, setAmbiance] = useState<Ambiance>("chandelles");

  useEffect(() => {
    setAmbiance(getAmbiance());
    return subscribeAmbiance(() => setAmbiance(getAmbiance()));
  }, []);

  return (
    <Section
      testid="settings-ambiance"
      icon={<Palette className="size-4" />}
      eyebrow={t("settings.appearanceEyebrow")}
      title={t("settings.ambianceTitle")}
      description={t("settings.ambianceBody")}
    >
      <div
        role="radiogroup"
        aria-label={t("settings.ambianceTitle")}
        className="grid gap-2 sm:grid-cols-2"
      >
        {AMBIANCE_CHOICES.map((choice) => {
          const active = ambiance === choice.value;
          const Icon = choice.icon;
          return (
            <button
              key={choice.value}
              type="button"
              role="radio"
              aria-checked={active}
              data-testid={`settings-ambiance-${choice.value}`}
              onClick={() => {
                saveAmbiance(choice.value);
                setAmbiance(choice.value);
              }}
              className={cn(
                "press flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                active
                  ? "gradient-primary top-light border-transparent text-white shadow-[var(--shadow-glow)]"
                  : "border-white/[0.08] bg-white/[0.03] hover:border-lavender-300/50",
              )}
            >
              <Icon className="mt-0.5 size-4 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  {t(choice.labelKey)}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block text-xs",
                    active ? "text-white/80" : "text-muted-foreground",
                  )}
                >
                  {t(choice.hintKey)}
                </span>
              </span>
              {active && <Check className="mt-0.5 size-4 shrink-0" />}
            </button>
          );
        })}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 1 bis. Langue de l'interface (§22)                                   */
/* ------------------------------------------------------------------ */

function LanguageSection() {
  const { t, locale } = useT();
  const { change } = useLanguage();

  return (
    <Section
      testid="settings-language"
      icon={<Languages className="size-4" />}
      eyebrow={t("lang.sectionEyebrow")}
      title={t("lang.title")}
      description={t("lang.description")}
      loaded
    >
      <div
        role="radiogroup"
        aria-label={t("lang.aria")}
        className="grid gap-2 sm:grid-cols-2"
      >
        {LOCALES.map((code) => {
          const active = locale === code;
          return (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={active}
              data-testid={`settings-lang-${code}`}
              onClick={() => change(code)}
              className={cn(
                "press flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors",
                active
                  ? "gradient-primary top-light border-transparent text-white shadow-[var(--shadow-glow)]"
                  : "border-white/[0.08] bg-white/[0.03] hover:border-lavender-300/50",
              )}
            >
              <span className="text-sm font-medium">
                {LOCALE_LABELS[code]}
              </span>
              <span
                className={cn(
                  "ml-auto text-xs uppercase tracking-[0.14em]",
                  active ? "text-white/80" : "text-muted-foreground",
                )}
              >
                {code}
              </span>
              {active && <Check className="size-4 shrink-0" />}
            </button>
          );
        })}
      </div>
      <p data-testid="settings-lang-current" className="mt-3 text-xs text-muted-foreground">
        {t("lang.current", { language: LOCALE_LABELS[locale] })}
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Préférences de jeu                                               */
/* ------------------------------------------------------------------ */

function depthCranks(locale: "fr" | "en", allLabel: string) {
  return [
    { id: "all", label: allLabel, testId: "settings-depth-all" },
    ...DEPTHS.map((depth) => ({
      id: depth.slug,
      label: localize(locale, depth.title, depth.titleEn),
      testId: `settings-depth-${depth.slug}`,
    })),
  ];
}

function PreferencesSection({ deviceToken }: { deviceToken?: string }) {
  const { locale, t } = useT();
  const stored = useQuery(
    api.preferences.get,
    deviceToken ? { deviceToken } : "skip",
  );
  const allThemes = useQuery(api.experiences.themes);
  const save = useMutation(api.preferences.save);
  const clear = useMutation(api.preferences.clear);

  const [maxDepth, setMaxDepth] = useState<DepthSlug | null>(null);
  const [avoidThemes, setAvoidThemes] = useState<string[]>([]);
  const [duration, setDuration] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [state, setState] = useState<SaveState>("idle");
  // Tant que le couple n'a rien touché, les valeurs enregistrées pré-remplissent
  // la page — même si la requête arrive après la première peinture.
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched || !stored) return;
    setMaxDepth(stored.maxDepth ?? null);
    setAvoidThemes(stored.avoidThemes);
    setDuration(
      stored.durationMinutes ? clampDuration(stored.durationMinutes) : null,
    );
    setMode(stored.mode ?? null);
  }, [stored, touched]);

  function markEdit() {
    setTouched(true);
  }

  function flash() {
    setState("saved");
    window.setTimeout(() => setState("idle"), 2500);
  }

  async function persist() {
    if (!deviceToken) return;
    setState("saving");
    setTouched(true);
    // On efface d'abord : `save` conserve les champs absents, il ne sait pas
    // revenir à « Automatique ». Vider puis réécrire rend le retour possible.
    await clear({ deviceToken });
    await save({
      deviceToken,
      maxDepth: maxDepth ?? undefined,
      avoidThemes,
      durationMinutes: duration ?? undefined,
      mode: mode ?? undefined,
    });
    flash();
  }

  async function reset() {
    if (!deviceToken) return;
    setState("saving");
    setTouched(true);
    await clear({ deviceToken });
    setMaxDepth(null);
    setAvoidThemes([]);
    setDuration(null);
    setMode(null);
    flash();
  }

  function toggleTheme(theme: string) {
    markEdit();
    setAvoidThemes((current) =>
      current.includes(theme)
        ? current.filter((item) => item !== theme)
        : [...current, theme],
    );
  }

  const themes = allThemes ?? [];

  return (
    <Section
      testid="settings-preferences"
      icon={<Sparkles className="size-4" />}
      eyebrow={t("settings.personalizationEyebrow")}
      title={t("settings.preferencesTitle")}
      description={t("settings.preferencesBody")}
      loaded={stored !== undefined && allThemes !== undefined}
    >
      <div className="flex flex-col gap-5">
        <IntimacyCrown
          label={t("settings.maxDepthLabel")}
          description={t("settings.maxDepthBody")}
          options={depthCranks(locale, t("setup.depthAll"))}
          value={maxDepth ?? "all"}
          onChange={(id) => {
            markEdit();
            setMaxDepth(id === "all" ? null : (id as DepthSlug));
          }}
        />

        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-medium text-muted-foreground">
            {t("settings.avoidThemes")}
          </legend>
          {themes.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {t("settings.themesLoading")}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {themes.map((theme) => {
                const active = avoidThemes.includes(theme);
                return (
                  <button
                    key={theme}
                    type="button"
                    data-testid={`settings-theme-${theme}`}
                    aria-pressed={active}
                    onClick={() => toggleTheme(theme)}
                    className={cn(
                      "press rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      active
                        ? "border-transparent bg-coral-500/20 text-coral-200"
                        : "border-white/[0.08] bg-white/[0.03] text-graphite-500 hover:border-lavender-300/50 hover:text-foreground",
                    )}
                  >
                    {theme}
                  </button>
                );
              })}
            </div>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-medium text-muted-foreground">
            {t("settings.durationLabel")}
          </legend>
          <div className="flex flex-wrap gap-2">
            <ChoicePill
              testid="settings-duration-auto"
              active={duration === null}
              onClick={() => {
                markEdit();
                setDuration(null);
              }}
            >
              {t("settings.auto")}
            </ChoicePill>
            {DURATIONS.map((minutes) => (
              <ChoicePill
                key={minutes}
                testid={`settings-duration-${minutes}`}
                active={duration === minutes}
                onClick={() => {
                  markEdit();
                  setDuration(minutes);
                }}
              >
                {minutes} min
              </ChoicePill>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-medium text-muted-foreground">
            {t("settings.modeLabel")}
          </legend>
          <div className="flex flex-wrap gap-2">
            <ChoicePill
              testid="settings-mode-auto"
              active={mode === null}
              onClick={() => {
                markEdit();
                setMode(null);
              }}
            >
              {t("settings.auto")}
            </ChoicePill>
            {GAME_MODES.map((option) => (
              <ChoicePill
                key={option.slug}
                testid={`settings-mode-${option.slug}`}
                active={mode === option.slug}
                onClick={() => {
                  markEdit();
                  setMode(option.slug);
                }}
              >
                {localize(locale, option.title, option.titleEn)}
              </ChoicePill>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            data-testid="settings-save"
            onClick={persist}
            disabled={!deviceToken || state === "saving"}
          >
            <Check />
            {t("settings.savePreferences")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            data-testid="settings-reset"
            onClick={reset}
            disabled={!deviceToken || state === "saving"}
          >
            <RotateCcw />
            {t("settings.resetAll")}
          </Button>
        </div>

        <StatusLine
          state={state}
          idle={t("settings.preferencesIdle")}
        />
      </div>
    </Section>
  );
}

function ChoicePill({
  testid,
  active,
  onClick,
  children,
}: {
  testid: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      data-testid={testid}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "press rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "gradient-primary top-light border-transparent text-white shadow-[var(--shadow-glow)]"
          : "border-white/[0.08] bg-white/[0.03] text-graphite-500 hover:border-lavender-300/50 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Rappels et confidentialité                                       */
/* ------------------------------------------------------------------ */

function PrivacySection({ deviceToken }: { deviceToken?: string }) {
  const { t } = useT();
  const consents = useQuery(
    api.consents.get,
    deviceToken ? { deviceToken } : "skip",
  );
  const setConsents = useMutation(api.consents.set);
  // `null` = pas encore touché par l'utilisateur : on suit la valeur serveur,
  // qui peut arriver (ou changer) après la première peinture. Dès qu'un tap a
  // lieu, le choix local prend le relais jusqu'à confirmation serveur.
  const [analyticsChoice, setAnalyticsChoice] = useState<boolean | null>(null);
  const [notificationsChoice, setNotificationsChoice] = useState<boolean | null>(
    null,
  );
  const [state, setState] = useState<SaveState>("idle");

  const analytics = analyticsChoice ?? consents?.analytics ?? false;
  const notifications =
    notificationsChoice ?? consents?.notifications ?? false;

  async function commit(next: { analytics: boolean; notifications: boolean }) {
    if (!deviceToken) return;
    setAnalyticsChoice(next.analytics);
    setNotificationsChoice(next.notifications);
    setState("saving");
    await setConsents({
      deviceToken,
      analytics: next.analytics,
      notifications: next.notifications,
    });
    setState("saved");
    window.setTimeout(() => setState("idle"), 2500);
  }

  return (
    <Section
      testid="settings-privacy"
      icon={<ShieldCheck className="size-4" />}
      eyebrow={t("settings.privacyEyebrow")}
      title={t("settings.privacyTitle")}
      description={t("settings.privacyBody")}
      loaded={consents !== undefined}
    >
      <div className="flex flex-col gap-4">
        <ToggleRow
          testid="settings-consent-analytics"
          label={t("settings.analyticsLabel")}
          description={t("settings.analyticsBody")}
          checked={analytics}
          onChange={(value) => commit({ analytics: value, notifications })}
        />
        <ToggleRow
          testid="settings-consent-notifications"
          label={t("settings.notificationsLabel")}
          description={t("settings.notificationsBody")}
          checked={notifications}
          onChange={(value) => commit({ analytics, notifications: value })}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusLine
            state={state}
            idle={t("settings.privacyIdle")}
            testid="settings-privacy-status"
          />
          <Link
            href="/confidentialite"
            className="text-xs text-lavender-300 hover:underline"
          >
            {t("settings.privacyLink")}
          </Link>
        </div>
      </div>
    </Section>
  );
}

function ToggleRow({
  testid,
  label,
  description,
  checked,
  onChange,
}: {
  testid: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4">
      <span className="flex flex-col">
        <span className="text-sm">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
      <input
        type="checkbox"
        data-testid={testid}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-5 shrink-0 accent-lavender-500"
      />
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Application                                                      */
/* ------------------------------------------------------------------ */

function AppSection() {
  const { t } = useT();
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [cacheState, setCacheState] = useState<SaveState>("idle");

  useEffect(() => {
    setDismissed(isInstallDismissed());
    const unsubscribe = subscribePwa(() => setDismissed(isInstallDismissed()));

    const media = window.matchMedia("(display-mode: standalone)");
    const nav = navigator as Navigator & { standalone?: boolean };
    const updateStandalone = () =>
      setStandalone(media.matches || nav.standalone === true);
    updateStandalone();
    media.addEventListener("change", updateStandalone);

    const capture = (incoming: Event) => {
      incoming.preventDefault();
      setInstallEvent(incoming as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", capture);

    return () => {
      unsubscribe();
      media.removeEventListener("change", updateStandalone);
      window.removeEventListener("beforeinstallprompt", capture);
    };
  }, []);

  async function installNow() {
    if (!installEvent) return;
    try {
      await installEvent.prompt();
      await installEvent.userChoice;
    } catch {
      /* l'utilisateur a fermé la boîte système */
    }
    setInstallEvent(null);
  }

  async function clearCache() {
    setCacheState("saving");
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch {
      /* aucun cache : rien à vider */
    }
    setCacheState("saved");
    window.setTimeout(() => setCacheState("idle"), 2500);
  }

  return (
    <Section
      testid="settings-app"
      icon={<Smartphone className="size-4" />}
      eyebrow={t("settings.appEyebrow")}
      title={t("settings.appTitle")}
      description={t("settings.appBody")}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm">{t("settings.installLabel")}</p>
            <p className="text-xs text-muted-foreground">
              {standalone
                ? t("settings.installedBody")
                : installEvent
                  ? t("settings.installReadyBody")
                  : t("settings.installManualBody")}
            </p>
          </div>
          {standalone ? (
            <span className="rounded-full bg-lavender-100 px-2.5 py-1 text-xs font-medium text-lavender-700">
              {t("settings.installed")}
            </span>
          ) : (
            installEvent && (
              <Button
                type="button"
                data-testid="settings-install"
                onClick={installNow}
              >
                <Download />
                {t("settings.install")}
              </Button>
            )
          )}
        </div>

        {dismissed && (
          <button
            type="button"
            data-testid="settings-install-reset"
            onClick={() => {
              allowInstallPrompt();
              setDismissed(false);
            }}
            className="self-start text-xs text-lavender-300 hover:underline"
          >
            {t("settings.offerInstallAgain")}
          </button>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm">{t("settings.cacheLabel")}</p>
            <p className="text-xs text-muted-foreground">
              {t("settings.cacheBody")}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            data-testid="settings-clear-cache"
            onClick={clearCache}
            disabled={cacheState === "saving"}
          >
            <RefreshCw />
            {t("settings.clearCache")}
          </Button>
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 text-xs text-muted-foreground">
          <span>{t("settings.versionLabel")}</span>
          <span className="font-medium text-foreground">v{APP_VERSION}</span>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Données de l'appareil                                            */
/* ------------------------------------------------------------------ */

function DeviceSection({ deviceToken }: { deviceToken?: string }) {
  const { t } = useT();
  const [name, setName] = useState("");
  const [hasAccount, setHasAccount] = useState(false);
  const [ambiance, setAmbiance] = useState<Ambiance>("chandelles");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setName(getPlayerName());
    setHasAccount(Boolean(getAccount()));
    setAmbiance(getAmbiance());
    return subscribeAmbiance(() => setAmbiance(getAmbiance()));
  }, []);

  const rows: { label: string; value: string }[] = [
    {
      label: t("settings.rowName"),
      value: name || t("settings.rowNameEmpty"),
    },
    {
      label: t("settings.rowAmbiance"),
      value: t(ambiance === "douceur" ? "ambiance.day" : "ambiance.evening"),
    },
    {
      label: t("settings.rowAccount"),
      value: t(
        hasAccount ? "settings.rowAccountLinked" : "settings.rowAccountSolo",
      ),
    },
    {
      label: t("settings.rowId"),
      value: deviceToken ? `${deviceToken.slice(0, 8)}…` : "—",
    },
  ];

  return (
    <Section
      testid="settings-device"
      icon={<HardDrive className="size-4" />}
      eyebrow={t("settings.dataEyebrow")}
      title={t("settings.appTitle")}
      description={t("settings.dataBody")}
    >
      <dl className="flex flex-col divide-y divide-white/[0.06]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 py-2.5"
          >
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="truncate text-sm font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 rounded-2xl border border-coral-500/20 bg-coral-500/[0.06] p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-coral-200">
          <TriangleAlert className="size-4 shrink-0" />
          {t("settings.resetTitle")}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {t("settings.resetBody")}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {confirming ? (
            <>
              <Button
                type="button"
                variant="destructive"
                data-testid="settings-reset-local-confirm"
                onClick={() => {
                  clearLocalData();
                  window.location.reload();
                }}
              >
                <Trash2 />
                {t("settings.resetConfirm")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirming(false)}
              >
                {t("common.cancel")}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="destructive"
              data-testid="settings-reset-local"
              onClick={() => setConfirming(true)}
            >
              <Trash2 />
              {t("settings.resetAction")}
            </Button>
          )}
        </div>
      </div>
    </Section>
  );
}
