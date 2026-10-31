"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Presence } from "@/components/app/presence";
import { AmbianceToggle } from "@/components/app/ambiance-toggle";
import { useT } from "@/lib/i18n";

/**
 * « Floating Island » — barre flottante mobile (sous `md`).
 *
 * Sur tablette et desktop, la navigation est portée par la sidebar (§6) et
 * l'en-tête contextuel (§7) : l'île n'y est plus rendue. Elle reste ici pour
 * garder le logo, l'ambiance, la présence et un accès direct à la création
 * d'une partie à portée de pouce.
 */
export function AppIsland() {
  const { t } = useT();
  return (
    <header
      className="fixed inset-x-4 top-4 z-40 mx-auto max-w-5xl md:hidden"
      style={{ top: "calc(env(safe-area-inset-top) + 0.75rem)" }}
    >
      <div className="liquid-glass top-light flex items-center gap-3 rounded-full py-2 pl-3 pr-2">
        <Link
          href="/accueil"
          aria-label={t("brand.homeLabel")}
          className="press inline-flex shrink-0 rounded-full"
        >
          <Logo />
        </Link>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <AmbianceToggle />
          <Presence className="min-w-0 max-w-[8.5rem]" />

          <Link
            href="/explorer"
            aria-label={t("action.createGame")}
            className="press gradient-primary top-light inline-flex size-10 shrink-0 items-center justify-center rounded-full text-white shadow-[var(--shadow-glow)] hover:brightness-[1.06]"
          >
            <Plus className="size-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
