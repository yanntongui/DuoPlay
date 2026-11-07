"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  Upload,
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

type ExperienceStatus = "published" | "draft" | "review" | "scheduled";

type Experience = {
  id: string;
  title: string;
  category: string;
  intensity: string;
  status: ExperienceStatus;
  uses: number;
  completion: number;
};

const SEED: Experience[] = [
  { id: "exp_101", title: "Soirée à deux — édition hiver", category: "Intimité", intensity: "Passionnée", status: "published", uses: 1234, completion: 82 },
  { id: "exp_102", title: "Parcours « Retrouvailles »", category: "Complicité", intensity: "Modérée", status: "review", uses: 0, completion: 0 },
  { id: "exp_103", title: "Cartes — niveau passionné", category: "Intimité", intensity: "Passionnée", status: "draft", uses: 0, completion: 0 },
  { id: "exp_104", title: "Défis du week-end", category: "Activités", intensity: "Légère", status: "published", uses: 3891, completion: 74 },
  { id: "exp_105", title: "Roue des envies", category: "Jeux", intensity: "Modérée", status: "scheduled", uses: 0, completion: 0 },
  { id: "exp_106", title: "Quiz découverte du couple", category: "Complicité", intensity: "Légère", status: "published", uses: 2108, completion: 91 },
  { id: "exp_107", title: "Rituel du dimanche soir", category: "Activités", intensity: "Légère", status: "published", uses: 640, completion: 68 },
  { id: "exp_108", title: "Jeu des 5 sens", category: "Intimité", intensity: "Passionnée", status: "review", uses: 0, completion: 0 },
];

const TABS = [
  { id: "all", label: "Tous" },
  { id: "published", label: "Publiés" },
  { id: "review", label: "En révision" },
  { id: "draft", label: "Brouillons" },
  { id: "scheduled", label: "Programmés" },
];

const CATEGORIES = ["Intimité", "Complicité", "Activités", "Jeux", "Découverte"];
const INTENSITIES = ["Légère", "Modérée", "Passionnée"];

const PAGE_SIZE = 5;
const STORAGE_KEY = "duoplay.admin.experiences.v1";

const numberFormat = new Intl.NumberFormat("fr-FR");

function statusBadge(status: ExperienceStatus) {
  if (status === "published") return <Badge tone="positive">Publié</Badge>;
  if (status === "review") return <Badge tone="info">En révision</Badge>;
  if (status === "scheduled") return <Badge tone="info">Programmé</Badge>;
  return <Badge tone="warning">Brouillon</Badge>;
}

