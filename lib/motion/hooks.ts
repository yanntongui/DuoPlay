"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  APPLE_SPRING,
  prefersReducedMotion,
  Spring,
  springTo,
  type SpringConfig,
} from "@/lib/motion/spring";

/** Suit `prefers-reduced-motion` en direct (l'utilisateur peut changer d'avis). */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

/**
 * Anime une valeur continue vers une cible avec la physique d'un ressort.
 * Ne re-render que tant que le mouvement est vivant.
 */
export function useSpring(
  target: number,
  config: SpringConfig = APPLE_SPRING,
): number {
  const springRef = useRef<Spring | null>(null);
  const frameRef = useRef<number | null>(null);
  const [value, setValue] = useState(target);

  const tick = useCallback(() => {
    const spring = springRef.current;
    if (!spring) return;
    let last = performance.now();
    const run = (now: number) => {
      const settled = spring.step((now - last) / 1000);
      last = now;
      setValue(spring.current);
      if (settled) {
        frameRef.current = null;
        return;
      }
      frameRef.current = requestAnimationFrame(run);
    };
    frameRef.current = requestAnimationFrame(run);
  }, []);

  useEffect(() => {
    if (!springRef.current) springRef.current = new Spring(config, target);
    const spring = springRef.current;
    spring.setTarget(target);
    if (prefersReducedMotion()) {
      spring.current = target;
      spring.velocity = 0;
      setValue(target);
      return;
    }
    if (frameRef.current === null) tick();
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}

/**
 * Réaction d'appui « haptique » : l'élément se comprime à 0,98 puis remonte
 * avec un ressort. Rien ne se déclenche si le mouvement est réduit.
 */
export function usePressScale<T extends HTMLElement>(scale = 0.98) {
  const ref = useRef<T | null>(null);

  const press = useCallback(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    springTo(el, [{ transform: `scale(${scale})` }], {
      ...APPLE_SPRING,
      stiffness: 520,
      damping: 26,
    });
  }, [scale]);

  const release = useCallback(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    springTo(el, [{ transform: "scale(1)" }], APPLE_SPRING);
  }, []);

  return { ref, press, release };
}

/**
 * Projecteur directionnel : pose `--mx` / `--my` (en %) à la position du
 * pointeur pour que `radial-gradient` suive le curseur ou le doigt.
 */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  const onPointerMove = useCallback((event: React.PointerEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty(
      "--mx",
      `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`,
    );
    el.style.setProperty(
      "--my",
      `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`,
    );
  }, []);

  return { ref, onPointerMove };
}
