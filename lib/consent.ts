"use client";

import { useEffect, useState } from "react";

/**
 * Consentement local (par appareil).
 *
 * Rien n'est déduit du silence : l'absence de choix garde les contenus adultes
 * verrouillés et n'autorise aucune session intime. Les réponses sont stockées
 * localement, jamais publiées ni rattachées au partenaire.
 */

export type ConsentDecision = "oui" | "peut-etre" | "pas-maintenant" | "non";

export type ConsentState = {
  /** Profondeur maximale acceptée pour les prochaines sessions. */
  depth: ConsentDecision;
  /** Contenus sensuels / 18+. */
  adult: ConsentDecision;
  ageConfirmed: boolean;
  updatedAt: number;
};

export const DEFAULT_CONSENT: ConsentState = {
  depth: "oui",
  adult: "pas-maintenant",
  ageConfirmed: false,
  updatedAt: 0,
};

export const CONSENT_DECISIONS: Array<{
  slug: ConsentDecision;
  label: string;
  description: string;
}> = [
  {
    slug: "oui",
    label: "Oui",
    description: "Je suis d'accord pour cette session.",
  },
  {
    slug: "peut-etre",
    label: "Peut-être",
    description: "On avance doucement, et je peux passer à tout moment.",
  },
  {
    slug: "pas-maintenant",
    label: "Pas maintenant",
    description: "Je préfère m'arrêter là. Ce n'est pas un échec.",
  },
  {
    slug: "non",
    label: "Non",
    description: "Je ne veux pas de cette session. C'est respecté.",
  },
];

const KEY = "duoplay:consent:v1";
const EVENT = "duoplay:consent-changed";

function read(): ConsentState {
  if (typeof window === "undefined") return DEFAULT_CONSENT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_CONSENT;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    return {
      depth: parsed.depth ?? DEFAULT_CONSENT.depth,
      adult: parsed.adult ?? DEFAULT_CONSENT.adult,
      ageConfirmed: Boolean(parsed.ageConfirmed),
      updatedAt: parsed.updatedAt ?? 0,
    };
  } catch {
    return DEFAULT_CONSENT;
  }
}

function write(state: ConsentState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* navigation privée : le consentement reste valable pour la session */
  }
}

export function readConsent(): ConsentState {
  return read();
}

export function saveConsent(patch: Partial<ConsentState>): ConsentState {
  const next = { ...read(), ...patch, updatedAt: Date.now() };
  write(next);
  return next;
}

export function confirmAge(): ConsentState {
  return saveConsent({ ageConfirmed: true });
}

export function useConsent(): ConsentState {
  const [state, setState] = useState<ConsentState>(DEFAULT_CONSENT);

  useEffect(() => {
    const update = () => setState(read());
    update();
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return state;
}

export type AllowedDepth = "leger" | "moyen" | "profond" | null;

/** La décision de profondeur se traduit en limite concrète de contenu. */
export function maxDepthFor(decision: ConsentDecision): AllowedDepth {
  if (decision === "oui") return "profond";
  if (decision === "peut-etre") return "moyen";
  if (decision === "pas-maintenant") return "leger";
  return null;
}

export function depthAllowed(
  consent: ConsentState,
  depth: "leger" | "moyen" | "profond",
): boolean {
  const max = maxDepthFor(consent.depth);
  if (max === null) return false;
  const rank = { leger: 1, moyen: 2, profond: 3 };
  return rank[depth] <= rank[max];
}

export function adultUnlocked(consent: ConsentState): boolean {
  return (
    consent.ageConfirmed &&
    (consent.adult === "oui" || consent.adult === "peut-etre")
  );
}

/** Une décision négative arrête la session sans la présenter comme un échec. */
export function isStopDecision(decision: ConsentDecision): boolean {
  return decision === "pas-maintenant" || decision === "non";
}
