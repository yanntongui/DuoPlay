"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Loader2, Share2, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmojiTile, Pill } from "@/components/ui/surface";
import { useDeviceToken } from "@/lib/game/use-device";
import { cn } from "@/lib/utils";

export function SoireeRoom({ code }: { code: string }) {
  const deviceToken = useDeviceToken();
  const game = useQuery(api.soiree.byCode, { code });
  const teams = useQuery(api.soiree.teams, { code });
  const gameQuestions = useQuery(api.soiree.getQuestions, { gameId: game?._id ?? ("skip" as any) });
  const allQuestions = useQuery(api.questions.listAll);
  const [copied, setCopied] = useState(false);
  const [joined, setJoined] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerInput, setAnswerInput] = useState("");
  const [validating, setValidating] = useState(false);
  const [validationQuestionIndex, setValidationQuestionIndex] = useState(0);
  const [showPodium, setShowPodium] = useState(false);

  useEffect(() => {
    if (game?.status === "in_progress") {
      setCurrentQuestionIndex(0);
      setAnswerInput("");
    }
  }, [game?.status]);

  useEffect(() => {
    if (!deviceToken || !game || joined) return;
    const myTeam = teams?.find((t) => t.deviceToken === deviceToken);
    if (myTeam) setJoined(true);
  }, [deviceToken, game, teams, joined]);

  const startGame = useMutation(api.soiree.startGame);
  const calculateScores = useMutation(api.soiree.calculateScores);
  const submitAnswer = useMutation(api.soiree.submitAnswer);
  const gradeAnswer = useMutation(api.soiree.gradeAnswer);
  const finalizeScores = useMutation(api.soiree.finalizeScores);

  function getMyTeam() {
    if (!teams || !deviceToken) return undefined;
    return teams.find((t) => t.deviceToken === deviceToken);
  }

  const myTeam = getMyTeam();

  async function handleAnswer() {
    if (!myTeam || !gameQuestions?.[currentQuestionIndex]) return;
    const q = gameQuestions[currentQuestionIndex];
    await submitAnswer({ teamId: myTeam._id, questionId: q.questionId, answer: answerInput });
    setAnswerInput("");
    if (currentQuestionIndex < gameQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      alert("Votre réponse est enregistrée !");
    }
  }

  async function handleGrade(teamId: string, questionId: string, isCorrect: boolean) {
    await gradeAnswer({ teamId: teamId as any, questionId: questionId as any, isCorrect });
  }

  async function completeValidation() {
    if (!game) return;
    const sorted = await finalizeScores({ gameId: game._id });
    setValidating(false);
    setShowPodium(true);
  }

  function toggleQuestion(questionId: string) {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  }

  function startWithSelected() {
    if (!game || !teams || teams.length < 2 || selectedQuestions.length === 0) return;
    startGame({ gameId: game._id, questions: selectedQuestions });
    window.location.reload();
  }

  if (!game) {
    return (
      <Card className="mx-auto flex max-w-md items-center justify-center p-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (game.status === "waiting" && !joined) {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-4 p-6 text-center">
        <EmojiTile tone="lavender" size="lg">
          🚪
        </EmojiTile>
        <div>
          <p className="text-sm font-medium">En attente</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Vous avez rejoint la soirée. En attente que d'autres équipes arrivent.
          </p>
        </div>
      </Card>
    );
  }

  if (game.status === "waiting" && joined && game.hostDeviceToken === deviceToken) {
    return (
      <Card className="mx-auto flex max-w-md flex-col gap-6 p-6">
        <div className="text-center">
          <p className="eyebrow mb-1">Code de la soirée</p>
          <h1 className="text-4xl font-bold tracking-widest">{code}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Invitez jusqu'à 10 joueurs avec ce code.
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-xl border border-ivory-200/80 bg-ivory-100/60 p-4">
          <div>
            <p className="text-sm font-medium">Équipes</p>
            <p className="text-xs text-muted-foreground">
              {teams?.length ?? 0}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? (
              <><Check className="size-4" />Copié</>
            ) : (
              <><Share2 className="size-4" />Copier</>
            )}
          </Button>
        </div>

        {game.rankingEnabled && (
          <div className="rounded-xl border border-lavender-300/25 bg-lavender-100/50 p-3.5">
            <p className="flex items-center gap-2 text-sm">
              <span className="flex size-4 items-center justify-center rounded-full bg-lavender-300" />
              Classement activé : points basés sur les réponses correctes
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Questions ({selectedQuestions.length})</p>
            <button
              type="button"
              onClick={() => setSelectedQuestions(allQuestions?.map((q) => q._id) ?? [])}
              className="text-xs text-lavender-600 hover:text-lavender-700"
            >
              Tout sélectionner
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto rounded-xl border border-ivory-200/80 bg-card/60">
            {allQuestions?.map((q) => (
              <button
                key={q._id}
                type="button"
                onClick={() => toggleQuestion(q._id)}
                className={cn(
                  "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-all",
                  selectedQuestions.includes(q._id)
                    ? "bg-lavender-100/60"
                    : "hover:bg-card"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-4 items-center justify-center rounded border",
                    selectedQuestions.includes(q._id)
                      ? "border-lavender-300 bg-lavender-300"
                      : "border-ivory-300"
                  )}
                >
                  {selectedQuestions.includes(q._id) && (
                    <Check className="size-3 text-white" />
                  )}
                </span>
                <p className="text-sm leading-snug">{q.prompt}</p>
              </button>
            ))}
          </div>
        </div>

        <Button
          size="lg"
          onClick={startWithSelected}
          disabled={!teams || teams.length < 2 || selectedQuestions.length === 0}
        >
          Lancer la soirée
        </Button>

        <div className="text-center text-xs text-muted-foreground">
          {teams?.length ?? 0} équipe{teams && teams.length > 1 ? "s" : ""} join
        </div>
      </Card>
    );
  }

  if (game.status === "in_progress" || game.status === "finished") {
    const questionText = gameQuestions?.[currentQuestionIndex]?.questionId;
    const questionPrompt = questionText && allQuestions?.find((q) => q._id === questionText)?.prompt;
    const canAnswer = myTeam && game.status === "in_progress";

    return (
      <Card className="mx-auto flex max-w-md flex-col gap-6 p-6">
        <div className="text-center">
          <p className="eyebrow mb-1">{game.status === "in_progress" ? "En cours" : "Terminée"}</p>
          <h1 className="text-xl font-medium">Soirée DuoPlay</h1>
        </div>

        {canAnswer && questionPrompt ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-lavender-300/25 bg-lavender-100/40 p-4">
              <p className="eyebrow mb-2 text-lavender-700">Question {currentQuestionIndex + 1} / {gameQuestions?.length}</p>
              <p className="text-base font-medium leading-relaxed">{questionPrompt}</p>
            </div>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Votre réponse</span>
              <textarea
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 py-3 outline-none focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60"
                placeholder="Écrivez votre réponse ici..."
              />
            </label>

            <Button size="lg" onClick={handleAnswer} disabled={!answerInput.trim()}>
              {currentQuestionIndex < (gameQuestions?.length ?? 0) - 1 ? "Envoyer et suivant" : "Terminer"}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              Les équipes ne voient pas les réponses des autres
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {teams && teams.map((team, i) => (
              <div
                key={team._id}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-3.5",
                  myTeam?._id === team._id
                    ? "border-lavender-300 bg-lavender-100/40"
                    : "border-ivory-200 bg-card/60",
                )}
              >
                <div>
                  <p className="text-sm font-medium">{team.teamName}</p>
                  {game.rankingEnabled && (
                    <p className="text-xs text-muted-foreground">
                      {team.score} point{team.score > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Pill tone="neutral">{i + 1}</Pill>
                </div>
              </div>
            ))}
          </div>
        )}

        {game.status === "finished" && game.rankingEnabled && (
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setValidating(true)}
              disabled={!myTeam || myTeam.deviceToken !== game.hostDeviceToken}
            >
              {validating ? "Terminer la validation" : "Valider les réponses"}
            </Button>
            {validating && gameQuestions?.[validationQuestionIndex] && (
              <ValidationPanel
                questionId={gameQuestions[validationQuestionIndex].questionId as any}
                questionIndex={validationQuestionIndex}
                totalQuestions={gameQuestions.length}
                gameId={game._id as any}
                onGrade={handleGrade}
                onNext={() => setValidationQuestionIndex((prev) => prev + 1)}
                onComplete={completeValidation}
              />
            )}
            {showPodium && (
              <Podium teams={teams ?? []} />
            )}
          </div>
        )}
      </Card>
    );
  }

  return null;
}

