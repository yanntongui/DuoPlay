import { JourneyRecap } from "@/components/game/journey-recap";

export const metadata = { title: "Récapitulatif du parcours" };
export const dynamic = "force-dynamic";

export default async function RecapitulatifPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <JourneyRecap slug={slug} />;
}
