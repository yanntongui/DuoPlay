import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { JourneyDetail } from "@/components/game/journey-detail";

export const dynamic = "force-dynamic";

/**
 * Le slug est le seul paramètre d'URL : le contenu du parcours n'est jamais
 * interpolé dans le HTML, on se contente d'un titre générique côté serveur.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return { title: "Parcours guidé" };

  try {
    const data = await new ConvexHttpClient(url).query(api.journeys.bySlug, {
      slug,
    });
    if (!data) return { title: "Parcours guidé" };
    return {
      title: data.journey.title,
      description: data.journey.description,
    };
  } catch {
    return { title: "Parcours guidé" };
  }
}

export default async function ParcoursDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <JourneyDetail slug={slug} />;
}
