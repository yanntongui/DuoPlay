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

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useT();

  return (
    <aside
      data-testid="app-sidebar"
      aria-label={t("nav.mainLabel")}
      className="fixed inset-y-0 left-0 z-40 hidden w-[4.75rem] flex-col gap-5 border-r border-white/10 bg-midnight-900/98 px-2 py-5 backdrop-blur-2xl md:flex lg:w-64 lg:px-4"
    >
      <Link
        href="/accueil"
        aria-label={t("brand.homeLabel")}
        className="press mx-auto inline-flex items-center rounded-xl lg:mx-0 lg:px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux-500"
      >
        <LogoMark className="lg:hidden text-cream-100" />
        <Logo className="hidden lg:inline-flex text-cream-100" />
      </Link>

      <Link
        href="/explorer"
        data-testid="sidebar-cta"
        aria-label={t("action.createGame")}
        className="press gradient-primary top-light mx-auto inline-flex size-11 shrink-0 items-center justify-center rounded-full text-white shadow-[var(--shadow-glow)] hover:brightness-110 lg:mx-0 lg:h-12 lg:w-full lg:gap-2 lg:px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <Plus className="size-5" />
        <span className="hidden text-sm font-semibold lg:inline">
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
      <p className="eyebrow mb-1 hidden px-3 lg:block text-cream-200">
        {t(labelKey)}
      </p>
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
    "relative flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux-500";
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
          "cursor-not-allowed text-muted-foreground opacity-50",
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
        active
          ? "bg-gradient-primary/20 text-cream-100 border-2 border-bordeaux-500/50 shadow-[var(--shadow-glow-prune)]"
          : "text-muted-foreground hover:bg-white/8 hover:text-cream-100 hover:-translate-x-0.5",
      )}
    >
      {active && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-bordeaux-400 shadow-[var(--shadow-glow-prune)] lg:left-0"
        />
      )}
      <Icon
        className="size-5 shrink-0 transition-transform duration-200"
        strokeWidth={active ? 2.5 : 2}
        aria-hidden="true"
      />
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}