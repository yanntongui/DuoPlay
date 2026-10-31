"use client";

import { motion } from "framer-motion";

const MOOD_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  joyeux: { emoji: "😊", label: "Joyeux", color: "text-yellow-400" },
  curieux: { emoji: "🤔", label: "Curieux", color: "text-purple-400" },
  calme: { emoji: "😌", label: "Calme", color: "text-blue-400" },
  fatigué: { emoji: "🥱", label: "Fatigué", color: "text-gray-400" },
  romantique: { emoji: "💕", label: "Romantique", color: "text-pink-400" },
};

export function MoodBadge({ 
  mood, 
  onClick 
}: { 
  mood?: string | null; 
  onClick?: () => void 
}) {
  if (!mood || !MOOD_CONFIG[mood]) return null;
  
  const config = MOOD_CONFIG[mood];
  
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs ring-1 ring-white/20 transition-transform hover:scale-105"
      title={config.label}
    >
      <span className="text-sm">{config.emoji}</span>
      <span className={config.color}>{config.label}</span>
    </button>
  );
}

export function PresenceIndicator({ active }: { active: boolean }) {
  return (
    <span className="relative flex h-2 w-2">
      {active && (
        <span
          className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-pulse"
        />
      )}
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  );
}
