"use client";

import { motion } from "framer-motion";

const MOOD_CONFIG: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  joyeux: { emoji: "😊", label: "Joyeux", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  curieux: { emoji: "🤔", label: "Curieux", color: "text-purple-400", bg: "bg-purple-400/10" },
  calme: { emoji: "😌", label: "Calme", color: "text-blue-400", bg: "bg-blue-400/10" },
  fatigué: { emoji: "🥱", label: "Fatigué", color: "text-gray-400", bg: "bg-gray-400/10" },
  romantique: { emoji: "💕", label: "Romantique", color: "text-pink-400", bg: "bg-pink-400/10" },
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
    <motion.button
      onClick={onClick}
      aria-label={`Humeur : ${config.label}. Cliquez pour changer.`}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-white/20 transition-colors hover:ring-white/30 active:scale-95"
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      <span className="text-base" aria-hidden="true">{config.emoji}</span>
      <span className={`${config.color} ${config.bg} px-1.5 rounded-full`}>{config.label}</span>
    </motion.button>
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
