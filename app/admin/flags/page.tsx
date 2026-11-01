"use client";

import { useMemo, useState } from "react";
import { Flag, Plus, Search, ShieldAlert, Users } from "lucide-react";
import {
  Badge,
  Card,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";

type FlagRow = {
  key: string;
  name: string;
  description: string;
  env: "Production" | "Staging";
  rollout: number;
  owner: string;
  enabled: boolean;
  updated: string;
};

const FLAGS: FlagRow[] = [
  { key: "new_onboarding", name: "Nouvel onboarding", description: "Parcours d'accueil en 4 étapes avec aperçu du couple.", env: "Production", rollout: 100, owner: "Produit", enabled: true, updated: "il y a 2 j" },
  { key: "couple_sync_v2", name: "Synchronisation v2", description: "Nouveau moteur de synchronisation temps réel.", env: "Production", rollout: 42, owner: "Technique", enabled: true, updated: "il y a 4 h" },
  { key: "ai_suggestions", name: "Suggestions assistées", description: "Recommandations d'expériences basées sur l'historique.", env: "Staging", rollout: 15, owner: "Produit", enabled: true, updated: "hier" },
  { key: "annual_offer_banner", name: "Bannière offre annuelle", description: "Mise en avant de l'abonnement annuel dans l'app.", env: "Production", rollout: 60, owner: "Marketing", enabled: true, updated: "il y a 6 j" },
  { key: "strict_media_review", name: "Revue média renforcée", description: "Double validation humaine avant publication d'un média.", env: "Production", rollout: 100, owner: "Modération", enabled: true, updated: "il y a 12 j" },
  { key: "legacy_dice_ui", name: "Ancienne interface des dés", description: "Conservée pour retour arrière rapide.", env: "Production", rollout: 0, owner: "Produit", enabled: false, updated: "il y a 1 mois" },
];

const TABS = [
  { id: "all", label: "Tous" },
  { id: "on", label: "Actifs" },
  { id: "off", label: "Inactifs" },
];

export default function AdminFlags() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(FLAGS.map((f) => [f.key, f.enabled])),
  );

  const rows = useMemo(
    () =>
      FLAGS.filter((f) => {
        if (tab === "on" && !state[f.key]) return false;
        if (tab === "off" && state[f.key]) return false;
        if (search && !`${f.name} ${f.key} ${f.owner}`.toLowerCase().includes(search.toLowerCase()))
          return false;
        return true;
      }),
    [tab, search, state],
  );

  return (
    <div className="ad-enter">
      <PageHeader
        title="Feature flags"
        subtitle="Activez, déployez progressivement et revenez en arrière sans redéploiement. Toute bascule est journalisée."
        actions={
          <>
            <button className="ad-btn ad-btn-outline">Historique</button>
            <button className="ad-btn ad-btn-primary">
              <Plus className="size-4" strokeWidth={2.2} />
              Nouveau flag
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Flags actifs" value="5" delta="1 en staging" tone="plum" />
        <StatTile label="Déploiements en cours" value="2" delta="progressif" tone="neutral" />
        <StatTile label="Bascules (24 h)" value="3" delta="journalisées" tone="neutral" />
        <StatTile label="Flags obsolètes" value="1" delta="à nettoyer" tone="warning" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="ad-card-dark flex flex-col justify-between p-[22px] md:col-span-2">
          <div className="relative z-10 flex items-center gap-2">
            <Flag className="size-4 text-white/70" />
            <p className="text-[12.5px] font-medium text-white/70">Déploiement progressif</p>
          </div>
          <div className="relative z-10 mt-3">
            <p className="text-[15px] font-semibold text-white">Synchronisation v2</p>
            <p className="mt-1 text-[11.5px] text-white/55">
              42 % des couples · surveillance des erreurs active
            </p>
          </div>
          <div className="relative z-10 mt-4 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-white" style={{ width: "42%" }} />
            </div>
            <span className="font-mono text-[18px] font-semibold text-white">42 %</span>
          </div>
        </div>
        <Card title="Garde-fous">
          <div className="flex items-start gap-2.5 text-[11.5px] leading-snug ad-muted">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 ad-warning" />
            Un flag touchant les paiements ou la conformité exige l&apos;approbation
            d&apos;un second administrateur.
          </div>
          <div className="mt-3 flex items-start gap-2.5 text-[11.5px] leading-snug ad-muted">
            <Users className="mt-0.5 size-4 shrink-0 ad-plum" />
            Les bascules sont limitées à 20 % par heure en production.
          </div>
        </Card>
      </div>

      <TableCard
        title="Tous les flags"
        subtitle={`${rows.length} flag(s)`}
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
                placeholder="Rechercher un flag…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
              />
            </div>
          </>
        }
        footer={<span>Les flags inactifs depuis 90 jours sont signalés pour suppression.</span>}
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Flag</th>
              <th>Environnement</th>
              <th>Déploiement</th>
              <th>Propriétaire</th>
              <th>Modifié</th>
              <th className="text-right">État</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => (
              <tr key={f.key}>
                <td>
                  <p className="text-[12.5px] font-medium ad-ink">{f.name}</p>
                  <p className="font-mono text-[10.5px] ad-faint">{f.key}</p>
                </td>
                <td>
                  <Badge tone={f.env === "Production" ? "plum" : "neutral"}>{f.env}</Badge>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full ad-bg-sunk">
                      <div
                        className="h-full rounded-full ad-bg-plum"
                        style={{ width: `${f.rollout}%` }}
                      />
                    </div>
                    <span className="text-[11.5px] ad-muted">{f.rollout} %</span>
                  </div>
                </td>
                <td className="text-[12px] ad-muted">{f.owner}</td>
                <td className="text-[11.5px] ad-faint">{f.updated}</td>
                <td className="text-right">
                  <button
                    onClick={() => setState((v) => ({ ...v, [f.key]: !v[f.key] }))}
                    aria-pressed={state[f.key]}
                    className={`relative ml-auto inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      state[f.key] ? "ad-bg-plum" : "ad-bg-sunk ad-bd border"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all ${
                        state[f.key] ? "left-[22px]" : "left-0.5"
                      }`}
                    />
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
