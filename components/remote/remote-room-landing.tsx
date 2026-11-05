"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Copy, Dices, HelpCircle, Layers, RotateCcw } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDeviceToken } from "@/lib/game/use-device";
import { copyText } from "@/lib/clipboard";
import { readableError } from "@/lib/convex-error";
import { cn } from "@/lib/utils";

type GameType = "questions" | "cartes" | "des";

const GAME_TYPES: Array<{
  value: GameType;
  label: string;
  description: string;
  icon: typeof HelpCircle;
}> = [
  {
    value: "questions",
    label: "Questions",
    description: "Tour de rôle, révélation ensemble",
    icon: HelpCircle,
  },
  {
    value: "cartes",
    label: "Cartes",
    description: "J'aime · À discuter · Pas maintenant",
    icon: Layers,
  },
  {
    value: "des",
    label: "Dés",
    description: "Chacun lance, on découvre",
    icon: Dices,
  },
];

export function RemoteRoomLanding({ backHref = "/explorer" }: { backHref?: string }) {
  const deviceToken = useDeviceToken();
  const experiences = useQuery(api.experiences.listAll);

  const createQuestionRoom = useMutation(api.remoteRoom.createRoom);
  const createCardGame = useMutation(api.remoteCards.createCardGame);
  const createDiceGame = useMutation(api.remoteDice.createDiceGame);

  const [showCreate, setShowCreate] = useState(false);
  const [gameType, setGameType] = useState<GameType>("questions");
  const [hostName, setHostName] = useState("");
  const [experienceId, setExperienceId] = useState<string>("");
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publishedExperiences = (experiences ?? []).filter(
    (item) => item.status === "published",
  );
  // Les cartes d'une session sont tirées des questions publiées de
  // l'expérience : toutes les expériences publiées peuvent donc servir.
  const experienceChoices = publishedExperiences;

  async function create() {
    if (deviceToken === undefined || !hostName.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (gameType === "questions") {
        const result = await createQuestionRoom({
          deviceToken,
          hostName: hostName.trim(),
          experienceId: experienceId ? (experienceId as Id<"experiences">) : undefined,
          maxQuestions: 10,
        });
        setCode(result.code);
      } else if (gameType === "cartes") {
        const result = await createCardGame({
          deviceToken,
          hostName: hostName.trim(),
          experienceId: experienceId
            ? (experienceId as Id<"experiences">)
            : undefined,
          maxCards: 10,
        });
        setCode(result.code);
      } else {
        const result = await createDiceGame({
          deviceToken,
          hostName: hostName.trim(),
          durationMinutes: 15,
        });
        setCode(result.code);
      }
    } catch (e) {
      setError(readableError(e, "Création impossible."));
    } finally {
      setBusy(false);
    }
  }

  if (deviceToken === undefined) {
    return (
      <Card className="mx-auto flex max-w-md items-center justify-center p-12">
        <span className="animate-spin text-muted-foreground">🔄</span>
      </Card>
    );
  }

  /* Écran de partage du code */
  if (code) {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-4 p-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-3xl bg-lavender-100 text-4xl">
          🤝
        </span>
        <div>
          <p className="eyebrow mb-1">Code d'invitation</p>
          <h1 className="text-3xl font-bold tracking-wider">{code}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Partagez ce code avec votre partenaire pour qu'il vous rejoigne.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Button onClick={() => (window.location.href = `/remote/${code}`)}>
            Passer à la salle
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              if (!(await copyText(code))) return;
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
                <Copy className="size-4" />
                Copier
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setCode(null);
              setShowCreate(false);
            }}
          >
            Créer une autre session
          </Button>
        </div>
      </Card>
    );
  }

  /* Formulaire de création */
  if (showCreate) {
    const list = experienceChoices;

    return (
      <Card className="mx-auto flex max-w-md flex-col gap-6 p-6">
        <div>
          <h1 className="text-xl leading-tight">Créer une session</h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Invitez votre partenaire et jouez chacun depuis votre appareil.
          </p>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Votre nom</span>
          <input
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            placeholder="Ex. Marie"
            className="h-12 w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 outline-none focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60"
          />
        </label>

        <div className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Type de jeu</span>
          <div className="grid grid-cols-3 gap-2">
            {GAME_TYPES.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setGameType(item.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors",
                    gameType === item.value
                      ? "border-lavender-400 bg-lavender-100/50"
                      : "border-ivory-200 bg-card/50 hover:border-lavender-300",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {GAME_TYPES.find((item) => item.value === gameType)?.description}
          </p>
        </div>

        {gameType !== "des" && (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">
              Expérience
            </span>
            <select
              value={experienceId}
              onChange={(e) => setExperienceId(e.target.value)}
              className="h-12 w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 outline-none focus-visible:border-lavender-400"
            >
              <option value="">Sélection automatique</option>
              {list.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.title}
                </option>
              ))}
            </select>
            {list.length === 0 && (
              <span className="text-xs text-coral-600">
                Aucune expérience publiée pour le moment.
              </span>
            )}
          </label>
        )}

        {error && <p className="text-sm text-coral-600">{error}</p>}

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCreate(false)}>
            Annuler
          </Button>
          <Button
            onClick={create}
            disabled={!hostName.trim() || busy}
          >
            {busy ? "Création…" : "Créer"}
          </Button>
        </div>
      </Card>
    );
  }

  /* Écran d'accueil */
  return (
    <Card className="mx-auto flex max-w-md flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl leading-tight">Mode à distance</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Jouez à distance avec votre partenaire : questions, cartes ou dés.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowCreate(true)}
        className="press flex min-h-16 items-center gap-4 rounded-2xl border border-lavender-300/40 bg-lavender-100/40 px-4 py-4 text-left hover:bg-lavender-100/60"
      >
        <span className="flex size-12 items-center justify-center rounded-xl bg-lavender-200">
          <RotateCcw className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-medium">Créer une session</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Vous êtes l'hôte, votre partenaire rejoint avec le code
          </p>
        </div>
      </button>

      <a
        href="/remote/join"
        className="press flex min-h-16 items-center gap-4 rounded-2xl border border-ivory-300 bg-card/80 px-4 py-4 text-left hover:border-lavender-300"
      >
        <span className="flex size-12 items-center justify-center rounded-xl bg-ivory-100 text-2xl">
          🚪
        </span>
        <div>
          <p className="text-sm font-medium">Rejoindre</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Entrez le code que votre partenaire vous a donné
          </p>
        </div>
      </a>

      <a
        href={backHref}
        className="press flex items-center justify-center gap-2 rounded-full border border-ivory-300 bg-card/90 py-3 text-sm font-medium hover:border-lavender-300"
      >
        Retour
      </a>
    </Card>
  );
}
