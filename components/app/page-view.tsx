"use client";

import { useEffect, useRef } from "react";
import { useTrack, type TrackedEvent } from "@/lib/analytics";

/**
 * Émet un événement produit **une seule fois** au montage (cf. PRD §19.1).
 * Sans rendu : sert aux pages serveur (landing, invitation) qui ne peuvent pas
 * journaliser elles-mêmes. Le consentement est filtré côté serveur.
 */
export function PageView({ name }: { name: TrackedEvent }) {
  const track = useTrack();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(name);
  }, [name, track]);

  return null;
}
