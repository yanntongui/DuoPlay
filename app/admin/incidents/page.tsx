"use client";

import { useEffect, useState } from "react";
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
  DemoToast,
  RowMenu,
} from "@/components/admin/demo-kit";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

type Severity = "critical" | "major" | "minor";
type IncidentStatus = "in_progress" | "resolved";

type Incident = {
  _id: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  service: string;
  startedAt: number;
  resolvedAt?: number;
  durationMinutes: number;
  owner: string;
  createdAt: number;
  updatedAt: number;
};

const PAGE_SIZE = 5;

function SeverityBadge({ value }: { value: Severity }) {
  if (value === "critical") return <Badge tone="danger">Critique</Badge>;
  if (value === "major") return <Badge tone="warning">Majeure</Badge>;
  return <Badge tone="neutral">Mineure</Badge>;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} h ${mins}` : `${hours} h`;
}

export default function AdminIncidents() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [declareOpen, setDeclareOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const data = useQuery(api.incidents.list, {
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });

  const stats = useQuery(api.incidents.getStats, {});

  useEffect(() => {
    setPage(0);
  }, [search]);

  const isLoading = data === undefined;
  const incidents = (data?.incidents as Incident[]) || [];
  const totalCount = data?.totalCount || 0;

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);

  const current = incidents.find((row) => row.status === "in_progress");

  const declare = useMutation(api.incidents.declare);
  const resolveIncident = useMutation(api.incidents.resolve);
  const reopen = useMutation(api.incidents.reopen);

  async function handleDeclare(values: Record<string, string>) {
    try {
      await declare({
        adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY || "",
        title: values.title,
        severity: values.severity === "Critique" ? "critical" : values.severity === "Majeure" ? "major" : "minor",
        service: values.service,
        owner: "Vous",
      });

      setToast(`Incident déclaré.`);
      setDeclareOpen(false);
      setPage(0);
    } catch (err) {
      setToast("Erreur lors de la déclaration de l'incident.");
      console.error(err);
    }
  }

  async function handleResolve(incident: Incident) {
    try {
      await resolveIncident({
        adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY || "",
        id: incident._id,
      });
      setToast(`Incident résolu.`);
    } catch (err) {
      setToast("Erreur lors de la résolution.");
      console.error(err);
    }
  }

  async function handleReopen(incident: Incident) {
    try {
      await reopen({
        adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY || "",
        id: incident._id,
      });
      setToast(`Incident rouvert.`);
    } catch (err) {
      setToast("Erreur lors de la réouverture.");
      console.error(err);
    }
  }

  function handleExport() {
    const csvData = incidents
      .map(
        (row) =>
          `${row._id},"${row.title}","${row.severity}","${row.service}","${row.status}"`,
      )
      .join("\n");

    const blob = new Blob(["id,Titre,Gravité,Service,Statut\n" + csvData], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `duoplay-incidents-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast(`${incidents.length} incident(s) exporté(s).`);
  }

  return (
    <div className="ad-enter">
      <PageHeader
        title="Incidents"
        subtitle="Déclarez, suivez et documentez les incidents. Une communication claire vaut mieux qu'un silence."
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
              className="ad-btn ad-btn-wine"
              onClick={() => setDeclareOpen(true)}
              disabled={isLoading}
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
                  {current ? `Incident en cours` : "Aucun incident en cours"}
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
              <Clock className="mr-1 inline size-3" /> {current ? formatDuration(current.durationMinutes) : "—"}
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
        <StatTile label="Incidents ouverts" value={String(stats?.open || 0)} delta={current?.severity || "aucun"} tone="warning" />
        <StatTile label="MTTR (30 j)" value="1 h 04" delta="-18 min" tone="positive" />
        <StatTile label="Incidents (30 j)" value={String(stats?.total || 0)} delta="-3" tone="neutral" />
        <StatTile label="SLA respecté" value="98,2 %" delta="+0,6 pt" tone="positive" />
      </div>

      <TableCard
        className="mb-4"
        title="Historique des incidents"
        subtitle={`${incidents.length} incident(s) sur 90 jours`}
        action={
          <div className="relative min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher…"
              className="ad-input h-9 ad-pl-9 text-[12.5px]"
              aria-label="Rechercher un incident"
              disabled={isLoading}
            />
          </div>
        }
        footer={
          <DemoPagination
            page={safePage}
            pageCount={pageCount}
            rangeStart={incidents.length === 0 ? 0 : safePage * PAGE_SIZE + 1}
            rangeEnd={safePage * PAGE_SIZE + incidents.length}
            total={totalCount}
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
            {isLoading && (
              <tr>
                <td colSpan={7} className="py-10 text-center">
                  Chargement…
                </td>
              </tr>
            )}
            {!isLoading && incidents.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[12.5px] ad-muted">
                  Aucun incident ne correspond à cette recherche.
                </td>
              </tr>
            )}
            {!isLoading &&
              incidents.map((row) => (
                <tr key={row._id}>
                  <td>
                    <p className="text-[12.5px] font-medium ad-ink">{row.title}</p>
                    <p className="font-mono text-[10.5px] ad-faint">
                      {row._id.slice(-6)} · {row.owner}
                    </p>
                  </td>
                  <td>
                    <SeverityBadge value={row.severity} />
                  </td>
                  <td className="text-[12px] ad-muted">{row.service}</td>
                  <td className="whitespace-nowrap text-[11.5px] ad-muted">
                    {new Intl.DateTimeFormat("fr-FR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(row.startedAt))}
                  </td>
                  <td className="text-[12px]">{formatDuration(row.durationMinutes)}</td>
                  <td>
                    {row.status === "resolved" ? (
                      <Badge tone="positive">Résolu</Badge>
                    ) : (
                      <Badge tone="warning">En cours</Badge>
                    )}
                  </td>
                  <td className="text-right">
                    <RowMenu
                      label={row._id.slice(-6)}
                      items={[
                        ...(row.status === "in_progress"
                          ? [
                              {
                                label: "Clôturer l'incident",
                                icon: <CheckCircle2 className="size-3.5" />,
                                confirm: `Clôturer ${row._id.slice(-6)} ?`,
                                onSelect: () => handleResolve(row),
                              },
                            ]
                          : [
                              {
                                label: "Rouvrir l'incident",
                                icon: <XCircle className="size-3.5" />,
                                onSelect: () => handleReopen(row),
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
          description="L'incident est ajouté à la base de données."
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
          onSubmit={handleDeclare}
        />
      )}
    </div>
  );
}
