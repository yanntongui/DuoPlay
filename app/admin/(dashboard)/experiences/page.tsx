import { api } from "@/convex/_generated/api";
import { saveExperience } from "@/lib/admin/actions";
import { adminClient } from "@/lib/admin/convex";

export const dynamic = "force-dynamic";
export const metadata = { title: "Expériences" };

const MODES = [
  { value: "ensemble", label: "Ensemble" },
  { value: "a-distance", label: "À distance" },
  { value: "differe", label: "Différé" },
  { value: "defi-individuel", label: "Défi individuel" },
] as const;

const field =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

type ExperienceRow = {
  _id: string;
  categoryId: string;
  slug: string;
  title: string;
  description: string;
  depth: "leger" | "moyen" | "profond";
  themes: string[];
  estimatedMinutes: number;
  modes: string[];
  status: "draft" | "published" | "archived";
  order: number;
};

function ExperienceForm({
  experience,
  categories,
}: {
  experience?: ExperienceRow;
  categories: Array<{ _id: string; title: string }>;
}) {
  return (
    <form
      action={saveExperience}
      className="grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2"
    >
      {experience && <input type="hidden" name="id" value={experience._id} />}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Catégorie</span>
        <select
          name="categoryId"
          defaultValue={experience?.categoryId ?? categories[0]?._id}
          className={field}
        >
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.title}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Titre</span>
        <input name="title" defaultValue={experience?.title ?? ""} required className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Slug</span>
        <input name="slug" defaultValue={experience?.slug ?? ""} required className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Durée estimée (min)</span>
        <input
          type="number"
          name="estimatedMinutes"
          defaultValue={experience?.estimatedMinutes ?? 10}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-muted-foreground">Description</span>
        <textarea
          name="description"
          defaultValue={experience?.description ?? ""}
          rows={2}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Profondeur</span>
        <select name="depth" defaultValue={experience?.depth ?? "leger"} className={field}>
          <option value="leger">Léger</option>
          <option value="moyen">Moyen</option>
          <option value="profond">Profond</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Thèmes (séparés par des virgules)</span>
        <input name="themes" defaultValue={(experience?.themes ?? []).join(", ")} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Ordre</span>
        <input type="number" name="order" defaultValue={experience?.order ?? 0} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Statut</span>
        <select name="status" defaultValue={experience?.status ?? "draft"} className={field}>
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
          <option value="archived">Archivé</option>
        </select>
      </label>

      <fieldset className="sm:col-span-2">
        <legend className="mb-1 text-sm text-muted-foreground">Modes</legend>
        <div className="flex flex-wrap gap-4">
          {MODES.map((mode) => (
            <label key={mode.value} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="modes"
                value={mode.value}
                defaultChecked={experience?.modes.includes(mode.value) ?? false}
              />
              {mode.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="h-10 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-coral-600"
        >
          {experience ? "Enregistrer" : "Créer l'expérience"}
        </button>
      </div>
    </form>
  );
}

export default async function AdminExperiencesPage() {
  const [experiences, categories] = await Promise.all([
    adminClient().query(api.experiences.listAll, {}),
    adminClient().query(api.categories.listAll, {}),
  ]);

  const categoryOptions = categories.map((c) => ({ _id: c._id, title: c.title }));

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold">Expériences</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {experiences.length} expériences.
        </p>
      </section>

      <div className="flex flex-col gap-4">
        {experiences.map((experience) => (
          <ExperienceForm
            key={experience._id}
            categories={categoryOptions}
            experience={{
              _id: experience._id,
              categoryId: experience.categoryId,
              slug: experience.slug,
              title: experience.title,
              description: experience.description,
              depth: experience.depth,
              themes: experience.themes,
              estimatedMinutes: experience.estimatedMinutes,
              modes: experience.modes,
              status: experience.status,
              order: experience.order,
            }}
          />
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Nouvelle expérience</h2>
        <ExperienceForm categories={categoryOptions} />
      </section>
    </div>
  );
}
