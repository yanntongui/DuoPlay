"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Search,
  Siren,
} from "lucide-react";
import {
  Badge,
  Card,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";

const INCIDENTS = [
  { id: "INC-142", title: "Webhooks Stripe en retard", severity: "major", status: "in_progress", started: "1 nov. · 13:42", duration: "52 min", services: "Paiements", owner: "Marc L." },
  { id: "INC-141", title: "Latence élevée sur l'API mobile", severity: "minor", status: "resolved", started: "29 oct. · 09:12", duration: "34 min", services: "API", owner: "Yann T." },
  { id: "INC-140", title: "Échec d'envoi des e-mails transactionnels", severity: "major", status: "resolved", started: "24 oct. · 18:04", duration: "1 h 12", services: "E-mails", owner: "Amina D." },
  { id: "INC-139", title: "Indisponibilité du stockage médias (EU)", severity: "critical", status: "resolved", started: "12 oct. · 07:31", duration: "2 h 06", services: "Stockage", owner: "Yann T." },
];

const TIMELINE = [
  { at: "13:42", text: "Alerte automatique : taux d'échec des webhooks > 5 %.", tone: "danger" as const },
  { at: "13:46", text: "Incident confirmé. Astreinte technique notifiée.", tone: "warning" as const },
  { at: "14:02", text: "Identification : saturation de la file de retry côté Stripe.", tone: "info" as const },
  { at: "14:18", text: "Purge de la file et augmentation du parallélisme appliquées.", tone: "info" as const },
  { at: "14:30", text: "Retour progressif à la normale observé (2,1 % d'échec).", tone: "positive" as const },
];

function Severity({ value }: { value: string }) {
  if (value === "critical") return <Badge tone="danger">Critique</Badge>;
  if (value === "major") return <Badge tone="warning">Majeure</Badge>;
  return <Badge tone="neutral">Mineure</Badge>;
}

export default function AdminIncidents() {
  const [search, setSearch] = useState("");

  const rows = INCIDENTS.filter((i) =>
    `${i.id} ${i.title} ${i.services}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="ad-enter">
      <PageHeader
        title="Incidents"
        subtitle="Déclarez, suivez et documentez les incidents. Une communication claire vaut mieux qu'un silence."
        actions={
          <>
            <button className="ad-btn ad-btn-outline">
              <FileText className="size-4" strokeWidth={1.9} />
              Post-mortems
            </button>
            <button className="ad-btn ad-btn-wine">
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
              <AlertTriangle className="size-5 text-white" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#f2b8a2]" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">
                  Incident en cours · INC-142
                </p>
              </div>
              <p className="mt-1.5 text-[17px] font-semibold text-white">
                Webhooks Stripe en retard
              </p>
              <p className="mt-1 max-w-xl text-[12px] leading-snug text-white/55">
                Les paiements sont acceptés, mais la synchronisation des
                abonnements peut accuser un retard de plusieurs minutes.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/80">
              <Clock className="mr-1 inline size-3" /> 52 min
            </span>
            <button className="inline-flex h-9 items-center rounded-full bg-white px-4 text-[12px] font-semibold text-[#2a1425]">
              Mettre à jour
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Incidents ouverts" value="1" delta="majeur" tone="warning" />
        <StatTile label="MTTR (30 j)" value="1 h 04" delta="-18 min" tone="positive" />
        <StatTile label="Incidents (30 j)" value="7" delta="-3" tone="neutral" />
        <StatTile label="SLA respecté" value="98,2 %" delta="+0,6 pt" tone="positive" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card
          title="Chronologie — INC-142"
          className="xl:col-span-4"
          action={<Badge tone="warning">En cours</Badge>}
        >
          <ol className="relative space-y-4 border-l ad-bd pl-4">
            {TIMELINE.map((t) => (
              <li key={t.at} className="relative">
                <span
                  className={`absolute -left-[21px] top-1 size-2.5 rounded-full ring-4 ring-white ${
                    t.tone === "danger"
                      ? "ad-bg-danger-solid"
                      : t.tone === "warning"
                        ? "ad-bg-warning-solid"
                        : t.tone === "positive"
                          ? "ad-bg-positive-solid"
                          : "ad-bg-plum"
                  }`}
                />
                <p className="font-mono text-[10.5px] ad-faint">{t.at}</p>
                <p className="mt-0.5 text-[12px] leading-snug ad-soft">{t.text}</p>
              </li>
            ))}
          </ol>
        </Card>

        <TableCard
          className="xl:col-span-8"
          title="Historique des incidents"
          subtitle={`${rows.length} incident(s) sur 90 jours`}
          action={
            <div className="relative min-w-[190px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
              />
            </div>
          }
          footer={
            <>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" /> Post-mortem requis pour tout incident critique
              </span>
              <button className="ad-btn ad-btn-outline h-8 px-3 text-[11.5px]">
                <Plus className="size-3.5" /> Exporter
              </button>
            </>
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
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id}>
                  <td>
                    <p className="text-[12.5px] font-medium ad-ink">{i.title}</p>
                    <p className="font-mono text-[10.5px] ad-faint">
                      {i.id} · {i.owner}
                    </p>
                  </td>
                  <td>
                    <Severity value={i.severity} />
                  </td>
                  <td className="text-[12px] ad-muted">{i.services}</td>
                  <td className="whitespace-nowrap text-[11.5px] ad-muted">{i.started}</td>
                  <td className="text-[12px]">{i.duration}</td>
                  <td>
                    {i.status === "resolved" ? (
                      <Badge tone="positive">Résolu</Badge>
                    ) : (
                      <Badge tone="warning">En cours</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      </div>
    </div>
  );
}
