"use client";

import type { ReactNode } from "react";
import { Info, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function AiBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[#d9a7c9]/30 bg-[#d9a7c9]/10 px-2.5 py-1 text-[11px] font-medium tracking-wide text-[#e8c8dd]",
        className,
      )}
    >
      <Sparkles className="size-3" aria-hidden="true" />
      Généré par IA
    </span>
  );
}

export function AiCard({
  children,
  className,
  soft,
}: {
  children: ReactNode;
  className?: string;
  soft?: boolean;
}) {
  return (
    <div className={cn(soft ? "ai-surface-soft" : "ai-surface", className)}>
      {children}
    </div>
  );
}

export function AiButton({
  children,
  className,
  variant = "soft",
  type = "button",
  ...props
}: React.ComponentProps<"button"> & {
  variant?: "primary" | "soft" | "ghost" | "danger";
}) {
  return (
    <button
      type={type}
      className={cn(
        "ai-button",
        variant === "primary" && "ai-button-primary",
        variant === "soft" && "ai-button-soft",
        variant === "ghost" && "ai-button-ghost",
        variant === "danger" && "ai-button-danger",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function AiChip({
  children,
  active,
  className,
  ...props
}: React.ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      data-active={active ? "true" : "false"}
      aria-pressed={active}
      className={cn("ai-chip", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function AiSectionTitle({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d9a7c9]/80">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-[1.35rem] leading-tight text-[#f6efe7]">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function AiNotice({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "safety" | "quota" | "success";
  title: string;
  children?: ReactNode;
}) {
  const styles = {
    info: "border-[#d9a7c9]/22 bg-[#d9a7c9]/8 text-[#e8d6e2]",
    safety: "border-[#a63a5c]/40 bg-[#7a2242]/16 text-[#f0cdd8]",
    quota: "border-[#e2b887]/30 bg-[#e2b887]/8 text-[#efd9bd]",
    success: "border-emerald-400/25 bg-emerald-400/8 text-emerald-100",
  } as const;

  const Icon = tone === "safety" ? ShieldCheck : Info;

  return (
    <div
      role={tone === "safety" ? "alert" : "status"}
      className={cn("rounded-2xl border px-4 py-3 text-sm", styles[tone])}
    >
      <p className="flex items-center gap-2 font-medium">
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {title}
      </p>
      {children ? (
        <div className="mt-1.5 text-[13px] leading-relaxed opacity-90">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function AiMeter({
  used,
  limit,
}: {
  used: number;
  limit: number;
}) {
  const ratio = limit > 0 ? Math.min(1, used / limit) : 0;
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={used}
        aria-label="Générations utilisées ce mois-ci"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#a63a5c] to-[#d9a7c9] transition-[width] duration-500"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span className="shrink-0 text-[11px] text-[#d9cbbf]/70">
        {used} / {limit} ce mois
      </span>
    </div>
  );
}

export function AiSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2.5" aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="ai-shimmer h-3 rounded-full"
          style={{ width: `${88 - index * 12}%` }}
        />
      ))}
    </div>
  );
}

export function AiEmpty({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#d9a7c9]/22 px-5 py-8 text-center">
      {icon ? (
        <span className="mb-3 text-[#d9a7c9]" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <p className="font-display text-lg text-[#f6efe7]">{title}</p>
      {children ? (
        <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-[#d9cbbf]/70">
          {children}
        </p>
      ) : null}
    </div>
  );
}