export default function AdminExperiences() {
  const [rows, setRows] = useDemoRows<Experience>(STORAGE_KEY, SEED);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [dialog, setDialog] = useState<"create" | "import" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setPage(0);
  }, [tab, search]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        if (tab !== "all" && row.status !== tab) return false;
        const query = search.trim().toLowerCase();
        if (query && !`${row.title} ${row.category}`.toLowerCase().includes(query)) {
          return false;
        }
        return true;
      }),
    [rows, tab, search],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeEnd = safePage * PAGE_SIZE + visible.length;

  const published = rows.filter((row) => row.status === "published").length;
  const review = rows.filter((row) => row.status === "review").length;
  const averageCompletion = (() => {
    const scored = rows.filter((row) => row.completion > 0);
    if (scored.length === 0) return 0;
    return Math.round(
      scored.reduce((total, row) => total + row.completion, 0) / scored.length,
    );
  })();

  function nextId(): string {
    const highest = rows.reduce((max, row) => {
      const match = /^exp_(\d+)$/.exec(row.id);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 100);
    return `exp_${highest + 1}`;
  }

  function create(values: Record<string, string>) {
    const row: Experience = {
      id: nextId(),
      title: values.title,
      category: values.category,
      intensity: values.intensity,
      status: "draft",
      uses: 0,
      completion: 0,
    };
    setRows((current) => [row, ...current]);
    setTab("all");
    setPage(0);
    setDialog(null);
    setToast(`Expérience « ${row.title} » créée en brouillon.`);
  }

  function duplicate(row: Experience) {
    const copy: Experience = {
      ...row,
      id: nextId(),
      title: `${row.title} (copie)`,
      status: "draft",
      uses: 0,
      completion: 0,
    };
    setRows((current) => [copy, ...current]);
    setTab("all");
    setPage(0);
    setToast(`« ${row.title} » dupliquée en brouillon.`);
  }

  function setStatus(row: Experience, status: ExperienceStatus, message: string) {
    setRows((current) =>
      current.map((item) => (item.id === row.id ? { ...item, status } : item)),
    );
    setToast(message);
  }

  function remove(row: Experience) {
    setRows((current) => current.filter((item) => item.id !== row.id));
    setToast(`« ${row.title} » supprimée.`);
  }

  function handleExport() {
    const ok = exportCsv(
      `duoplay-experiences-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: "id", label: "Identifiant" },
        { key: "title", label: "Titre" },
        { key: "category", label: "Catégorie" },
        { key: "intensity", label: "Intensité" },
        { key: "status", label: "Statut" },
        { key: "uses", label: "Utilisations" },
        { key: "completion", label: "Complétion" },
      ],
      filtered.map((row) => ({
        ...row,
        uses: String(row.uses),
        completion: row.completion ? `${row.completion} %` : "—",
      })),
    );
    setToast(
      ok
        ? `${filtered.length} contenu(s) exporté(s).`
        : "Aucun contenu à exporter avec ces filtres.",
    );
  }

  const dialogFields = [
    { key: "title", label: "Titre", required: true, placeholder: "Soirée à deux — édition printemps" },
    { key: "category", label: "Catégorie", options: CATEGORIES, half: true },
    { key: "intensity", label: "Intensité", options: INTENSITIES, half: true },
  ];

  return (
    <div className="ad-enter">
      <PageHeader
        title="Expériences"
        subtitle="Créez, révisez et publiez les contenus. Chaque publication passe par une seconde validation."
        actions={
          <>
            <DemoPill />
            <button
              type="button"
              className="ad-btn ad-btn-outline"
              onClick={() => setDialog("import")}
            >
              <Upload className="size-4" strokeWidth={1.9} />
              Importer
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-primary"
              onClick={() => setDialog("create")}
            >
              <Plus className="size-4" strokeWidth={2.2} />
              Créer une expérience
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Contenus publiés" value={String(published)} delta="+8 ce mois" tone="positive" />
        <StatTile label="En attente de validation" value={String(review)} delta="à traiter" tone="warning" />
        <StatTile label="Taux de complétion moyen" value={`${averageCompletion} %`} delta="+2,3 pts" tone="positive" />
        <StatTile label="Signalements sur contenu" value="4" delta="-3" tone="neutral" />
      </div>

      <TableCard
        title="Catalogue"
        subtitle={`${filtered.length} contenu(s) sur ${rows.length}`}
        toolbar={
          <>
            <div className="flex flex-wrap items-center gap-1">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  aria-pressed={tab === item.id}
                  className={`h-8 rounded-full px-3 text-[12px] font-medium transition-colors ${
                    tab === item.id ? "ad-bg-plum text-white" : "ad-muted ad-hover-soft"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="ad-btn ad-btn-outline h-9 px-3 text-[12.5px]"
            >
              Exporter
            </button>
            <div className="relative ml-auto min-w-[220px] flex-1 sm:max-w-[280px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
                aria-label="Rechercher un contenu"
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
            note="Brouillon → Révision → Approbation → Publication · deux validateurs"
          />
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Contenu</th>
              <th>Catégorie</th>
              <th>Intensité</th>
              <th>Statut</th>
              <th>Utilisations</th>
              <th>Complétion</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[12.5px] ad-muted">
                  Aucun contenu ne correspond à ces critères.
                </td>
              </tr>
            )}
            {visible.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg ad-bg-plum-50 ad-plum">
                      <Sparkles className="size-4" />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-medium ad-ink">{row.title}</p>
                      <p className="text-[10.5px] ad-faint">{row.id}</p>
                    </div>
                  </div>
                </td>
                <td className="text-[12.5px]">{row.category}</td>
                <td>
                  <Badge tone={row.intensity === "Passionnée" ? "plum" : "neutral"}>
                    {row.intensity}
                  </Badge>
                </td>
                <td>{statusBadge(row.status)}</td>
                <td className="text-[12.5px]">{numberFormat.format(row.uses)}</td>
                <td className="text-[12.5px]">
                  {row.completion ? `${row.completion} %` : "—"}
                </td>
                <td className="text-right">
                  <RowMenu
                    label={row.title}
                    items={[
                      ...(row.status !== "published"
                        ? [
                            {
                              label: "Publier",
                              icon: <CheckCircle2 className="size-3.5" />,
                              onSelect: () =>
                                setStatus(row, "published", `« ${row.title} » publiée.`),
                            },
                          ]
                        : [
                            {
                              label: "Repasser en révision",
                              icon: <Send className="size-3.5" />,
                              onSelect: () =>
                                setStatus(row, "review", `« ${row.title} » repassée en révision.`),
                            },
                          ]),
                      {
                        label: "Dupliquer",
                        icon: <Copy className="size-3.5" />,
                        onSelect: () => duplicate(row),
                      },
                      {
                        label: "Supprimer",
                        icon: <Trash2 className="size-3.5" />,
                        tone: "danger",
                        confirm: `Supprimer « ${row.title} » ? Action locale à la démonstration.`,
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

      {dialog && (
        <DemoCreateDialog
          title={dialog === "create" ? "Créer une expérience" : "Importer une expérience"}
          description={
            dialog === "create"
              ? "Le contenu est ajouté en brouillon à cette démonstration."
              : "Collez le titre d’un contenu existant : il sera importé en brouillon."
          }
          submitLabel={dialog === "create" ? "Créer le brouillon" : "Importer"}
          fields={dialogFields}
          onClose={() => setDialog(null)}
          onSubmit={create}
        />
      )}
    </div>
  );
}
