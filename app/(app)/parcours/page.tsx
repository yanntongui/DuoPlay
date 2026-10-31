import { JourneyList } from "@/components/app/journey-list";

export const metadata = { title: "Parcours guidés" };

export default function ParcoursPage() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold">Parcours guidés</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Des programmes de 3, 7 ou 21 jours, une étape par jour. Vous ne
          choisissez plus quoi faire : on vous guide.
        </p>
      </section>

      <JourneyList />
    </div>
  );
}
