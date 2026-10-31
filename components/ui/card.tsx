import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Carte premium - ombres prononcées, couleurs plus saturées
 */
const TONES = {
  default: "bg-card border-white/10",
  surface: "bg-surface border-white/5",
  surfaceLight: "bg-surface-light border-white/8",
  accent: "bg-bordeaux-600/20 border-bordeaux-500/30",
  highlight: "bg-surface-lighter border-rose-400/30",
} as const;

function Card({
  className,
  tone = "default",
  interactive,
  ...props
}: React.ComponentProps<"div"> & {
  tone?: keyof typeof TONES;
  interactive?: boolean;
}) {
  return (
    <div
      data-slot="card"
      className={cn(
        "relative overflow-hidden rounded-xl border shadow-[var(--shadow-md)] text-card-foreground",
        TONES[tone],
        interactive &&
          "cursor-pointer transition-all duration-250 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux-500",
        interactive && tone === "highlight" && "ring-rose-400/20 hover:ring-rose-400/40",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-2 p-5", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-xl font-semibold leading-tight text-cream-100", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-cream-200", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-5 pt-0", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center p-5 pt-0", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};