import { DuoCards } from "@/components/formats/duo-cards";

export const metadata = { title: "DuoCards" };

export default async function DuoCardsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ambiance?: string }>;
}) {
  const { slug } = await params;
  const { ambiance } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <DuoCards slug={slug} mood={ambiance ?? null} />
    </div>
  );
}
