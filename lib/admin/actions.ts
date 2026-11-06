"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { adminClient, adminKey } from "@/lib/admin/convex";
import {
  checkCredentials,
  endAdminSession,
  isAdminAuthenticated,
  startAdminSession,
} from "@/lib/admin/session";

/* ------------------------------------------------------------------ */
/* Authentification                                                    */
/* ------------------------------------------------------------------ */

export async function login(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!checkCredentials(username, password)) {
    redirect("/admin/login?error=1");
  }

  await startAdminSession();
  redirect("/admin");
}

export async function logout() {
  await endAdminSession();
  redirect("/admin/login");
}

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function num(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

function lines(formData: FormData, key: string) {
  return str(formData, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/* ------------------------------------------------------------------ */
/* Catégories                                                          */
/* ------------------------------------------------------------------ */

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  await adminClient().mutation(api.categories.adminUpsert, {
    adminKey: adminKey(),
    id: (id || undefined) as Id<"categories"> | undefined,
    slug: str(formData, "slug"),
    title: str(formData, "title"),
    tagline: str(formData, "tagline"),
    description: str(formData, "description"),
    emoji: str(formData, "emoji"),
    accent: str(formData, "accent") as "coral" | "lavender" | "graphite",
    order: num(formData, "order"),
    mvp: formData.get("mvp") === "on",
    status: str(formData, "status") as "draft" | "published" | "archived",
  });
  revalidatePath("/admin/categories");
  revalidatePath("/explorer");
}

export async function setCategoryStatus(formData: FormData) {
  await requireAdmin();
  await adminClient().mutation(api.categories.adminSetStatus, {
    adminKey: adminKey(),
    id: str(formData, "id") as Id<"categories">,
    status: str(formData, "status") as "draft" | "published" | "archived",
  });
  revalidatePath("/admin/categories");
  revalidatePath("/explorer");
}

/* ------------------------------------------------------------------ */
/* Expériences                                                         */
/* ------------------------------------------------------------------ */

export async function saveExperience(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  await adminClient().mutation(api.experiences.adminUpsert, {
    adminKey: adminKey(),
    id: (id || undefined) as Id<"experiences"> | undefined,
    categoryId: str(formData, "categoryId") as Id<"categories">,
    slug: str(formData, "slug"),
    title: str(formData, "title"),
    description: str(formData, "description"),
    depth: str(formData, "depth") as "leger" | "moyen" | "profond",
    themes: lines(formData, "themes"),
    estimatedMinutes: num(formData, "estimatedMinutes", 10),
    modes: formData.getAll("modes").map(String) as Array<
      "ensemble" | "a-distance" | "differe" | "defi-individuel"
    >,
    type: str(formData, "type") as
      | "questions"
      | "cartes"
      | "des"
      | "parcours",
    status: str(formData, "status") as "draft" | "published" | "archived",
    order: num(formData, "order"),
  });
  revalidatePath("/admin/experiences");
}

export async function setExperienceStatus(formData: FormData) {
  await requireAdmin();
  await adminClient().mutation(api.experiences.adminSetStatus, {
    adminKey: adminKey(),
    id: str(formData, "id") as Id<"experiences">,
    status: str(formData, "status") as "draft" | "published" | "archived",
  });
  revalidatePath("/admin/experiences");
}

/* ------------------------------------------------------------------ */
/* Questions                                                           */
/* ------------------------------------------------------------------ */

export async function saveQuestion(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const options = lines(formData, "options");
  await adminClient().mutation(api.questions.adminUpsert, {
    adminKey: adminKey(),
    id: (id || undefined) as Id<"questions"> | undefined,
    experienceId: str(formData, "experienceId") as Id<"experiences">,
    kind: str(formData, "kind") as "choice" | "open" | "challenge",
    prompt: str(formData, "prompt"),
    options: options.length > 0 ? options : undefined,
    depth: str(formData, "depth") as "leger" | "moyen" | "profond",
    themes: lines(formData, "themes"),
    order: num(formData, "order"),
    status: str(formData, "status") as "draft" | "published" | "archived",
  });
  revalidatePath("/admin/questions");
}

export async function setQuestionStatus(formData: FormData) {
  await requireAdmin();
  await adminClient().mutation(api.questions.adminSetStatus, {
    adminKey: adminKey(),
    id: str(formData, "id") as Id<"questions">,
    status: str(formData, "status") as "draft" | "published" | "archived",
  });
  revalidatePath("/admin/questions");
}

export async function deleteQuestion(formData: FormData) {
  await requireAdmin();
  await adminClient().mutation(api.questions.adminRemove, {
    adminKey: adminKey(),
    id: str(formData, "id") as Id<"questions">,
  });
  revalidatePath("/admin/questions");
}

/* ------------------------------------------------------------------ */
/* Parcours guidés                                                     */
/* ------------------------------------------------------------------ */

export async function saveJourney(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  await adminClient().mutation(api.journeys.adminUpsert, {
    adminKey: adminKey(),
    id: (id || undefined) as Id<"journeys"> | undefined,
    slug: str(formData, "slug"),
    title: str(formData, "title"),
    tagline: str(formData, "tagline"),
    description: str(formData, "description"),
    emoji: str(formData, "emoji"),
    lengthDays: num(formData, "lengthDays", 7),
    order: num(formData, "order"),
    status: str(formData, "status") as "draft" | "published" | "archived",
  });
  revalidatePath("/admin/parcours");
  revalidatePath("/parcours");
}

export async function setJourneyStatus(formData: FormData) {
  await requireAdmin();
  await adminClient().mutation(api.journeys.adminSetStatus, {
    adminKey: adminKey(),
    id: str(formData, "id") as Id<"journeys">,
    status: str(formData, "status") as "draft" | "published" | "archived",
  });
  revalidatePath("/admin/parcours");
  revalidatePath("/parcours");
}

export async function deleteJourney(formData: FormData) {
  await requireAdmin();
  await adminClient().mutation(api.journeys.adminRemove, {
    adminKey: adminKey(),
    id: str(formData, "id") as Id<"journeys">,
  });
  revalidatePath("/admin/parcours");
  revalidatePath("/parcours");
}

export async function saveJourneyStep(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const experienceId = str(formData, "experienceId");
  const journeyId = str(formData, "journeyId");
  await adminClient().mutation(api.journeys.adminUpsertStep, {
    adminKey: adminKey(),
    id: (id || undefined) as Id<"journeySteps"> | undefined,
    journeyId: journeyId as Id<"journeys">,
    dayIndex: num(formData, "dayIndex", 1),
    title: str(formData, "title"),
    prompt: str(formData, "prompt") || undefined,
    experienceId: (experienceId || undefined) as
      | Id<"experiences">
      | undefined,
    mission: str(formData, "mission") || undefined,
  });
  revalidatePath("/admin/parcours");
  revalidatePath("/parcours");
}

export async function deleteJourneyStep(formData: FormData) {
  await requireAdmin();
  await adminClient().mutation(api.journeys.adminRemoveStep, {
    adminKey: adminKey(),
    id: str(formData, "id") as Id<"journeySteps">,
  });
  revalidatePath("/admin/parcours");
  revalidatePath("/parcours");
}

/* ------------------------------------------------------------------ */
/* Modération                                                          */
/* ------------------------------------------------------------------ */

export async function resolveReport(formData: FormData) {
  await requireAdmin();
  await adminClient().mutation(api.reports.resolve, {
    adminKey: adminKey(),
    id: str(formData, "id") as Id<"reports">,
    status: str(formData, "status") as "nouveau" | "traite" | "rejete",
  });
  revalidatePath("/admin/reports");
}
