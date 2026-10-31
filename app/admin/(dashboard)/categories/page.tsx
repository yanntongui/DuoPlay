import { api } from "@/convex/_generated/api";
import { saveCategory } from "@/lib/admin/actions";
import { adminClient } from "@/lib/admin/convex";

export const dynamic = "force-dynamic";
export const metadata = { title: "Catégories" };

const field =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function CategoryForm({
  category,
}: {
  category?: {
    _id: string;
    slug: string;
    title: string;
    tagline: string;
    description: string;
    emoji: string;
    accent: "coral" | "lavender" | "graphite";
    order: number;
    mvp: boolean;
    status: "draft" | "published" | "archived";
  };
}) {
  return (
    <form
      action={saveCategory}
      className="grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2"
    >
      {category && <input type="hidden" name="id" value={category._id} />}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Emoji</span>
        <input name="emoji" defaultValue={category?.emoji ?? ""} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Titre</span>
        <input name="title" defaultValue={category?.title ?? ""} required className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Slug</span>
        <input name="slug" defaultValue={category?.slug ?? ""} required className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Accroche</span>
        <input name="tagline" defaultValue={category?.tagline ?? ""} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-muted-foreground">Description</span>
        <textarea
          name="description"
          defaultValue={category?.description ?? ""}
          rows={2}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Accent</span>
        <select name="accent" defaultValue={category?.accent ?? "coral"} className={field}>
          <option value="coral">Corail</option>
          <option value="lavender">Lavande</option>
          <option value="graphite">Graphite</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Ordre</span>
        <input type="number" name="order" defaultValue={category?.order ?? 0} className={field} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Statut</span>
        <select name="status" defaultValue={category?.status ?? "draft"} className={field}>
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
          <option value="archived">Archivé</option>
        </select>
      </label>
      <label className="flex items-center gap-2 self-end text-sm">
        <input type="checkbox" name="mvp" defaultChecked={category?.mvp ?? false} />
        <span>Disponible au MVP</span>
      </label>

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="h-10 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-coral-600"
        >
          {category ? "Enregistrer" : "Créer la catégorie"}
        </button>
      </div>
    </form>
  );
}

export default async function AdminCategoriesPage() {
  const categories = await adminClient().query(api.categories.listAll, {});

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold">Catégories</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {categories.length} univers. Modifiez puis enregistrez.
        </p>
      </section>

      <div className="flex flex-col gap-4">
        {categories.map((category) => (
          <CategoryForm
            key={category._id}
            category={{
              _id: category._id,
              slug: category.slug,
              title: category.title,
              tagline: category.tagline,
              description: category.description,
              emoji: category.emoji,
              accent: category.accent,
              order: category.order,
              mvp: category.mvp,
              status: category.status,
            }}
          />
        ))}
      </div>
    </div>
  );
}
