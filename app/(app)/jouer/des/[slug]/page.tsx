import { DuoDice } from "@/components/formats/duo-dice";

export const metadata = { title: "DuoDice" };

export default async function DuoDicePage({
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
      <DuoDice slug={slug} mood={ambiance ?? null} />
    </div>
  );
}
