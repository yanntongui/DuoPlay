"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, ShieldCheck } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDeviceToken } from "@/lib/game/use-device";
import { cn } from "@/lib/utils";

export function SoireeLanding({ backHref = "/explorer" }: { backHref?: string }) {
  const deviceToken = useDeviceToken();
  const createGame = useMutation(api.soiree.createGame);

  const [showCreate, setShowCreate] = useState(false);
  const [hostName, setHostName] = useState("");
  const [ranking, setRanking] = useState(true);
  const [code, setCode] = useState<string | null>(null);

  if (!deviceToken) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-2xl">Soirée DuoPlay</h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Connectez-vous pour organiser ou rejoindre une soirée.
        </p>
      </div>
    );
  }

  if (code) {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-4 p-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-3xl bg-lavender-100 text-4xl">
          🎉
        </span>
        <div>
          <p className="eyebrow mb-1">Code de la soirée</p>
          <h1 className="text-3xl font-bold tracking-wider">{code}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Partagez ce code avec les autres couples pour qu'ils rejoignent.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Button
            type="button"
            onClick={() => {
              if (ranking) {
                window.location.href = `/soiree/${code}`;
              } else {
                window.location.href = `/soiree/${code}`;
              }
            }}
          >
            Passer à la salle
          </Button>
          <Link
            href={backHref}
            className="press inline-flex h-12 items-center justify-center gap-2 rounded-full border border-ivory-300 bg-card/90 text-sm font-medium hover:border-lavender-300"
          >
            <ArrowLeft className="size-4" />
            Retour
          </Link>
        </div>
      </Card>
    );
  }

  if (showCreate) {
    return (
      <Card className="mx-auto flex max-w-md flex-col gap-6 p-6">
        <div>
          <h1 className="text-xl leading-tight">Créer une soirée</h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Organisez une soirée entre 4 et 10 joueurs. Le classement est facultatif.
          </p>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Nom de l'hôte</span>
          <input
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            placeholder="Ex. Thomas"
            className="h-12 w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 outline-none focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60"
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Classement</legend>
          <button
            type="button"
            onClick={() => setRanking(true)}
            className={cn(
              "press flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
              ranking
                ? "border-lavender-300 bg-lavender-200/60 text-lavender-700"
                : "border-ivory-200 bg-white/[0.03] text-foreground hover:border-lavender-300/70",
            )}
          >
            <span className="flex size-5 items-center justify-center rounded-full border border-current">
              {ranking && <span className="size-2.5 rounded-full bg-current" />}
            </span>
            <div>
              <p className="text-sm font-medium">Avec classement</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Points basés sur les réponses correctes
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRanking(false)}
            className={cn(
              "press flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
              !ranking
                ? "border-lavender-300 bg-lavender-200/60 text-lavender-700"
                : "border-ivory-200 bg-white/[0.03] text-foreground hover:border-lavender-300/70",
            )}
          >
            <span className="flex size-5 items-center justify-center rounded-full border border-current">
              {!ranking && <span className="size-2.5 rounded-full bg-current" />}
            </span>
            <div>
              <p className="text-sm font-medium">Sans classement</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Juste le jeu, sans points ni podium
              </p>
            </div>
          </button>
        </fieldset>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCreate(false)}>
            Annuler
          </Button>
          <Button
            onClick={async () => {
              if (!hostName.trim()) return;
              const { code } = await createGame({
                deviceToken,
                hostName: hostName.trim(),
                rankingEnabled: ranking,
              });
              setCode(code);
            }}
            disabled={!hostName.trim()}
          >
            Créer
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-auto flex max-w-md flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl leading-tight">Soirée DuoPlay</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Regroupez 4 à 10 joueurs pour des questions communes.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowCreate(true)}
        className="press flex min-h-16 items-center gap-4 rounded-2xl border border-lavender-300/40 bg-lavender-100/40 px-4 py-4 text-left hover:bg-lavender-100/60"
      >
        <span className="flex size-12 items-center justify-center rounded-xl bg-lavender-200 text-2xl">
          🎉
        </span>
        <div>
          <p className="text-sm font-medium">Créer une soirée</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Vous serez l'hôte, les autres rejoindront avec le code
          </p>
        </div>
      </button>

      <Link
        href="/soiree/join"
        className="press flex min-h-16 items-center gap-4 rounded-2xl border border-ivory-300 bg-card/80 px-4 py-4 text-left hover:border-lavender-300"
      >
        <span className="flex size-12 items-center justify-center rounded-xl bg-ivory-100 text-2xl">
          🚪
        </span>
        <div>
          <p className="text-sm font-medium">Rejoindre</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Entrez le code que l'hôte vous a donné
          </p>
        </div>
      </Link>

      <Link
        href={backHref}
        className="press flex items-center justify-center gap-2 rounded-full border border-ivory-300 bg-card/90 py-3 text-sm font-medium hover:border-lavender-300"
      >
        <ArrowLeft className="size-4" />
        Retour
      </Link>
    </Card>
  );
}
