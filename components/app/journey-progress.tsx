"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface JourneyStep {
  dayIndex: number;
  title: string;
  prompt?: string;
  experienceId?: string;
  mission?: string;
  completed: boolean;
  seen: boolean;
}

interface JourneyProgressProps {
  _slug: string;
  title: string;
  emoji: string;
  steps: JourneyStep[];
  totalDays: number;
  onMarkSeen: (dayIndex: number) => void;
  onMarkComplete: (dayIndex: number) => void;
}

export function JourneyProgress({
  _slug,
  title,
  emoji,
  steps,
  totalDays,
  onMarkSeen,
  onMarkComplete,
}: JourneyProgressProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const completedSteps = steps.filter((s) => s.completed).length;
  const progress = Math.round((completedSteps / totalDays) * 100);

  const activeStep = selectedDay !== null ? steps[selectedDay] : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header avec progression */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-coral-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {completedSteps}/{totalDays}
          </span>
        </div>
      </div>

      {/* Timeline des jours */}
      <div className="grid grid-cols-7 gap-2">
        {steps.map((step, index) => (
          <button
            key={step.dayIndex}
            onClick={() => {
              setSelectedDay(index);
              if (!step.seen) onMarkSeen(step.dayIndex);
            }}
            className={cn(
              "aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all",
              selectedDay === index && "ring-2 ring-coral-400",
              step.completed && "bg-coral-100 text-coral-700",
              !step.completed && step.seen && "bg-lavender-100 text-lavender-700",
              !step.seen && "bg-muted text-muted-foreground hover:bg-accent",
            )}
          >
            <span>J{step.dayIndex + 1}</span>
            {step.completed && <span>✓</span>}
          </button>
        ))}
      </div>

      {/* Détail du jour sélectionné */}
      {activeStep && (
        <Card
          className={cn(
            "p-6 transition-all",
            activeStep.completed && "bg-coral-50",
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="px-2 py-0.5 rounded-full text-xs font-medium border border-border">
              Jour {activeStep.dayIndex + 1}
            </div>
            {activeStep.completed ? (
              <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-coral-100 text-coral-700">
                Terminé
              </div>
            ) : (
              <div className="px-2 py-0.5 rounded-full text-xs font-medium border border-border">
                À faire
              </div>
            )}
          </div>

          <h3 className="text-lg font-medium mb-2">{activeStep.title}</h3>

          {activeStep.prompt && (
            <p className="text-muted-foreground mb-4">{activeStep.prompt}</p>
          )}

          {activeStep.mission && (
            <div className="bg-card rounded-lg p-4 mb-4">
              <p className="text-sm font-medium">Mission :</p>
              <p className="text-sm text-muted-foreground">{activeStep.mission}</p>
            </div>
          )}

          <div className="flex gap-2">
            {!activeStep.completed && (
              <Button
                size="sm"
                onClick={() => onMarkComplete(activeStep.dayIndex)}
              >
                Marquer termin&#233;
              </Button>
            )}
            {activeStep.experienceId && (
              <Button variant="outline" size="sm">
                Explorer l&#39;exp&#233;rience
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}