function Podium({ teams }: { teams: { _id: string; teamName: string; score: number }[] }) {
  const sorted = teams.slice().sort((a, b) => b.score - a.score);
  const [first, second, third] = sorted;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4">
      <div className="text-center">
        <p className="eyebrow mb-1">Podium final</p>
        <h2 className="text-2xl font-bold">🏆</h2>
      </div>

      <div className="flex w-full items-end justify-center gap-2">
        {/* 2nd place */}
        {second && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-ivory-200/80 text-2xl font-bold text-muted-foreground">
              {second.score}
            </div>
            <Pill tone="neutral">2e</Pill>
            <p className="text-sm font-medium text-center w-full truncate">{second.teamName}</p>
          </div>
        )}

        {/* 1st place */}
        {first && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-primary text-3xl font-bold text-white shadow-lg">
              {first.score}
            </div>
            <Pill tone="lavender">1er</Pill>
            <p className="text-sm font-medium text-center w-full truncate">{first.teamName}</p>
          </div>
        )}

        {/* 3rd place */}
        {third && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-coral-100/60 text-2xl font-bold text-coral-700">
              {third.score}
            </div>
            <Pill tone="neutral">3e</Pill>
            <p className="text-sm font-medium text-center w-full truncate">{third.teamName}</p>
          </div>
        )}
      </div>

      {/* Remaining teams */}
      {sorted.length > 3 && (
        <div className="mt-2 flex flex-col gap-1">
          {sorted.slice(3).map((team, i) => (
            <div
              key={team._id}
              className="flex items-center justify-between rounded-lg border border-ivory-200/80 bg-card p-2"
            >
              <p className="text-sm font-medium">{team.teamName}</p>
              <Pill tone="neutral">{team.score} pts</Pill>
            </div>
          ))}
        </div>
      )}

      <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
        Nouvelle soirée
      </Button>
    </div>
  );
}

