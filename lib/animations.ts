/**
 * Hooks et utilitaires pour les animations fonctionnelles
 */

import { useState, useEffect } from "react";

/**
 * Hook pour détecter si l'utilisateur préfère réduire les animations
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook pour vérifier si l'appareil est mobile
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}

/**
 * Animation de retournement de carte (flip)
 */
export const cardFlipStyles = {
  initial: { rotateY: 0, opacity: 1 },
  animate: { rotateY: 180, opacity: 0 },
  exit: { rotateY: 0, opacity: 1 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

/**
 * Animation de confirmation de favori (pop)
 */
export const favoritePopStyles = {
  initial: { scale: 1, rotate: 0 },
  animate: { scale: 1.2, rotate: 15 },
  exit: { scale: 1, rotate: 0 },
  transition: { duration: 0.15, ease: [0.33, 1, 0.68, 1] },
};

/**
 * Animation de progression de parcours
 */
export const journeyProgressStyles = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "100%", opacity: 1 },
  transition: { duration: 0.3, ease: [0.33, 1, 0.68, 1] },
};

/**
 * Animation de lancement de dé
 */
export const diceRollStyles = {
  initial: { rotateX: 0, rotateY: 0, rotateZ: 0 },
  animate: { 
    rotateX: [0, 720, 360], 
    rotateY: [0, 720, 360], 
    rotateZ: [0, 360, 180] 
  },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
};

/**
 * Animation de révélation simultanée
 */
export const revealStyles = {
  initial: { opacity: 0, scale: 0.5, filter: "blur(10px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0)" },
  transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] },
};

/**
 * Animation d'apparition de souvenir
 */
export const memoryAppearanceStyles = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.33, 1, 0.68, 1] },
};

/**
 * Animation de transition entre étapes
 */
export const stepTransitionStyles = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: { duration: 0.25, ease: [0.33, 1, 0.68, 1] },
};

/**
 * Classes Tailwind pour animations rapides (CSS-only)
 */
export const animationClasses = {
  micro: "transition-all duration-100 ease-out",
  small: "transition-all duration-250 ease-out",
  medium: "transition-all duration-400 ease-out",
  long: "transition-all duration-700 ease-out",
};

/**
 * Vérifier si les animations devraient être réduites (sans hook)
 */
export function shouldReduceMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Durée d'animation basée sur le contexte
 */
export const durations = {
  micro: 100,    // feedback tactile
  small: 250,    // petites transitions
  medium: 400,   // transitions importantes
  long: 700,     // animations longues (dé)
} as const;

/**
 * Créer une classe de transition conditionnelle
 */
export function getTransitionClass(type: "micro" | "small" | "medium" | "long"): string {
  const base = durations[type];
  return `transition-all duration-[${base}ms] ease-out`;
}

/**
 * Animation simple sans dépendance externe
 */
export function animate(element: HTMLElement, styles: Partial<CSSStyleDeclaration>, duration: number = 300): Promise<void> {
  return new Promise((resolve) => {
    if (shouldReduceMotion()) {
      Object.assign(element.style, styles);
      resolve();
      return;
    }

    const startTime = performance.now();
    const startStyles = { ...element.style };

    const tick = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);

      Object.keys(styles).forEach((key) => {
        const styleKey = key as keyof CSSStyleDeclaration;
        if (styles[styleKey] !== undefined) {
          const startValue = parseFloat(startStyles[styleKey] as string) || 0;
          const endValue = parseFloat(styles[styleKey] as string) || 0;
          const currentValue = startValue + (endValue - startValue) * eased;
          (element.style[styleKey] as string) = `${currentValue}px`;
        }
      });

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        Object.assign(element.style, styles);
        resolve();
      }
    };

    requestAnimationFrame(tick);
  });
}
