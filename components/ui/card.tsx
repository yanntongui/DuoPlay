import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Carte premium : ombres hiérarchisées retenues, angles doux.
 * `interactive` ajoute des micro-interactions accessibles.
 */
const TONES = {
  default: "bg-card",
  surface: "bg-surface",
  surfaceLight: "bg-surface-light",
  accent: "bg-bordeaux-600/10 border-bordeaux-600/20",
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
        "relative overflow-hidden rounded-xl border border-white/10 shadow-[var(--shadow-md)] text-card-foreground",
        TONES[tone],
        interactive &&
          "cursor-pointer transition-transform duration-200 hover:translate-y-[-2px] hover:shadow-[var(--shadow-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux-500",
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
      className={cn("text-lg font-medium leading-tight", className)}
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