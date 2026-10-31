"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export const popIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const Card = motion.div;
export const List = motion.ul;
export const ListItem = motion.li;

export function AnimatedButton({
  children,
  className,
  ...props
}: HTMLMotionProps<"button">) {
  return (
    <Button
      className={cn(
        "press cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux-500 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
      {...props}
    >
      {children}
    </Button>
  );
}

export function AnimatedCard({
  children,
  className,
  highlight,
  ...props
}: HTMLMotionProps<"div"> & { highlight?: boolean }) {
  return (
    <Card
      className={cn(
        "rounded-xl border border-white/10 bg-card p-5 shadow-md transition-shadow",
        highlight && "border-rose-400/30 hover:border-rose-400/50 shadow-[var(--shadow-glow-prune)]",
        className,
      )}
      whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      {...props}
    >
      {children}
    </Card>
  );
}

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
        "h-2.5 overflow-hidden rounded-full bg-white/10",
        className,
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <motion.div
        className="h-full bg-gradient-primary"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

export function AnimatedPresenceDot({ online = false, className }: { online?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "relative flex h-3.5 w-3.5",
        className,
      )}
      aria-label={online ? "En ligne" : "Hors ligne"}
    >
      {online && (
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500" />
    </span>
  );
}