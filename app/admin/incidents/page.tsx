"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Search,
  Siren,
  XCircle,
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

type Severity = "critical" | "major" | "minor";
type IncidentStatus = "in_progress" | "resolved";

type Incident = {
  id: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  started: string;
  duration: string;
  services: string;
  owner: string;
};

const SEED: Incident[] = [
  { id: "INC-142", title: "Webhooks Stripe en retard", severity: "major", status: "in_progress", started: "1 nov. · 13:42", duration: "52 min", services: "Paiements", owner: "Marc L." },
  { id: "INC-141", title: "Latence élevée sur l'API mobile", severity: "minor", status: "resolved", started: "29 oct. · 09:12", duration: "34 min", services: "API", owner: "Yann T." },
  { id: "INC-140", title: "Échec d'envoi des e-mails transactionnels", severity: "major", status: "resolved", started: "24 oct. · 18:04", duration: "1 h 12", services: "E-mails", owner: "Amina D." },
  { id: "INC-139", title: "Indisponibilité du stockage médias (EU)", severity: "critical", status: "resolved", started: "12 oct. · 07:31", duration: "2 h 06", services: "Stockage", owner: "Yann T." },
  { id: "INC-138", title: "File de notifications saturée", severity: "minor", status: "resolved", started: "8 oct. · 21:48", duration: "21 min", services: "Notifications", owner: "Marc L." },
  { id: "INC-137", title: "Erreurs 502 sur les sessions à distance", severity: "major", status: "resolved", started: "3 oct. · 16:10", duration: "47 min", services: "Sessions", owner: "Amina D." },
  { id: "INC-136", title: "Dégradation du rendu des cartes", severity: "minor", status: "resolved", started: "28 sept. · 11:02", duration: "18 min", services: "Cartes", owner: "Yann T." },
];

const PAGE_SIZE = 5;
const STORAGE_KEY = "duoplay.admin.incidents.v1";

function SeverityBadge({ value }: { value: Severity }) {
  if (value === "critical") return <Badge tone="danger">Critique</Badge>;
  if (value === "major") return <Badge tone="warning">Majeure</Badge>;
  return <Badge tone="neutral">Mineure</Badge>;
}

