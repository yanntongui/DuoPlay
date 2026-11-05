import { DuoPath } from "@/components/formats/duo-path";

export const metadata = { title: "DuoPath" };

export default async function DuoPathPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <DuoPath slug={slug} />
    </div>
  );
}
