"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useDeviceToken } from "@/lib/game/use-device";
import { Logo } from "@/components/brand/logo";
import { PRIMARY_NAV, PERSONAL_NAV, NavItem, isActive } from "@/lib/navigation";

/**
 * Sidebar du dashboard (§6).
 *
 * ComportementToggle :
 * - Côté desktop (≥ lg) : le bouton Toggle dans la header contrôle la visibilité.
 * - Lorsque la sidebar est masquée, le contenu principal étend toute la largeur.
 * - Côté mobile (sm) : la sidebar est toujours masquée par défaut, accessible
 *   via le bouton du header ; elle se ferme automatiquement après sélection.
 *
 * Points d'accessibilité :
 * - `aria-label` et `aria-expanded` mis à jour dynamiquement.
 * - Transition fluide de 200 ms sur la largeur.
 */
export function AppSidebar({
  sidebarState,
  onToggle,
}: {
  sidebarState: "visible" | "hidden";
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const { t } = useT();

  const sidebarWidth = sidebarState === "visible" ? "w-[4.75rem]" : "0";
  const contentMargin = sidebarState === "visible" ? "md:pl-[4.75rem]" : "md:pl-0";
  const ariaLabel = sidebarState === "visible" ? t("nav.sidebarHide") : t("nav.sidebarShow");
  const sidebarClassName = cn(
    "fixed inset-y-0 left-0 z-40 overflow-y-auto transition-all duration-200",
    sidebarState === "visible" ? "w-[4.75rem] flex-col" : "w-0",
    "bg-[#0b0710]/85 border-r border-white/[0.06] backdrop-blur-2xl px-2 py-5"
  );

  return (
    <aside
      data-testid="app-sidebar"
      aria-label={ariaLabel}
      className={sidebarClassName}
    >
      {sidebarState === "visible" && (
        <Link
          href="/accueil"
          aria-label={t("brand.homeLabel")}
          className="press mx-auto inline-flex items-center rounded-xl lg:mx-0 lg:px-1"
        >
          <Logo className="lg:hidden" />
          <Logo className="hidden lg:inline-flex" />
        </Link>
      )}

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        <NavGroup items={PRIMARY_NAV} pathname={pathname} />
        <NavGroup items={PERSONAL_NAV} pathname={pathname} />
      </nav>

      {/* Bouton de toggle visible uniquement sur mobile / petite tablette */}
      {sidebarState === "hidden" && (
        <button
          onClick={onToggle}
          aria-label={t("nav.toggleSidebar")}
          aria-expanded={sidebarState === "visible"}
          className="absolute top-2 right-2 size-9 rounded-full bg-white/[0.08] hover:bg-white/[0.1] transition-colors flex items-center justify-center"
        >
          <PanelRightOpen className="size-4" aria-hidden="true" />
        </button>
      )}
    </aside>
  );
}

/* ---------- Composants internes (copiés depuis l'original) ---------- */

function NavGroup({
  items,
  pathname,
}: {
  items: NavItem[];
  pathname: string;
}) {
  const { t } = useT();

  return (
    <div className="flex flex-col gap-1">
      <p className="eyebrow mb-1 hidden md:block">Navigation</p>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.href}>
            <NavEntry item={item} pathname={pathname} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function NavEntry({ item, pathname }: { item: NavItem; pathname: string }) {
  const { t } = useT();
  const label = t(item.labelKey);
  const Icon = item.icon;
  const active = !item.soon && isActive(pathname, item.href);

  const base =
    "relative flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200 ease-out";
  const centered = "justify-center lg:justify-start";

  if (item.soon) {
    return (
      <span
        data-testid="nav-soon"
        aria-disabled="true"
        aria-label={`${label}, bientôt disponible`}
        title={t("nav.soonTitle", { label })}
        className={cn("cursor-not-allowed text-graphite-400 opacity-60")}
      >
        <Icon className="size-5 shrink-0" aria-hidden="true" />
        <span className="hidden">{label}</span>
        <Pill tone="neutral" className="ml-auto hidden">
          {t("nav.soon")}
        </Pill>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200 ease-out",
        "justify-center lg:justify-start",
        active
          ? "bg-white/[0.08] text-lavender-300 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.06)] scale-[1.02]"
          : "text-graphite-500 hover:bg-white/[0.04] hover:text-foreground hover:scale-[1.02]",
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active-indicator"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          aria-hidden="true"
          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-lavender-300"
        />
      )}
      <Icon
        className={cn("size-5 shrink-0 transition-transform duration-200", active ? "scale-110" : "scale-100")}
        strokeWidth={active ? 2.3 : 1.9}
        aria-hidden="true"
      />
      <span className="hidden">{label}</span>
    </Link>
  );
}