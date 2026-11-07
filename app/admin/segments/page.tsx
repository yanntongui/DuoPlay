"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Plus,
  Search,
  Send,
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
  DemoPill,
  DemoToast,
  RowMenu,
  exportCsv,
  useDemoRows,
} from "@/components/admin/demo-kit";

type SegmentStatus = "published" | "draft" | "review";

type Segment = {
  id: string;
  name: string;
  desc: string;
  size: number;
  growth: string;
  type: string;
  updated: string;
  tone: "positive" | "danger" | "plum" | "warning" | "neutral";
};

const SEED: Segment[] = [
  { id: "seg_01", name: "Nouveaux couples", desc: "Inscrits depuis moins de 14 jours", size: 12408, growth: "+8,2 %", type: "Cycle de vie", updated: "il y a 2 h", tone: "positive" },
  { id: "seg_02", name: "Actifs hebdomadaires", desc: "Au moins 3 sessions sur 7 jours", size: 24582, growth: "+5,1 %", type: "Engagement", updated: "il y a 1 h", tone: "positive" },
  { id: "seg_03", name: "À risque de churn", desc: "Aucune session depuis 21 jours", size: 3142, growth: "+12,4 %", type: "Rétention", updated: "il y a 4 h", tone: "danger" },
  { id: "seg_04", name: "Abonnés annuels", desc: "Offre annuelle active", size: 4902, growth: "+2,4 %", type: "Revenus", updated: "hier", tone: "plum" },
  { id: "seg_05", name: "Invitations non acceptées", desc: "Partenaire invité sans réponse sous 7 j", size: 312, growth: "-3,1 %", type: "Activation", updated: "il y a 6 h", tone: "warning" },
  { id: "seg_06", name: "Premium récents", desc: "Passés au premium depuis 30 jours", size: 1864, growth: "+6,6 %", type: "Revenus", updated: "il y a 3 h", tone: "plum" },
  { id: "seg_07", name: "Ambassadeurs", desc: "Au moins 2 invitations acceptées", size: 486, growth: "+1,8 %", type: "Fidélité", updated: "hier", tone: "positive" },
];

const PAGE_SIZE = 5;
const STORAGE_KEY = "duoplay.admin.segments.v1";

const numberFormat = new Intl.NumberFormat("fr-FR");

export default function AdminSegments() {
  const [rows, setRows] = useDemoRows<Segment>(STORAGE_KEY, SEED);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setPage(0);
  }, [search]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return `${row.name} ${row.type}`.toLowerCase().includes(query);
      }),
    [rows, search],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeEnd = safePage * PAGE_SIZE + visible.length;

  const totalSize = rows.reduce((sum, row) => sum + row.size, 0);

  function nextId(): string {
    const highest = rows.reduce((max, row) => {
      const match = /^seg_(\d+)$/.exec(row.id);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);
    return `seg_${String(highest + 1).padStart(2, "0")}`;
  }

  function create(values: Record<string, string>) {
    const size = Number.parseInt(values.size || "0", 10);
    const row: Segment = {
      id: nextId(),
      name: values.name,
      desc: values.desc || "Segment créé manuellement",
      size: Number.isFinite(size) ? size : 0,
      growth: "+0,0 %",
      type: values.type,
      updated: "à l’instant",
      tone: "neutral",
    };
    setRows((current) => [row, ...current]);
    setPage(0);
    setDialogOpen(false);
    setToast(`Segment « ${row.name} » créé (${numberFormat.format(size)} comptes).`);
  }

  function duplicate(row: Segment) {
    const copy: Segment = {
      ...row,
      id: nextId(),
      name: `${row.name} (copie)`,
      updated: "à l’instant",
    };
    setRows((current) => [copy, ...current]);
    setPage(0);
    setToast(`Segment « ${row.name} » dupliqué.`);
  }

  function remove(row: Segment) {
    setRows((current) => current.filter((item) => item.id !== row.id));
    setToast(`Segment « ${row.name} » supprimé.`);
  }

  function handleExport() {
    const ok = exportCsv(
      `duoplay-segments-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: "id", label: "Identifiant" },
        { key: "name", label: "Segment" },
        { key: "desc", label: "Description" },
        { key: "size", label: "Taille" },
        { key: "growth", label: "Évolution 30 j" },
        { key: "type", label: "Type" },
        { key: "updated", label: "Actualisé" },
      ],
      filtered.map((row) => ({ ...row, size: String(row.size) })),
    );
    setToast(
      ok
        ? `${filtered.length} segment(s) exporté(s).`
        : "Aucun segment à exporter avec ces filtres.",
    );
  }

  return (
    <div className="ad-enter">
      <PageHeader
        title="Segments"
        subtitle="Regroupez les utilisateurs par comportement pour cibler les campagnes. Les segments sont recalculés chaque nuit."
        actions={
          <>
            <DemoPill />
            <button
              type="button"
              className="ad-btn ad-btn-outline"
              onClick={handleExport}
            >
              Exporter
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-primary"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="size-4" strokeWidth={2.2} />
              Créer un segment
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Segments actifs" value={String(rows.length)} delta="3 dynamiques" tone="plum" />
        <StatTile label="Utilisateurs segmentés" value={numberFormat.format(totalSize)} delta="+4,2 %" tone="positive" />
        <StatTile label="Segments sans campagne" value="4" delta="à activer" tone="warning" />
        <StatTile label="Taux de correspondance" value="92 %" delta="couverture" tone="neutral" />
      </div>

      <TableCard
        title="Tous les segments"
        subtitle={`${filtered.length} segment(s) sur ${rows.length}`}
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
              />
            </div>
          </>
        }
        footer={
          <DemoPagination
            page={safePage}
            pageCount={pageCount}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            total={filtered.length}
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
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[12.5px] ad-muted">
                  Aucun segment ne correspond à cette recherche.
                </td>
              </tr>
            )}
            {visible.map((row) => (
              <tr key={row.id}>
                <td>
                  <p className="text-[12.5px] font-medium ad-ink">{row.name}</p>
                  <p className="text-[11px] ad-faint">{row.desc}</p>
                </td>
                <td>
                  <Badge tone="neutral">{row.type}</Badge>
                </td>
                <td className="text-[12.5px] font-medium ad-ink">
                  {numberFormat.format(row.size)}
                </td>
                <td>
                  <Badge tone={row.tone}>{row.growth}</Badge>
                </td>
                <td className="text-[11.5px] ad-faint">{row.updated}</td>
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
                        label: "Dupliquer",
                        icon: <Copy className="size-3.5" />,
                        onSelect: () => duplicate(row),
                      },
                      {
                        label: "Supprimer",
                        icon: <Trash2 className="size-3.5" />,
                        tone: "danger",
                        confirm: `Supprimer « ${row.name} » ? Action locale à la démonstration.`,
                        onSelect: () => remove(row),
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
          description="Le segment est ajouté à cette démonstration, avec une taille simulée."
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
