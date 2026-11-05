"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDeviceToken } from "@/lib/game/use-device";

export function SoireeJoin({ backHref = "/soiree" }: { backHref?: string }) {
  const deviceToken = useDeviceToken();
  const joinGame = useMutation(api.soiree.joinGame);

  const [code, setCode] = useState("");
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!deviceToken) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-2xl">Rejoindre une soirée</h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Connectez-vous pour rejoindre une soirée.
        </p>
      </div>
    );
  }

  return (
    <Card className="mx-auto flex max-w-md flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl leading-tight">Rejoindre une soirée</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Entrez le code de la soirée que l'hôte vous a donné.
        </p>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Code de la soirée</span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={4}
          placeholder="ABCD"
          className="h-12 w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 text-center text-lg font-mono tracking-widest outline-none focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Nom de votre équipe</span>
        <input
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Ex. Les couples"
          className="h-12 w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 outline-none focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60"
        />
      </label>

      {error && (
        <div className="rounded-xl border border-coral-200/70 bg-coral-100/70 px-3.5 py-2.5 text-sm text-coral-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Link
          href={backHref}
          className="press inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-ivory-300 bg-card/90 text-sm font-medium hover:border-lavender-300"
        >
          <ArrowLeft className="size-4" />
          Retour
        </Link>
        <Button
          onClick={async () => {
            if (!code || !teamName.trim()) return;
            setError(null);
            try {
              await joinGame({
                deviceToken,
                code,
                teamName: teamName.trim(),
              });
              window.location.href = `/soiree/${code}`;
            } catch (e: any) {
              setError(e.message ?? "Impossible de rejoindre");
            }
          }}
          disabled={!code || !teamName.trim()}
        >
          Rejoindre
        </Button>
      </div>
    </Card>
  );
}
