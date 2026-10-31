"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface JourneyCardProps {
  _slug: string;
  title: string;
  description: string;
  emoji: string;
  lengthDays: number;
  intensity: "leger" | "moyen" | "profond";
  progress?: number;
  onOpen: () => void;
}

export function JourneyCard({
  _slug,
  title,
  description,
  emoji,
  lengthDays,
  intensity,
  progress,
  onOpen,
}: JourneyCardProps) {
  return (
    <Card
      className={cn(
        "p-6 flex flex-col gap-3 transition-all hover:shadow-lg cursor-pointer",
        intensity === "profond" && "border-gradient-to-br from-coral-200/20 to-lavender-200/20",
      )}
      onClick={onOpen}
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl">{emoji}</span>
        {progress !== undefined && (
          <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-coral-100 text-coral-700">
            {progress}% complété
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <div className="px-2 py-0.5 rounded-full text-xs font-medium border border-border">
          {lengthDays} jour{lengthDays > 1 ? "s" : ""}
        </div>
        <div
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium border border-border",
            intensity === "leger" && "bg-neutral-100",
            intensity === "moyen" && "bg-lavender-100",
            intensity === "profond" && "bg-coral-100",
          )}
        >
          {intensity === "leger"
            ? "Léger"
            : intensity === "moyen"
              ? "Moyen"
              : "Profond"}
        </div>
      </div>

      <Button variant="ghost" size="sm" className="self-start gap-1">
        {progress !== undefined ? "Continuer" : "Commencer"} →
      </Button>
    </Card>
  );
}