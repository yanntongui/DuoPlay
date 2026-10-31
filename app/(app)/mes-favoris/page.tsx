import { MesFavoris } from "@/components/app/mes-favoris";

export const metadata = { title: "Mes favoris" };

export default function MesFavorisPage() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold">Mes favoris</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Les expériences que vous avez gardées, prêtes à être lancées.
        </p>
      </section>

      <MesFavoris />
    </div>
  );
}
