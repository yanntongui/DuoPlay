"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_NAV, isActive } from "@/lib/navigation";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { MoodBadge } from "@/components/ui/status-badges";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useT();

  return (
    <nav
      aria-label={t("nav.mainLabel")}
      data-testid="bottom-nav"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="glass">
        <ul className="mx-auto flex max-w-md items-stretch px-2 py-1.5">
          {MOBILE_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  aria-label={t(item.labelKey)}
                  className="press relative flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-medium active:scale-95"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-1 inset-y-1.5 -z-10 rounded-2xl transition-all duration-300",
                      active
                        ? "gradient-tendresse opacity-100 shadow-[var(--shadow-glow)] scale-100"
                        : "opacity-0 scale-90",
                    )}
                  />
                  <Icon
                    className={cn(
                      "size-5 transition-all duration-300",
                      active ? "text-white scale-110" : "text-graphite-500 scale-100",
                    )}
                    strokeWidth={active ? 2.3 : 1.9}
                  />
                  <span
                    className={cn(
                      "transition-all duration-300",
                      active ? "text-white" : "text-graphite-500",
                    )}
                  >
                    {t(item.labelKey)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
