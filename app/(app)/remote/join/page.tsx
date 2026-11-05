import { RemoteRoomJoin } from "@/components/remote/remote-room-join";

export const metadata = { title: "Rejoindre · DuoPlay" };

export default function RemoteJoinPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <RemoteRoomJoin />
    </div>
  );
}