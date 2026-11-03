import Link from "next/link";
import { ArrowRight, Compass, Dices, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmojiTile, SectionTitle } from "@/components/ui/surface";
import { DailyChallengeCard } from "@/components/app/daily-challenge-card";
import { ConnectionAura } from "@/components/app/connection-aura";
import { ActivityStats } from "@/components/app/activity-stats";
import { JourneyActiveCard } from "@/components/app/journey-active-card";
import { ResumeCard } from "@/components/app/resume-card";
import { ContextualSuggestions } from "@/components/app/contextual-suggestions";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { PreferencesOnboarding } from "@/components/app/preferences-onboarding";
import { AiSpotlight } from "@/components/ai/ai-spotlight";
import { cn } from "@/lib/utils";
import { UNIVERSES } from "@/lib/content";

export const metadata = { title: "Accueil" };

export default function AccueilPage() {
  const mvpUniverses = UNIVERSES.filter((universe) => universe.mvp);

  return (
    <div className="flex flex-col gap-9">
      <section className="flex flex-col gap-5 pt-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <p className="eyebrow mb-2">Votre moment à deux</p>
          <h1 className="text-[2.5rem] leading-[1.05] lg:text-[3rem]">
            Un moment rien qu&apos;à&nbsp;vous deux.
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Choisissez ce qui vous ferait plaisir aujourd&apos;hui et DuoPlay
            vous accompagne pour créer un moment de complicité.
          </p>
          <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/explorer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full gap-2 sm:w-auto",
              )}
            >
              <Plus className="size-4" />
              Créer une partie
            </Link>
            <Link
              href="#univers"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "w-full gap-2 sm:w-auto",
              )}
            >
              <Compass className="size-4" />
              Découvrir les expériences
            </Link>
          </div>
        </div>
        <ConnectionAura />
      </section>

      <InstallPrompt />

      <PreferencesOnboarding />

      <AiSpotlight />

      <ContextualSuggestions />

      <ActivityStats />


      <div className="grid grid-cols-1 gap-9 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-9">
          <section>
            <SectionTitle
              eyebrow="Chaque jour"
              title="Défi du jour"
              action={
                <Link
                  href="/defi"
                  className="shrink-0 text-xs font-medium text-primary hover:underline"
                >
                  Voir
                </Link>
              }
            />
            <DailyChallengeCard />
          </section>

          <section>
            <SectionTitle
              eyebrow="Reprendre"
              title="En cours"
              action={
                <Link
                  href="/notre-espace"
                  className="shrink-0 text-xs font-medium text-primary hover:underline"
                >
                  Historique
                </Link>
              }
            />
            <ResumeCard />
          </section>

          <section>
            <SectionTitle eyebrow="En plusieurs fois" title="Parcours guidé" />
            <JourneyActiveCard />
          </section>
        </div>

        <div className="flex flex-col gap-9">
          <section>
            <Link
              href="/roue"
              data-testid="roue-cta"
              className="press spotlight top-light group relative flex items-center gap-4 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 shadow-[var(--shadow-soft)] transition-colors hover:border-lavender-300/40"
            >
              <EmojiTile tone="coral" size="md">
                <Dices className="size-5 text-lavender-300" />
              </EmojiTile>
              <span className="min-w-0">
                <span className="block font-display text-lg leading-tight">
                  Roue du hasard
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  Le sort tire un défi court à vivre maintenant.
                </span>
              </span>
              <ArrowRight className="ml-auto size-4 shrink-0 text-lavender-300 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </section>

          <section id="univers" className="scroll-mt-24">
            <SectionTitle
              eyebrow="Explorer"
              title="Accès rapide"
              action={
                <Link
                  href="/explorer"
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Tout voir
                  <ArrowRight className="size-3.5" />
                </Link>
              }
            />
            <div className="grid grid-cols-2 gap-3">
              {mvpUniverses.map((universe) => (
                <Link
                  key={universe.slug}
                  href={`/explorer/${universe.slug}`}
                  className="press group relative overflow-hidden rounded-xl border border-ivory-200/80 bg-card p-4 shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:border-lavender-300 hover:shadow-[var(--shadow-lift)]"
                >
                  <EmojiTile
                    tone={universe.accent === "coral" ? "coral" : "lavender"}
                    size="sm"
                    className="mb-3"
                  >
                    {universe.emoji}
                  </EmojiTile>
                  <p className="text-sm font-medium leading-tight">
                    {universe.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {universe.tagline}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-graphite-500">
                    ≈ {universe.durationMinutes} min
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
