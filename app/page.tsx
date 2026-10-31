import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Link2,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { PageView } from "@/components/app/page-view";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Aura, Pill } from "@/components/ui/surface";
import { cn } from "@/lib/utils";
import { GAME_MODES, UNIVERSES } from "@/lib/content";

const STEPS = [
  {
    icon: Sparkles,
    title: "Choisissez une expérience",
    description:
      "Une ambiance, une durée, un niveau de profondeur. DuoPlay fait le reste.",
  },
  {
    icon: Link2,
    title: "Invitez votre partenaire",
    description:
      "Un lien privé à partager sur WhatsApp. Aucune installation requise.",
  },
  {
    icon: Heart,
    title: "Révélez-vous",
    description:
      "Vous répondez chacun de votre côté, puis découvrez vos réponses ensemble.",
  },
] as const;

const PROMISES = [
  "Sans compte pour commencer",
  "Un lien privé, rien d'autre",
  "Vos réponses restent entre vous",
] as const;

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-x-clip bg-background">
      <PageView name="landing_view" />
      {/* Fond du hero : lavage dégradé, ondes lumineuses, grain fin. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem] overflow-hidden"
      >
        <div className="gradient-dawn absolute inset-0 opacity-80" />
        <Aura
          tone="lavender"
          drift="slower"
          className="absolute -left-32 top-10 size-80"
        />
        <Aura
          tone="coral"
          drift="slow"
          className="absolute -right-24 top-40 size-72"
        />
      </div>

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <Logo />
        <Link
          href="/accueil"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Commencer
        </Link>
      </header>

      <main id="contenu" className="mx-auto w-full max-w-5xl px-5 pb-24">
        {/* Hero */}
        <section className="flex flex-col items-start gap-7 pt-8 pb-20 sm:pt-16">
          <Pill tone="lavender" className="rise">
            <Sparkles className="size-3.5" />
            Jouable à deux · sans installation
          </Pill>

          <h1 className="rise max-w-2xl text-[2.6rem] leading-[1.02] sm:text-6xl">
            Retrouvez-vous{" "}
            <span className="text-tendresse" style={{ fontStyle: "italic" }}>
              autrement.
            </span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            DuoPlay réunit les couples autour de jeux, de défis et
            d&apos;expériences simples pour renforcer les liens, briser la
            routine et raviver la flamme.
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/accueil"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full gap-2 sm:w-auto",
              )}
            >
              Créer une partie
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/explorer"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "w-full sm:w-auto",
              )}
            >
              Explorer les univers
            </Link>
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-2">
            {PROMISES.map((promise) => (
              <li
                key={promise}
                className="flex items-center gap-2 text-sm text-graphite-600"
              >
                <ShieldCheck className="size-4 text-coral-600" />
                {promise}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 pt-1 text-sm text-muted-foreground">
            <span
              className="flex text-gold-400"
              aria-label="Note de cinq étoiles"
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className="size-3.5 fill-current"
                  aria-hidden="true"
                />
              ))}
            </span>
            <span>Pensé pour les couples francophones — l&apos;Afrique d&apos;abord.</span>
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="pb-20">
          <p className="eyebrow mb-2">Le déroulé</p>
          <h2 className="mb-6 max-w-xl text-3xl leading-tight sm:text-4xl">
            Trois étapes, un moment rien qu&apos;à vous
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <Card key={step.title} className="grain p-6">
                <div className="relative z-10">
                  <div className="gradient-tendresse mb-5 flex size-11 items-center justify-center rounded-2xl text-white shadow-[var(--shadow-glow-lavender)]">
                    <step.icon className="size-5" />
                  </div>
                  <p className="eyebrow mb-2">Étape {index + 1}</p>
                  <h3 className="mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Univers */}
        <section className="pb-20">
          <p className="eyebrow mb-2">Les univers</p>
          <h2 className="mb-6 max-w-xl text-3xl leading-tight sm:text-4xl">
            Six ambiances à explorer
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {UNIVERSES.map((universe) => (
              <Card
                key={universe.slug}
                interactive
                className="grain group p-5"
              >
                <div className="relative z-10">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-ivory-100 text-2xl shadow-[var(--shadow-soft)]">
                    {universe.emoji}
                  </div>
                  <h3 className="mb-1 text-lg">{universe.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {universe.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Modes */}
        <section className="pb-20">
          <p className="eyebrow mb-2">Les modes</p>
          <h2 className="mb-6 max-w-xl text-3xl leading-tight sm:text-4xl">
            Quatre façons de jouer
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {GAME_MODES.map((mode) => (
              <Card key={mode.slug} className="p-5">
                <h3 className="mb-1 text-lg">{mode.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {mode.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="gradient-night grain relative overflow-hidden rounded-xl px-6 py-14 text-center text-white shadow-[var(--shadow-lift)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <Aura
              tone="coral"
              drift="slow"
              className="absolute -left-16 top-0 size-64 opacity-70"
            />
            <Aura
              tone="lavender"
              drift="slower"
              className="absolute -right-10 bottom-0 size-60 opacity-70"
            />
          </div>
          <div className="relative z-10">
            <p className="eyebrow mb-3 text-white/60">Pour vous deux</p>
            <h2 className="mx-auto max-w-lg text-3xl leading-tight sm:text-4xl">
              Offrez-vous un moment rien qu&apos;à vous deux.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/70">
              Gratuit pour commencer. Un lien suffit.
            </p>
            <Link
              href="/accueil"
              className={cn(
                buttonVariants({ size: "lg", variant: "light" }),
                "mt-7",
              )}
            >
              Commencer maintenant
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-ivory-200/80">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
          <Logo showWordmark />
          <nav className="flex gap-5">
            <Link href="/confidentialite" className="hover:text-foreground">
              Confidentialité
            </Link>
            <Link href="/cgu" className="hover:text-foreground">
              CGU
            </Link>
          </nav>
          <p>© {new Date().getFullYear()} DuoPlay</p>
        </div>
      </footer>
    </div>
  );
}
