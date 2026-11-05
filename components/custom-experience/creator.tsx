"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Plus, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDeviceToken } from "@/lib/game/use-device";
import { cn } from "@/lib/utils";
import { DEPTHS, DURATIONS } from "@/lib/personalization";
import { localize, useT } from "@/lib/i18n";

const THEMES = [
  "Notre première rencontre",
  "Notre prochain voyage",
  "Nos petites habitudes",
  "Ce que nous aimons l'un chez l'autre",
  "Nos rêves à deux",
  "Notre soirée idéale",
];

const AMBIANCES = [
  { slug: "connexion", label: "Connexion", emoji: "🤍" },
  { slug: "rire", label: "Rire", emoji: "😄" },
  { slug: "reconnexion", label: "Reconnexion", emoji: "🤍" },
  { slug: "souvenir", label: "Souvenir", emoji: "📷" },
  { slug: "routine", label: "Routine", emoji: "🌿" },
  { slug: "sensuel", label: "Sensuel", emoji: "🔥" },
];

export function CustomExperienceCreator() {
  const router = useRouter();
  const deviceToken = useDeviceToken();
  const tp = useT();
  const create = useMutation(api.customExperiences.create as any);

  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState(THEMES[0]);
  const [mood, setMood] = useState<string | null>(null);
  const [duration, setDuration] = useState(15);
  const [depth, setDepth] = useState<"leger" | "moyen" | "profond" | null>(null);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!deviceToken || !title.trim()) return;
    setSaving(true);
    try {
      const id = await create({
        deviceToken,
        title: title.trim(),
        theme,
        mood: mood ?? undefined,
        durationMinutes: duration,
        depth: depth ?? undefined,
        excludedCategories: excluded,
        customQuestions: customQuestions.filter(Boolean),
      });
      router.push(`/custom-experience/${id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex flex-col gap-6">
      <section>
        <p className="eyebrow mb-2">Créateur</p>
        <h1 className="text-[2rem] leading-[1.1]">Créer notre expérience</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Construisez une expérience unique pour votre couple. Choisissez un
          thème, une ambiance, des questions et enregistrez-la dans Notre espace.
        </p>
      </section>

      <Card className="flex flex-col gap-6 p-5">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Titre de l'expérience</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex. Notre soirée idéale"
            className="h-12 w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 text-base outline-none focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60"
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Thème</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {THEMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={cn(
                  "press rounded-xl border px-4 py-3 text-left text-sm transition-all",
                  theme === t
                    ? "border-lavender-300 bg-lavender-200/60 text-lavender-700"
                    : "border-ivory-200 bg-white/[0.03] text-foreground hover:border-lavender-300/70",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Ambiance</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {AMBIANCES.map((a) => (
              <button
                key={a.slug}
                type="button"
                onClick={() => setMood(a.slug)}
                className={cn(
                  "press min-h-12 rounded-xl border px-3 py-2 text-center text-sm transition-all",
                  mood === a.slug
                    ? "border-lavender-300 bg-lavender-200/60 text-lavender-700"
                    : "border-ivory-200 bg-white/[0.03] text-foreground hover:border-lavender-300/70",
                )}
              >
                <span className="block text-xl">{a.emoji}</span>
                <span className="mt-0.5 block font-medium">{a.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Durée</legend>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={cn(
                    "press h-11 flex-1 rounded-xl border text-sm font-medium",
                    duration === d
                      ? "border-coral-300 bg-coral-100/80 text-coral-700"
                      : "border-ivory-200 bg-white/[0.04] text-graphite-600 hover:border-lavender-300",
                  )}
                >
                  {d} min
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Niveau</legend>
            <div className="flex gap-2">
              {DEPTHS.map((d) => (
                <button
                  key={d.slug}
                  type="button"
                  onClick={() => setDepth(d.slug)}
                  className={cn(
                    "press h-11 flex-1 rounded-xl border text-sm font-medium",
                    depth === d.slug
                      ? "border-lavender-300 bg-lavender-200/60 text-lavender-700"
                      : "border-ivory-200 bg-white/[0.04] text-graphite-600 hover:border-lavender-300",
                  )}
                >
                  {localize(tp.locale, d.title, d.titleEn)}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Questions personnalisées</legend>
          <div className="flex flex-col gap-2">
            {customQuestions.map((q, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={q}
                  onChange={(e) =>
                    setCustomQuestions((prev) =>
                      prev.map((item, idx) => (idx === i ? e.target.value : item)),
                    )
                  }
                  placeholder="Votre question…"
                  className="flex-1 rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 py-2.5 outline-none focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60"
                />
                <button
                  type="button"
                  onClick={() =>
                    setCustomQuestions((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="press inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ivory-200 text-graphite-500 hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCustomQuestions((prev) => [...prev, ""])}
            >
              <Plus className="size-4" />
              Ajouter une question
            </Button>
          </div>
        </fieldset>

        <div className="flex items-center justify-between border-t border-ivory-200/70 pt-4">
          <p className="text-sm text-muted-foreground">
            L'expérience sera enregistrée dans Notre espace
          </p>
          <Button
            size="lg"
            onClick={save}
            disabled={saving || !title.trim()}
          >
            {saving ? (
              <>Enregistrement…</>
            ) : (
              <>
                <Plus className="size-4" />
                Créer l'expérience
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
