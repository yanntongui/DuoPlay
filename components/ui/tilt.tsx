"use client";

import { useRef, useState } from "react";
import { useReducedMotion } from "@/lib/motion/hooks";
import { cn } from "@/lib/utils";

/**
 * Inclinaison 3D douce : la surface se penche de quelques degrés vers le
 * pointeur, comme une carte tenue en main, et expose `--mx` / `--my` pour que
 * le projecteur (`.spotlight`) suive le même point. Figée si l'utilisateur
 * demande moins de mouvement.
 */
export function Tilt({
  children,
  className,
  max = 6,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>();
  const reduced = useReducedMotion();

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || reduced) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    setTransform(
      `rotateX(${((0.5 - py) * 2 * max).toFixed(2)}deg) rotateY(${(
        (px - 0.5) *
        2 *
        max
      ).toFixed(2)}deg)`,
    );
  }

  function reset() {
    setTransform("rotateX(0deg) rotateY(0deg)");
  }

  return (
    <div className={cn("[perspective:1100px]", className)}>
      <div
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={reset}
        style={{
          transform,
          transition: "transform 360ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        className="[transform-style:preserve-3d] will-change-transform"
      >
        {children}
      </div>
    </div>
  );
}
