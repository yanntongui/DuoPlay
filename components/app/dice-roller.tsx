"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DiceResult {
  category: string;
  ambiance: string;
  durationMinutes: number;
}

interface DiceRollerProps {
  onResult: (result: DiceResult) => void;
  disabled?: boolean;
}

export function DiceRoller({ onResult, disabled }: DiceRollerProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<DiceResult | null>(null);

  const roll = () => {
    if (isRolling || disabled) return;
    setIsRolling(true);
    setResult(null);

    // Animation simulée
    setTimeout(() => {
      const categories = ["connexion", "sensations", "defis", "fantasmes"];
      const ambiances = ["tendre", "romantique", "jouer", "mystereux", "sensuel", "audacieux"];
      const durations = [1, 3, 5, 10, 20, 30];

      const randomResult: DiceResult = {
        category: categories[Math.floor(Math.random() * categories.length)],
        ambiance: ambiances[Math.floor(Math.random() * ambiances.length)],
        durationMinutes: durations[Math.floor(Math.random() * durations.length)],
      };

      setResult(randomResult);
      setIsRolling(false);
      onResult(randomResult);
    }, 1500);
  };

  const resultText = result
    ? `${result.ambiance} - ${result.category} - ${result.durationMinutes} min`
    : isRolling
      ? "Lancer..."
      : "Lancer le dé";

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className={cn(
          "w-24 h-24 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500",
          isRolling ? "bg-gradient-to-br from-coral-100 to-lavender-100 animate-pulse" : "bg-gradient-to-br from-lavender-100 to-coral-100",
        )}
      >
        <span className="text-3xl">
          {isRolling ? "🎲" : result ? "✨" : "🎲"}
        </span>
      </div>

      <Button
        onClick={roll}
        disabled={isRolling || disabled}
        size="lg"
        className="gap-2"
      >
        <span>{isRolling ? "🎲" : "🎲"}</span>
        {resultText}
      </Button>

      {result && (
        <div className="bg-card border border-ivory-200/80 rounded-lg p-4 text-center">
          <div className="text-lg font-medium text-foreground">
            {result.ambiance}
          </div>
          <div className="text-sm text-muted-foreground">
            Catégorie : {result.category} · {result.durationMinutes} min
          </div>
        </div>
      )}
    </div>
  );
}
