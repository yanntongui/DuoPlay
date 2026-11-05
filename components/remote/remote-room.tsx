"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RemoteQuestionsRoom } from "@/components/remote/remote-questions-room";
import { RemoteCardGame } from "@/components/remote/remote-card-game";
import { RemoteDiceGame } from "@/components/remote/remote-dice-game";

/**
 * Routeur du mode à distance : un même code peut désigner une partie de
 * questions, de cartes ou de dés. On interroge les trois tables et on
 * délègue au composant correspondant.
 */
export function RemoteRoom({ code }: { code: string }) {
  const questionsRoom = useQuery(api.remoteRoom.getRoomByCode, { code });
  const cardGame = useQuery(api.remoteCards.getCardGameByCode, { code });
  const diceGame = useQuery(api.remoteDice.getDiceGameByCode, { code });

  // Tant qu'une des requêtes n'a pas répondu, on patiente.
  if (
    questionsRoom === undefined &&
    cardGame === undefined &&
    diceGame === undefined
  ) {
    return (
      <Card className="mx-auto flex max-w-md items-center justify-center p-12">
        <span className="animate-spin text-muted-foreground">🔄</span>
      </Card>
    );
  }

  if (cardGame) return <RemoteCardGame code={code} />;
  if (diceGame) return <RemoteDiceGame code={code} />;
  if (questionsRoom) return <RemoteQuestionsRoom code={code} />;

  if (
    questionsRoom === null &&
    cardGame === null &&
    diceGame === null
  ) {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
        <span className="text-4xl">🔍</span>
        <h1 className="text-lg font-medium">Session introuvable</h1>
        <p className="text-sm text-muted-foreground">
          Vérifiez le code et réessayez.
        </p>
        <Button variant="outline" onClick={() => (window.location.href = "/remote")}>
          Retour
        </Button>
      </Card>
    );
  }

  return (
    <Card className="mx-auto flex max-w-md items-center justify-center p-12">
      <span className="animate-spin text-muted-foreground">🔄</span>
    </Card>
  );
}
