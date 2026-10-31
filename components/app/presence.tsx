"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDeviceToken } from "@/lib/game/use-device";
import { cn } from "@/lib/utils";

export function useRealTimePresence() {
  const deviceToken = useDeviceToken();
  const [active, setActive] = useState(false);

  const couple = useQuery(
    api.couples.mine,
    deviceToken ? { deviceToken } : "skip",
  );

  const touchActivity = useMutation(api.profiles.touchActivity);

  // Activate presence when mounted
  useEffect(() => {
    if (deviceToken) {
      setActive(true);
      touchActivity({ deviceToken }).catch(() => {});
    }
  }, [deviceToken]);

  // Heartbeat ping every 30s
  useEffect(() => {
    if (!deviceToken) return;

    const interval = setInterval(() => {
      touchActivity({ deviceToken }).catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, [deviceToken]);

  return couple !== null;
}

export function Presence({ className }: { className?: string }) {
  const isOnline = useRealTimePresence();

  return (
    <span className={cn("relative flex h-2 w-2", className)} aria-label={isOnline ? "En ligne" : "Hors ligne"}>
      {isOnline && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-pulse" />
      )}
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  );
}
