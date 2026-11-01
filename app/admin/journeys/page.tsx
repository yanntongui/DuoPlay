"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Clock, Plus, Route, Search } from "lucide-react";
import {
  Badge,
  Card,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";

const JOURNEYS = [
  { name: "Retrouvailles", steps: 7, couples: "4 902", completion: 74, duration: "7 jours", status: "published", owner: "Amina D." },
  { name: "Premiers pas à deux", steps: 5, couples: "12 408", completion: 88, duration: "5 jours", status: "published", owner: "Amina D." },
  { name: "Découverte des envies", steps: 9, couples: "2 118", completion: 61, duration: "14 jours", status: "review", owner: "Sofia R." },
  { name: "Rituel du dimanche", steps: 4, couples: "—", completion: 0, duration: "4 semaines", status: "draft", owner: "Yann T." },
  { name: "Anniversaire de couple", steps: 6, couples: "890", completion: 92, duration: "1 jour", status: "published", owner: "Marc L." },
];

export default function AdminJourneys() {
  const [search, setSearch] = useState("");

  const rows = JOURNEYS.filter((j) =>
    `${j.name} ${j.owner}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="ad-enter">
      <PageHeader
        title="Parcours"
        subtitle="Des séquences guidées qui installent une habitude douce. Suivez la progression sans jamais lire les réponses."
        actions={
          <>
            <button className="ad-btn ad-btn-outline">
              <Route className="size-4" strokeWidth={1.9} />
              Modèles
            </button>
            <button className="ad-btn ad-btn-primary">
              <Plus className="size-4" strokeWidth={2.2} />
              Nouveau parcours
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Parcours actifs" value="12" delta="+2" tone="positive" />
        <StatTile label="Couples engagés" value="18 204" delta="+6,8 %" tone="plum" />
        <StatTile label="Complétion moyenne" value="79 %" delta="+1,9 pt" tone="positive" />
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
        subtitle={`${rows.length} parcours`}
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
              <Check className="size-3.5" /> Validation à deux avant publication
            </span>
            <span className="ad-faint">Aucune réponse individuelle accessible</span>
          </>
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
            </tr>
          </thead>
          <tbody>
            {rows.map((j) => (
              <tr key={j.name}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg ad-bg-plum-50 ad-plum">
                      <Route className="size-4" />
                    </span>
                    <span className="text-[12.5px] font-medium ad-ink">{j.name}</span>
                  </div>
                </td>
                <td className="text-[12.5px]">{j.steps}</td>
                <td className="text-[12.5px]">{j.couples}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full ad-bg-sunk">
                      <div className="h-full rounded-full ad-bg-plum" style={{ width: `${j.completion}%` }} />
                    </div>
                    <span className="text-[11.5px] ad-muted">{j.completion ? `${j.completion} %` : "—"}</span>
                  </div>
                </td>
                <td className="text-[12px] ad-muted">{j.duration}</td>
                <td>
                  {j.status === "published" ? (
                    <Badge tone="positive">Publié</Badge>
                  ) : j.status === "review" ? (
                    <Badge tone="info">En révision</Badge>
                  ) : (
                    <Badge tone="warning">Brouillon</Badge>
                  )}
                </td>
                <td className="text-[12px] ad-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3 ad-faint" /> {j.owner}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
