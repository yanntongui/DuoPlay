"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Copy,
  Plus,
  Route,
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
import { adminPortalHost } from "@/lib/admin/portal";

type JourneyStatus = "published" | "draft" | "review";

type Journey = {
  id: string;
  name: string;
  steps: number;
  couples: number;
  completion: number;
  duration: string;
  status: JourneyStatus;
  owner: string;
};

const SEED: Journey[] = [
  { id: "jr_501", name: "Retrouvailles", steps: 7, couples: 4902, completion: 74, duration: "7 jours", status: "published", owner: "Amina D." },
  { id: "jr_502", name: "Premiers pas à deux", steps: 5, couples: 12408, completion: 88, duration: "5 jours", status: "published", owner: "Amina D." },
  { id: "jr_503", name: "Découverte des envies", steps: 9, couples: 2118, completion: 61, duration: "14 jours", status: "review", owner: "Sofia R." },
  { id: "jr_504", name: "Rituel du dimanche", steps: 4, couples: 0, completion: 0, duration: "4 semaines", status: "draft", owner: "Yann T." },
  { id: "jr_505", name: "Anniversaire de couple", steps: 6, couples: 890, completion: 92, duration: "1 jour", status: "published", owner: "Marc L." },
  { id: "jr_506", name: "Cap sur la complicité", steps: 5, couples: 1540, completion: 79, duration: "5 jours", status: "published", owner: "Sofia R." },
  { id: "jr_507", name: "Pause sans écran", steps: 3, couples: 0, completion: 0, duration: "3 jours", status: "draft", owner: "Yann T." },
];

const TEMPLATES = [
  { name: "Rituel court", steps: 3, description: "Trois étapes, une semaine, zéro pression." },
  { name: "Découverte guidée", steps: 5, description: "Idéal pour un couple qui débute." },
  { name: "Retrouvailles", steps: 7, description: "Reconnecter après une période chargée." },
];

const PAGE_SIZE = 5;
const STORAGE_KEY = "duoplay.admin.journeys.v1";

const numberFormat = new Intl.NumberFormat("fr-FR");

function statusBadge(status: JourneyStatus) {
  if (status === "published") return <Badge tone="positive">Publié</Badge>;
  if (status === "review") return <Badge tone="info">En révision</Badge>;
  return <Badge tone="warning">Brouillon</Badge>;
}

