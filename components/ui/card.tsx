import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Carte premium : élévation douce superposée, hairline chaud, rayon généreux.
 * `tone` permet de teinter légèrement la surface (lavande, corail, graphite)
 * sans casser la lisibilité du texte.
 */
const TONES = {
  default: "bg-card",
  ivory: "bg-ivory-100",
  lavender: "bg-lavender-100/70",
  coral: "bg-coral-100/70",
  dark: "gradient-night text-white",
} as const;

function Card({
  className,
  tone = "default",
  interactive,
  role,
  tabIndex,
  ariaLabel,
  ...props
}: React.ComponentProps<"div"> & {
  tone?: keyof typeof TONES;
  interactive?: boolean;
  role?: string;
  tabIndex?: number;
  ariaLabel?: string;
}) {
  return (
    <div
      data-slot="card"
      role={interactive ? (role || "button") : role}
      tabIndex={interactive ? (tabIndex ?? 0) : undefined}
      aria-label={ariaLabel}
      className={cn(
        "relative overflow-hidden rounded-xl border border-ivory-200/80 shadow-[var(--shadow-soft)] text-card-foreground focus-ring transition-shadow",
        TONES[tone],
        tone === "dark" && "border-white/10",
        interactive &&
          "spotlight press cursor-pointer hover:-translate-y-0.5 hover:border-lavender-300/60 hover:shadow-[var(--shadow-lift)] focus:outline-none",
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
      className={cn("flex flex-col gap-1.5 p-5", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-lg leading-tight", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
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
