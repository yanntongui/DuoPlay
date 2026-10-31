import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { resolveReport } from "@/lib/admin/actions";
import { adminClient, adminKey } from "@/lib/admin/convex";

export const dynamic = "force-dynamic";
export const metadata = { title: "Modération" };

const STATUS_LABEL: Record<string, string> = {
  nouveau: "Nouveau",
  traite: "Traité",
  rejete: "Rejeté",
};

export default async function AdminReportsPage() {
  const reports = await adminClient().query(api.reports.listAll, {
    adminKey: adminKey(),
  });

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold">Modération</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {reports.filter((r) => r.status === "nouveau").length} signalement(s)
          à traiter sur {reports.length}.
        </p>
      </section>

      {reports.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">
          Aucun signalement pour le moment.
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map((report) => (
            <Card key={report._id} className="flex flex-col gap-3 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {report.targetType === "question" ? "Question" : "Expérience"}
                </span>
                <span
                  className={
                    report.status === "nouveau"
                      ? "rounded-full bg-coral-100 px-2.5 py-1 text-xs font-medium text-coral-700"
                      : "rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  }
                >
                  {STATUS_LABEL[report.status]}
                </span>
              </div>

              <p className="text-sm">{report.reason}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {report.targetId}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(report.createdAt).toLocaleString("fr-FR")}
              </p>

              {report.status === "nouveau" && (
                <div className="flex gap-2">
                  {(["traite", "rejete"] as const).map((status) => (
                    <form key={status} action={resolveReport}>
                      <input type="hidden" name="id" value={report._id as Id<"reports">} />
                      <input type="hidden" name="status" value={status} />
                      <button
                        type="submit"
                        className="h-9 rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
                      >
                        {status === "traite" ? "Marquer traité" : "Rejeter"}
                      </button>
                    </form>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
