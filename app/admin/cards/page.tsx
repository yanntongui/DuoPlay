"use client";

import { useState } from "react";
import { Copy, EyeOff, Layers, MoreHorizontal, Plus, Search } from "lucide-react";
import {
  Badge,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";

type CardRow = {
  title: string;
  deck: string;
  level: string;
  intensity: "Légère" | "Modérée" | "Passionnée";
  status: "published" | "draft" | "review";
  uses: string;
  note?: string;
};

const CARDS: CardRow[] = [
  { title: "Question de complicité", deck: "Découverte", level: "Niveau 1", intensity: "Légère", status: "published", uses: "12 480" },
  { title: "Souvenir partagé", deck: "Découverte", level: "Niveau 1", intensity: "Légère", status: "published", uses: "9 214" },
  { title: "Défi des sens", deck: "Passion", level: "Niveau 3", intensity: "Passionnée", status: "review", uses: "0", note: "Revue de conformité en cours" },
  { title: "Confiance en soi", deck: "Complicité", level: "Niveau 2", intensity: "Modérée", status: "published", uses: "6 902" },
  { title: "Rêve éveillé", deck: "Passion", level: "Niveau 3", intensity: "Passionnée", status: "draft", uses: "0" },
  { title: "Petit plaisir du quotidien", deck: "Complicité", level: "Niveau 2", intensity: "Modérée", status: "published", uses: "4 118" },
];

const TABS = [
  { id: "all", label: "Toutes" },
  { id: "published", label: "Publiées" },
  { id: "review", label: "En révision" },
  { id: "draft", label: "Brouillons" },
];

export default function AdminCards() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const rows = CARDS.filter((c) => {
    if (tab !== "all" && c.status !== tab) return false;
    if (search && !`${c.title} ${c.deck}`.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="ad-enter">
      <PageHeader
        title="Cartes"
        subtitle="Le catalogue de cartes à jouer. Les contenus intimes sont séparés par niveau et soumis à une validation renforcée."
        actions={
          <>
            <button className="ad-btn ad-btn-outline">Importer un paquet</button>
            <button className="ad-btn ad-btn-primary">
              <Plus className="size-4" strokeWidth={2.2} />
              Nouvelle carte
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Cartes publiées" value="286" delta="+12" tone="positive" />
        <StatTile label="En révision" value="7" delta="à valider" tone="warning" />
        <StatTile label="Paquets actifs" value="9" delta="3 niveaux" tone="plum" />
        <StatTile label="Taux de tirage" value="68 %" delta="+3,4 pts" tone="positive" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { l: "Niveau 1 · Découverte", n: 96, d: "Complicité légère, sans connotation explicite.", tone: "positive" as const },
          { l: "Niveau 2 · Complicité", n: 124, d: "Suggestif, consentement explicite dans l'app.", tone: "plum" as const },
          { l: "Niveau 3 · Passion", n: 66, d: "Réservé aux couples ayant activé le niveau.", tone: "warning" as const },
        ].map((d) => (
          <div key={d.l} className="ad-card p-[22px]">
            <div className="flex items-start justify-between">
              <span className="flex size-9 items-center justify-center rounded-xl ad-bg-plum-50 ad-plum">
                <Layers className="size-4" />
              </span>
              <Badge tone={d.tone}>{d.n} cartes</Badge>
            </div>
            <p className="mt-3 text-[13px] font-semibold ad-ink">{d.l}</p>
            <p className="mt-1 text-[11.5px] leading-snug ad-muted">{d.d}</p>
          </div>
        ))}
      </div>

      <TableCard
        title="Catalogue des cartes"
        subtitle={`${rows.length} carte(s)`}
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
            <div className="relative ml-auto min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une carte…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
              />
            </div>
          </>
        }
        footer={
          <>
            <span className="inline-flex items-center gap-1.5">
              <EyeOff className="size-3.5" /> Le texte des cartes n&apos;est pas affiché dans la console.
            </span>
            <span className="ad-faint">Aperçu nécessitant une habilitation</span>
          </>
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Carte</th>
              <th>Paquet</th>
              <th>Niveau</th>
              <th>Intensité</th>
              <th>Statut</th>
              <th>Tirages</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.title}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg ad-bg-plum-50 ad-plum">
                      <Layers className="size-4" />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-medium ad-ink">{c.title}</p>
                      {c.note && <p className="text-[10.5px] ad-warning">{c.note}</p>}
                    </div>
                  </div>
                </td>
                <td className="text-[12px]">{c.deck}</td>
                <td className="text-[12px] ad-muted">{c.level}</td>
                <td>
                  <Badge tone={c.intensity === "Passionnée" ? "plum" : "neutral"}>
                    {c.intensity}
                  </Badge>
                </td>
                <td>
                  {c.status === "published" ? (
                    <Badge tone="positive">Publiée</Badge>
                  ) : c.status === "review" ? (
                    <Badge tone="info">En révision</Badge>
                  ) : (
                    <Badge tone="warning">Brouillon</Badge>
                  )}
                </td>
                <td className="text-[12px]">{c.uses}</td>
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
