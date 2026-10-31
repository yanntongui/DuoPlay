"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Pill } from "@/components/ui/surface";
import { PRIMARY_NAV, PERSONAL_NAV, isActive, type NavItem } from "@/lib/navigation";
import { useT } from "@/lib/i18n";
import type { MessageKey } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

/**
 * Sidebar du dashboard (§6).
 *
 * — Desktop (≥ lg) : colonne complète, libellés visibles.
 * — Tablette (md → lg) : rail compact à icônes, libellés masqués mais
 *   conservés pour les lecteurs d'écran (`aria-label`) et au survol (`title`).
 *
 * L'entrée active est marquée par `aria-current="page"` et un fond champagne.
 * Les entrées « Bientôt » ne sont pas des liens : elles sont inertes et
 * signalées comme telles.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useT();

  return (
    <aside
      data-testid="app-sidebar"
      aria-label={t("nav.mainLabel")}
      className="fixed inset-y-0 left-0 z-40 hidden w-[4.75rem] flex-col gap-5 border-r border-white/[0.06] bg-[#0b0710]/85 px-2 py-5 backdrop-blur-2xl md:flex lg:w-64 lg:px-4"
    >
      <Link
        href="/accueil"
        aria-label={t("brand.homeLabel")}
        className="press mx-auto inline-flex items-center rounded-xl lg:mx-0 lg:px-1"
      >
        <LogoMark className="lg:hidden" />
        <Logo className="hidden lg:inline-flex" />
      </Link>

      <Link
        href="/explorer"
        data-testid="sidebar-cta"
        aria-label={t("action.createGame")}
        className="press gradient-primary top-light mx-auto inline-flex size-11 shrink-0 items-center justify-center rounded-full text-white shadow-[var(--shadow-glow)] hover:brightness-[1.06] lg:mx-0 lg:h-12 lg:w-full lg:gap-2 lg:px-5"
      >
        <Plus className="size-5" />
        <span className="hidden text-sm font-medium lg:inline">
          {t("action.createGame")}
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        <NavGroup labelKey="nav.groupMain" items={PRIMARY_NAV} pathname={pathname} />
        <NavGroup
          labelKey="nav.groupPersonal"
          items={PERSONAL_NAV}
          pathname={pathname}
        />
      </nav>
    </aside>
  );
}

function NavGroup({
  labelKey,
  items,
  pathname,
}: {
  labelKey: MessageKey;
  items: NavItem[];
  pathname: string;
}) {
  const { t } = useT();
  return (
    <div className="flex flex-col gap-1">
      <p className="eyebrow mb-1 hidden px-3 lg:block">{t(labelKey)}</p>
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
    "relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors";
  const centered = "justify-center lg:justify-start";

  if (item.soon) {
    return (
      <span
        data-testid="nav-soon"
        aria-disabled="true"
        title={t("nav.soonTitle", { label })}
        className={cn(
          base,
          centered,
          "cursor-not-allowed text-graphite-400 opacity-60",
        )}
      >
        <Icon className="size-5 shrink-0" aria-hidden="true" />
        <span className="hidden lg:inline">{label}</span>
        <Pill tone="neutral" className="ml-auto hidden lg:inline-flex">
          {t("nav.soon")}
        </Pill>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={label}
      className={cn(
        base,
        centered,
        "focus:outline-none focus-ring",
        active
          ? "bg-white/[0.08] text-lavender-300 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.06)]"
          : "text-graphite-500 hover:bg-white/[0.04] hover:text-foreground",
      )}
    >
      {active && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-lavender-300 lg:left-0"
        />
      )}
      <Icon
        className="size-5 shrink-0"
        strokeWidth={active ? 2.3 : 1.9}
        aria-hidden="true"
      />
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}
