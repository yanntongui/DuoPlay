"use client";

import { Sparkles } from "lucide-react";
import { Card } from "./card";

export function MilestonesCard({ milestones }: { milestones: Array<{ name: string; icon: string; reachedAt: number }> }) {
  if (milestones.length === 0) return null;

  return (
    <Card tone="ivory" className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-lavender-500" />
        <h3 className="text-sm font-semibold">Nos étapes</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {milestones.map((m) => (
          <div
            key={m.name}
            className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-xs"
            title={`Atteint le ${new Date(m.reachedAt).toLocaleDateString()}`}
          >
            <span>{m.icon}</span>
            <span className="text-muted-foreground">{m.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function RelationshipStats({
  days,
  streak,
  bestStreak,
}: {
  days: number;
  streak: number;
  bestStreak: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="flex flex-col items-center gap-0.5 rounded-lg bg-white/5 p-2">
        <span className="text-lg font-semibold">{days}</span>
        <span className="text-[10px] text-muted-foreground">Jours</span>
      </div>
      <div className="flex flex-col items-center gap-0.5 rounded-lg bg-white/5 p-2">
        <span className="text-lg font-semibold">{streak}</span>
        <span className="text-[10px] text-muted-foreground">Séances</span>
      </div>
      <div className="flex flex-col items-center gap-0.5 rounded-lg bg-white/5 p-2">
        <span className="text-lg font-semibold text-lavender-300">{bestStreak}</span>
        <span className="text-[10px] text-muted-foreground">Meilleur</span>
      </div>
    </div>
  );
}
