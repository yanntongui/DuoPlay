"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  EyeOff,
  Flag,
  RotateCcw,
  Search,
  ShieldCheck,
  Timer,
  UserCheck,
} from "lucide-react";
import {
  Avatar,
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

type Report = {
  id: string;
  content: string;
  motif: string;
  severity: "high" | "medium" | "low";
  reporter: string;
  date: string;
  status: "pending" | "in_progress" | "resolved";
  category: string;
};

const SEED: Report[] = [
  { id: "sig_8841", content: "Carte « Défi des sens »", motif: "Contenu explicite non conforme", severity: "high", reporter: "Camille R.", date: "il y a 12 min", status: "pending", category: "Contenu" },
  { id: "sig_8840", content: "Message privé — fil c_2201", motif: "Harcèlement signalé", severity: "high", reporter: "Nadia E.", date: "il y a 38 min", status: "in_progress", category: "Comportement" },
  { id: "sig_8839", content: "Profil « Marco M. »", motif: "Usurpation d'identité", severity: "medium", reporter: "Sofia R.", date: "il y a 1 h", status: "pending", category: "Compte" },
  { id: "sig_8838", content: "Expérience « Soirée à deux »", motif: "Image potentiellement choquante", severity: "medium", reporter: "Diego F.", date: "il y a 2 h", status: "in_progress", category: "Contenu" },
  { id: "sig_8837", content: "Avis App Store", motif: "Avis frauduleux suspecté", severity: "low", reporter: "Système", date: "il y a 5 h", status: "pending", category: "Réputation" },
  { id: "sig_8836", content: "Signalement groupé (4 comptes)", motif: "Spam / bots", severity: "low", reporter: "Système", date: "hier", status: "resolved", category: "Compte" },
  { id: "sig_8835", content: "Carte « Nuit blanche »", motif: "Contenu explicite non conforme", severity: "high", reporter: "Léa D.", date: "hier", status: "pending", category: "Contenu" },
  { id: "sig_8834", content: "Profil « Ana P. »", motif: "Propos haineux", severity: "high", reporter: "Hugo V.", date: "il y a 2 j", status: "resolved", category: "Comportement" },
];

const TABS = [
  { id: "all", label: "Tous" },
  { id: "pending", label: "À traiter" },
  { id: "in_progress", label: "En cours" },
  { id: "resolved", label: "Traités" },
];

const PAGE_SIZE = 5;
const STORAGE_KEY = "duoplay.admin.moderation.v1";

function SeverityBadge({ value }: { value: Report["severity"] }) {
  if (value === "high") return <Badge tone="danger">Critique</Badge>;
  if (value === "medium") return <Badge tone="warning">Moyenne</Badge>;
  return <Badge tone="neutral">Faible</Badge>;
}

function statusBadge(status: Report["status"]) {
  if (status === "resolved") {
    return (
      <Badge tone="positive">
        <CheckCircle2 className="size-3" /> Traité
      </Badge>
    );
  }
  if (status === "in_progress") return <Badge tone="info">En cours</Badge>;
  return <Badge tone="warning">À traiter</Badge>;
}

export default function AdminModeration() {
  const [rows, setRows] = useDemoRows<Report>(STORAGE_KEY, SEED);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [ruleOpen, setRuleOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setPage(0);
  }, [tab, search, priorityOnly]);

  const filtered = useMemo(
    () =>
      rows.filter((report) => {
        if (tab !== "all" && report.status !== tab) return false;
        if (priorityOnly && report.severity !== "high") return false;
        const query = search.trim().toLowerCase();
        if (query && !`${report.id} ${report.motif} ${report.content}`.toLowerCase().includes(query)) {
          return false;
        }
        return true;
      }),
    [rows, tab, search, priorityOnly],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeEnd = safePage * PAGE_SIZE + visible.length;

  const pending = rows.filter((report) => report.status === "pending").length;
  const critical = rows.filter(
    (report) => report.severity === "high" && report.status !== "resolved",
  ).length;
  const resolved = rows.filter((report) => report.status === "resolved").length;

  function setStatus(report: Report, status: Report["status"], message: string) {
    setRows((current) =>
      current.map((row) => (row.id === report.id ? { ...row, status } : row)),
    );
    setToast(message);
  }

  function handleExport() {
    const ok = exportCsv(
      `duoplay-signalements-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: "id", label: "Signalement" },
        { key: "content", label: "Contenu" },
        { key: "motif", label: "Motif" },
        { key: "severity", label: "Gravité" },
        { key: "reporter", label: "Signalé par" },
        { key: "date", label: "Reçu" },
        { key: "status", label: "Statut" },
      ],
      filtered,
    );
    setToast(
      ok
        ? `${filtered.length} signalement(s) exporté(s).`
        : "Aucun signalement à exporter avec ces filtres.",
    );
  }

  return (
    <div className="ad-enter">
      <PageHeader
        title="Modération"
        subtitle="Traitez les signalements dans un cadre tracé. Le contenu intime n'est visible qu'après habilitation explicite."
        actions={
          <>
            <DemoPill />
            <button
              type="button"
              className="ad-btn ad-btn-outline"
              onClick={() => setRuleOpen(true)}
            >
              <ShieldCheck className="size-4" strokeWidth={1.9} />
              Règles de modération
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-wine"
              aria-pressed={priorityOnly}
              onClick={() => {
                const next = !priorityOnly;
                setPriorityOnly(next);
                if (next) {
                  setTab("pending");
                  setToast("File prioritaire : signalements critiques à traiter.");
                }
              }}
            >
              <AlertTriangle className="size-4" strokeWidth={2} />
              {priorityOnly ? "Tous les signalements" : "File prioritaire"}
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Signalements en attente" value={String(pending)} delta={`${critical} critique(s)`} tone="warning" />
        <StatTile label="Délai moyen de traitement" value="3 h 12" delta="-24 min" tone="positive" />
        <StatTile label="Signalements traités" value={String(resolved)} delta="sur cette page" tone="plum" />
        <StatTile label="Comptes suspendus (7 j)" value="9" delta="stable" tone="neutral" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card
          title="Charge de modération"
          subtitle="Signalements reçus par jour"
          className="xl:col-span-8"
          action={<Badge tone="plum">14 derniers jours</Badge>}
        >
          <div className="flex h-[150px] items-end gap-1.5">
            {[22, 34, 28, 41, 36, 52, 47, 38, 61, 44, 57, 49, 66, 41].map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={i === 12 ? "ad-bar w-full" : "ad-bar-muted w-full"}
                  style={{ height: `${(v / 70) * 118}px` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10.5px] ad-faint">
            <span>18 oct.</span>
            <span>25 oct.</span>
            <span>1 nov.</span>
          </div>
        </Card>

        <Card title="Motifs les plus fréquents" className="xl:col-span-4">
          <div className="space-y-3">
            {[
              { l: "Contenu explicite", v: 38 },
              { l: "Harcèlement", v: 24 },
              { l: "Spam / bots", v: 19 },
              { l: "Usurpation", v: 12 },
              { l: "Autre", v: 7 },
            ].map((m) => (
              <div key={m.l}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-[12px] ad-soft">{m.l}</span>
                  <span className="text-[12px] font-semibold ad-ink">{m.v} %</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full ad-bg-sunk">
                  <div className="h-full rounded-full ad-bg-plum" style={{ width: `${m.v}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-xl ad-bg-soft p-3 text-[11.5px] leading-snug ad-muted">
            <EyeOff className="mt-0.5 size-4 shrink-0 ad-plum" />
            Les médias signalés sont masqués par défaut. Toute levée de masque est
            journalisée et notifiée au responsable conformité.
          </div>
        </Card>
      </div>

      <TableCard
        title="File de signalements"
        subtitle={`${filtered.length} signalement(s) sur ${rows.length}`}
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
                placeholder="Rechercher un signalement…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
                aria-label="Rechercher un signalement"
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
                <Timer className="size-3.5" /> SLA interne : 4 h ouvrées pour les cas critiques
              </span>
            }
          />
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Signalement</th>
              <th>Motif</th>
              <th>Gravité</th>
              <th>Signalé par</th>
              <th>Reçu</th>
              <th>Statut</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[12.5px] ad-muted">
                  Aucun signalement ne correspond à ces critères.
                </td>
              </tr>
            )}
            {visible.map((report) => (
              <tr key={report.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg ad-bg-plum-50 ad-plum">
                      <Flag className="size-4" />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-medium ad-ink">{report.content}</p>
                      <p className="text-[11px] ad-faint">
                        {report.id} · {report.category}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="max-w-[240px] truncate text-[12px]">{report.motif}</td>
                <td>
                  <SeverityBadge value={report.severity} />
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Avatar name={report.reporter} size={26} />
                    <span className="text-[12px]">{report.reporter}</span>
                  </div>
                </td>
                <td className="text-[12px] ad-muted">{report.date}</td>
                <td>{statusBadge(report.status)}</td>
                <td className="text-right">
                  <RowMenu
                    label={report.id}
                    items={[
                      ...(report.status === "resolved"
                        ? [
                            {
                              label: "Rouvrir le signalement",
                              icon: <RotateCcw className="size-3.5" />,
                              onSelect: () =>
                                setStatus(report, "pending", `Signalement ${report.id} rouvert.`),
                            },
                          ]
                        : [
                            {
                              label: "Prendre en charge",
                              icon: <UserCheck className="size-3.5" />,
                              onSelect: () =>
                                setStatus(
                                  report,
                                  "in_progress",
                                  `Signalement ${report.id} pris en charge.`,
                                ),
                            },
                            {
                              label: "Marquer comme traité",
                              icon: <CheckCircle2 className="size-3.5" />,
                              confirm: `Clôturer le signalement ${report.id} ? Double validation requise.`,
                              onSelect: () =>
                                setStatus(report, "resolved", `Signalement ${report.id} traité.`),
                            },
                          ]),
                      {
                        label: "Escalader à la conformité",
                        icon: <AlertTriangle className="size-3.5" />,
                        tone: "danger",
                        confirm: `Escalader ${report.id} au responsable conformité ? L’action est journalisée.`,
                        onSelect: () =>
                          setToast(`Signalement ${report.id} escaladé à la conformité.`),
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

      {ruleOpen && (
        <DemoCreateDialog
          title="Nouvelle règle de modération"
          description="Règle locale à la démonstration, non appliquée automatiquement."
          submitLabel="Ajouter la règle"
          fields={[
            { key: "name", label: "Nom de la règle", required: true, placeholder: "Contenu explicite" },
            {
              key: "severity",
              label: "Gravité",
              options: ["Critique", "Moyenne", "Faible"],
              half: true,
            },
            {
              key: "action",
              label: "Action",
              options: ["Masquer", "Avertir", "Suspendre", "Escalader"],
              half: true,
            },
            { key: "description", label: "Description", type: "textarea", placeholder: "Quand appliquer cette règle…" },
          ]}
          onClose={() => setRuleOpen(false)}
          onSubmit={(values) => {
            setRuleOpen(false);
            setToast(`Règle « ${values.name} » ajoutée (${values.severity}).`);
          }}
        />
      )}
    </div>
  );
}
