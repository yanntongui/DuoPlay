"use client";

import Link from "next/link";
import { ArrowLeft, Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** En-tête discret, commun aux quatre formats. */
export function SessionHeader({
  title,
  subtitle,
  progress,
  backHref,
  onPause,
  onEnd,
}: {
  title: string;
  subtitle?: string;
  progress?: string;
  backHref: string;
  onPause?: () => void;
  onEnd: () => void;
}) {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={backHref}
          className="press inline-flex min-h-10 items-center gap-1.5 rounded-full px-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Catalogue
        </Link>
        <div className="flex items-center gap-1">
          {onPause && (
            <button
              type="button"
              onClick={onPause}
              className="press inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-xs text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
            >
              <Pause className="size-3.5" />
              Pause
            </button>
          )}
          <button
            type="button"
            onClick={onEnd}
            className="press inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-xs text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
          >
            <Square className="size-3" />
            Terminer
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl leading-tight">{title}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {subtitle && <span>{subtitle}</span>}
          {subtitle && progress && <span aria-hidden="true">·</span>}
          {progress && <span>{progress}</span>}
        </div>
      </div>
    </header>
  );
}

function Overlay({
  children,
  labelledBy,
}: {
  children: React.ReactNode;
  labelledBy: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-900/80 p-5 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="w-full max-w-md"
      >
        {children}
      </div>
    </div>
  );
}

export function PauseOverlay({
  open,
  onResume,
  onEnd,
}: {
  open: boolean;
  onResume: () => void;
  onEnd: () => void;
}) {
  if (!open) return null;
  return (
    <Overlay labelledBy="pause-title">
      <div className="rounded-2xl border border-ivory-200/80 bg-card p-6 shadow-[var(--shadow-lift)]">
        <p className="eyebrow mb-2">Pause</p>
        <h2 id="pause-title" className="text-xl leading-tight">
          Rien ne presse.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Votre session est en pause. Vous pouvez reprendre quand vous voulez,
          ou terminer sans rien justifier.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button type="button" size="lg" onClick={onResume}>
            <Play className="size-4" />
            Reprendre
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onEnd}>
            Terminer la session
          </Button>
        </div>
      </div>
    </Overlay>
  );
}

export function EndOverlay({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <Overlay labelledBy="end-title">
      <div className="rounded-2xl border border-ivory-200/80 bg-card p-6 shadow-[var(--shadow-lift)]">
        <p className="eyebrow mb-2">Terminer</p>
        <h2 id="end-title" className="text-xl leading-tight">
          On s&apos;arrête ici ?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Vous pouvez reprendre plus tard. Ce qui a été vécu reste vécu, rien
          n&apos;est perdu.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button type="button" variant="outline" size="lg" onClick={onCancel}>
            Continuer la session
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onConfirm}>
            Oui, terminer
          </Button>
        </div>
      </div>
    </Overlay>
  );
}

/** Actions de session toujours accessibles, sans attirer l'œil. */
export function SessionFooter({
  onPause,
  onEnd,
  note,
  className,
}: {
  onPause: () => void;
  onEnd: () => void;
  note?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 border-t border-ivory-200/70 pt-3",
        className,
      )}
    >
      <p className="text-xs text-graphite-500">{note}</p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPause}
          className="press min-h-9 rounded-full px-3 text-xs text-muted-foreground underline decoration-ivory-300 underline-offset-4 hover:text-foreground"
        >
          Pause
        </button>
        <button
          type="button"
          onClick={onEnd}
          className="press min-h-9 rounded-full px-3 text-xs text-muted-foreground underline decoration-ivory-300 underline-offset-4 hover:text-foreground"
        >
          Terminer
        </button>
      </div>
    </div>
  );
}
