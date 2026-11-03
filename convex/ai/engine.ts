import {
  composeSession,
  type AiBrief,
  type GeneratedSession,
  type GeneratedStep,
} from "./content";
import { violatesExclusions } from "./policy";

/**
 * Garantit qu'aucune étape ne contredit une exclusion. C'est le contrôle
 * déterministe qui rend l'engagement « 0 violation » vérifiable : on ne fait
 * pas confiance au texte, on le relit avant de le stocker.
 */
function safeStep(step: GeneratedStep): GeneratedStep {
  return {
    title: "Une pause en douceur",
    body: "Prenez une respiration ensemble. Dites chacun un mot sur ce dont vous avez besoin maintenant : plus de calme, plus de temps, ou simplement continuer.",
    minutes: Math.max(1, step.minutes),
    kind: "pause",
    intensity: "leger",
  };
}

export function generateSession(brief: AiBrief): GeneratedSession {
  const session = composeSession(brief);
  const steps = session.steps.map((step) =>
    violatesExclusions(`${step.title} ${step.body}`, brief.exclusions)
      ? safeStep(step)
      : step,
  );

  return { ...session, steps };
}

/**
 * Variante plus douce d'une étape, utilisée par la feuille « Remplacer ».
 * Aucun appel modèle : la réponse est immédiate, explicable et sûre.
 */
export function softenStep(step: GeneratedStep): GeneratedStep {
  const byKind: Record<string, GeneratedStep> = {
    ouverture: {
      title: "Un mot, sans se presser",
      body: "Dites chacun un mot sur votre journée. L’autre écoute, sans répondre tout de suite.",
      minutes: step.minutes,
      kind: "ouverture",
      intensity: "leger",
    },
    souvenir: {
      title: "Un souvenir léger",
      body: "Partagez chacun un petit souvenir qui vous fait sourire. Pas besoin que ce soit important : un détail suffit.",
      minutes: step.minutes,
      kind: "souvenir",
      intensity: "leger",
    },
    discussion: {
      title: "Une question plus légère",
      body: "Chacun répond à cette question : « Qu’est-ce qui t’a fait du bien cette semaine ? » Une phrase suffit.",
      minutes: step.minutes,
      kind: "discussion",
      intensity: "leger",
    },
    jeu: {
      title: "Un jeu sans enjeu",
      body: "Chacun décrit sa journée en trois mots. L’autre devine lequel des trois est le plus important.",
      minutes: step.minutes,
      kind: "jeu",
      intensity: "leger",
    },
    gratitude: {
      title: "Un merci simple",
      body: "Dites merci à l’autre pour une petite chose. Rien de plus, rien à justifier.",
      minutes: step.minutes,
      kind: "gratitude",
      intensity: "leger",
    },
    projection: {
      title: "Une idée, sans engagement",
      body: "Imaginez chacun une chose agréable à faire ensemble, sans décider maintenant. L’autre peut simplement écouter.",
      minutes: step.minutes,
      kind: "projection",
      intensity: "leger",
    },
    cloture: {
      title: "Une fin calme",
      body: "Dites chacun un mot sur ce que vous emportez de ce moment. Puis arrêtez-vous là, sans bilan.",
      minutes: step.minutes,
      kind: "cloture",
      intensity: "leger",
    },
  };

  return byKind[step.kind] ?? {
    title: "Une version plus douce",
    body: "Prenez une respiration. Dites chacun ce qui vous ferait du bien maintenant, sans rien devoir à l’autre.",
    minutes: step.minutes,
    kind: "pause",
    intensity: "leger",
  };
}
