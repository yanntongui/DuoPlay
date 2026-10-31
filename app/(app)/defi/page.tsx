import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { DailyChallenge } from "@/components/game/daily-challenge";

export const metadata = { title: "Défi du jour" };
export const dynamic = "force-dynamic";

/**
 * Le défi du jour est publié par un cron à 00:05 (WAT). On le crée aussi à la
 * demande ici : un premier visiteur de la journée ne tombe jamais sur un vide.
 */
async function ensureToday() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return;
  try {
    await new ConvexHttpClient(url).mutation(api.daily.ensureToday, {});
  } catch {
    /* l'écran affichera un état vide explicite */
  }
}

export default async function DefiPage() {
  await ensureToday();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-7">
      <section className="pt-2">
        <p className="eyebrow mb-2">Chaque jour</p>
        <h1 className="text-[2rem] leading-[1.1]">Défi du jour</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          Une question ou une petite mission, chaque jour. Compatible à
          distance et en différé.
        </p>
      </section>

      <DailyChallenge />
    </div>
  );
}
