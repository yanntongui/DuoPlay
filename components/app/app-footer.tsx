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
    <footer className="mt-16 border-t border-white/[0.06] px-4 pb-24 pt-8 sm:px-6 md:pb-10 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <Logo showWordmark />
        <nav aria-label={t("nav.legalLabel")} className="flex gap-5">
          <Link href="/confidentialite" className="hover:text-foreground">
            {t("nav.privacy")}
          </Link>
          <Link href="/cgu" className="hover:text-foreground">
            {t("nav.terms")}
          </Link>
        </nav>
        <p>© {new Date().getFullYear()} DuoPlay</p>
      </div>
    </footer>
  );
}
