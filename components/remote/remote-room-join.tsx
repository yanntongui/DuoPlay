"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDeviceToken } from "@/lib/game/use-device";
import { readableError } from "@/lib/convex-error";

export function RemoteRoomJoin({ backHref = "/remote" }: { backHref?: string }) {
  const deviceToken = useDeviceToken();
  const joinAnyRoom = useMutation(api.remoteRoom.joinAnyRoom);

  const [code, setCode] = useState("");
  const [guestName, setGuestName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (deviceToken === undefined) {
    return (
      <Card className="mx-auto flex max-w-md items-center justify-center p-12">
        <span className="animate-spin text-muted-foreground">🔄</span>
      </Card>
    );
  }

  if (!deviceToken) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-2xl">Rejoindre une session</h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Impossible d'identifier cet appareil. Rechargez la page pour
          réessayer.
        </p>
      </div>
    );
  }

  return (
    <Card className="mx-auto flex max-w-md flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl leading-tight">Rejoindre une session</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Entrez le code d'invitation que votre partenaire vous a donné.
        </p>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Code d'invitation</span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={5}
          placeholder="ABCDE"
          className="h-12 w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 text-center text-lg font-mono tracking-widest outline-none focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Votre nom</span>
        <input
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Ex. Thomas"
          className="h-12 w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 outline-none focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60"
        />
      </label>

      {error && (
        <div className="rounded-xl border border-coral-200/70 bg-coral-100/70 px-3.5 py-2.5 text-sm text-coral-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Link
          href={backHref}
          className="press inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-ivory-300 bg-card/90 text-sm font-medium hover:border-lavender-300"
        >
          <ArrowLeft className="size-4" />
          Retour
        </Link>
        <Button
          onClick={async () => {
            if (deviceToken === undefined || !code || !guestName.trim() || busy) return;
            setError(null);
            setBusy(true);
            try {
              const { code: joined } = await joinAnyRoom({
                deviceToken,
                code,
                guestName: guestName.trim(),
              });
              window.location.href = `/remote/${joined}`;
            } catch (e) {
              setError(readableError(e, "Impossible de rejoindre"));
            } finally {
              setBusy(false);
            }
          }}
          disabled={!code || !guestName.trim() || busy}
        >
          {busy ? "Connexion…" : "Rejoindre"}
        </Button>
      </div>
    </Card>
  );
}