import Link from "next/link";
import { SetupForm } from "@/components/game/setup-form";

export const metadata = { title: "Nouvelle partie" };

export default async function NewSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ journey?: string; jour?: string; ambiance?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;

  const journey =
    typeof query.journey === "string" && query.journey.length > 0
      ? query.journey
      : undefined;
  const parsed = Number.parseInt(query.jour ?? "", 10);
  const journeyDayIndex = Number.isFinite(parsed) ? parsed : undefined;
  const mood =
    typeof query.ambiance === "string" && query.ambiance.length > 0
      ? query.ambiance
      : undefined;

  const back = journey
    ? `/parcours/${journey}`
    : mood
      ? `/explorer/${slug}?ambiance=${mood}`
      : `/explorer/${slug}`;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href={back}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← {journey ? "Parcours" : "Expérience"}
      </Link>

      <SetupForm
        slug={slug}
        journey={journey}
        journeyDayIndex={journeyDayIndex}
        mood={mood}
      />
    </div>
  );
}
