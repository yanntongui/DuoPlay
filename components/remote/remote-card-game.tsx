"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Share2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDeviceToken } from "@/lib/game/use-device";
import { cn } from "@/lib/utils";

const RESPONSE_LABELS: Record<string, string> = {
  jaime: "J'aime ❤️",
  a_discuter: "À discuter 💬",
  pas_maintenant: "Pas maintenant ⏰",
  passer: "Passer ⏭️",
};

export function RemoteCardGame({ code }: { code: string }) {
  const deviceToken = useDeviceToken();
  const game = useQuery(api.remoteCards.getCardGameByCode, { code });
  const responses = useQuery(
    api.remoteCards.getCardResponses,
    game && game !== null ? { roomId: game._id } : "skip",
  );
  const submitResponse = useMutation(api.remoteCards.submitCardResponse);
  const advanceCard = useMutation(api.remoteCards.advanceCard);
  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState(false);

  if (game === undefined) {
    return (
      <Card className="mx-auto flex max-w-md items-center justify-center p-12">
        <span className="animate-spin text-muted-foreground">🔄</span>
      </Card>
    );
  }

  if (!game) {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
        <span className="text-4xl">🔍</span>
        <h1 className="text-lg font-medium">Partie introuvable</h1>
        <Button variant="outline" onClick={() => (window.location.href = "/remote")}>
          Retour
        </Button>
      </Card>
    );
  }

  const total = game.cardDetails.length;
  const isHost = deviceToken === game.hostDeviceToken;
  const isGuest = deviceToken === game.guestToken;
  const playerToken = isHost
    ? game.hostDeviceToken
    : isGuest
      ? game.guestToken
      : undefined;

  const currentCard = game.cardDetails[game.currentCard];

  const myResponse = responses?.find(
    (r) => r.playerToken === deviceToken && r.questionId === currentCard?._id,
  );
  const partnerToken = isHost ? game.guestToken : game.hostDeviceToken;
  const partnerResponse = responses?.find(
    (r) => r.playerToken === partnerToken && r.questionId === currentCard?._id,
  );

  async function respond(
    kind: "jaime" | "a_discuter" | "pas_maintenant" | "passer",
  ) {
    if (!game || !playerToken || !currentCard || pending) return;
    setPending(true);
    try {
      await submitResponse({
        roomId: game._id,
        playerToken,
        questionId: currentCard._id,
        response: kind,
      });
    } finally {
      setPending(false);
    }
  }

  async function next() {
    if (!game || !playerToken || pending) return;
    setPending(true);
    try {
      await advanceCard({ roomId: game._id, playerToken });
    } catch {
      /* La carte a déjà été avancée par l'autre joueur. */
    } finally {
      setPending(false);
    }
  }

  /* Salle en attente du partenaire */
  if (game.status === "waiting" && !game.guestToken) {
    return (
      <Card className="mx-auto flex max-w-md flex-col gap-6 p-6">
        <div className="text-center">
          <p className="eyebrow mb-1">En attente</p>
          <h1 className="text-4xl font-bold tracking-widest">{game.roomCode}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Partagez ce code avec votre partenaire.
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 rounded-xl border border-ivory-200/80 bg-ivory-100/60 p-4">
          <p className="text-sm">Mode cartes · {total} cartes</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(game.roomCode);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? (
              <>
                <Check className="size-4" />
                Copié
              </>
            ) : (
              <>
                <Share2 className="size-4" />
                Copier
              </>
            )}
          </Button>
        </div>
      </Card>
    );
  }

  /* Partie terminée */
  if (game.status === "completed") {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-4 p-6 text-center">
        <span className="text-4xl">🎉</span>
        <div>
          <p className="text-sm font-medium">Partie terminée</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Vous avez parcouru les {total} cartes ensemble.
          </p>
        </div>
        <Button variant="outline" onClick={() => (window.location.href = "/remote")}>
          Nouvelle session
        </Button>
      </Card>
    );
  }

  /* Révélation de la manche : les deux ont répondu */
  if (myResponse && partnerResponse) {
    return (
      <Card className="reveal-sync mx-auto flex max-w-md flex-col gap-6 p-6">
        <div className="text-center">
          <p className="eyebrow mb-1">Révélons ensemble</p>
          <h1 className="text-xl">Vos réponses</h1>
        </div>

        <p className="rounded-xl border border-lavender-300/25 bg-lavender-100/40 p-4 text-center text-base leading-relaxed">
          {currentCard?.prompt ?? "Carte terminée"}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-lavender-300/25 bg-lavender-100/40 p-4">
            <p className="eyebrow mb-2 text-lavender-700">Toi</p>
            <p className="text-base">{RESPONSE_LABELS[myResponse.response]}</p>
          </div>
          <div className="rounded-xl border border-ivory-200/80 bg-card/60 p-4">
            <p className="eyebrow mb-2">{isHost ? game.guestName : game.hostName}</p>
            <p className="text-base">{RESPONSE_LABELS[partnerResponse.response]}</p>
          </div>
        </div>

        <Button size="lg" onClick={next} disabled={pending}>
          {game.currentCard + 1 >= total ? "Terminer la partie" : "Carte suivante"}
        </Button>
      </Card>
    );
  }

  /* En attente de la réponse du partenaire */
  if (myResponse && !partnerResponse) {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-4 p-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-3xl bg-ivory-100 text-4xl">
          ⏳
        </span>
        <div>
          <p className="text-sm font-medium">Réponse enregistrée</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            En attente de votre partenaire…
          </p>
        </div>
        <p className="rounded-xl border border-ivory-200/80 bg-card/60 p-3 text-sm">
          {RESPONSE_LABELS[myResponse.response]}
        </p>
      </Card>
    );
  }

  /* Écran de jeu */
  if (!currentCard) {
    return (
      <Card className="mx-auto flex max-w-md items-center justify-center p-12">
        <span className="text-muted-foreground">Aucune carte disponible.</span>
      </Card>
    );
  }

  return (
    <Card className="mx-auto flex max-w-md flex-col gap-6 p-6">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="eyebrow">Carte {game.currentCard + 1}</span>
        <span>
          {game.currentCard + 1} / {total}
        </span>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-ivory-200/60">
        <div
          className="h-full rounded-full bg-lavender-400 transition-all duration-300"
          style={{
            width: `${((game.currentCard + 1) / Math.max(total, 1)) * 100}%`,
          }}
        />
      </div>

      <div className="rounded-2xl border border-lavender-300/25 bg-lavender-100/40 p-6">
        <div className="mb-3 flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium",
              currentCard.depth === "leger" && "bg-neutral-500/10 text-neutral-600",
              currentCard.depth === "moyen" && "bg-lavender-200 text-lavender-800",
              currentCard.depth === "profond" && "bg-coral-100 text-coral-700",
            )}
          >
            {currentCard.depth === "leger"
              ? "Léger"
              : currentCard.depth === "moyen"
                ? "Moyen"
                : "Profond"}
          </span>
          {currentCard.isOptional && (
            <span className="rounded-full bg-neutral-500/10 px-2 py-0.5 text-[11px] text-neutral-600">
              Optionnel
            </span>
          )}
        </div>
        <p className="text-lg leading-relaxed">{currentCard.prompt}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" disabled={pending} onClick={() => respond("jaime")}>
          ❤️ J'aime
        </Button>
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => respond("a_discuter")}
        >
          💬 À discuter
        </Button>
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => respond("pas_maintenant")}
        >
          ⏰ Pas maintenant
        </Button>
        <Button variant="outline" disabled={pending} onClick={() => respond("passer")}>
          ⏭️ Passer
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Votre partenaire ne verra votre choix qu'une fois qu'il aura répondu.
      </p>
    </Card>
  );
}