function nowLabel(): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export default function AdminIncidents() {
  const [rows, setRows] = useDemoRows<Incident>(STORAGE_KEY, SEED);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [declareOpen, setDeclareOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setPage(0);
  }, [search]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return `${row.id} ${row.title} ${row.services}`.toLowerCase().includes(query);
      }),
    [rows, search],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeEnd = safePage * PAGE_SIZE + visible.length;

  const current = rows.find((row) => row.status === "in_progress");
  const open = rows.filter((row) => row.status === "in_progress").length;

  function nextIncidentId(): string {
    const highest = rows.reduce((max, row) => {
      const match = /^INC-(\d+)$/.exec(row.id);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 100);
    return `INC-${highest + 1}`;
  }

  function declare(values: Record<string, string>) {
    const row: Incident = {
      id: nextIncidentId(),
      title: values.title,
      severity:
        values.severity === "Critique"
          ? "critical"
          : values.severity === "Majeure"
            ? "major"
            : "minor",
      status: "in_progress",
      started: `${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} · ${nowLabel()}`,
      duration: "1 min",
      services: values.service,
      owner: "Vous",
    };
    setRows((currentRows) => [row, ...currentRows]);
    setDeclareOpen(false);
    setPage(0);
    setToast(`Incident ${row.id} déclaré.`);
  }

  function resolve(row: Incident) {
    setRows((currentRows) =>
      currentRows.map((item) =>
        item.id === row.id ? { ...item, status: "resolved" as IncidentStatus } : item,
      ),
    );
    setToast(`Incident ${row.id} clôturé.`);
  }

  function reopen(row: Incident) {
    setRows((currentRows) =>
      currentRows.map((item) =>
        item.id === row.id
          ? { ...item, status: "in_progress" as IncidentStatus, duration: "1 min" }
          : item,
      ),
    );
    setToast(`Incident ${row.id} rouvert.`);
  }

  function handleExport() {
    const ok = exportCsv(
      `duoplay-incidents-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: "id", label: "Incident" },
        { key: "title", label: "Titre" },
        { key: "severity", label: "Gravité" },
        { key: "services", label: "Service" },
        { key: "started", label: "Début" },
        { key: "duration", label: "Durée" },
        { key: "status", label: "Statut" },
        { key: "owner", label: "Responsable" },
      ],
      filtered,
    );
    setToast(
      ok
        ? `${filtered.length} incident(s) exporté(s).`
        : "Aucun incident à exporter avec ces filtres.",
    );
  }

  return (
    <div className="ad-enter">
      <PageHeader
        title="Incidents"
        subtitle="Déclarez, suivez et documentez les incidents. Une communication claire vaut mieux qu'un silence."
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
              className="ad-btn ad-btn-wine"
              onClick={() => setDeclareOpen(true)}
            >
              <Siren className="size-4" strokeWidth={2} />
              Déclarer un incident
            </button>
          </>
        }
      />

      <div className="ad-card-dark mb-4 p-[22px]">
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/12">
              {current ? (
                <CheckCircle2 className="size-5 text-white" />
              ) : (
                <CheckCircle2 className="size-5 text-white" />
              )}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#f2b8a2]" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">
                  {current ? `Incident en cours · ${current.id}` : "Aucun incident en cours"}
                </p>
              </div>
              <p className="mt-1.5 text-[17px] font-semibold text-white">
                {current ? current.title : "Tous les services sont opérationnels"}
              </p>
              <p className="mt-1 max-w-xl text-[12px] leading-snug text-white/55">
                {current
                  ? "Les paiements sont acceptés, mais la synchronisation des abonnements peut accuser un retard de plusieurs minutes."
                  : "Le dernier incident a été clôturé."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/80">
              <Clock className="mr-1 inline size-3" /> {current ? current.duration : "—"}
            </span>
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-full bg-white px-4 text-[12px] font-semibold text-[#2a1425]"
              onClick={() => setToast(current ? "Mise à jour : aucun changement à signaler." : "Aucun incident en cours à mettre à jour.")}
            >
              Mettre à jour
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Incidents ouverts" value={String(open)} delta={current ? current.severity : "aucun"} tone="warning" />
        <StatTile label="MTTR (30 j)" value="1 h 04" delta="-18 min" tone="positive" />
        <StatTile label="Incidents (30 j)" value={String(rows.length)} delta="-3" tone="neutral" />
        <StatTile label="SLA respecté" value="98,2 %" delta="+0,6 pt" tone="positive" />
      </div>

      <TableCard
        className="mb-4"
        title="Historique des incidents"
        subtitle={`${filtered.length} incident(s) sur 90 jours`}
        action={
          <div className="relative min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher…"
              className="ad-input h-9 ad-pl-9 text-[12.5px]"
              aria-label="Rechercher un incident"
            />
          </div>
        }
        footer={
          <DemoPagination
            page={safePage}
            pageCount={pageCount}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            total={filtered.length}
            onPage={setPage}
            note="Post-mortem requis pour tout incident critique"
          />
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Incident</th>
              <th>Gravité</th>
              <th>Service</th>
              <th>Début</th>
              <th>Durée</th>
              <th>Statut</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[12.5px] ad-muted">
                  Aucun incident ne correspond à cette recherche.
                </td>
              </tr>
            )}
            {visible.map((row) => (
              <tr key={row.id}>
                <td>
                  <p className="text-[12.5px] font-medium ad-ink">{row.title}</p>
                  <p className="font-mono text-[10.5px] ad-faint">
                    {row.id} · {row.owner}
                  </p>
                </td>
                <td>
                  <SeverityBadge value={row.severity} />
                </td>
                <td className="text-[12px] ad-muted">{row.services}</td>
                <td className="whitespace-nowrap text-[11.5px] ad-muted">{row.started}</td>
                <td className="text-[12px]">{row.duration}</td>
                <td>
                  {row.status === "resolved" ? (
                    <Badge tone="positive">Résolu</Badge>
                  ) : (
                    <Badge tone="warning">En cours</Badge>
                  )}
                </td>
                <td className="text-right">
                  <RowMenu
                    label={row.id}
                    items={[
                      ...(row.status === "in_progress"
                        ? [
                            {
                              label: "Clôturer l'incident",
                              icon: <CheckCircle2 className="size-3.5" />,
                              confirm: `Clôturer ${row.id} ? La chronologie sera mise à jour.`,
                              onSelect: () => resolve(row),
                            },
                          ]
                        : [
                            {
                              label: "Rouvrir l'incident",
                              icon: <XCircle className="size-3.5" />,
                              onSelect: () => reopen(row),
                            },
                          ]),
                      {
                        label: "Exporter l'historique",
                        icon: <CheckCircle2 className="size-3.5" />,
                        onSelect: handleExport,
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

      {declareOpen && (
        <DemoCreateDialog
          title="Déclarer un incident"
          description="L'incident est ajouté à cette démonstration, en cours."
          submitLabel="Déclarer"
          fields={[
            { key: "title", label: "Titre", required: true, placeholder: "Latence sur l'API mobile" },
            {
              key: "severity",
              label: "Gravité",
              options: ["Critique", "Majeure", "Mineure"],
              half: true,
            },
            { key: "service", label: "Service", options: ["Paiements", "API", "E-mails", "Stockage", "Notifications", "Sessions", "Cartes"], half: true },
          ]}
          onClose={() => setDeclareOpen(false)}
          onSubmit={declare}
        />
      )}
    </div>
  );
}
