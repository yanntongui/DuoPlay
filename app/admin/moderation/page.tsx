"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  EyeOff,
  Flag,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Timer,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Card,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";

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

const REPORTS: Report[] = [
  { id: "sig_8841", content: "Carte « Défi des sens »", motif: "Contenu explicite non conforme", severity: "high", reporter: "Camille R.", date: "il y a 12 min", status: "pending", category: "Contenu" },
  { id: "sig_8840", content: "Message privé — fil c_2201", motif: "Harcèlement signalé", severity: "high", reporter: "Nadia E.", date: "il y a 38 min", status: "in_progress", category: "Comportement" },
  { id: "sig_8839", content: "Profil « Marco M. »", motif: "Usurpation d'identité", severity: "medium", reporter: "Sofia R.", date: "il y a 1 h", status: "pending", category: "Compte" },
  { id: "sig_8838", content: "Expérience « Soirée à deux »", motif: "Image potentiellement choquante", severity: "medium", reporter: "Diego F.", date: "il y a 2 h", status: "in_progress", category: "Contenu" },
  { id: "sig_8837", content: "Avis App Store", motif: "Avis frauduleux suspecté", severity: "low", reporter: "Système", date: "il y a 5 h", status: "pending", category: "Réputation" },
  { id: "sig_8836", content: "Signalement groupé (4 comptes)", motif: "Spam / bots", severity: "low", reporter: "Système", date: "hier", status: "resolved", category: "Compte" },
];

const TABS = [
  { id: "all", label: "Tous" },
  { id: "pending", label: "À traiter" },
  { id: "in_progress", label: "En cours" },
  { id: "resolved", label: "Traités" },
];

function Severity({ value }: { value: Report["severity"] }) {
  if (value === "high") return <Badge tone="danger">Critique</Badge>;
  if (value === "medium") return <Badge tone="warning">Moyenne</Badge>;
  return <Badge tone="neutral">Faible</Badge>;
}

export default function AdminModeration() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const rows = REPORTS.filter((r) => {
    if (tab !== "all" && r.status !== tab) return false;
    if (search && !`${r.id} ${r.motif} ${r.content}`.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="ad-enter">
      <PageHeader
        title="Modération"
        subtitle="Traitez les signalements dans un cadre tracé. Le contenu intime n'est visible qu'après habilitation explicite."
        actions={
          <>
            <button className="ad-btn ad-btn-outline">
              <ShieldCheck className="size-4" strokeWidth={1.9} />
              Règles de modération
            </button>
            <button className="ad-btn ad-btn-wine">
              <AlertTriangle className="size-4" strokeWidth={2} />
              File prioritaire
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Signalements en attente" value="12" delta="+4" tone="warning" />
        <StatTile label="Délai moyen de traitement" value="3 h 12" delta="-24 min" tone="positive" />
        <StatTile label="Signalements confirmés" value="38 %" delta="+2 pts" tone="plum" />
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
        subtitle={`${rows.length} signalement(s) affiché(s)`}
        toolbar={
          <>
            <div className="flex items-center gap-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`h-8 rounded-full px-3 text-[12px] font-medium transition-colors ${
                    tab === t.id ? "ad-bg-plum text-white" : "ad-muted ad-hover-soft"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="relative ml-auto min-w-[210px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un signalement…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
              />
            </div>
          </>
        }
        footer={
          <>
            <span className="inline-flex items-center gap-1.5">
              <Timer className="size-3.5" /> SLA interne : 4 h ouvrées pour les cas critiques
            </span>
            <span className="ad-faint">Double validation requise pour une suppression définitive</span>
          </>
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
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg ad-bg-plum-50 ad-plum">
                      <Flag className="size-4" />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-medium ad-ink">{r.content}</p>
                      <p className="text-[11px] ad-faint">
                        {r.id} · {r.category}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="max-w-[240px] truncate text-[12px]">{r.motif}</td>
                <td>
                  <Severity value={r.severity} />
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Avatar name={r.reporter} size={26} />
                    <span className="text-[12px]">{r.reporter}</span>
                  </div>
                </td>
                <td className="text-[12px] ad-muted">{r.date}</td>
                <td>
                  {r.status === "resolved" ? (
                    <Badge tone="positive">
                      <CheckCircle2 className="size-3" /> Traité
                    </Badge>
                  ) : r.status === "in_progress" ? (
                    <Badge tone="info">En cours</Badge>
                  ) : (
                    <Badge tone="warning">À traiter</Badge>
                  )}
                </td>
                <td className="text-right">
                  <button className="ad-iab ml-auto" aria-label="Actions">
                    <MoreHorizontal className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
