"use client";

import { cn } from "@/lib/utils";

/** Visuel d'expérience : dégradé + emoji, sans image externe à charger. */
export function ExperienceArtwork({
  emoji,
  className,
  adult,
  formatLabel,
  size = "md",
}: {
  emoji: string;
  className?: string;
  adult?: boolean;
  formatLabel?: string;
  size?: "sm" | "md" | "lg";
}) {
  const heights = {
    sm: "h-24",
    md: "h-36",
    lg: "h-48",
  } as const;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-br",
        heights[size],
        className,
      )}
    >
      <span
        className={cn(
          "drop-shadow-[0_12px_30px_rgba(225,29,72,0.22)]",
          size === "sm" ? "text-3xl" : size === "lg" ? "text-6xl" : "text-5xl",
        )}
      >
        {emoji}
      </span>
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_10%,rgb(255_255_255/0.10),transparent_70%)]" />
      {adult && (
        <span className="absolute right-2.5 top-2.5 rounded-full border border-coral-300/40 bg-graphite-900/80 px-2 py-0.5 text-[10px] font-semibold text-coral-200 backdrop-blur">
          18+
        </span>
      )}
      {formatLabel && (
        <span className="absolute bottom-2.5 left-2.5 rounded-full border border-white/10 bg-graphite-900/70 px-2.5 py-0.5 text-[10px] font-medium text-graphite-200 backdrop-blur">
          {formatLabel}
        </span>
      )}
    </div>
  );
}
