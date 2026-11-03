"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { AiBrief } from "@/convex/ai/content";
import { useDeviceToken } from "@/lib/game/use-device";
import type { AiOverview } from "@/components/ai/types";
import { AiCard, AiSkeleton } from "@/components/ai/ai-ui";
import { AiHome } from "@/components/ai/ai-home";
import { AiComposer } from "@/components/ai/ai-composer";
import { AiLive } from "@/components/ai/ai-live";
import { AiSearch } from "@/components/ai/ai-search";
import { AiCommunication } from "@/components/ai/ai-communication";

type View =
  | { name: "home" }
  | { name: "composer"; preset?: Partial<AiBrief> }
  | { name: "search"; query: string }
  | { name: "communication" }
  | { name: "live"; sessionId: Id<"aiSessions"> };

export function AiStudio() {
  const deviceToken = useDeviceToken();
  const [view, setView] = useState<View>({ name: "home" });

  const overview = useQuery(
    api.ai.overview,
    deviceToken ? { deviceToken } : "skip",
  );
  const recommendations = useQuery(
    api.ai.recommendations,
    deviceToken ? { deviceToken } : "skip",
  );
  const liveSession = useQuery(
    api.ai.getSession,
    deviceToken && view.name === "live"
      ? { deviceToken, sessionId: view.sessionId }
      : "skip",
  );

  const setConsent = useMutation(api.ai.setConsent);
  const generate = useMutation(api.ai.generateSession);
  const start = useMutation(api.ai.startSession);
  const record = useMutation(api.ai.recordAction);
  const alternative = useMutation(api.ai.requestAlternative);
  const remove = useMutation(api.ai.deleteSession);
  const clear = useMutation(api.ai.clearHistory);
  const dismiss = useMutation(api.ai.dismissRecommendation);
  const restore = useMutation(api.ai.restoreRecommendations);

  if (!deviceToken || overview === undefined) {
    return (
      <AiCard className="mt-6 p-6 sm:p-8">
        <AiSkeleton lines={2} />
        <div className="mt-6">
          <AiSkeleton lines={5} />
        </div>
        <p className="sr-only">Chargement de DuoPlay AI</p>
      </AiCard>
    );
  }

  if (overview === null) {
    return (
      <AiCard className="mt-6 p-6">
        <p className="text-sm text-[#d9cbbf]/70">
          Votre espace DuoPlay AI est indisponible pour le moment. Le catalogue
          reste accessible.
        </p>
      </AiCard>
    );
  }

  const home = (
    <AiHome
      overview={overview}
      recommendations={recommendations?.items ?? []}
      onCompose={(preset) => setView({ name: "composer", preset })}
      onSearch={(query) => setView({ name: "search", query })}
      onCommunication={() => setView({ name: "communication" })}
      onOpenSession={async (id) => {
        await start({ deviceToken, sessionId: id });
        setView({ name: "live", sessionId: id });
      }}
      onDeleteSession={async (id) => {
        await remove({ deviceToken, sessionId: id });
      }}
      onClearHistory={async () => {
        await clear({ deviceToken });
      }}
      onToggleConsent={async (granted) => {
        await setConsent({ deviceToken, granted });
      }}
      onDismissRecommendation={async (kind, value) => {
        await dismiss({ deviceToken, kind, value });
      }}
      onRestoreRecommendations={async () => {
        await restore({ deviceToken });
      }}
    />
  );

  if (view.name === "home") return home;

  if (view.name === "composer") {
    return (
      <AiComposer
        initial={view.preset}
        onCancel={() => setView({ name: "home" })}
        onGenerate={(brief) => generate({ deviceToken, ...brief })}
        onStart={async (sessionId) => {
          await start({ deviceToken, sessionId: sessionId as Id<"aiSessions"> });
          setView({ name: "live", sessionId: sessionId as Id<"aiSessions"> });
        }}
        onLater={() => setView({ name: "home" })}
      />
    );
  }

  if (view.name === "search") {
    return (
      <AiSearch
        deviceToken={deviceToken}
        initialQuery={view.query}
        onBack={() => setView({ name: "home" })}
        onCompose={(preset) => setView({ name: "composer", preset })}
      />
    );
  }

  if (view.name === "communication") {
    return (
      <AiCommunication
        deviceToken={deviceToken}
        onBack={() => setView({ name: "home" })}
      />
    );
  }

  if (view.name === "live") {
    if (liveSession === undefined) {
      return (
        <AiCard className="mt-6 p-6">
          <AiSkeleton lines={4} />
          <p className="sr-only">Ouverture de la session</p>
        </AiCard>
      );
    }
    if (!liveSession) {
      return (
        <AiCard className="mt-6 p-6">
          <p className="text-sm text-[#d9cbbf]/70">
            Cette session n’est plus disponible. Elle a peut-être été supprimée
            ou a expiré.
          </p>
          <button
            type="button"
            onClick={() => setView({ name: "home" })}
            className="mt-3 text-[13px] text-[#f6efe7] underline-offset-4 hover:underline"
          >
            Revenir à DuoPlay AI
          </button>
        </AiCard>
      );
    }

    return (
      <AiLive
        key={liveSession._id}
        session={liveSession}
        onRecord={async (action, stepIndex) => {
          await record({
            deviceToken,
            sessionId: liveSession._id,
            stepIndex,
            action,
          });
        }}
        onAlternative={async (stepIndex) => {
          const response = await alternative({
            deviceToken,
            sessionId: liveSession._id,
            stepIndex,
          });
          return response.ok ? response.step : null;
        }}
        onExit={() => setView({ name: "home" })}
      />
    );
  }

  return home;
}

export type { AiOverview };
