"use client";

import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Filter,
  Plus,
  Search,
  Sparkles,
  UsersRound,
} from "lucide-react";
import {
  Badge,
  Card,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";

const SEGMENTS = [
  { name: "Nouveaux couples", desc: "Inscrits depuis moins de 14 jours", size: "12 408", growth: "+8,2 %", type: "Cycle de vie", updated: "il y a 2 h", tone: "positive" as const },
  { name: "Actifs hebdomadaires", desc: "Au moins 3 sessions sur 7 jours", size: "24 582", growth: "+5,1 %", type: "Engagement", updated: "il y a 1 h", tone: "positive" as const },
  { name: "À risque de churn", desc: "Aucune session depuis 21 jours", size: "3 142", growth: "+12,4 %", type: "Rétention", updated: "il y a 4 h", tone: "danger" as const },
  { name: "Abonnés annuels", desc: "Offre annuelle active", size: "4 902", growth: "+2,4 %", type: "Revenus", updated: "hier", tone: "plum" as const },
  { name: "Invitations non acceptées", desc: "Partenaire invité sans réponse sous 7 j", size: "312", growth: "-3,1 %", type: "Activation", updated: "il y a 6 h", tone: "warning" as const },
];

const RULES = [
  { field: "Plan", op: "est", value: "Premium" },
  { field: "Dernière session", op: "il y a plus de", value: "14 jours" },
  { field: "Pays", op: "parmi", value: "France, Belgique" },
];

export default function AdminSegments() {
  const [search, setSearch] = useState("");

  const rows = SEGMENTS.filter((s) =>
    `${s.name} ${s.type}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="ad-enter">
      <PageHeader
        title="Segments"
        subtitle="Regroupez les utilisateurs par comportement pour cibler les campagnes. Les segments sont recalculés chaque nuit."
        actions={
          <>
            <button className="ad-btn ad-btn-outline">
              <Download className="size-4" strokeWidth={1.9} />
              Exporter
            </button>
            <button className="ad-btn ad-btn-primary">
              <Plus className="size-4" strokeWidth={2.2} />
              Créer un segment
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Segments actifs" value="18" delta="3 dynamiques" tone="plum" />
        <StatTile label="Utilisateurs segmentés" value="31 204" delta="+4,2 %" tone="positive" />
        <StatTile label="Segments sans campagne" value="4" delta="à activer" tone="warning" />
        <StatTile label="Taux de correspondance" value="92 %" delta="couverture" tone="neutral" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card
          title="Aperçu du segment"
          subtitle="Brouillon · non enregistré"
          className="xl:col-span-5"
          action={<Badge tone="neutral">Brouillon</Badge>}
        >
          <div className="space-y-2">
            {RULES.map((r) => (
              <div
                key={r.field}
                className="flex flex-wrap items-center gap-2 rounded-xl ad-bg-soft px-3 py-2.5"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] ad-faint">
                  {r.field}
                </span>
                <span className="text-[12px] ad-muted">{r.op}</span>
                <span className="rounded-md bg-white px-2 py-0.5 text-[12px] font-medium ad-ink">
                  {r.value}
                </span>
              </div>
            ))}
          </div>
          <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed ad-bd-strong py-2.5 text-[12px] font-medium ad-muted ad-hover-soft">
            <Plus className="size-3.5" /> Ajouter une condition
          </button>
          <div className="mt-4 flex items-center justify-between rounded-xl ad-bg-plum-50 p-3">
            <div>
              <p className="text-[11px] ad-muted">Estimation</p>
              <p className="text-[20px] font-semibold tracking-[-0.02em] ad-plum">2 418</p>
            </div>
            <UsersRound className="size-6 ad-plum" />
          </div>
        </Card>

        <Card title="Segments les plus sollicités" className="xl:col-span-7">
          <div className="space-y-3">
            {[
              { l: "Onboarding — J+3", v: "14 campagnes", w: 82 },
              { l: "Relance panier / offre", v: "9 campagnes", w: 56 },
              { l: "À risque de churn", v: "6 campagnes", w: 38 },
              { l: "Ambassadeurs", v: "3 campagnes", w: 18 },
            ].map((s) => (
              <div key={s.l}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[12px] ad-soft">{s.l}</span>
                  <span className="text-[11.5px] ad-muted">{s.v}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full ad-bg-sunk">
                  <div className="h-full rounded-full ad-bg-plum" style={{ width: `${s.w}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-xl ad-bg-soft p-3 text-[11.5px] ad-muted">
            <Sparkles className="mt-0.5 size-4 shrink-0 ad-plum" />
            Astuce : un segment de moins de 500 personnes limite la pertinence
            statistique des tests A/B.
          </div>
        </Card>
      </div>

      <TableCard
        title="Tous les segments"
        subtitle={`${rows.length} segment(s)`}
        action={
          <div className="flex items-center gap-2">
            <div className="relative min-w-[190px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
              />
            </div>
            <button className="ad-btn ad-btn-outline h-9 px-3 text-[12px]">
              <Filter className="size-3.5" /> Type
            </button>
          </div>
        }
        footer={<span>Recalcul automatique chaque nuit à 03:00 (Europe/Paris).</span>}
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Segment</th>
              <th>Type</th>
              <th>Taille</th>
              <th>Évolution 30 j</th>
              <th>Actualisé</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.name}>
                <td>
                  <p className="text-[12.5px] font-medium ad-ink">{s.name}</p>
                  <p className="text-[11px] ad-faint">{s.desc}</p>
                </td>
                <td>
                  <Badge tone="neutral">{s.type}</Badge>
                </td>
                <td className="text-[12.5px] font-medium ad-ink">{s.size}</td>
                <td>
                  <Badge tone={s.tone}>
                    {s.growth.startsWith("-") ? (
                      <ArrowDownRight className="size-3" />
                    ) : (
                      <ArrowUpRight className="size-3" />
                    )}
                    {s.growth}
                  </Badge>
                </td>
                <td className="text-[11.5px] ad-faint">{s.updated}</td>
                <td className="text-right">
                  <button className="ad-btn ad-btn-outline h-8 px-3 text-[11.5px]">
                    Cibler
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
