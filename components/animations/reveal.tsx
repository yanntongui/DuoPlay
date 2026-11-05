"use client";

import { motion } from "framer-motion";

export interface DiceProps {
  value: number;
  isRolling: boolean;
  onRoll?: () => void;
  className?: string;
}

/**
 * Animation de lancement de dé
 */
export function Dice({ value, isRolling, onRoll, className }: DiceProps) {
  return (
    <motion.button
      type="button"
      onClick={() => !isRolling && onRoll?.()}
      disabled={isRolling}
      className={`text-4xl font-bold p-4 rounded-xl ${className}`}
      animate={
        isRolling
          ? { rotateX: [0, 360, 720], rotateY: [0, 360, 720], rotateZ: [0, 180, 360] }
          : { rotateX: 0, rotateY: 0, rotateZ: 0 }
      }
      transition={
        isRolling
          ? { duration: 0.8 }
          : { duration: 0.3 }
      }
      whileTap={!isRolling ? { scale: 0.95 } : {}}
    >
      {value}
    </motion.button>
  );
}

export interface RevealProps {
  children: React.ReactNode;
  isRevealed: boolean;
  onReveal?: () => void;
  className?: string;
  delay?: number;
}

/**
 * Animation de révélation simultanée
 */
export function Reveal({ children, isRevealed, onReveal, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      {isRevealed ? (
        children
      ) : onReveal ? (
        <button
          type="button"
          onClick={onReveal}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
        >
          Révéler
        </button>
      ) : null}
    </motion.div>
  );
}

/**
 * Animation de révélation simultanée (multi-éléments)
 */
export interface RevealGroupProps {
  items: Array<{ id: string; content: React.ReactNode }>;
  isRevealed: boolean;
  onReveal?: () => void;
  className?: string;
}

export function RevealGroup({ items, isRevealed, onReveal, className }: RevealGroupProps) {
  return (
    <div className={className}>
      {!isRevealed && onReveal ? (
        <motion.button
          type="button"
          onClick={onReveal}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          Révéler ensemble
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
              }}
            >
              {item.content}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
