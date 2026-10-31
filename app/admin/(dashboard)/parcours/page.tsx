import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  deleteJourney,
  deleteJourneyStep,
  saveJourney,
  saveJourneyStep,
} from "@/lib/admin/actions";
import { adminClient } from "@/lib/admin/convex";

export const dynamic = "force-dynamic";
export const metadata = { title: "Parcours" };

const field =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

type JourneyRow = {
  _id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  emoji: string;
  lengthDays: number;
  order: number;
  status: "draft" | "published" | "archived";
  stepCount: number;
  followers: number;
  completions: number;
};

type StepRow = {
  _id: string;
  dayIndex: number;
  title: string;
  prompt?: string;
  experienceId?: string;
  experienceTitle: string | null;
  mission?: string;
};

type ExperienceOption = { _id: string; title: string; categoryTitle: string };

function JourneyForm({ journey }: { journey?: JourneyRow }) {
  return (
    <form
      action={saveJourney}
      className="grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2"
    >
      {journey && <input type="hidden" name="id" value={journey._id} />}

      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-muted-foreground">Titre</span>
        <input name="title" defaultValue={journey?.title ?? ""} required className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Identifiant (slug)</span>
        <input name="slug" defaultValue={journey?.slug ?? ""} required className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Emoji</span>
        <input name="emoji" defaultValue={journey?.emoji ?? ""} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-muted-foreground">Accroche</span>
        <input name="tagline" defaultValue={journey?.tagline ?? ""} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-muted-foreground">Description</span>
        <textarea
          name="description"
          defaultValue={journey?.description ?? ""}
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Durée (jours)</span>
        <input
          type="number"
          name="lengthDays"
          min={1}
          max={21}
          defaultValue={journey?.lengthDays ?? 7}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Ordre d&apos;affichage</span>
        <input type="number" name="order" defaultValue={journey?.order ?? 0} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Statut</span>
        <select name="status" defaultValue={journey?.status ?? "draft"} className={field}>
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
          <option value="archived">Archivé</option>
        </select>
      </label>

      <div className="flex items-center gap-2 sm:col-span-2">
        <button
          type="submit"
          className="h-10 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-coral-600"
        >
          {journey ? "Enregistrer" : "Créer le parcours"}
        </button>
      </div>
    </form>
  );
}

function StepForm({
  journeyId,
  step,
  experiences,
}: {
  journeyId: string;
  step?: StepRow;
  experiences: ExperienceOption[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <form action={saveJourneyStep} className="grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="journeyId" value={journeyId} />
        {step && <input type="hidden" name="id" value={step._id} />}

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Jour</span>
          <input
            type="number"
            name="dayIndex"
            min={1}
            defaultValue={step?.dayIndex ?? 1}
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Titre de l&apos;étape</span>
          <input name="title" defaultValue={step?.title ?? ""} required className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="text-muted-foreground">Phrase d&apos;introduction</span>
          <input name="prompt" defaultValue={step?.prompt ?? ""} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Expérience liée (optionnel)</span>
          <select
            name="experienceId"
            defaultValue={step?.experienceId ?? ""}
            className={field}
          >
            <option value="">Aucune — mission uniquement</option>
            {experiences.map((item) => (
              <option key={item._id} value={item._id}>
                {item.categoryTitle} — {item.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Mission (optionnel)</span>
          <input name="mission" defaultValue={step?.mission ?? ""} className={field} />
        </label>

        <div className="flex items-center gap-2 sm:col-span-2">
          <button
            type="submit"
            className="h-10 rounded-full border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted"
          >
            {step ? "Enregistrer l'étape" : "Ajouter l'étape"}
          </button>
          {step && (!step.experienceId || !step.mission) && (
            <span className="text-xs text-muted-foreground">
              {step.experienceId
                ? "Expérience liée : la partie terminée valide l'étape."
                : null}
              {step.experienceId && step.mission ? " · " : null}
              {!step.mission && !step.experienceId
                ? "Sans expérience ni mission, l'étape reste à valider à la main."
                : null}
            </span>
          )}
        </div>
      </form>

      {step && (
        <form action={deleteJourneyStep} className="mt-3 border-t border-border pt-3">
          <input type="hidden" name="id" value={step._id} />
          <button
            type="submit"
            className="text-xs font-medium text-destructive hover:underline"
          >
            Supprimer l&apos;étape
          </button>
        </form>
      )}
    </div>
  );
}

export default async function AdminJourneysPage({
  searchParams,
}: {
  searchParams: Promise<{ journey?: string }>;
}) {
  const { journey: requested } = await searchParams;
  const [journeys, experiences] = await Promise.all([
    adminClient().query(api.journeys.listAll, {}),
    adminClient().query(api.experiences.listAll, {}),
  ]);

  const selected =
    journeys.find((item) => item._id === requested) ?? journeys[0] ?? null;

  const steps: StepRow[] = selected
    ? await adminClient().query(api.journeys.adminSteps, {
        journeyId: selected._id as Id<"journeys">,
      })
    : [];

  const options: ExperienceOption[] = experiences.map((item) => ({
    _id: item._id,
    title: item.title,
    categoryTitle: item.categoryTitle,
  }));

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold">Parcours guidés</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Un programme de 3, 7 ou 21 jours, une étape par jour — mission à faire
          dans la vie réelle ou expérience à jouer. Une partie terminée vaut
          étape validée.
        </p>
      </section>

      {journeys.length > 0 && (
        <form method="get" className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Parcours</span>
            <select name="journey" defaultValue={selected?._id} className={`${field} min-w-72`}>
              {journeys.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.emoji} {item.title} ({item.status})
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="h-10 rounded-full border border-border bg-card px-5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Afficher
          </button>
        </form>
      )}

      {selected ? (
        <>
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>
                {selected.stepCount} étape{selected.stepCount > 1 ? "s" : ""} ·{" "}
                {selected.followers} couple{selected.followers > 1 ? "s" : ""}{" "}
                suivi{selected.followers > 1 ? "s" : ""} ·{" "}
                {selected.completions} terminé{selected.completions > 1 ? "s" : ""}
              </span>
              {selected.stepCount !== selected.lengthDays && (
                <span className="rounded-full bg-coral-100 px-2 py-0.5 text-xs font-medium text-coral-700">
                  {selected.lengthDays} jours annoncés, {selected.stepCount}{" "}
                  étape(s) définie(s)
                </span>
              )}
            </div>

            <JourneyForm journey={selected as JourneyRow} />

            <form action={deleteJourney} className="self-start">
              <input type="hidden" name="id" value={selected._id} />
              <button
                type="submit"
                className="text-xs font-medium text-destructive hover:underline"
              >
                Supprimer ce parcours et ses étapes
              </button>
            </form>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Étapes</h2>
            {steps.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aucune étape pour l&apos;instant.
              </p>
            )}
            {steps.map((step) => (
              <StepForm
                key={step._id}
                journeyId={selected._id}
                step={step}
                experiences={options}
              />
            ))}
            <h3 className="mt-2 text-sm font-semibold">Nouvelle étape</h3>
            <StepForm journeyId={selected._id} experiences={options} />
          </section>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Aucun parcours. Créez le premier ci-dessous.
        </p>
      )}

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Nouveau parcours</h2>
        <JourneyForm />
      </section>
    </div>
  );
}
