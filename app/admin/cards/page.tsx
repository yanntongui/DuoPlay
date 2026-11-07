"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  EyeOff,
  Layers,
  Package,
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

type CardStatus = "published" | "draft" | "review";
type Intensity = "Légère" | "Modérée" | "Passionnée";

type CardRow = {
  id: string;
  title: string;
  deck: string;
  level: string;
  intensity: Intensity;
  status: CardStatus;
  uses: number;
  note?: string;
};

const SEED: CardRow[] = [
  { id: "card_401", title: "Question de complicité", deck: "Découverte", level: "Niveau 1", intensity: "Légère", status: "published", uses: 12480 },
  { id: "card_402", title: "Souvenir partagé", deck: "Découverte", level: "Niveau 1", intensity: "Légère", status: "published", uses: 9214 },
  { id: "card_403", title: "Défi des sens", deck: "Passion", level: "Niveau 3", intensity: "Passionnée", status: "review", uses: 0, note: "Revue de conformité en cours" },
  { id: "card_404", title: "Confiance en soi", deck: "Complicité", level: "Niveau 2", intensity: "Modérée", status: "published", uses: 6902 },
  { id: "card_405", title: "Rêve éveillé", deck: "Passion", level: "Niveau 3", intensity: "Passionnée", status: "draft", uses: 0 },
  { id: "card_406", title: "Petit plaisir du quotidien", deck: "Complicité", level: "Niveau 2", intensity: "Modérée", status: "published", uses: 4118 },
  { id: "card_407", title: "Le compliment sincère", deck: "Découverte", level: "Niveau 1", intensity: "Légère", status: "published", uses: 3376 },
  { id: "card_408", title: "Nuit blanche", deck: "Passion", level: "Niveau 3", intensity: "Passionnée", status: "review", uses: 0 },
];

const TABS = [
  { id: "all", label: "Toutes" },
  { id: "published", label: "Publiées" },
  { id: "review", label: "En révision" },
  { id: "draft", label: "Brouillons" },
];

const DECKS = ["Découverte", "Complicité", "Passion"];
const LEVELS = ["Niveau 1", "Niveau 2", "Niveau 3"];
const INTENSITIES: Intensity[] = ["Légère", "Modérée", "Passionnée"];

const PAGE_SIZE = 5;
const STORAGE_KEY = "duoplay.admin.cards.v1";

const numberFormat = new Intl.NumberFormat("fr-FR");

function statusBadge(status: CardStatus) {
  if (status === "published") return <Badge tone="positive">Publiée</Badge>;
  if (status === "review") return <Badge tone="info">En révision</Badge>;
  return <Badge tone="warning">Brouillon</Badge>;
}

