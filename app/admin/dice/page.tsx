"use client";

import { useState } from "react";
import { Dices, MoreHorizontal, Plus, Search } from "lucide-react";
import {
  Badge,
  Card,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";

const DICE = [
  { name: "Dé de la complicité", faces: 6, intensity: "Légère", status: "published", uses: "8 402", theme: "Complicité" },
  { name: "Dé des envies", faces: 12, intensity: "Modérée", status: "published", uses: "5 118", theme: "Désir" },
  { name: "Dé des défis", faces: 8, intensity: "Modérée", status: "published", uses: "3 902", theme: "Jeux" },
  { name: "Dé des souvenirs", faces: 6, intensity: "Légère", status: "review", uses: "0", theme: "Nostalgie" },
  { name: "Dé passionné", faces: 20, intensity: "Passionnée", status: "draft", uses: "0", theme: "Intimité" },
];

const TABS = [
  { id: "all", label: "Tous" },
  { id: "published", label: "Publiés" },
  { id: "review", label: "En révision" },
  { id: "draft", label: "Brouillons" },
];

export default function AdminDice() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const rows = DICE.filter((d) => {
    if (tab !== "all" && d.status !== tab) return false;
    if (search && !`${d.name} ${d.theme}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="ad-enter">
      <PageHeader
        title="Dés"
        subtitle="Configurez les dés et leurs faces. Chaque face suit les mêmes règles de validation que les cartes."
        actions={
          <button className="ad-btn ad-btn-primary">
            <Plus className="size-4" strokeWidth={2.2} />
            Nouveau dé
          </button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Dés actifs" value="14" delta="+2" tone="positive" />
        <StatTile label="Faces au total" value="186" delta="+24" tone="plum" />
        <StatTile label="En révision" value="3" delta="à valider" tone="warning" />
        <StatTile label="Lancers (30 j)" value="94 208" delta="+11,2 %" tone="positive" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card title="Répartition des lancers" subtitle="Par thème · 30 derniers jours" className="xl:col-span-7">
          <div className="space-y-3.5">
            {[
              { l: "Complicité", v: "34 %", w: 34 },
              { l: "Désir", v: "28 %", w: 28 },
              { l: "Jeux", v: "21 %", w: 21 },
              { l: "Nostalgie", v: "11 %", w: 11 },
              { l: "Autres", v: "6 %", w: 6 },
            ].map((t) => (
              <div key={t.l}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[12px] ad-soft">{t.l}</span>
                  <span className="text-[12px] font-semibold ad-ink">{t.v}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full ad-bg-sunk">
                  <div className="h-full rounded-full ad-bg-plum" style={{ width: `${t.w}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Contrôle qualité" className="xl:col-span-5">
          <div className="flex flex-wrap gap-2">
            {[6, 8, 12, 20].map((f) => (
              <div
                key={f}
                className="flex size-16 flex-col items-center justify-center rounded-2xl border ad-bd ad-bg-soft"
              >
                <Dices className="size-5 ad-plum" />
                <span className="mt-1 text-[10.5px] font-semibold ad-muted">{f} faces</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11.5px] leading-snug ad-muted">
            Les dés de plus de 12 faces sont réservés aux couples ayant explicitement
            activé le niveau correspondant. Aucun contenu n&apos;est affiché ici.
          </p>
          <div className="mt-3">
            <Badge tone="positive">Conforme aux règles de contenu</Badge>
          </div>
        </Card>
      </div>

      <TableCard
        title="Tous les dés"
        subtitle={`${rows.length} dé(s)`}
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
            <div className="relative ml-auto min-w-[190px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
              />
            </div>
          </>
        }
        footer={<span>Un dé ne peut être publié qu&apos;après validation de toutes ses faces.</span>}
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Dé</th>
              <th>Thème</th>
              <th>Faces</th>
              <th>Intensité</th>
              <th>Statut</th>
              <th>Lancers</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.name}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg ad-bg-plum-50 ad-plum">
                      <Dices className="size-4" />
                    </span>
                    <span className="text-[12.5px] font-medium ad-ink">{d.name}</span>
                  </div>
                </td>
                <td className="text-[12px] ad-muted">{d.theme}</td>
                <td className="text-[12.5px]">{d.faces}</td>
                <td>
                  <Badge tone={d.intensity === "Passionnée" ? "plum" : "neutral"}>{d.intensity}</Badge>
                </td>
                <td>
                  {d.status === "published" ? (
                    <Badge tone="positive">Publié</Badge>
                  ) : d.status === "review" ? (
                    <Badge tone="info">En révision</Badge>
                  ) : (
                    <Badge tone="warning">Brouillon</Badge>
                  )}
                </td>
                <td className="text-[12px]">{d.uses}</td>
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
