import { MesParties } from "@/components/app/mes-parties";

export const metadata = { title: "Mes parties" };

export default function MesPartiesPage() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold">Mes parties</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vos parties en cours, vos invitations en attente et vos parties
          terminées, au même endroit.
        </p>
      </section>

      <MesParties />
    </div>
  );
}
