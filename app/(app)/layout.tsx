"use client";

import { useState, useEffect } from "react";
import { AppIsland } from "@/components/app/app-island";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppHeader } from "@/components/app/app-header";
import { AppFooter } from "@/components/app/app-footer";
import { BottomNav } from "@/components/app/bottom-nav";
import { AppBackground } from "@/components/app/app-background";
import { OfflineBanner } from "@/components/pwa/offline-banner";

type SidebarState = "visible" | "hidden";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [sidebarState, setSidebarState] = useState<SidebarState>(
    "visible"
  );

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("duoplay_sidebarState");
    if (stored === "visible" || stored === "hidden") {
      setSidebarState(stored as SidebarState);
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    localStorage.setItem("duoplay_sidebarState", sidebarState);
  }, [sidebarState]);

  const toggleSidebar = () => {
    setSidebarState((prev) => (prev === "visible" ? "hidden" : "visible"));
  };

  return (
    <div className="relative flex min-h-dvh flex-col">
      <AppBackground />
      <AppSidebar
        sidebarState={sidebarState}
        onToggle={toggleSidebar}
      />

      <div className="flex flex-1 flex-col md:pl-[4.75rem] lg:pl-64">
        <AppIsland />
        <AppHeader
          sidebarState={sidebarState}
          onToggle={toggleSidebar}
        />

        <div className="flex flex-1 flex-col pt-20 sm:pt-24 md:pt-0">
          <OfflineBanner />

          <main
            id="contenu"
            className="mx-auto w-full flex-1 px-4 pt-6 sm:px-6 lg:px-8"
          >
            <div className="max-w-5xl">
              {children}
            </div>
          </main>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}