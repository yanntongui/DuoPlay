import Link from "next/link";
import { ExperienceList } from "@/components/app/experience-list";

export const metadata = { title: "Explorer" };

export default async function ExplorerCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ambiance?: string }>;
}) {
  const { slug } = await params;
  const { ambiance } = await searchParams;

  const back = ambiance ? `/explorer?ambiance=${ambiance}` : "/explorer";

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={back}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Tous les univers
      </Link>

      <ExperienceList slug={slug} mood={ambiance ?? null} />
    </div>
  );
}
