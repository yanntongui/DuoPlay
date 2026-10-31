"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_NAV, isActive } from "@/lib/navigation";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useT();

  return (
    <nav
      aria-label={t("nav.mainLabel")}
      data-testid="bottom-nav"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-midnight-900/98 backdrop-blur-2xl md:hidden"
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
                  className="press relative flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bordeaux-500"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-1 inset-y-0.5 -z-10 rounded-2xl transition-all duration-300",
                      active
                        ? "gradient-primary opacity-100 shadow-[var(--shadow-glow)]"
                        : "opacity-0 scale-95",
                    )}
                  />
                  <Icon
                    className={cn(
                      "size-5 shrink-0 transition-all duration-200",
                      active ? "text-cream-100 scale-110" : "text-muted-foreground",
                    )}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span
                    className={cn(
                      "transition-all duration-200 font-medium",
                      active ? "text-cream-100 scale-105" : "text-muted-foreground",
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