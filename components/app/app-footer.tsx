"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { useT } from "@/lib/i18n";

/**
 * Pied de page discret (§16). Aucun lien inventé : uniquement les pages
 * réellement existantes (confidentialité, CGU).
 */
export function AppFooter() {
  const { t } = useT();
  return (
    <footer className="mt-10 border-t border-white/[0.06] px-4 pb-20 pt-5 sm:px-6 md:pb-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
        <Logo showWordmark size="sm" className="opacity-85" />
        <nav
          aria-label={t("nav.legalLabel")}
          className="flex items-center gap-4"
        >
          <Link
            href="/confidentialite"
            className="transition-colors hover:text-foreground"
          >
            {t("nav.privacy")}
          </Link>
          <span aria-hidden="true" className="text-white/15">
            ·
          </span>
          <Link href="/cgu" className="transition-colors hover:text-foreground">
            {t("nav.terms")}
          </Link>
        </nav>
        <p className="tabular-nums">© {new Date().getFullYear()} DuoPlay</p>
      </div>
    </footer>
  );
}