export default function AdminCards() {
  const [rows, setRows] = useDemoRows<CardRow>(STORAGE_KEY, SEED);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [dialog, setDialog] = useState<"card" | "deck" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setPage(0);
  }, [tab, search]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        if (tab !== "all" && row.status !== tab) return false;
        const query = search.trim().toLowerCase();
        if (query && !`${row.title} ${row.deck} ${row.level}`.toLowerCase().includes(query)) {
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
  const decks = new Set(rows.map((row) => row.deck)).size;

  const levels = [
    { l: "Niveau 1 · Découverte", count: rows.filter((row) => row.level === "Niveau 1").length, d: "Complicité légère, sans connotation explicite.", tone: "positive" as const },
    { l: "Niveau 2 · Complicité", count: rows.filter((row) => row.level === "Niveau 2").length, d: "Suggestif, consentement explicite dans l'app.", tone: "plum" as const },
    { l: "Niveau 3 · Passion", count: rows.filter((row) => row.level === "Niveau 3").length, d: "Réservé aux couples ayant activé le niveau.", tone: "warning" as const },
  ];

  function nextId(): string {
    const highest = rows.reduce((max, row) => {
      const match = /^card_(\d+)$/.exec(row.id);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 400);
    return `card_${highest + 1}`;
  }

  function duplicate(row: CardRow) {
    const copy: CardRow = {
      ...row,
      id: nextId(),
      title: `${row.title} (copie)`,
      status: "draft",
      uses: 0,
      note: undefined,
    };
    setRows((current) => [copy, ...current]);
    setTab("all");
    setPage(0);
    setToast(`« ${row.title} » dupliquée en brouillon.`);
  }

  function setStatus(row: CardRow, status: CardStatus, message: string) {
    setRows((current) =>
      current.map((item) =>
        item.id === row.id
          ? { ...item, status, note: status === "published" ? undefined : item.note }
          : item,
      ),
    );
    setToast(message);
  }

  function remove(row: CardRow) {
    setRows((current) => current.filter((item) => item.id !== row.id));
    setToast(`« ${row.title} » supprimée.`);
  }

  function handleExport() {
    const ok = exportCsv(
      `duoplay-cartes-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: "id", label: "Identifiant" },
        { key: "title", label: "Carte" },
        { key: "deck", label: "Paquet" },
        { key: "level", label: "Niveau" },
        { key: "intensity", label: "Intensité" },
        { key: "status", label: "Statut" },
        { key: "uses", label: "Tirages" },
      ],
      filtered.map((row) => ({ ...row, uses: String(row.uses) })),
    );
    setToast(
      ok
        ? `${filtered.length} carte(s) exportée(s).`
        : "Aucune carte à exporter avec ces filtres.",
    );
  }

  return (
    <div className="ad-enter">
      <PageHeader
        title="Cartes"
        subtitle="Le catalogue de cartes à jouer. Les contenus intimes sont séparés par niveau et soumis à une validation renforcée."
        actions={
          <>
            <DemoPill />
            <button
              type="button"
              className="ad-btn ad-btn-outline"
              onClick={() => setDialog("deck")}
            >
              <Package className="size-4" strokeWidth={1.9} />
              Importer un paquet
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-primary"
              onClick={() => setDialog("card")}
            >
              <Plus className="size-4" strokeWidth={2.2} />
              Nouvelle carte
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Cartes publiées" value={String(published)} delta="+12" tone="positive" />
        <StatTile label="En révision" value={String(review)} delta="à valider" tone="warning" />
        <StatTile label="Paquets actifs" value={String(decks)} delta="3 niveaux" tone="plum" />
        <StatTile label="Taux de tirage" value="68 %" delta="+3,4 pts" tone="positive" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {levels.map((level) => (
          <div key={level.l} className="ad-card p-[22px]">
            <div className="flex items-start justify-between">
              <span className="flex size-9 items-center justify-center rounded-xl ad-bg-plum-50 ad-plum">
                <Layers className="size-4" />
              </span>
              <Badge tone={level.tone}>{level.count} cartes</Badge>
            </div>
            <p className="mt-3 text-[13px] font-semibold ad-ink">{level.l}</p>
            <p className="mt-1 text-[11.5px] leading-snug ad-muted">{level.d}</p>
          </div>
        ))}
      </div>

      <TableCard
        title="Catalogue des cartes"
        subtitle={`${filtered.length} carte(s) sur ${rows.length}`}
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
                placeholder="Rechercher une carte…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
                aria-label="Rechercher une carte"
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
            note={
              <span className="inline-flex items-center gap-1.5">
                <EyeOff className="size-3.5" /> Le texte des cartes n&apos;est pas affiché dans la console
              </span>
            }
          />
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Carte</th>
              <th>Paquet</th>
              <th>Niveau</th>
              <th>Intensité</th>
              <th>Statut</th>
              <th>Tirages</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[12.5px] ad-muted">
                  Aucune carte ne correspond à ces critères.
                </td>
              </tr>
            )}
            {visible.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg ad-bg-plum-50 ad-plum">
                      <Layers className="size-4" />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-medium ad-ink">{row.title}</p>
                      {row.note && <p className="text-[10.5px] ad-warning">{row.note}</p>}
                    </div>
                  </div>
                </td>
                <td className="text-[12px]">{row.deck}</td>
                <td className="text-[12px] ad-muted">{row.level}</td>
                <td>
                  <Badge tone={row.intensity === "Passionnée" ? "plum" : "neutral"}>
                    {row.intensity}
                  </Badge>
                </td>
                <td>{statusBadge(row.status)}</td>
                <td className="text-[12px]">{numberFormat.format(row.uses)}</td>
                <td className="text-right">
                  <RowMenu
                    label={row.title}
                    items={[
                      ...(row.status === "published"
                        ? [
                            {
                              label: "Repasser en révision",
                              icon: <Send className="size-3.5" />,
                              onSelect: () =>
                                setStatus(row, "review", `« ${row.title} » repassée en révision.`),
                            },
                          ]
                        : [
                            {
                              label: "Publier",
                              icon: <CheckCircle2 className="size-3.5" />,
                              onSelect: () =>
                                setStatus(row, "published", `« ${row.title} » publiée.`),
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

      {dialog === "card" && (
        <DemoCreateDialog
          title="Nouvelle carte"
          description="La carte est ajoutée en brouillon à cette démonstration."
          submitLabel="Créer la carte"
          fields={[
            { key: "title", label: "Titre de la carte", required: true, placeholder: "Le compliment sincère" },
            { key: "deck", label: "Paquet", options: DECKS, half: true },
            { key: "level", label: "Niveau", options: LEVELS, half: true },
            { key: "intensity", label: "Intensité", options: INTENSITIES, half: true },
          ]}
          onClose={() => setDialog(null)}
          onSubmit={(values) => {
            const row: CardRow = {
              id: nextId(),
              title: values.title,
              deck: values.deck,
              level: values.level,
              intensity: values.intensity as Intensity,
              status: "draft",
              uses: 0,
            };
            setRows((current) => [row, ...current]);
            setTab("all");
            setPage(0);
            setDialog(null);
            setToast(`Carte « ${row.title} » créée en brouillon.`);
          }}
        />
      )}

      {dialog === "deck" && (
        <DemoCreateDialog
          title="Importer un paquet"
          description="Le paquet est ajouté en brouillon à cette démonstration."
          submitLabel="Importer le paquet"
          fields={[
            { key: "deck", label: "Nom du paquet", required: true, placeholder: "Paquet « Été »" },
            { key: "level", label: "Niveau", options: LEVELS, half: true },
            { key: "count", label: "Nombre de cartes", type: "number", placeholder: "12", half: true },
          ]}
          onClose={() => setDialog(null)}
          onSubmit={(values) => {
            const count = Math.max(0, Math.min(60, Number.parseInt(values.count || "0", 10) || 0));
            setDialog(null);
            setToast(
              count > 0
                ? `Paquet « ${values.deck} » importé : ${count} carte(s) en brouillon.`
                : `Paquet « ${values.deck} » importé, sans carte.`,
            );
          }}
        />
      )}
    </div>
  );
}
