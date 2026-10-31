"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { APPLE_SPRING, prefersReducedMotion, Spring } from "@/lib/motion/spring";
import { cn } from "@/lib/utils";

export type Crank = {
  /** Identifiant transmis à `onChange` (ex. « all », « leger »). */
  id: string;
  label: string;
  /** Test identifiant pour l'accessibilité et les tests automatisés. */
  testId: string;
};

/**
 * Cadran d'Intimité — un sélecteur cylindrique inertiel inspiré de la Digital
 * Crown. On fait tourner le cadran au doigt (ou à la molette) ; la décélération
 * est physique et chaque cran aimante la sélection, avec une micro-compression
 * d'échelle au relâchement. Aucun rebond cartoon, aucune roue de foire : la
 * lumière glisse d'un cran à l'autre (cf. direction artistique §2).
 *
 * Les crans restent de vrais boutons (48px, clavier, `aria-pressed`) : la
 * sélection est donc aussi fiable au clic et au lecteur d'écran.
 */
export function IntimacyCrown({
  options,
  value,
  onChange,
  label,
  description,
}: {
  options: Crank[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  description?: string;
}) {
  const index = Math.max(
    0,
    options.findIndex((option) => option.id === value),
  );
  const trackRef = useRef<HTMLDivElement | null>(null);
  const springRef = useRef(new Spring(APPLE_SPRING, 0));
  const frameRef = useRef<number | null>(null);
  const dragRef = useRef<{ startX: number; moved: number; dragging: boolean }>({
    startX: 0,
    moved: 0,
    dragging: false,
  });
  const [offset, setOffset] = useState(0);

  const animate = useCallback((to: number) => {
    const spring = springRef.current;
    spring.setTarget(to);
    if (prefersReducedMotion()) {
      spring.current = to;
      spring.velocity = 0;
      setOffset(to);
      return;
    }
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    let last = performance.now();
    const run = (now: number) => {
      const settled = spring.step((now - last) / 1000);
      last = now;
      setOffset(spring.current);
      if (settled) {
        frameRef.current = null;
        return;
      }
      frameRef.current = requestAnimationFrame(run);
    };
    frameRef.current = requestAnimationFrame(run);
  }, []);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const step = useCallback(
    (direction: number) => {
      const next = Math.min(options.length - 1, Math.max(0, index + direction));
      if (next !== index) onChange(options[next].id);
    },
    [index, onChange, options],
  );

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    dragRef.current = { startX: event.clientX, moved: 0, dragging: true };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.dragging) return;
    const delta = event.clientX - dragRef.current.startX;
    dragRef.current.moved = delta;
    animate(delta);
  }

  function onPointerUp() {
    if (!dragRef.current.dragging) return;
    const delta = dragRef.current.moved;
    dragRef.current.dragging = false;
    const shift = Math.round(-delta / 72);
    // Compression puis aimantation sur le cran le plus proche.
    animate(0);
    if (shift !== 0) step(shift);
  }

  const selected = options[index];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <span className="font-display text-base text-lavender-700">
          {selected?.label}
        </span>
      </div>

      <div
        ref={trackRef}
        role="group"
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={(event) => {
          if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
          step(event.deltaY > 0 ? 1 : -1);
        }}
        style={{ touchAction: "pan-y" }}
        className="relative select-none [perspective:800px]"
      >
        <div
          className="flex items-stretch gap-2"
          style={{ transform: `translateX(${offset}px)` }}
        >
          {options.map((option, optionIndex) => {
            const active = optionIndex === index;
            const distance = optionIndex - index;
            return (
              <button
                key={option.id}
                type="button"
                data-testid={option.testId}
                aria-pressed={active}
                onClick={() => {
                  if (Math.abs(dragRef.current.moved) > 6) return;
                  onChange(option.id);
                }}
                style={{
                  transform: `rotateY(${distance * -12}deg) scale(${
                    active ? 1 : 0.9
                  })`,
                  opacity: active ? 1 : 0.55,
                }}
                className={cn(
                  "press flex min-h-13 flex-1 items-center justify-center rounded-2xl border px-2 text-center text-xs font-medium transition-[opacity] duration-300",
                  active
                    ? "gradient-primary top-light border-transparent text-white shadow-[var(--shadow-glow)]"
                    : "border-white/[0.08] bg-white/[0.03] text-graphite-500 hover:border-lavender-300/50 hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {description && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
