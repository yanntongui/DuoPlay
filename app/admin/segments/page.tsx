"use client";

import { useEffect, useState } from "react";
import {
  Copy,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  Badge,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";
import {
  DemoCreateDialog,
  DemoPagination,
  DemoToast,
  RowMenu,
} from "@/components/admin/demo-kit";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

type SegmentStatus = "published" | "draft" | "review";

type Segment = {
  _id: string;
  name: string;
  description?: string;
  type: string;
  size: number;
  growthRate?: number;
  status: SegmentStatus;
  updatedAt: number;
  createdAt: number;
};

const PAGE_SIZE = 5;

const numberFormat = new Intl.NumberFormat("fr-FR");

function growthToTone(growth?: number): "positive" | "danger" | "plum" | "warning" | "neutral" {
  if (growth === undefined) return "neutral";
  if (growth > 5) return "positive";
  if (growth > 0) return "plum";
  if (growth > -5) return "neutral";
  return "danger";
}

export default function AdminSegments() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const data = useQuery(api.segments.list, {
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });

  useEffect(() => {
    setPage(0);
  }, [search]);

  const isLoading = data === undefined;
  const segments = (data?.segments as Segment[]) || [];
  const totalCount = data?.totalCount || 0;

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);

  const totalSize = segments.reduce((sum, s) => sum + s.size, 0);

  const upsert = useMutation(api.segments.upsert);
  const remove = useMutation(api.segments.remove);

  async function create(values: Record<string, string>) {
    try {
      const size = Number.parseInt(values.size || "0", 10);
      await upsert({
        adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY || "",
        name: values.name,
        description: values.desc,
        type: values.type,
        size,
        growthRate: 0,
        status: "draft",
      });

      setToast(`Segment "${values.name}" créé (${numberFormat.format(size)} comptes).`);
      setDialogOpen(false);
      setPage(0);
    } catch (err) {
      setToast("Erreur lors de la création du segment.");
      console.error(err);
    }
  }

  async function handleRemove(segment: Segment) {
    try {
      await remove({
        adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY || "",
        id: segment._id,
      });
      setToast(`Segment "${segment.name}" supprimé.`);
    } catch (err) {
      setToast("Erreur lors de la suppression du segment.");
      console.error(err);
    }
  }

  function handleExport() {
    const csvData = segments
      .map(
        (row) =>
          `${row._id},"${row.name}","${row.description || ""}","${row.type}","${row.size}","${row.status}"`,
      )
      .join("\n");

    const blob = new Blob(["id,Segment,Description,Type,Taille,Statut\n" + csvData], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `duoplay-segments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast(`${segments.length} segment(s) exporté(s).`);
  }

  return (
    <div className="ad-enter">
      <PageHeader
        title="Segments"
        subtitle="Regroupez les utilisateurs par comportement pour cibler les campagnes. Les segments sont recalculés chaque nuit."
        actions={
          <>
            <button
              type="button"
              className="ad-btn ad-btn-outline"
              onClick={handleExport}
              disabled={isLoading}
            >
              Exporter
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-primary"
              onClick={() => setDialogOpen(true)}
              disabled={isLoading}
            >
              <Plus className="size-4" strokeWidth={2.2} />
              Créer un segment
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Segments actifs" value={String(segments.length)} delta="3 dynamiques" tone="plum" />
        <StatTile label="Utilisateurs segmentés" value={numberFormat.format(totalSize)} delta="+4,2 %" tone="positive" />
        <StatTile label="Segments sans campagne" value="4" delta="à activer" tone="warning" />
        <StatTile label="Taux de correspondance" value="92 %" delta="couverture" tone="neutral" />
      </div>

      <TableCard
        title="Tous les segments"
        subtitle={`${segments.length} segment(s) sur ${totalCount}`}
        toolbar={
          <>
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
                aria-label="Rechercher un segment"
                disabled={isLoading}
              />
            </div>
          </>
        }
        footer={
          <DemoPagination
            page={safePage}
            pageCount={pageCount}
            rangeStart={segments.length === 0 ? 0 : safePage * PAGE_SIZE + 1}
            rangeEnd={safePage * PAGE_SIZE + segments.length}
            total={totalCount}
            onPage={setPage}
            note="Recalcul automatique chaque nuit à 03:00 (Europe/Paris)."
          />
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Segment</th>
              <th>Type</th>
              <th>Taille</th>
              <th>Évolution 30 j</th>
              <th>Actualisé</th>
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
            {!isLoading && segments.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[12.5px] ad-muted">
                  Aucun segment ne correspond à cette recherche.
                </td>
              </tr>
            )}
            {!isLoading &&
              segments.map((row) => (
                <tr key={row._id}>
                  <td>
                    <p className="text-[12.5px] font-medium ad-ink">{row.name}</p>
                    <p className="text-[11px] ad-faint">{row.description || "-"}</p>
                  </td>
                  <td>
                    <Badge tone="neutral">{row.type}</Badge>
                  </td>
                  <td className="text-[12.5px] font-medium ad-ink">
                    {numberFormat.format(row.size)}
                  </td>
                  <td>
                    <Badge tone={growthToTone(row.growthRate)}>
                      {row.growthRate !== undefined ? `${row.growthRate > 0 ? "+" : ""}${row.growthRate} %` : "-"}
                    </Badge>
                  </td>
                  <td className="text-[11.5px] ad-faint">
                    {new Intl.DateTimeFormat("fr-FR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(row.updatedAt))}
                  </td>
                  <td className="text-right">
                    <RowMenu
                      label={row.name}
                      items={[
                        {
                          label: "Cibler par campagne",
                          icon: <Plus className="size-3.5" />,
                          onSelect: () =>
                            setToast(`Campagne préparée pour « ${row.name} » (${numberFormat.format(row.size)} comptes).`),
                        },
                        {
                          label: "Supprimer",
                          icon: <Trash2 className="size-3.5" />,
                          tone: "danger",
                          confirm: `Supprimer « ${row.name} » ?`,
                          onSelect: () => handleRemove(row),
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
          title="Créer un segment"
          description="Le segment est ajouté à la base de données."
          submitLabel="Créer le segment"
          fields={[
            { key: "name", label: "Nom du segment", required: true, placeholder: "Revenus — hiver" },
            { key: "desc", label: "Description", type: "textarea", placeholder: "Qui ce segment regroupe-t-il ?" },
            {
              key: "type",
              label: "Type",
              options: ["Cycle de vie", "Engagement", "Rétention", "Revenus", "Activation", "Fidélité"],
              half: true,
            },
            { key: "size", label: "Taille estimée", type: "number", placeholder: "1200", half: true },
          ]}
          onClose={() => setDialogOpen(false)}
          onSubmit={create}
        />
      )}
    </div>
  );
}
