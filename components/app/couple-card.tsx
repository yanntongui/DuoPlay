"use client";

import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MoodBadge } from "@/components/ui/status-badges";
import { RelationshipStats } from "@/components/ui/stats-cards";
import { Card } from "@/components/ui/card";

type CoupleData = {
  relationshipDays?: number;
  streakCurrent?: number;
  streakBest?: number;
  stats: {
    sessions: number;
    answered: number;
  };
  id: string;
  sharedMood?: string;
};

type ProfileData = {
  _id: Id<"users">;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  image?: string | null;
  isAnonymous?: boolean;
};

type HistoryData = {
  summary: {
    sessions: number;
    completed: number;
    inProgress: number;
    answered: number;
    revealed: number;
  };
};

export function CoupleCard({
  couple,
  profile,
  history,
}: {
  couple: CoupleData;
  profile?: ProfileData;
  history?: HistoryData;
}) {
  const updateMood = useMutation(api.profiles.updateMood);
  const updateSharedMood = useMutation(api.couples.updateSharedMood);

  const relationshipDays = couple.relationshipDays ?? 0;
  const streakCurrent = couple.streakCurrent ?? 0;
  const streakBest = couple.streakBest ?? 0;

  const moodHandler = () => {
    const moods = ["joyeux", "curieux", "calme", "fatigué", "romantique"];
    const next = moods[Math.floor(Math.random() * moods.length)];
    if (profile) updateMood({ userId: profile._id, mood: next });
    updateSharedMood({ coupleId: couple.id, mood: next });
  };

  return (
    <Card tone="dark" className="grain ride p-5 transition-transform hover:scale-[1.01]">
      <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-coral-500/40 blur-3xl" aria-hidden="true" />
      <div className="relative z-10 flex flex-col gap-5">
        <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500">
          <MoodBadge mood={profile?.mood} onClick={moodHandler} />
          <RelationshipStats days={relationshipDays} streak={streakCurrent} bestStreak={streakBest} />
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <StatCell labelKey="space.statGames" value={couple.stats.sessions} />
            <StatCell labelKey="space.statAnswers" value={couple.stats.answered} />
            <StatCell labelKey="space.statFinished" value={history?.summary.completed ?? 0} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function StatCell({ labelKey, value }: { labelKey: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/10 px-2 py-3 ring-1 ring-inset ring-white/15 backdrop-blur-sm transition-transform hover:scale-105">
      <p className="text-xl text-white">{value}</p>
      <p className="text-[11px] text-white/70">{labelKey}</p>
    </div>
  );
}
