import { RoueDuHasard } from "@/components/game/roue-du-hasard";

export const metadata = { title: "Roue du hasard" };

export default function RouePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-7">
      <section className="pt-2 text-center">
        <p className="eyebrow mb-2">Le sort décide</p>
        <h1 className="text-[2rem] leading-[1.1]">Roue du hasard</h1>
        <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          Tournez la roue : elle tire un défi court à vivre dans l&apos;instant,
          léger ou profond selon le sort.
        </p>
      </section>

      <RoueDuHasard />
    </div>
  );
}
