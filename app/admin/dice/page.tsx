"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Dices,
  Plus,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import {
  Badge,
  Card,
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

type DieStatus = "published" | "draft" | "review";
type Intensity = "Légère" | "Modérée" | "Passionnée";

type Die = {
  id: string;
  name: string;
  faces: number;
  intensity: Intensity;
  status: DieStatus;
  uses: number;
  theme: string;
};

const SEED: Die[] = [
  { id: "die_301", name: "Dé de la complicité", faces: 6, intensity: "Légère", status: "published", uses: 8402, theme: "Complicité" },
  { id: "die_302", name: "Dé des envies", faces: 12, intensity: "Modérée", status: "published", uses: 5118, theme: "Désir" },
  { id: "die_303", name: "Dé des défis", faces: 8, intensity: "Modérée", status: "published", uses: 3902, theme: "Jeux" },
  { id: "die_304", name: "Dé des souvenirs", faces: 6, intensity: "Légère", status: "review", uses: 0, theme: "Nostalgie" },
  { id: "die_305", name: "Dé passionné", faces: 20, intensity: "Passionnée", status: "draft", uses: 0, theme: "Intimité" },
  { id: "die_306", name: "Dé des compliments", faces: 6, intensity: "Légère", status: "published", uses: 2214, theme: "Complicité" },
  { id: "die_307", name: "Dé du hasard", faces: 12, intensity: "Modérée", status: "draft", uses: 0, theme: "Jeux" },
];

const TABS = [
  { id: "all", label: "Tous" },
  { id: "published", label: "Publiés" },
  { id: "review", label: "En révision" },
  { id: "draft", label: "Brouillons" },
];

const THEMES = ["Complicité", "Désir", "Jeux", "Nostalgie", "Intimité"];
const INTENSITIES: Intensity[] = ["Légère", "Modérée", "Passionnée"];

const PAGE_SIZE = 5;
const STORAGE_KEY = "duoplay.admin.dice.v1";

const numberFormat = new Intl.NumberFormat("fr-FR");

function statusBadge(status: DieStatus) {
  if (status === "published") return <Badge tone="positive">Publié</Badge>;
  if (status === "review") return <Badge tone="info">En révision</Badge>;
  return <Badge tone="warning">Brouillon</Badge>;
}

export default function AdminDice() {
  const [rows, setRows] = useDemoRows<Die>(STORAGE_KEY, SEED);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setPage(0);
  }, [tab, search]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        if (tab !== "all" && row.status !== tab) return false;
        const query = search.trim().toLowerCase();
        if (query && !`${row.name} ${row.theme}`.toLowerCase().includes(query)) {
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
  const faces = rows.reduce((total, row) => total + row.faces, 0);
  const rolls = rows.reduce((total, row) => total + row.uses, 0);

  function nextId(): string {
    const highest = rows.reduce((max, row) => {
      const match = /^die_(\d+)$/.exec(row.id);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 300);
    return `die_${highest + 1}`;
  }

  function setStatus(row: Die, status: DieStatus, message: string) {
    setRows((current) =>
      current.map((item) => (item.id === row.id ? { ...item, status } : item)),
    );
    setToast(message);
  }

  function duplicate(row: Die) {
    const copy: Die = {
      ...row,
      id: nextId(),
      name: `${row.name} (copie)`,
      status: "draft",
      uses: 0,
    };
    setRows((current) => [copy, ...current]);
    setTab("all");
    setPage(0);
    setToast(`« ${row.name} » dupliqué en brouillon.`);
  }

  function remove(row: Die) {
    setRows((current) => current.filter((item) => item.id !== row.id));
    setToast(`« ${row.name} » supprimé.`);
  }

  function handleExport() {
    const ok = exportCsv(
      `duoplay-des-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: "id", label: "Identifiant" },
        { key: "name", label: "Dé" },
        { key: "theme", label: "Thème" },
        { key: "faces", label: "Faces" },
        { key: "intensity", label: "Intensité" },
        { key: "status", label: "Statut" },
        { key: "uses", label: "Lancers" },
      ],
      filtered.map((row) => ({ ...row, faces: String(row.faces), uses: String(row.uses) })),
    );
    setToast(
      ok
        ? `${filtered.length} dé(s) exporté(s).`
        : "Aucun dé à exporter avec ces filtres.",
    );
  }

  return (
    <div className="ad-enter">
      <PageHeader
        title="Dés"
        subtitle="Configurez les dés et leurs faces. Chaque face suit les mêmes règles de validation que les cartes."
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
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" strokeWidth={2.2} />
              Nouveau dé
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Dés actifs" value={String(published)} delta="+2" tone="positive" />
        <StatTile label="Faces au total" value={String(faces)} delta="+24" tone="plum" />
        <StatTile label="En révision" value={String(review)} delta="à valider" tone="warning" />
        <StatTile label="Lancers (30 j)" value={numberFormat.format(rolls)} delta="+11,2 %" tone="positive" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card title="Répartition des lancers" subtitle="Par thème · 30 derniers jours" className="xl:col-span-7">
          <div className="space-y-3.5">
            {[
              { l: "Complicité", v: "34 %", w: 34 },
              { l: "Désir", v: "28 %", w: 28 },
              { l: "Jeux", v: "21 %", w: 21 },
              { l: "Nostalgie", v: "11 %", w: 11 },
              { l: "Autres", v: "6 %", w: 6 },
            ].map((theme) => (
              <div key={theme.l}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[12px] ad-soft">{theme.l}</span>
                  <span className="text-[12px] font-semibold ad-ink">{theme.v}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full ad-bg-sunk">
                  <div className="h-full rounded-full ad-bg-plum" style={{ width: `${theme.w}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Contrôle qualité" className="xl:col-span-5">
          <div className="flex flex-wrap gap-2">
            {[6, 8, 12, 20].map((count) => (
              <div
                key={count}
                className="flex size-16 flex-col items-center justify-center rounded-2xl border ad-bd ad-bg-soft"
              >
                <Dices className="size-5 ad-plum" />
                <span className="mt-1 text-[10.5px] font-semibold ad-muted">{count} faces</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11.5px] leading-snug ad-muted">
            Les dés de plus de 12 faces sont réservés aux couples ayant explicitement
            activé le niveau correspondant. Aucun contenu n&apos;est affiché ici.
          </p>
          <div className="mt-3">
            <Badge tone="positive">Conforme aux règles de contenu</Badge>
          </div>
        </Card>
      </div>

      <TableCard
        title="Tous les dés"
        subtitle={`${filtered.length} dé(s) sur ${rows.length}`}
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
            <div className="relative ml-auto min-w-[220px] flex-1 sm:max-w-[280px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
                aria-label="Rechercher un dé"
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
            note="Un dé ne peut être publié qu’après validation de toutes ses faces."
          />
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Dé</th>
              <th>Thème</th>
              <th>Faces</th>
              <th>Intensité</th>
              <th>Statut</th>
              <th>Lancers</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[12.5px] ad-muted">
                  Aucun dé ne correspond à ces critères.
                </td>
              </tr>
            )}
            {visible.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg ad-bg-plum-50 ad-plum">
                      <Dices className="size-4" />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-medium ad-ink">{row.name}</p>
                      <p className="text-[10.5px] ad-faint">{row.id}</p>
                    </div>
                  </div>
                </td>
                <td className="text-[12px] ad-muted">{row.theme}</td>
                <td className="text-[12.5px]">{row.faces}</td>
                <td>
                  <Badge tone={row.intensity === "Passionnée" ? "plum" : "neutral"}>
                    {row.intensity}
                  </Badge>
                </td>
                <td>{statusBadge(row.status)}</td>
                <td className="text-[12px]">{numberFormat.format(row.uses)}</td>
                <td className="text-right">
                  <RowMenu
                    label={row.name}
                    items={[
                      ...(row.status === "published"
                        ? [
                            {
                              label: "Repasser en révision",
                              icon: <Send className="size-3.5" />,
                              onSelect: () =>
                                setStatus(row, "review", `« ${row.name} » repassé en révision.`),
                            },
                          ]
                        : [
                            {
                              label: "Publier",
                              icon: <CheckCircle2 className="size-3.5" />,
                              onSelect: () =>
                                setStatus(row, "published", `« ${row.name} » publié.`),
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

      {createOpen && (
        <DemoCreateDialog
          title="Nouveau dé"
          description="Le dé est ajouté en brouillon à cette démonstration."
          submitLabel="Créer le dé"
          fields={[
            { key: "name", label: "Nom du dé", required: true, placeholder: "Dé des compliments" },
            { key: "theme", label: "Thème", options: THEMES, half: true },
            { key: "faces", label: "Nombre de faces", type: "number", placeholder: "6", half: true },
            { key: "intensity", label: "Intensité", options: INTENSITIES, half: true },
          ]}
          onClose={() => setCreateOpen(false)}
          onSubmit={(values) => {
            const facesCount = Number.parseInt(values.faces || "6", 10);
            const row: Die = {
              id: nextId(),
              name: values.name,
              theme: values.theme,
              faces: Number.isFinite(facesCount) && facesCount > 0 ? Math.min(facesCount, 20) : 6,
              intensity: values.intensity as Intensity,
              status: "draft",
              uses: 0,
            };
            setRows((current) => [row, ...current]);
            setTab("all");
            setPage(0);
            setCreateOpen(false);
            setToast(`« ${row.name} » créé en brouillon (${row.faces} faces).`);
          }}
        />
      )}
    </div>
  );
}
