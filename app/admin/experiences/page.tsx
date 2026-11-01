"use client";

import { useState } from "react";
import { Copy, MoreHorizontal, Plus, Search, Sparkles } from "lucide-react";
import {
  Badge,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";

const CONTENT: {
  title: string;
  category: string;
  intensity: string;
  status: "published" | "draft" | "review" | "scheduled";
  uses: string;
  completion: number;
}[] = [
  { title: "Soirée à deux — édition hiver", category: "Intimité", intensity: "Passionnée", status: "published", uses: "1 234", completion: 82 },
  { title: "Parcours « Retrouvailles »", category: "Complicité", intensity: "Modérée", status: "review", uses: "0", completion: 0 },
  { title: "Cartes — niveau passionné", category: "Intimité", intensity: "Passionnée", status: "draft", uses: "0", completion: 0 },
  { title: "Défis du week-end", category: "Activités", intensity: "Légère", status: "published", uses: "3 891", completion: 74 },
  { title: "Roue des envies", category: "Jeux", intensity: "Modérée", status: "scheduled", uses: "0", completion: 0 },
  { title: "Quiz découverte du couple", category: "Complicité", intensity: "Légère", status: "published", uses: "2 108", completion: 91 },
];

const TABS = [
  { id: "all", label: "Tous" },
  { id: "published", label: "Publiés" },
  { id: "review", label: "En révision" },
  { id: "draft", label: "Brouillons" },
  { id: "scheduled", label: "Programmés" },
];

export default function AdminExperiences() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const rows = CONTENT.filter((c) => {
    if (tab !== "all" && c.status !== tab) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="ad-enter">
      <PageHeader
        title="Expériences"
        subtitle="Créez, révisez et publiez les contenus. Chaque publication passe par une seconde validation."
        actions={
          <>
            <button className="ad-btn ad-btn-outline">Importer</button>
            <button className="ad-btn ad-btn-primary">
              <Plus className="size-4" strokeWidth={2.2} />
              Créer une expérience
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Contenus publiés" value="342" delta="+8 ce mois" tone="positive" />
        <StatTile label="En attente de validation" value="11" delta="à traiter" tone="warning" />
        <StatTile label="Taux de complétion moyen" value="81 %" delta="+2,3 pts" tone="positive" />
        <StatTile label="Signalements sur contenu" value="4" delta="-3" tone="neutral" />
      </div>

      <TableCard
        title="Catalogue"
        subtitle={`${rows.length} contenu(s)`}
        toolbar={
          <>
            <div className="flex flex-wrap items-center gap-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`h-8 rounded-full px-3 text-[12px] font-medium transition-colors ${
                    tab === t.id
                      ? "ad-bg-plum text-white"
                      : "ad-muted ad-hover-soft"
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
        footer={
          <>
            <span>Brouillon → Révision → Approbation → Publication</span>
            <span className="ad-faint">Workflow à deux validateurs</span>
          </>
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Contenu</th>
              <th>Catégorie</th>
              <th>Intensité</th>
              <th>Statut</th>
              <th>Utilisations</th>
              <th>Complétion</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.title}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg ad-bg-plum-50 ad-plum">
                      <Sparkles className="size-4" />
                    </span>
                    <span className="text-[12.5px] font-medium ad-ink">{c.title}</span>
                  </div>
                </td>
                <td className="text-[12.5px]">{c.category}</td>
                <td>
                  <Badge tone={c.intensity === "Passionnée" ? "plum" : "neutral"}>
                    {c.intensity}
                  </Badge>
                </td>
                <td>
                  {c.status === "published" ? (
                    <Badge tone="positive">Publié</Badge>
                  ) : c.status === "review" ? (
                    <Badge tone="info">En révision</Badge>
                  ) : c.status === "scheduled" ? (
                    <Badge tone="info">Programmé</Badge>
                  ) : (
                    <Badge tone="warning">Brouillon</Badge>
                  )}
                </td>
                <td className="text-[12.5px]">{c.uses}</td>
                <td className="text-[12.5px]">
                  {c.completion ? `${c.completion} %` : "—"}
                </td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="ad-iab" aria-label="Dupliquer">
                      <Copy className="size-3.5" />
                    </button>
                    <button className="ad-iab" aria-label="Actions">
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
