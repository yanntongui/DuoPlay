"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Erreur inattendue dans l'espace joueur (cf. PRD §20).
 * Message clair, jamais de jargon, et toujours une porte de sortie.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col gap-4">
      <Card
        data-testid="app-error"
        className="flex flex-col items-center gap-3 p-6 text-center"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-2xl">
          ⚠️
        </div>
        <h1 className="text-lg font-semibold">Quelque chose s&apos;est mal passé</h1>
        <p className="text-sm text-muted-foreground">
          Votre partie n&apos;est pas perdue : elle reprend à la dernière
          question non terminée. Réessayez, ou revenez à l&apos;accueil.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <Button type="button" onClick={reset}>
            <RefreshCw className="size-4" />
            Réessayer
          </Button>
          <Link
            href="/accueil"
            className="text-sm text-primary hover:underline"
          >
            Revenir à l&apos;accueil
          </Link>
        </div>
      </Card>
    </div>
  );
}
