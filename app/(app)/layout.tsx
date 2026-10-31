import { AppIsland } from "@/components/app/app-island";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppHeader } from "@/components/app/app-header";
import { AppFooter } from "@/components/app/app-footer";
import { BottomNav } from "@/components/app/bottom-nav";
import { AppBackground } from "@/components/app/app-background";
import { OfflineBanner } from "@/components/pwa/offline-banner";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative min-h-dvh">
      <AppBackground />
      <AppSidebar />

      <div className="md:pl-[4.75rem] lg:pl-64">
        <AppIsland />
        <AppHeader />

        <div className="pt-20 sm:pt-24 md:pt-0">
          <OfflineBanner />

          <main
            id="contenu"
            className="mx-auto w-full max-w-2xl px-4 pt-6 sm:px-6 lg:max-w-5xl lg:px-8"
          >
            {children}
          </main>

          <AppFooter />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
