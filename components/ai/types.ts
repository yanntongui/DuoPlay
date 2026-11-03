import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";

export type AiOverview = NonNullable<
  FunctionReturnType<typeof api.ai.overview>
>;
export type AiSessionSummary = AiOverview["sessions"][number];
export type AiRecommendations = FunctionReturnType<
  typeof api.ai.recommendations
>;
export type AiRecommendation = AiRecommendations["items"][number];
export type AiSessionDoc = NonNullable<
  FunctionReturnType<typeof api.ai.getSession>
>;
export type AiGenerated = Extract<
  FunctionReturnType<typeof api.ai.generateSession>,
  { ok: true }
>;
export type AiGenerateResult = FunctionReturnType<
  typeof api.ai.generateSession
>;
export type AiSearchResult = FunctionReturnType<typeof api.ai.search>;
export type AiSearchExperience = AiSearchResult["experiences"][number];
