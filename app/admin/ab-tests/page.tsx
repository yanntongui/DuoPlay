"use client";

import { useState } from "react";
import { FlaskConical, Plus, Search, TrendingUp } from "lucide-react";
import {
  Badge,
  Card,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";

const TESTS = [
  { name: "Onboarding en 3 étapes", hypothesis: "Moins d'étapes augmente l'activation à J+1", metric: "Activation J+1", a: "41,2 %", b: "46,8 %", uplift: "+13,6 %", confidence: "97 %", status: "running" },
  { name: "Paywall après la 2ᵉ expérience", hypothesis: "Un paywall plus tardif réduit le churn", metric: "Conversion premium", a: "8,4 %", b: "9,1 %", uplift: "+8,3 %", confidence: "88 %", status: "running" },
  { name: "Rappel push 19 h vs 21 h", hypothesis: "Le créneau du soir améliore l'ouverture", metric: "Ouverture push", a: "52,1 %", b: "61,4 %", uplift: "+17,8 %", confidence: "99 %", status: "completed" },
  { name: "Cartes avec aperçu visuel", hypothesis: "L'aperçu augmente le tirage", metric: "Tirages / session", a: "3,2", b: "2,9", uplift: "-9,4 %", confidence: "94 %", status: "completed" },
  { name: "Offre annuelle mise en avant", hypothesis: "La mise en avant augmente la part d'annuel", metric: "Part d'annuel", a: "—", b: "—", uplift: "—", confidence: "—", status: "draft" },
];

const TABS = [
  { id: "all", label: "Tous" },
  { id: "running", label: "En cours" },
  { id: "completed", label: "Terminés" },
  { id: "draft", label: "Brouillons" },
];

export default function AdminAbTests() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const rows = TESTS.filter((t) => {
    if (tab !== "all" && t.status !== tab) return false;
    if (search && !`${t.name} ${t.metric}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="ad-enter">
      <PageHeader
        title="Tests A/B"
        subtitle="Mesurez l'effet réel de chaque changement. Un test n'est concluant qu'avec une puissance statistique suffisante."
        actions={
          <>
            <button className="ad-btn ad-btn-outline">Guide de test</button>
            <button className="ad-btn ad-btn-primary">
              <Plus className="size-4" strokeWidth={2.2} />
              Nouveau test
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Tests en cours" value="2" delta="2 gagnants" tone="positive" />
        <StatTile label="Tests terminés (90 j)" value="11" delta="8 concluants" tone="plum" />
        <StatTile label="Uplift moyen" value="+9,4 %" delta="sur les gagnants" tone="positive" />
        <StatTile label="Tests abandonnés" value="2" delta="puissance insuffisante" tone="warning" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card
          title="Test en cours — Onboarding en 3 étapes"
          subtitle="Activation J+1 · 12 408 participants"
          className="xl:col-span-8"
          action={<Badge tone="positive">97 % de confiance</Badge>}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border ad-bd ad-bg-soft p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] ad-faint">
                  Variante A
                </span>
                <Badge tone="neutral">Contrôle</Badge>
              </div>
              <p className="mt-2 text-[30px] font-semibold leading-none tracking-[-0.03em] ad-ink">
                41,2 %
              </p>
              <p className="mt-1 text-[11.5px] ad-muted">Taux d&apos;activation</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full ad-bg-sunk">
                <div className="h-full rounded-full" style={{ width: "41%", background: "var(--ad-line-strong)" }} />
              </div>
            </div>
            <div className="rounded-2xl border ad-bd-plum ad-bg-plum-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] ad-faint">
                  Variante B
                </span>
                <Badge tone="positive">Gagnante</Badge>
              </div>
              <p className="mt-2 text-[30px] font-semibold leading-none tracking-[-0.03em] ad-plum">
                46,8 %
              </p>
              <p className="mt-1 text-[11.5px] ad-muted">Taux d&apos;activation</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full ad-bg-sunk">
                <div className="h-full rounded-full ad-bg-plum" style={{ width: "46.8%" }} />
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl ad-bg-soft px-3 py-2.5">
            <span className="text-[11.5px] ad-muted">
              Durée prévue : 14 jours · 4 jours restants
            </span>
            <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold ad-positive">
              <TrendingUp className="size-3.5" /> +13,6 % d&apos;activation
            </span>
          </div>
        </Card>

        <Card title="Règle d'arrêt" className="xl:col-span-4">
          <div className="space-y-3 text-[11.5px] leading-snug ad-muted">
            <div className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full ad-bg-plum" />
              Arrêt automatique si la confiance dépasse 99 % pendant 48 h.
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full ad-bg-plum" />
              Aucun test ne peut toucher plus de 50 % des utilisateurs.
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full ad-bg-plum" />
              Les mineurs et comptes sensibles sont exclus par défaut.
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full ad-bg-warning-solid" />
              Un test sur le prix exige une revue conformité.
            </div>
          </div>
        </Card>
      </div>

      <TableCard
        title="Tous les tests"
        subtitle={`${rows.length} test(s)`}
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
        footer={<span>Les résultats sont figés après 30 jours et archivés automatiquement.</span>}
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Test</th>
              <th>Métrique</th>
              <th>A</th>
              <th>B</th>
              <th>Uplift</th>
              <th>Confiance</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.name}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg ad-bg-plum-50 ad-plum">
                      <FlaskConical className="size-4" />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-medium ad-ink">{t.name}</p>
                      <p className="max-w-[260px] truncate text-[10.5px] ad-faint">{t.hypothesis}</p>
                    </div>
                  </div>
                </td>
                <td className="text-[12px] ad-muted">{t.metric}</td>
                <td className="text-[12.5px]">{t.a}</td>
                <td className="text-[12.5px]">{t.b}</td>
                <td>
                  <span
                    className={`text-[12.5px] font-semibold ${
                      t.uplift.startsWith("+")
                        ? "ad-positive"
                        : t.uplift.startsWith("-")
                          ? "ad-danger"
                          : "ad-faint"
                    }`}
                  >
                    {t.uplift}
                  </span>
                </td>
                <td className="text-[12px] ad-muted">{t.confidence}</td>
                <td>
                  {t.status === "running" ? (
                    <Badge tone="info">En cours</Badge>
                  ) : t.status === "completed" ? (
                    <Badge tone="positive">Terminé</Badge>
                  ) : (
                    <Badge tone="warning">Brouillon</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
