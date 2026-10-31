import { Parametres } from "@/components/app/parametres";

export const metadata = { title: "Paramètres" };

export default function ParametresPage() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold">Paramètres</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          L&apos;ambiance, vos préférences de jeu, vos consentements et les
          données de cet appareil — au même endroit.
        </p>
      </section>

      <Parametres />
    </div>
  );
}
