import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { saveQuestion } from "@/lib/admin/actions";
import { adminClient } from "@/lib/admin/convex";

export const dynamic = "force-dynamic";
export const metadata = { title: "Questions" };

const field =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

type QuestionRow = {
  _id: string;
  experienceId: string;
  kind: "choice" | "open" | "challenge";
  prompt: string;
  options?: string[];
  depth: "leger" | "moyen" | "profond";
  themes: string[];
  order: number;
  status: "draft" | "published" | "archived";
};

function QuestionForm({
  experienceId,
  question,
}: {
  experienceId: string;
  question?: QuestionRow;
}) {
  return (
    <form
      action={saveQuestion}
      className="grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2"
    >
      <input type="hidden" name="experienceId" value={question?.experienceId ?? experienceId} />
      {question && <input type="hidden" name="id" value={question._id} />}

      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-muted-foreground">Énoncé</span>
        <textarea
          name="prompt"
          defaultValue={question?.prompt ?? ""}
          rows={2}
          required
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Type</span>
        <select name="kind" defaultValue={question?.kind ?? "open"} className={field}>
          <option value="choice">Choix multiple</option>
          <option value="open">Question ouverte</option>
          <option value="challenge">Défi</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Ordre</span>
        <input type="number" name="order" defaultValue={question?.order ?? 0} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-muted-foreground">
          Options (séparées par des virgules — choix multiple uniquement)
        </span>
        <input name="options" defaultValue={(question?.options ?? []).join(", ")} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Profondeur</span>
        <select name="depth" defaultValue={question?.depth ?? "leger"} className={field}>
          <option value="leger">Léger</option>
          <option value="moyen">Moyen</option>
          <option value="profond">Profond</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Thèmes (séparés par des virgules)</span>
        <input name="themes" defaultValue={(question?.themes ?? []).join(", ")} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-muted-foreground">Statut</span>
        <select name="status" defaultValue={question?.status ?? "draft"} className={field}>
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
          <option value="archived">Archivé</option>
        </select>
      </label>

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="h-10 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-coral-600"
        >
          {question ? "Enregistrer" : "Ajouter la question"}
        </button>
      </div>
    </form>
  );
}

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ experience?: string }>;
}) {
  const { experience } = await searchParams;
  const experiences = await adminClient().query(api.experiences.listAll, {});

  const selectedId = (experience ?? experiences[0]?._id) as
    | Id<"experiences">
    | undefined;

  const questions = selectedId
    ? await adminClient().query(api.questions.listByExperience, {
        experienceId: selectedId,
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold">Questions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choisissez une expérience puis éditez ses questions.
        </p>
      </section>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Expérience</span>
          <select name="experience" defaultValue={selectedId} className={`${field} min-w-64`}>
            {experiences.map((item) => (
              <option key={item._id} value={item._id}>
                {item.categoryTitle} — {item.title}
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

      {selectedId ? (
        <>
          <div className="flex flex-col gap-4">
            {questions.map((question) => (
              <QuestionForm
                key={question._id}
                experienceId={selectedId}
                question={{
                  _id: question._id,
                  experienceId: question.experienceId,
                  kind: question.kind,
                  prompt: question.prompt,
                  options: question.options,
                  depth: question.depth,
                  themes: question.themes,
                  order: question.order,
                  status: question.status,
                }}
              />
            ))}
            {questions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aucune question pour cette expérience.
              </p>
            )}
          </div>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Nouvelle question</h2>
            <QuestionForm experienceId={selectedId} />
          </section>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Aucune expérience disponible. Créez-en une d&apos;abord.
        </p>
      )}
    </div>
  );
}
