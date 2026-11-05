import { RemoteRoomLanding } from "@/components/remote/remote-room-landing";

export const metadata = { title: "Mode à distance · DuoPlay" };

export default function RemotePage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <RemoteRoomLanding />
    </div>
  );
}