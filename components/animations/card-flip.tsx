"use client";

import { motion } from "framer-motion";

export interface CardFlipProps {
  children: React.ReactNode;
  isFlipped: boolean;
  onFlip: () => void;
  className?: string;
}

/**
 * Composant de carte avec animation de retournement
 */
export function CardFlip({ children, isFlipped, onFlip, className }: CardFlipProps) {
  return (
    <motion.div
      className={`perspective-1000 ${className}`}
      onClick={onFlip}
      initial={{ rotateY: 0, opacity: 1 }}
      animate={isFlipped ? { rotateY: 180, opacity: 0 } : { rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(0deg)",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

export interface StepTransitionProps {
  children: React.ReactNode;
  step: number;
}

/**
 * Animation de transition entre étapes de parcours
 */
export function StepTransition({ children, step }: StepTransitionProps) {
  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}
