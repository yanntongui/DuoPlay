import { Catalogue } from "@/components/explorer/catalogue";
import { CatalogueBoundary } from "@/components/explorer/catalogue-boundary";

export const metadata = { title: "Explorer" };

export default async function ExplorerPage({
  searchParams,
}: {
  searchParams: Promise<{ format?: string; ambiance?: string }>;
}) {
  const { format } = await searchParams;

  return (
    <CatalogueBoundary>
      <Catalogue initialFormat={format ?? null} />
    </CatalogueBoundary>
  );
}
