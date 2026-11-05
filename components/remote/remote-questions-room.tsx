"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Share2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { copyText } from "@/lib/clipboard";
import { useDeviceToken } from "@/lib/game/use-device";
import { cn } from "@/lib/utils";

export function RemoteQuestionsRoom({ code }: { code: string }) {
  const deviceToken = useDeviceToken();
  const room = useQuery(api.remoteRoom.getRoomByCode, { code });
  const answers = useQuery(
    api.remoteRoom.getAnswers,
    room && room !== null ? { roomId: room._id } : "skip",
  );
  const submitAnswer = useMutation(api.remoteRoom.submitAnswer);
  const advanceQuestion = useMutation(api.remoteRoom.advanceQuestion);

  const [copied, setCopied] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [pending, setPending] = useState(false);

  const currentQuestion = room?.questionDetails[room.currentQuestion];
  const total = room?.questionDetails.length ?? 0;

  useEffect(() => {
    setAnswerText("");
  }, [room?.currentQuestion]);

  if (room === undefined) {
    return (
      <Card className="mx-auto flex max-w-md items-center justify-center p-12">
        <span className="animate-spin text-muted-foreground">🔄</span>
      </Card>
    );
  }

  if (!room) {
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

  const isHost = room.hostDeviceToken === deviceToken;
  const isGuest = !!room.guestToken && room.guestToken === deviceToken;
  const playerToken = isHost
    ? room.hostDeviceToken
    : isGuest
      ? room.guestToken
      : undefined;

  const myAnswer = answers?.find(
    (a) => a.playerToken === deviceToken && a.questionId === currentQuestion?._id,
  );
  const partnerToken = isHost ? room.guestToken : room.hostDeviceToken;
  const partnerAnswer = answers?.find(
    (a) => a.playerToken === partnerToken && a.questionId === currentQuestion?._id,
  );

  async function handleSubmit() {
    if (!room || !playerToken || !currentQuestion || !answerText.trim() || pending) {
      return;
    }
    setPending(true);
    try {
      await submitAnswer({
        roomId: room._id,
        playerToken,
        questionId: currentQuestion._id,
        answer: answerText.trim(),
      });
    } finally {
      setPending(false);
    }
  }

  async function next() {
    if (!room || !playerToken || pending) return;
    setPending(true);
    try {
      await advanceQuestion({ roomId: room._id, playerToken });
      setAnswerText("");
    } catch {
      /* La manche a déjà été avancée par l'autre joueur. */
    } finally {
      setPending(false);
    }
  }

  async function copyCode(value: string) {
    if (!(await copyText(value))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* En attente du partenaire */
  if (room.status === "waiting" && !room.guestToken) {
    return (
      <Card className="mx-auto flex max-w-md flex-col gap-6 p-6">
        <div className="text-center">
          <p className="eyebrow mb-1">En attente</p>
          <h1 className="text-4xl font-bold tracking-widest">{room.roomCode}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Partagez ce code avec votre partenaire.
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-xl border border-ivory-200/80 bg-ivory-100/60 p-4">
          <div>
            <p className="text-sm font-medium">Invitation</p>
            <p className="text-xs text-muted-foreground">
              Mode questions · {total} questions
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void copyCode(room.roomCode)}>
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
  if (room.status === "completed") {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-4 p-6 text-center">
        <span className="text-4xl">🎉</span>
        <div>
          <p className="text-sm font-medium">Session terminée</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Vous avez répondu aux {total} questions ensemble.
          </p>
        </div>
        <Button variant="outline" onClick={() => (window.location.href = "/remote")}>
          Nouvelle session
        </Button>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="mx-auto flex max-w-md items-center justify-center p-12">
        <span className="text-muted-foreground">Aucune question disponible.</span>
      </Card>
    );
  }

  /* Révélation : les deux ont répondu */
  if (myAnswer && partnerAnswer) {
    return (
      <Card className="reveal-sync mx-auto flex max-w-md flex-col gap-6 p-6">
        <div className="text-center">
          <p className="eyebrow mb-1">Révélons ensemble</p>
          <h1 className="text-xl">Vos réponses</h1>
        </div>

        <p className="rounded-xl border border-lavender-300/25 bg-lavender-100/40 p-4 text-center text-base leading-relaxed">
          {currentQuestion.prompt}
        </p>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-lavender-300/25 bg-lavender-100/40 p-4">
            <p className="eyebrow mb-2 text-lavender-700">Ta réponse</p>
            <p className="text-base leading-relaxed">{myAnswer.answer}</p>
          </div>

          <div className="rounded-xl border border-ivory-200/80 bg-card/60 p-4">
            <p className="eyebrow mb-2">
              Réponse de {isHost ? room.guestName : room.hostName}
            </p>
            <p className="text-base leading-relaxed">{partnerAnswer.answer}</p>
          </div>
        </div>

        <Button size="lg" onClick={next} disabled={pending}>
          {room.currentQuestion + 1 >= total
            ? "Terminer la session"
            : "Question suivante"}
        </Button>
      </Card>
    );
  }

  /* En attente de la réponse du partenaire */
  if (myAnswer && !partnerAnswer) {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-4 p-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-3xl bg-ivory-100 text-4xl">
          ⏳
        </span>
        <div>
          <p className="text-sm font-medium">Réponse enregistrée</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Votre partenaire est en train de répondre.
          </p>
        </div>
        <p className="rounded-xl border border-ivory-200/80 bg-card/60 p-3 text-sm">
          {myAnswer.answer}
        </p>
      </Card>
    );
  }

  /* Écran de jeu */
  return (
    <Card className="mx-auto flex max-w-md flex-col gap-6 p-6">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="eyebrow">Question {room.currentQuestion + 1}</span>
        <span>
          {room.currentQuestion + 1} / {total}
        </span>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-ivory-200/60">
        <div
          className="h-full rounded-full bg-lavender-400 transition-all duration-300"
          style={{
            width: `${((room.currentQuestion + 1) / Math.max(total, 1)) * 100}%`,
          }}
        />
      </div>

      <div className="rounded-2xl border border-lavender-300/25 bg-lavender-100/40 p-6">
        <p className="text-lg leading-relaxed">{currentQuestion.prompt}</p>
      </div>

      {currentQuestion.options && currentQuestion.options.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={answerText === option}
              onClick={() => setAnswerText(option)}
              className={cn(
                "rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                answerText === option
                  ? "border-lavender-400 bg-lavender-100/50"
                  : "border-ivory-200 bg-card/50 hover:border-lavender-300",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Votre réponse</span>
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            rows={4}
            placeholder="Écrivez votre réponse..."
            className="w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 py-3 outline-none focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60"
          />
        </label>
      )}

      <Button size="lg" onClick={handleSubmit} disabled={!answerText.trim() || pending}>
        {pending ? "Envoi…" : "Envoyer"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Votre partenaire ne verra pas votre réponse avant la révélation.
      </p>
    </Card>
  );
}