function ValidationPanel({
  questionId,
  questionIndex,
  totalQuestions,
  onGrade,
  onNext,
  onComplete,
  gameId,
}: {
  questionId: string;
  questionIndex: number;
  totalQuestions: number;
  onGrade: (teamId: string, questionId: string, isCorrect: boolean) => Promise<void>;
  onNext: () => void;
  onComplete: () => void;
  gameId: string;
}) {
  const questions = useQuery(api.questions.listAll);
  const q = questions?.find((q) => q._id === questionId);
  const answers = useQuery(api.soiree.getAnswersByQuestion, {
    gameId: gameId as any,
    questionId: questionId as any,
  });

  const questionText = q?.prompt;

  return (
    <div className="rounded-xl border border-lavender-300/25 bg-lavender-100/40 p-4">
      <p className="eyebrow mb-2 text-lavender-700">Question {questionIndex + 1} / {totalQuestions}</p>
      <p className="text-sm font-medium leading-relaxed">{questionText}</p>

      <div className="mt-3 flex flex-col gap-2">
        {answers?.map((answer) => (
          <div
            key={answer._id}
            className="flex items-center justify-between rounded-lg border border-ivory-200 bg-card p-3"
          >
            <div>
              <p className="text-sm font-medium">{answer.teamName}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{answer.answer}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onGrade(answer._id as any, answer.questionId as any, true)}
                className="press rounded-md bg-lavender-100 px-2 py-1 text-xs font-medium text-lavender-700 hover:bg-lavender-200"
              >
                ✓ Correct
              </button>
              <button
                type="button"
                onClick={() => onGrade(answer._id as any, answer.questionId as any, false)}
                className="press rounded-md bg-coral-100 px-2 py-1 text-xs font-medium text-coral-700 hover:bg-coral-200"
              >
                ✕ Incorrect
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => questionIndex < totalQuestions - 1 ? onNext() : onComplete()}
        >
          {questionIndex < totalQuestions - 1 ? "Suivante" : "Terminer"}
        </Button>
      </div>
    </div>
  );
}
