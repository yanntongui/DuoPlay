import { RemoteRoom } from "@/components/remote/remote-room";

export const metadata = { title: "Session · DuoPlay" };

export default async function RemoteRoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return (
    <div className="mx-auto w-full max-w-2xl">
      <RemoteRoom code={code} />
    </div>
  );
}