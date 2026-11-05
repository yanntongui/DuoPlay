"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CONSENT_DECISIONS,
  isStopDecision,
  saveConsent,
  useConsent,
  type ConsentDecision,
} from "@/lib/consent";
import { DEPTH_LABEL } from "@/lib/formats";
import { cn } from "@/lib/utils";

/**
 * Consentement explicite avant une session.
 *
 * Aucun choix n'est pré-sélectionné. « Pas maintenant » et « Non » arrêtent la
 * session avec un message neutre : une réponse négative n'est jamais un échec.
 */
export function SessionConsent({
  title,
  adult,
  depth,
  onReady,
  backHref,
}: {
  title: string;
  adult: boolean;
  depth: string;
  onReady: (decision: ConsentDecision) => void;
  backHref: string;
}) {
  const consent = useConsent();
  const [decision, setDecision] = useState<ConsentDecision | null>(null);
  const [ageError, setAgeError] = useState(false);

  function choose(value: ConsentDecision) {
    setAgeError(false);
    setDecision(value);
    if (adult) {
      saveConsent({ depth: value, adult: value });
    } else {
      saveConsent({ depth: value });
    }
  }

  function confirmAge() {
    saveConsent({ ageConfirmed: true });
    setAgeError(false);
  }

  const needsAge = adult && !consent.ageConfirmed;
  const stopped = decision !== null && isStopDecision(decision);

  if (needsAge) {
    return (
      <Card className="mx-auto flex max-w-xl flex-col gap-5 p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-coral-100 text-coral-600">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <p className="eyebrow mb-1">Contenu réservé aux adultes</p>
            <h1 className="text-2xl leading-tight">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Cette expérience parle de sensualité et d&apos;intimité. Elle est
              réservée aux personnes majeures et consentantes. Rien ne sera
              affiché avant votre confirmation.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-ivory-200/80 bg-ivory-100/70 p-4 text-sm leading-relaxed text-graphite-600">
          Vous pourrez passer chaque étape, mettre en pause ou terminer à tout
          moment. Aucun geste n&apos;est imposé, aucune réponse n&apos;est
          publique.
        </div>

        {ageError && (
          <p className="rounded-xl border border-coral-200/70 bg-coral-100/70 px-3.5 py-2.5 text-sm text-coral-700">
            Confirmez votre âge pour continuer. Vous pouvez aussi revenir au
            catalogue, sans rien justifier.
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            size="lg"
            className="flex-1"
            onClick={confirmAge}
          >
            <Check className="size-4" />
            J&apos;ai 18 ans ou plus
          </Button>
          <Link
            href={backHref}
            className="press inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full border border-ivory-300 bg-card/90 text-sm font-medium text-foreground hover:border-lavender-300"
          >
            <ArrowLeft className="size-4" />
            Retour au catalogue
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-auto flex max-w-xl flex-col gap-5 p-6">
      <div>
        <p className="eyebrow mb-1">Avant de commencer</p>
        <h1 className="text-2xl leading-tight">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Comment vous sentez-vous pour cette session ? Votre réponse est
          personnelle et peut changer à tout moment.
        </p>
        <p className="mt-2 text-xs text-graphite-500">
          Niveau de l&apos;expérience : {DEPTH_LABEL[depth] ?? depth} · 2 joueurs
          · vous pourrez tout arrêter.
        </p>
      </div>

      <div
        className="grid gap-2 sm:grid-cols-2"
        role="group"
        aria-label="Choix de consentement"
      >
        {CONSENT_DECISIONS.map((item) => {
          const active = decision === item.slug;
          return (
            <button
              key={item.slug}
              type="button"
              aria-pressed={active}
              onClick={() => choose(item.slug)}
              className={cn(
                "press min-h-[64px] rounded-xl border px-4 py-3 text-left transition-all",
                active
                  ? "border-lavender-300 bg-lavender-100 shadow-[var(--shadow-soft)]"
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
              <span className="mt-1 block pl-4 text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </span>
            </button>
          );
        })}
      </div>

      {stopped && (
        <div className="rounded-xl border border-ivory-200/80 bg-ivory-100/70 p-4">
          <p className="text-sm font-medium">C&apos;est noté, rien ne commence.</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Vous pouvez revenir quand vous voulez, ou choisir un autre moment.
            Ce n&apos;est ni un refus de l&apos;autre, ni un échec.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        {!stopped ? (
          <Button
            type="button"
            size="lg"
            className="flex-1"
            disabled={decision === null}
            onClick={() => {
              if (decision === null) return;
              if (adult && !consent.ageConfirmed) {
                setAgeError(true);
                return;
              }
              onReady(decision);
            }}
          >
            Continuer
          </Button>
        ) : null}
        <Link
          href={backHref}
          className={cn(
            "press inline-flex h-14 items-center justify-center gap-2 rounded-full border border-ivory-300 bg-card/90 text-sm font-medium text-foreground hover:border-lavender-300",
            stopped ? "flex-1" : "px-6",
          )}
        >
          <ArrowLeft className="size-4" />
          Retour au catalogue
        </Link>
      </div>

      <p className="text-xs leading-relaxed text-graphite-500">
        Aucune réponse n&apos;est déduite de votre silence. Les contenus sensuels
        restent verrouillés tant que vous ne les avez pas explicitement
        autorisés.
      </p>
    </Card>
  );
}
