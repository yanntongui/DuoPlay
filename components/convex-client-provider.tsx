"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useMemo, type ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

/** Permet aux écrans de basculer sur un contenu statique tant que
 *  `npx convex dev` n'a pas été exécuté. */
export const isConvexConfigured = Boolean(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const client = useMemo(
    () => (convexUrl ? new ConvexReactClient(convexUrl) : null),
    [],
  );

  if (!client) {
    return (
      <div className="min-h-dvh">
        <div className="bg-coral-600 px-4 py-3 text-center text-sm font-medium text-white">
          Convex n&apos;est pas encore configuré. Exécute{" "}
          <code className="rounded bg-black/20 px-1.5 py-0.5">
            npx convex dev
          </code>{" "}
          puis renseigne NEXT_PUBLIC_CONVEX_URL.
        </div>
        {children}
      </div>
    );
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
