"use client";

import { useState } from "react";
import {
  CalendarClock,
  Download,
  FileBarChart,
  FileSpreadsheet,
  Plus,
  Search,
  Wallet,
} from "lucide-react";
import {
  Badge,
  Card,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";

const REPORTS = [
  { name: "Utilisateurs & activation", desc: "Inscriptions, activation, rétention par cohorte", format: "CSV", size: "12 Mo", last: "1 nov. 2026", icon: FileSpreadsheet },
  { name: "Revenus & abonnements", desc: "MRR, ARR, churn, remboursements", format: "XLSX", size: "4,2 Mo", last: "1 nov. 2026", icon: Wallet },
  { name: "Engagement produit", desc: "Sessions, expériences, complétion", format: "CSV", size: "28 Mo", last: "31 oct. 2026", icon: FileBarChart },
  { name: "Modération & sécurité", desc: "Signalements, décisions, délais", format: "PDF", size: "1,8 Mo", last: "31 oct. 2026", icon: FileBarChart },
  { name: "Conformité RGPD", desc: "Demandes, délais, anonymisations", format: "PDF", size: "820 Ko", last: "30 oct. 2026", icon: FileSpreadsheet },
];

const EXPORTS = [
  { name: "Rapport mensuel direction", freq: "Mensuel · le 1ᵉʳ à 08:00", recipients: "3 destinataires", status: "scheduled", next: "1 déc. 2026" },
  { name: "Suivi quotidien incidents", freq: "Quotidien · 07:00", recipients: "Équipe technique", status: "active", next: "2 nov. 2026" },
  { name: "Export comptable", freq: "Mensuel · le 5 à 06:00", recipients: "Finance", status: "active", next: "5 nov. 2026" },
  { name: "Synthèse modération", freq: "Hebdomadaire · lundi", recipients: "2 destinataires", status: "paused", next: "—" },
];

export default function AdminReports() {
  const [search, setSearch] = useState("");

  const rows = REPORTS.filter((r) =>
    `${r.name} ${r.desc}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="ad-enter">
      <PageHeader
        title="Rapports"
        subtitle="Générez et programmez vos exports. Les données sont agrégées ; aucun contenu intime n'est inclus."
        actions={
          <>
            <button className="ad-btn ad-btn-outline">
              <CalendarClock className="size-4" strokeWidth={1.9} />
              Planifier
            </button>
            <button className="ad-btn ad-btn-primary">
              <Plus className="size-4" strokeWidth={2.2} />
              Nouveau rapport
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Rapports disponibles" value="18" delta="5 modèles" tone="plum" />
        <StatTile label="Exports ce mois" value="42" delta="+8" tone="positive" />
        <StatTile label="Exports programmés" value="3" delta="1 en pause" tone="neutral" />
        <StatTile label="Volume généré" value="1,2 Go" delta="ce mois" tone="neutral" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.name} className="ad-card flex flex-col p-[22px]">
              <div className="flex items-start justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl ad-bg-plum-50 ad-plum">
                  <Icon className="size-4" />
                </span>
                <Badge tone="neutral">{r.format}</Badge>
              </div>
              <p className="mt-3 text-[13.5px] font-semibold ad-ink">{r.name}</p>
              <p className="mt-1 flex-1 text-[11.5px] leading-snug ad-muted">{r.desc}</p>
              <div className="mt-4 flex items-center justify-between border-t ad-bd pt-3">
                <span className="text-[10.5px] ad-faint">
                  {r.size} · {r.last}
                </span>
                <button className="inline-flex items-center gap-1 text-[11.5px] font-semibold ad-plum ad-hover-plum-50 rounded-md px-2 py-1">
                  <Download className="size-3.5" /> Télécharger
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <TableCard
        title="Exports programmés"
        subtitle="Envois automatiques et destinataires"
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
        footer={<span>Les exports de plus de 100 000 lignes sont exécutés en tâche de fond.</span>}
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Export</th>
              <th>Fréquence</th>
              <th>Destinataires</th>
              <th>Prochain envoi</th>
              <th>Statut</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {EXPORTS.map((e) => (
              <tr key={e.name}>
                <td className="text-[12.5px] font-medium ad-ink">{e.name}</td>
                <td className="text-[12px] ad-muted">{e.freq}</td>
                <td className="text-[12px]">{e.recipients}</td>
                <td className="text-[12px] ad-muted">{e.next}</td>
                <td>
                  {e.status === "active" ? (
                    <Badge tone="positive">Actif</Badge>
                  ) : e.status === "scheduled" ? (
                    <Badge tone="info">Programmé</Badge>
                  ) : (
                    <Badge tone="neutral">En pause</Badge>
                  )}
                </td>
                <td className="text-right">
                  <button className="ad-btn ad-btn-outline h-8 px-3 text-[11.5px]">Modifier</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <div className="mt-4">
        <Card title="Bonne pratique">
          <p className="text-[11.5px] leading-snug ad-muted">
            Tout export contenant des données personnelles est chiffré, expire après
            7 jours et son téléchargement est inscrit au journal d&apos;audit. Les
            exports ne doivent jamais être partagés hors des canaux internes.
          </p>
        </Card>
      </div>
    </div>
  );
}
