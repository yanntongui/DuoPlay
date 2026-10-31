import { Aura } from "@/components/ui/surface";

/**
 * Fond commun de l'espace joueur : l'obsidienne se creuse d'une nuit violette
 * et de trois ondes lumineuses (rubis et champagne) qui dérivent lentement.
 * Purement décoratif (`aria-hidden`), figé si le système demande moins de
 * mouvement (cf. PRD §16 et §18).
 */
export function AppBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="gradient-night absolute inset-0" />
      <div className="gradient-dawn absolute inset-x-0 top-0 h-[34rem] opacity-80" />
      <Aura
        tone="lavender"
        drift="slower"
        className="absolute -left-28 -top-24 size-80"
      />
      <Aura
        tone="coral"
        drift="slow"
        className="absolute -right-24 top-32 size-72"
      />
      <Aura
        tone="blush"
        drift="slower"
        className="absolute bottom-0 left-1/3 size-80 opacity-70"
      />
    </div>
  );
}