export default function AdminJourneys() {
  const [rows, setRows] = useDemoRows<Journey>(STORAGE_KEY, SEED);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [dialog, setDialog] = useState<"create" | "templates" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setPage(0);
  }, [search, status]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        const query = search.trim().toLowerCase();
        if (query && !`${row.name} ${row.owner}`.toLowerCase().includes(query)) {
          return false;
        }
        if (status !== "all" && row.status !== status) return false;
        return true;
      }),
    [rows, search, status],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeEnd = safePage * PAGE_SIZE + visible.length;

  const active = rows.filter((row) => row.status === "published").length;
  const engaged = rows.reduce((total, row) => total + row.couples, 0);
  const scored = rows.filter((row) => row.completion > 0);
  const averageCompletion =
    scored.length === 0
      ? 0
      : Math.round(scored.reduce((total, row) => total + row.completion, 0) / scored.length);

  function nextId(): string {
    const highest = rows.reduce((max, row) => {
      const match = /^jr_(\d+)$/.exec(row.id);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 500);
    return `jr_${highest + 1}`;
  }

  function create(values: Record<string, string>) {
    const steps = Number.parseInt(values.steps || "5", 10);
    const row: Journey = {
      id: nextId(),
      name: values.name,
      steps: Number.isFinite(steps) && steps > 0 ? Math.min(steps, 30) : 5,
      couples: 0,
      completion: 0,
      duration: values.duration,
      status: "draft",
      owner: "Vous",
    };
    setRows((current) => [row, ...current]);
    setPage(0);
    setDialog(null);
    setToast(`Parcours « ${row.name} » créé en brouillon.`);
  }

  function setJourneyStatus(row: Journey, next: JourneyStatus, message: string) {
    setRows((current) =>
      current.map((item) => (item.id === row.id ? { ...item, status: next } : item)),
    );
    setToast(message);
  }

  function duplicate(row: Journey) {
    const copy: Journey = {
      ...row,
      id: nextId(),
      name: `${row.name} (copie)`,
      couples: 0,
      completion: 0,
      status: "draft",
      owner: "Vous",
    };
    setRows((current) => [copy, ...current]);
    setPage(0);
    setToast(`« ${row.name} » dupliqué en brouillon.`);
  }

  function remove(row: Journey) {
    setRows((current) => current.filter((item) => item.id !== row.id));
    setToast(`« ${row.name} » supprimé.`);
  }

  function handleExport() {
    const ok = exportCsv(
      `duoplay-parcours-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: "id", label: "Identifiant" },
        { key: "name", label: "Parcours" },
        { key: "steps", label: "Étapes" },
        { key: "couples", label: "Couples" },
        { key: "completion", label: "Complétion" },
        { key: "duration", label: "Durée" },
        { key: "status", label: "Statut" },
        { key: "owner", label: "Responsable" },
      ],
      filtered.map((row) => ({
        ...row,
        steps: String(row.steps),
        couples: String(row.couples),
        completion: row.completion ? `${row.completion} %` : "—",
      })),
    );
    setToast(
      ok
        ? `${filtered.length} parcours exporté(s).`
        : "Aucun parcours à exporter avec ces filtres.",
    );
  }

  return (
    <div className="ad-enter">
      <PageHeader
        title="Parcours"
        subtitle="Des séquences guidées qui installent une habitude douce. Suivez la progression sans jamais lire les réponses."
        actions={
          <>
            <DemoPill />
            <button
              type="button"
              className="ad-btn ad-btn-outline"
              onClick={() => setDialog("templates")}
            >
              <Route className="size-4" strokeWidth={1.9} />
              Modèles
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-primary"
              onClick={() => setDialog("create")}
            >
              <Plus className="size-4" strokeWidth={2.2} />
              Nouveau parcours
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Parcours actifs" value={String(active)} delta="+2" tone="positive" />
        <StatTile label="Couples engagés" value={numberFormat.format(engaged)} delta="+6,8 %" tone="plum" />
        <StatTile label="Complétion moyenne" value={`${averageCompletion} %`} delta="+1,9 pt" tone="positive" />
        <StatTile label="Abandons à l'étape 1" value="14 %" delta="-2 pts" tone="warning" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card
          title="Tunnel du parcours « Retrouvailles »"
          subtitle="Progression étape par étape"
          className="xl:col-span-8"
          action={<Badge tone="positive">81 % de rétention</Badge>}
        >
          <div className="space-y-3">
            {[
              { s: "1. Invitation", v: 100 },
              { s: "2. Mise en contexte", v: 94 },
              { s: "3. Premier échange", v: 88 },
              { s: "4. Défi à deux", v: 81 },
              { s: "5. Rituel quotidien", v: 76 },
              { s: "6. Bilan", v: 72 },
              { s: "7. Clôture", v: 74 },
            ].map((step) => (
              <div key={step.s} className="flex items-center gap-3">
                <span className="w-[150px] shrink-0 text-[12px] ad-soft">{step.s}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full ad-bg-sunk">
                  <div className="h-full rounded-full ad-bg-plum" style={{ width: `${step.v}%` }} />
                </div>
                <span className="w-10 text-right text-[11.5px] font-semibold ad-ink">{step.v} %</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4 xl:col-span-4">
          <Card title="Rythme d'engagement">
            <div className="flex items-end gap-2">
              {[42, 58, 51, 66, 72, 64, 78].map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className={i === 6 ? "ad-bar w-full" : "ad-bar-muted w-full"}
                    style={{ height: `${v}px` }}
                  />
                  <span className="text-[9.5px] ad-faint">J{i + 1}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="flex items-start gap-2.5 text-[11.5px] leading-snug ad-muted">
              <ArrowUpRight className="mt-0.5 size-4 shrink-0 ad-plum" />
              Les parcours de 5 étapes ont un taux de complétion supérieur de 12
              points aux parcours longs.
            </div>
          </Card>
        </div>
      </div>

      <TableCard
        title="Tous les parcours"
        subtitle={`${filtered.length} parcours sur ${rows.length}`}
        toolbar={
          <>
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
                aria-label="Rechercher un parcours"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="ad-select h-9 text-[12.5px]"
              aria-label="Filtrer par statut"
            >
              <option value="all">Tous les statuts</option>
              <option value="published">Publié</option>
              <option value="review">En révision</option>
              <option value="draft">Brouillon</option>
            </select>
            <button
              type="button"
              onClick={handleExport}
              className="ad-btn ad-btn-outline h-9 px-3 text-[12.5px]"
            >
              Exporter
            </button>
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
            note="Validation à deux avant publication · aucune réponse individuelle accessible"
          />
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Parcours</th>
              <th>Étapes</th>
              <th>Couples</th>
              <th>Complétion</th>
              <th>Durée</th>
              <th>Statut</th>
              <th>Responsable</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-[12.5px] ad-muted">
                  Aucun parcours ne correspond à ces critères.
                </td>
              </tr>
            )}
            {visible.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg ad-bg-plum-50 ad-plum">
                      <Route className="size-4" />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-medium ad-ink">{row.name}</p>
                      <p className="text-[10.5px] ad-faint">{row.id}</p>
                    </div>
                  </div>
                </td>
                <td className="text-[12.5px]">{row.steps}</td>
                <td className="text-[12.5px]">{row.couples ? numberFormat.format(row.couples) : "—"}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full ad-bg-sunk">
                      <div className="h-full rounded-full ad-bg-plum" style={{ width: `${row.completion}%` }} />
                    </div>
                    <span className="text-[11.5px] ad-muted">
                      {row.completion ? `${row.completion} %` : "—"}
                    </span>
                  </div>
                </td>
                <td className="text-[12px] ad-muted">{row.duration}</td>
                <td>{statusBadge(row.status)}</td>
                <td className="text-[12px] ad-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3 ad-faint" /> {row.owner}
                  </span>
                </td>
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
                                setJourneyStatus(row, "review", `« ${row.name} » repassé en révision.`),
                            },
                          ]
                        : [
                            {
                              label: "Publier",
                              icon: <CheckCircle2 className="size-3.5" />,
                              onSelect: () =>
                                setJourneyStatus(row, "published", `« ${row.name} » publié.`),
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

      {dialog === "create" && (
        <DemoCreateDialog
          title="Nouveau parcours"
          description="Le parcours est ajouté en brouillon à cette démonstration."
          submitLabel="Créer le brouillon"
          fields={[
            { key: "name", label: "Nom du parcours", required: true, placeholder: "Rituel du dimanche" },
            { key: "steps", label: "Nombre d’étapes", type: "number", placeholder: "5", half: true },
            {
              key: "duration",
              label: "Durée",
              options: ["1 jour", "3 jours", "5 jours", "7 jours", "14 jours", "4 semaines"],
              half: true,
            },
          ]}
          onClose={() => setDialog(null)}
          onSubmit={create}
        />
      )}

      {dialog === "templates" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
            <button
              type="button"
              aria-label="Fermer"
              className="ad-scrim"
              onClick={() => setDialog(null)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Modèles de parcours"
              className="ad-card relative z-50 max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-b-none p-5 sm:rounded-2xl sm:p-6"
            >
              <h2 className="text-[18px] font-semibold tracking-[-0.02em] ad-ink">
                Modèles de parcours
              </h2>
              <p className="mt-1 text-[12.5px] ad-muted">
                Repartez d’une structure éprouvée, puis adaptez les étapes.
              </p>
              <div className="mt-5 space-y-2.5">
                {TEMPLATES.map((template) => (
                  <div
                    key={template.name}
                    className="flex items-center gap-3 rounded-xl border ad-bd p-3.5"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl ad-bg-plum-50 ad-plum">
                      <Route className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium ad-ink">
                        {template.name} <span className="ad-faint">· {template.steps} étapes</span>
                      </p>
                      <p className="text-[11.5px] ad-muted">{template.description}</p>
                    </div>
                    <button
                      type="button"
                      className="ad-btn ad-btn-outline h-8 shrink-0 px-3 text-[11.5px]"
                      onClick={() => {
                        const row: Journey = {
                          id: nextId(),
                          name: template.name,
                          steps: template.steps,
                          couples: 0,
                          completion: 0,
                          duration: `${template.steps} jours`,
                          status: "draft",
                          owner: "Vous",
                        };
                        setRows((current) => [row, ...current]);
                        setPage(0);
                        setDialog(null);
                        setToast(`Modèle « ${template.name} » ajouté en brouillon.`);
                      }}
                    >
                      Utiliser
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  className="ad-btn ad-btn-primary h-10 px-4 text-[12.5px]"
                  onClick={() => setDialog(null)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>,
          adminPortalHost() ?? document.body,
        )}
    </div>
  );
}
