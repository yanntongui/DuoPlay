"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Badge, PageHeader, StatTile, TableCard } from "@/components/admin/ui";
import { DemoCreateDialog, DemoPagination, DemoToast, RowMenu } from "@/components/admin/demo-kit";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

type Report = {
  _id: string;
  content: string;
  motif: string;
  severity: "high" | "medium" | "low";
  category: string;
  status: "pending" | "in_progress" | "resolved";
  createdAt: number;
};

const PAGE_SIZE = 5;

export default function AdminModeration() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const data = useQuery(api.moderation.list, {
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });

  const stats = useQuery(api.moderation.getStats, {});

  useEffect(() => {
    setPage(0);
  }, [search]);

  const isLoading = data === undefined;
  const reports = (data?.reports as Report[]) || [];
  const totalCount = data?.totalCount || 0;

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);

  const upsert = useMutation(api.moderation.upsert);
  const remove = useMutation(api.moderation.remove);

  async function create(values: Record<string, string>) {
    try {
      await upsert({
        adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY || "",
        content: values.content,
        motif: values.motif,
        category: values.category,
        severity: "medium",
        status: "pending",
      });
      setToast(`Signalement créé.`);
      setDialogOpen(false);
      setPage(0);
    } catch (err) {
      setToast("Erreur lors de la création.");
      console.error(err);
    }
  }

  async function handleRemove(report: Report) {
    try {
      await remove({
        adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY || "",
        id: report._id,
      });
      setToast(`Signalement supprimé.`);
    } catch (err) {
      setToast("Erreur lors de la suppression.");
      console.error(err);
    }
  }

  return (
    <div className="ad-enter">
      <PageHeader
        title="Modération"
        subtitle="Gérez les signalements et la modération de contenu."
        actions={
          <>
            <button
              type="button"
              className="ad-btn ad-btn-primary"
              onClick={() => setDialogOpen(true)}
              disabled={isLoading}
            >
              <Plus className="size-4" strokeWidth={2.2} />
              Nouveau signalement
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Signalements ouverts" value={String(stats?.pending || 0)} delta="à traiter" tone="warning" />
        <StatTile label="Alértes critique" value={String(stats?.highSeverity || 0)} delta="urgence" tone="danger" />
        <StatTile label="Total (30 j)" value={String(stats?.total || 0)} delta="-8" tone="positive" />
        <StatTile label="Temps moyen" value="2 h 14" delta="-35 min" tone="positive" />
      </div>

      <TableCard
        title="Signalements"
        subtitle={`${reports.length} signalement(s) sur ${totalCount}`}
        toolbar={
          <>
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
                aria-label="Rechercher un signalement"
                disabled={isLoading}
              />
            </div>
          </>
        }
        footer={
          <DemoPagination
            page={safePage}
            pageCount={pageCount}
            rangeStart={reports.length === 0 ? 0 : safePage * PAGE_SIZE + 1}
            rangeEnd={safePage * PAGE_SIZE + reports.length}
            total={totalCount}
            onPage={setPage}
          />
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Contenu</th>
              <th>Motif</th>
              <th>Catégorie</th>
              <th>Gravité</th>
              <th>Statut</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="py-10 text-center">
                  Chargement…
                </td>
              </tr>
            )}
            {!isLoading && reports.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[12.5px] ad-muted">
                  Aucun signalement ne correspond à cette recherche.
                </td>
              </tr>
            )}
            {!isLoading &&
              reports.map((report) => (
                <tr key={report._id}>
                  <td>
                    <p className="text-[12.5px] font-medium ad-ink">{report.content}</p>
                  </td>
                  <td className="text-[12.5px] ad-ink">{report.motif}</td>
                  <td>
                    <Badge tone="neutral">{report.category}</Badge>
                  </td>
                  <td>
                    <Badge tone={report.severity === "high" ? "danger" : report.severity === "medium" ? "warning" : "neutral"}>{report.severity}</Badge>
                  </td>
                  <td>
                    <Badge tone={report.status === "resolved" ? "positive" : report.status === "in_progress" ? "plum" : "warning"}>
                      {report.status === "resolved" ? "Résolu" : report.status === "in_progress" ? "En cours" : "À traiter"}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <RowMenu
                      label={report.content}
                      items={[
                        {
                          label: "Supprimer",
                          icon: <Badge tone="danger">✕</Badge>,
                          tone: "danger",
                          onSelect: () => handleRemove(report),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </TableCard>

      <DemoToast message={toast} onClose={() => setToast(null)} />

      {dialogOpen && (
        <DemoCreateDialog
          title="Créer un signalement"
          description="Le signalement sera créé en statut « à traiter »."
          submitLabel="Créer"
          fields={[
            { key: "content", label: "Contenu", required: true, placeholder: "Description du contenu" },
            { key: "motif", label: "Motif", placeholder: "Pourquoi ce signalement ?" },
            { key: "category", label: "Catégorie", options: ["Contenu", "Comportement", "Compte", "Réputation"], half: true },
          ]}
          onClose={() => setDialogOpen(false)}
          onSubmit={create}
        />
      )}
    </div>
  );
}
