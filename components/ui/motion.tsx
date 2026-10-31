"use client";

import { motion, HTMLMotionProps } from "framer-motion";

/**
 * Animation utilities for cards, transitions, and interactions.
 * All animations respect prefers-reduced-motion.
 */

export const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const Card = motion.div;
export const List = motion.ul;
export const ListItem = motion.li;
export const Button = motion.button;
export const Link = motion.a;

/**
 * Animated button with press feedback
 */
export function AnimatedButton({
  children,
  className,
  ...props
}: HTMLMotionProps<"button">) {
  return (
    <Button
      className={cn(
        "press cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux-500 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </Button>
  );
}

/**
 * Animated card with hover lift
 */
export function AnimatedCard({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <Card
      className={cn(
        "rounded-xl border border-white/10 bg-card p-4 shadow-md transition-shadow",
        className,
      )}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </Card>
  );
}

/**
 * Animated progress indicator
 */
export function AnimatedProgress({
  value,
  max = 100,
  className,
}: {
  value: number;
  max?: number;
  className?: string;
}) {
  const percentage = Math.min(100, (value / max) * 100);

  return (
    <div
      className={cn(
        "h-2 overflow-hidden rounded-full bg-white/10",
        className,
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <motion.div
        className="h-full bg-bordeaux-500"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}

/**
 * Animated presence indicator
 */
export function AnimatedPresenceDot({ online = false, className }: { online?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "relative flex h-3 w-3",
        className,
      )}
      aria-label={online ? "En ligne" : "Hors ligne"}
    >
      {online && (
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
          animate={{ scale: [1, 1.2, 1], opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
    </span>
  );
}