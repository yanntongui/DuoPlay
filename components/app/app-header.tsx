"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Presence } from "@/components/app/presence";
import { AmbianceToggle } from "@/components/app/ambiance-toggle";
import { NotificationsBell } from "@/components/app/notifications-bell";
import { MoodBadge } from "@/components/ui/status-badges";
import { titleKeyForPath } from "@/lib/navigation";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { PanelLeftClose } from "lucide-react";

export function AppHeader({
  sidebarState,
  onToggle,
}: {
  sidebarState: "visible" | "hidden";
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const { t } = useT();

  return (
    <div
      data-testid="app-header"
      className="sticky top-0 z-30 hidden items-center justify-between gap-4 border-b border-white/[0.06] bg-[#040205]/70 px-6 py-2.5 backdrop-blur-xl md:flex lg:px-8"
    >
      <button
        onClick={onToggle}
        aria-label={sidebarState === "visible" ? t("nav.toggleSidebarHide") : t("nav.toggleSidebarShow")}
        aria-expanded={sidebarState === "visible"}
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:text-lavender-200 transition-colors"
      >
        {sidebarState === "visible" ? (
          <PanelLeftClose className="size-4" aria-hidden="true" />
        ) : (
          <PanelLeft className="size-4" aria-hidden="true" />
        )}
      </button>

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