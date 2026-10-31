import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { adminClient, adminKey } from "@/lib/admin/convex";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tableau de bord" };

function Stat({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: number;
  hint?: string;
  href?: string;
}) {
  const content = (
    <Card className="p-5 transition-colors hover:border-coral-300">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default async function AdminDashboardPage() {
  const stats = await adminClient().query(api.stats.overview, {
    adminKey: adminKey(),
  });

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Contenu, sessions et modération en un coup d&apos;œil.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat
          label="Catégories"
          value={stats.categories.total}
          hint={`${stats.categories.published} publiée(s)`}
          href="/admin/categories"
        />
        <Stat
          label="Expériences"
          value={stats.experiences.total}
          hint={`${stats.experiences.published} publiée(s)`}
          href="/admin/experiences"
        />
        <Stat
          label="Questions"
          value={stats.questions.total}
          hint={`${stats.questions.published} publiée(s)`}
          href="/admin/questions"
        />
        <Stat
          label="Sessions"
          value={stats.sessions.total}
          hint={`${stats.sessions.completed} terminée(s)`}
        />
        <Stat
          label="Signalements ouverts"
          value={stats.reports.open}
          hint={`${stats.reports.total} au total`}
          href="/admin/reports"
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Entonnoir d&apos;usage</h2>
        <Card className="divide-y divide-border">
          {[
            { label: "Parties créées", value: stats.funnel.sessionCreated },
            { label: "Invitations partagées", value: stats.funnel.inviteShared },
            { label: "Invités ayant rejoint", value: stats.funnel.guestJoined },
            { label: "Parties terminées", value: stats.funnel.gameCompleted },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between px-5 py-3 text-sm"
            >
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-medium tabular-nums">{row.value}</span>
            </div>
          ))}
        </Card>
        <p className="mt-2 text-xs text-muted-foreground">
          Les événements seront émis à partir de la Phase 2 (boucle de jeu).
        </p>
      </section>
    </div>
  );
}
