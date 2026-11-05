"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Share2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { copyText } from "@/lib/clipboard";
import { useDeviceToken } from "@/lib/game/use-device";
import { cn } from "@/lib/utils";

const DICE_CATEGORIES = [
  { value: "connexion", label: "Connexion", emoji: "🤝" },
  { value: "sensations", label: "Sensations", emoji: "✨" },
  { value: "defis", label: "Défis", emoji: "🎯" },
  { value: "fantasmes", label: "Fantasmes", emoji: "🔥" },
];

/** Chaque face du dé ouvre une direction de conversation. */
const DICE_FACES: Record<
  number,
  { label: string; emoji: string; hint: string }
> = {
  1: {
    label: "Question",
    emoji: "💬",
    hint: "Une question pour mieux se connaître.",
  },
  2: {
    label: "Souvenir",
    emoji: "📷",
    hint: "Un souvenir à rouvrir ensemble.",
  },
  3: {
    label: "Compliment",
    emoji: "💗",
    hint: "Une attention à dire à voix haute.",
  },
  4: {
    label: "Défi",
    emoji: "🌿",
    hint: "Une petite action réelle, jamais imposée.",
  },
  5: {
    label: "Surprise",
    emoji: "✨",
    hint: "Quelque chose d'inattendu, à adapter.",
  },
  6: {
    label: "Discussion",
    emoji: "🫧",
    hint: "Un échange sans bonne réponse.",
  },
};

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  DICE_CATEGORIES.map((category) => [category.value, category.label]),
);

export function RemoteDiceGame({ code }: { code: string }) {
  const deviceToken = useDeviceToken();
  const game = useQuery(api.remoteDice.getDiceGameByCode, { code });
  const results = useQuery(
    api.remoteDice.getDiceResults,
    game && game !== null ? { roomId: game._id } : "skip",
  );
  const rollDice = useMutation(api.remoteDice.rollDice);
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    DICE_CATEGORIES[0].value,
  );
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

  const isHost = deviceToken === game.hostDeviceToken;
  const isGuest = deviceToken === game.guestToken;
  const playerToken = isHost
    ? game.hostDeviceToken
    : isGuest
      ? game.guestToken
      : undefined;

  const myResult = results
    ?.filter((r) => r.playerToken === deviceToken)
    .at(-1);
  const partnerToken = isHost ? game.guestToken : game.hostDeviceToken;
  const partnerResult = results
    ?.filter((r) => r.playerToken === partnerToken)
    .at(-1);

  async function roll() {
    if (!game || !playerToken || pending) return;
    setPending(true);
    try {
      await rollDice({
        roomId: game._id,
        playerToken,
        category: selectedCategory,
      });
    } finally {
      setPending(false);
    }
  }

  async function copyCode(value: string) {
    if (!(await copyText(value))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <div>
            <p className="text-sm font-medium">Invitation</p>
            <p className="text-xs text-muted-foreground">
              Mode dés · {game.durationMinutes} min
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void copyCode(game.roomCode)}>
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

  /* Les deux ont lancé : révélation */
  if (myResult && partnerResult) {
    const mine = DICE_FACES[myResult.result];
    const theirs = DICE_FACES[partnerResult.result];
    const same = myResult.result === partnerResult.result;

    return (
      <Card className="reveal-sync mx-auto flex max-w-md flex-col gap-6 p-6">
        <div className="text-center">
          <p className="eyebrow mb-1">Révélation</p>
          <h1 className="text-xl">Vos dés</h1>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-lavender-300/25 bg-lavender-100/40 p-4 text-center">
            <p className="eyebrow mb-2 text-lavender-700">Toi</p>
            <p className="text-4xl font-bold">🎲 {myResult.result}</p>
            <p className="mt-2 text-sm font-medium">
              {mine.emoji} {mine.label}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {mine.hint}
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              {CATEGORY_LABEL[myResult.category] ?? myResult.category}
            </p>
          </div>
          <div className="rounded-xl border border-ivory-200/80 bg-card/60 p-4 text-center">
            <p className="eyebrow mb-2">
              {isHost ? game.guestName : game.hostName}
            </p>
            <p className="text-4xl font-bold">🎲 {partnerResult.result}</p>
            <p className="mt-2 text-sm font-medium">
              {theirs.emoji} {theirs.label}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {theirs.hint}
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              {CATEGORY_LABEL[partnerResult.category] ?? partnerResult.category}
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {same
            ? "Même résultat — belle synchronisation ✨"
            : "Deux directions différentes : prenez-en une chacun, puis échangez."}
        </p>

        <Button variant="outline" onClick={() => (window.location.href = "/remote")}>
          Nouvelle session
        </Button>
      </Card>
    );
  }

  /* En attente du lancer du partenaire */
  if (myResult && !partnerResult) {
    const mine = DICE_FACES[myResult.result];
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-4 p-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-3xl bg-ivory-100 text-4xl">
          ⏳
        </span>
        <div>
          <p className="text-sm font-medium">
            Vous avez fait {myResult.result} — {mine.emoji} {mine.label}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            En attente du lancer de votre partenaire…
          </p>
        </div>
      </Card>
    );
  }

  /* Écran de lancer */
  return (
    <Card className="mx-auto flex max-w-md flex-col gap-6 p-6">
      <div className="text-center">
        <p className="eyebrow mb-1">Mode dés</p>
        <h1 className="text-xl">Lancez le dé</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Choisissez une ambiance, puis lancez chacun votre tour.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {DICE_CATEGORIES.map((category) => (
          <button
            key={category.value}
            type="button"
            onClick={() => setSelectedCategory(category.value)}
            className={cn(
              "press flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
              selectedCategory === category.value
                ? "border-lavender-400 bg-lavender-100/50"
                : "border-ivory-200 bg-card/50 hover:border-lavender-300",
            )}
          >
            <span aria-hidden="true">{category.emoji}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center py-4 [perspective:700px]">
        <div
          className={cn(
            "flex size-32 items-center justify-center rounded-3xl bg-gradient-to-br from-lavender-100 to-card text-6xl shadow-[var(--shadow-soft)]",
            pending && "dice-roll",
          )}
        >
          🎲
        </div>
      </div>

      <Button size="lg" onClick={roll} disabled={pending || !playerToken}>
        {pending ? "Lancer…" : "Lancer le dé"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Le résultat n'est révélé qu'une fois que vous avez lancé tous les deux.
      </p>
    </Card>
  );
}
