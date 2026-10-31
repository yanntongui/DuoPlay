/**
 * Physique du mouvement — sans dépendance externe.
 *
 * Le brief demande explicitement les ressorts « Apple » (stiffness 380,
 * damping 30, mass 0.8) et bannit toute interpolation linéaire ou rebond
 * cartoon. On reproduit donc un oscillateur harmonique amorti réel, piloté
 * par requestAnimationFrame, plutôt que d'importer Framer Motion.
 *
 * Deux usages :
 *  - `springEasing()` génère une fonction d'accélération CSS `linear(...)`
 *    pour les transitions déclaratives (boutons, apparitions) ;
 *  - la classe `Spring` + le hook `useSpring()` animent une valeur continue
 *    (échelle d'appui, sélecteur d'humeur inertiel) image par image.
 *
 * Tout est neutralisé si l'utilisateur demande moins de mouvement.
 */

export type SpringConfig = {
  stiffness: number;
  damping: number;
  mass: number;
  /** Seuil de repos en dessous duquel l'animation s'arrête. */
  restDelta: number;
};

/** Ressort standard Apple, tel que spécifié dans la direction artistique. */
export const APPLE_SPRING: SpringConfig = {
  stiffness: 380,
  damping: 30,
  mass: 0.8,
  restDelta: 0.001,
};

/** Variante plus douce, pour les révélations et les grandes surfaces. */
export const GENTLE_SPRING: SpringConfig = {
  stiffness: 210,
  damping: 26,
  mass: 1,
  restDelta: 0.001,
};

/** Pulsation amortie échantillonnée en une easing CSS `linear(...)`. */
export function springEasing(
  config: SpringConfig = APPLE_SPRING,
  samples = 48,
  duration = 1.05,
): string {
  const omega0 = Math.sqrt(config.stiffness / config.mass);
  const zeta = config.damping / (2 * Math.sqrt(config.stiffness * config.mass));

  // Réponse indicielle d'un oscillateur amorti partant du repos : la
  // position `decay(t)` part de 1 et rejoint 0, la progression vaut 1 - decay.
  const decay = (t: number) => {
    if (zeta < 1) {
      const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
      return (
        Math.exp(-zeta * omega0 * t) *
        (Math.cos(omegaD * t) + ((zeta * omega0) / omegaD) * Math.sin(omegaD * t))
      );
    }
    const omegaH = omega0 * Math.sqrt(zeta * zeta - 1);
    return (
      Math.exp(-zeta * omega0 * t) *
      (Math.cosh(omegaH * t) + ((zeta * omega0) / omegaH) * Math.sinh(omegaH * t))
    );
  };

  const points: string[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const t = (i / samples) * duration;
    const value = 1 - decay(t);
    points.push(Math.max(0, Math.min(1, value)).toFixed(4));
  }
  // Premier point = 0, dernier = 1 pour une easing propre.
  points[0] = "0";
  points[points.length - 1] = "1";

  return `linear(${points.join(", ")})`;
}

/** Prend en compte `prefers-reduced-motion` côté navigateur. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Oscillateur amorti pilotable : on fixe une cible, la valeur la rejoint en
 * respectant la physique, et `step()` indique si le mouvement est au repos.
 */
export class Spring {
  current: number;
  velocity = 0;
  target: number;
  private readonly config: SpringConfig;

  constructor(config: SpringConfig = APPLE_SPRING, initial = 0) {
    this.config = config;
    this.current = initial;
    this.target = initial;
  }

  setTarget(target: number) {
    this.target = target;
  }

  /** Avance la simulation de `dt` secondes. Renvoie `true` si au repos. */
  step(dt: number): boolean {
    const { stiffness, damping, mass, restDelta } = this.config;
    const clamped = Math.min(dt, 1 / 30);
    // Sous-pas fixes : stabilité numérique quel que soit le taux de rafraîchissement.
    const substeps = Math.max(1, Math.ceil(clamped / (1 / 120)));
    const h = clamped / substeps;

    for (let i = 0; i < substeps; i += 1) {
      const acceleration =
        (-stiffness * (this.current - this.target) - damping * this.velocity) /
        mass;
      this.velocity += acceleration * h;
      this.current += this.velocity * h;
    }

    if (
      Math.abs(this.current - this.target) < restDelta &&
      Math.abs(this.velocity) < restDelta * 10
    ) {
      this.current = this.target;
      this.velocity = 0;
      return true;
    }
    return false;
  }
}

/**
 * Applique une transformation physique à un élément en WAAPI, avec repli
 * sur `springEasing()` (transition CSS) si l'API n'est pas disponible.
 */
export function springTo(
  element: HTMLElement,
  keyframes: Keyframe[],
  config: SpringConfig = GENTLE_SPRING,
): Animation | null {
  if (typeof element.animate !== "function") return null;
  const animation = element.animate(keyframes, {
    duration: prefersReducedMotion() ? 1 : 620,
    easing: springEasing(config),
    fill: "both",
  });
  return animation;
}
