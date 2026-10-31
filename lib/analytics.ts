"use client";

import { useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getActiveDeviceToken } from "@/lib/game/storage";

/**
 * Journal d'événements produit depuis l'interface (cf. PRD §19.1).
 *
 * Le consentement est vérifié **côté serveur** (`analytics.track`) : appeler
 * `track` sans consentement ne produit aucune écriture. On peut donc appeler
 * sans condition, sans jamais collecter à l'insu de l'utilisateur (§15.6).
 */
export type TrackedEvent =
  | "landing_view"
  | "invite_link_shared"
  | "invite_opened"
  | "game_started"
  | "session_resumed"
  | "notification_optin"
  | "result_card_shared";

export function useTrack() {
  const track = useMutation(api.analytics.track);

  return useCallback(
    (name: TrackedEvent, props?: Record<string, unknown>) => {
      void track({
        name,
        deviceToken: getActiveDeviceToken(),
        props,
      }).catch(() => {
        /* la mesure ne doit jamais casser l'expérience */
      });
    },
    [track],
  );
}
