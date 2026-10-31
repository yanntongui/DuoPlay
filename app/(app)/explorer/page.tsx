import Link from "next/link";
import { ArrowRight, Route } from "lucide-react";
import { Card } from "@/components/ui/card";
import { UniverseGrid } from "@/components/app/universe-grid";
import { PreferencesOnboarding } from "@/components/app/preferences-onboarding";

export const metadata = { title: "Explorer" };

export default async function ExplorerPage({
  searchParams,
}: {
  searchParams: Promise<{ ambiance?: string }>;
}) {
  const { ambiance } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold">Explorer</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choisissez une ambiance, un univers, puis une expérience à vivre à
          deux.
        </p>
      </section>

      <Link href="/parcours" className="block">
        <Card className="flex items-center gap-4 border-primary/30 bg-coral-100/40 p-4 transition-colors hover:bg-coral-100/70">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Route className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium">Parcours guidés</p>
            <p className="text-sm text-muted-foreground">
              Un programme de 3, 7 ou 21 jours, une étape par jour.
            </p>
          </div>
          <ArrowRight className="size-5 shrink-0 text-primary" />
        </Card>
      </Link>

      <PreferencesOnboarding />

      <UniverseGrid mood={ambiance ?? null} />
    </div>
  );
}

