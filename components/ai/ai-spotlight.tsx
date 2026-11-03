import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

/**
 * Entrée vers DuoPlay AI depuis l'accueil. Volontairement sobre : une
 * proposition, jamais une injonction. Aucun compteur, aucune série.
 */
export function AiSpotlight() {
  return (
    <Link
      href="/ai"
      data-testid="ai-spotlight"
      className="group relative block overflow-hidden rounded-[22px] border border-[#d9a7c9]/22 bg-[linear-gradient(150deg,rgba(64,32,60,0.55),rgba(122,34,66,0.22)_45%,rgba(11,7,16,0.9))] p-5 shadow-[0_24px_70px_-34px_rgba(0,0,0,0.95)] transition-colors hover:border-[#d9a7c9]/40 sm:p-6"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-[#d9a7c9]/12 blur-3xl"
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d9a7c9]/30 bg-[#d9a7c9]/10 px-2.5 py-1 text-[11px] font-medium text-[#e8c8dd]">
            <Sparkles className="size-3" aria-hidden="true" />
            DuoPlay AI · Votre moment à deux
          </span>
          <p className="mt-3 font-display text-[1.6rem] leading-tight text-[#f6efe7]">
            Une session pensée pour vous, pas pour vous presser.
          </p>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-[#d9cbbf]/70">
            Décrivez votre soirée : DuoPlay AI propose des étapes, des
            alternatives et des raisons. Vous acceptez, modifiez ou passez —
            toujours.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-[#d9a7c9]/40 bg-[#7a2242]/35 px-4 py-2.5 text-[13px] font-medium text-[#f6efe7] transition-colors group-hover:bg-[#7a2242]/55 sm:self-auto">
          Découvrir
          <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}
