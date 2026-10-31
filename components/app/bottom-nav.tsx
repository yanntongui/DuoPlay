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
                  className="press relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium focus-ring focus:outline-none"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-1.5 inset-y-0.5 -z-10 rounded-2xl transition-opacity duration-300",
                      active
                        ? "gradient-tendresse opacity-100 shadow-[var(--shadow-glow)]"
                        : "opacity-0",
                    )}
                  />
                  <Icon
                    className={cn(
                      "size-5 transition-colors",
                      active ? "text-white" : "text-graphite-500",
                    )}
                    strokeWidth={active ? 2.3 : 1.9}
                  />
                  <span
                    className={cn(
                      "transition-colors",
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
