"use client";

import { motion } from "framer-motion";

export interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Animation de confirmation de favori
 */
export function FavoriteButton({ isFavorite, onToggle, className }: FavoriteButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      className={className}
      animate={{ scale: 1, rotate: 0 }}
      whileTap={{ scale: 0.9, rotate: -5 }}
      transition={{ duration: 0.15 }}
    >
      {isFavorite ? "★" : "☆"}
    </motion.button>
  );
}

/**
 * Animation de progression de barre
 */
export interface ProgressBarProps {
  progress: number;
  className?: string;
}

export function ProgressBar({ progress, className }: ProgressBarProps) {
  return (
    <div className={`w-full h-1 bg-muted rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}
