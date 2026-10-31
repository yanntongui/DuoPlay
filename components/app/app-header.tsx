"use client";

import { usePathname } from "next/navigation";
import { Presence } from "@/components/app/presence";
import { AmbianceToggle } from "@/components/app/ambiance-toggle";
import { NotificationsBell } from "@/components/app/notifications-bell";
import { MoodBadge } from "@/components/ui/status-badges";
import { titleKeyForPath } from "@/lib/navigation";
import { useT } from "@/lib/i18n";

export function AppHeader() {
  const pathname = usePathname();
  const { t } = useT();

  return (
    <div
      data-testid="app-header"
      className="sticky top-0 z-30 hidden items-center justify-between gap-4 border-b border-white/[0.06] bg-[#040205]/70 px-6 py-2.5 backdrop-blur-xl md:flex lg:px-8"
    >
      <p className="eyebrow truncate">{t(titleKeyForPath(pathname))}</p>
      <div className="flex items-center gap-3">
        <MoodBadge mood={undefined} />
        <Presence />
        <NotificationsBell />
        <AmbianceToggle />
      </div>
    </div>
  );
}
