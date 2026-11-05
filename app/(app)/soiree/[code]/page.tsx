import { SoireeRoom } from "@/components/soiree/soiree-room";

export const metadata = { title: "Soirée · DuoPlay" };

export default async function SoireeRoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return (
    <div className="mx-auto w-full max-w-2xl">
      <SoireeRoom code={code} />
    </div>
  );
}
