"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Download, Search, Wallet } from "lucide-react";
import {
  Badge,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";

const TX = [
  { id: "tx_2291", user: "Camille R.", type: "Abonnement", amount: "9,99 €", status: "completed", date: "1 nov. 2026", method: "Visa •• 4021" },
  { id: "tx_2290", user: "Lukas B.", type: "Abonnement annuel", amount: "79,00 €", status: "completed", date: "1 nov. 2026", method: "Mastercard •• 8812" },
  { id: "tx_2289", user: "Diego F.", type: "Abonnement", amount: "9,99 €", status: "failed", date: "31 oct. 2026", method: "Visa •• 1190" },
  { id: "tx_2288", user: "Nadia E.", type: "Remboursement", amount: "-9,99 €", status: "completed", date: "31 oct. 2026", method: "Visa •• 7743" },
  { id: "tx_2287", user: "Marta N.", type: "Abonnement", amount: "9,99 €", status: "pending", date: "30 oct. 2026", method: "SEPA" },
];

const MONTHS = [
  { m: "Mai", v: 52 },
  { m: "Juin", v: 61 },
  { m: "Juil.", v: 58 },
  { m: "Août", v: 66 },
  { m: "Sept.", v: 78 },
  { m: "Oct.", v: 88 },
  { m: "Nov.", v: 72 },
];

export default function AdminFinance() {
  const [search, setSearch] = useState("");

  const rows = TX.filter((t) =>
    `${t.id} ${t.user}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="ad-enter">
      <PageHeader
        title="Finance"
        subtitle="Paiements, abonnements et remboursements. Aucune donnée bancaire complète n'est stockée dans DuoPlay."
        actions={
          <>
            <button className="ad-btn ad-btn-outline">
              <Download className="size-4" strokeWidth={1.9} />
              Export comptable
            </button>
            <button className="ad-btn ad-btn-wine">Enregistrer un remboursement</button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Revenus du mois" value="45 678 €" delta="+9,3 %" tone="positive" />
        <StatTile label="MRR" value="38 420 €" delta="+4,1 %" tone="positive" />
        <StatTile label="Abonnements actifs" value="12 340" delta="+112" tone="plum" />
        <StatTile label="Remboursements" value="234 €" delta="4 dossiers" tone="warning" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="ad-card xl:col-span-8">
          <div className="ad-card-head pb-4">
            <div>
              <h2 className="ad-card-title">Chiffre d&apos;affaires</h2>
              <p className="mt-0.5 text-[12px] ad-muted">7 derniers mois · net de taxes</p>
            </div>
            <Badge tone="positive">
              <ArrowUpRight className="size-3" /> +9,3 %
            </Badge>
          </div>
          <div className="flex h-[196px] items-end gap-2 px-[22px] pb-[22px] sm:gap-4">
            {MONTHS.map((m, i) => (
              <div key={m.m} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full max-w-[54px] items-end" style={{ height: 150 }}>
                  <div
                    className={i === MONTHS.length - 2 ? "ad-bar w-full" : "ad-bar-muted w-full"}
                    style={{ height: `${m.v}%` }}
                  />
                </div>
                <span className={`text-[10.5px] ${i === MONTHS.length - 2 ? "font-semibold ad-ink" : "ad-faint"}`}>
                  {m.m}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="ad-card flex flex-col p-[22px] xl:col-span-4">
          <h2 className="ad-card-title">Répartition</h2>
          <div className="mt-4 space-y-3.5">
            {[
              { l: "Abonnements mensuels", v: "62 %", w: 62 },
              { l: "Abonnements annuels", v: "31 %", w: 31 },
              { l: "Achats ponctuels", v: "7 %", w: 7 },
            ].map((r) => (
              <div key={r.l}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[12px] ad-soft">{r.l}</span>
                  <span className="text-[12px] font-semibold ad-ink">{r.v}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full ad-bg-sunk">
                  <div className="h-full rounded-full ad-bg-plum" style={{ width: `${r.w}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-center gap-2 rounded-xl ad-bg-soft p-3 text-[11.5px] ad-muted">
            <Wallet className="size-4 shrink-0 ad-plum" />
            Paiements tokenisés via Stripe. Les numéros de carte ne transitent
            jamais par nos serveurs.
          </div>
        </section>
      </div>

      <TableCard
        title="Transactions récentes"
        subtitle={`${rows.length} transaction(s)`}
        action={
          <div className="relative min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ID ou utilisateur…"
              className="ad-input h-9 ad-pl-9 text-[12.5px]"
            />
          </div>
        }
        footer={<span>Les remboursements supérieurs à 100 € exigent une double validation.</span>}
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Client</th>
              <th>Type</th>
              <th>Montant</th>
              <th>Moyen</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td className="font-mono text-[11.5px] ad-faint">{t.id}</td>
                <td className="text-[12.5px] font-medium ad-ink">{t.user}</td>
                <td className="text-[12.5px]">{t.type}</td>
                <td className={`text-[12.5px] font-semibold ${t.amount.startsWith("-") ? "ad-danger" : "ad-ink"}`}>
                  {t.amount}
                </td>
                <td className="text-[12px] ad-muted">{t.method}</td>
                <td>
                  {t.status === "completed" ? (
                    <Badge tone="positive">Réussi</Badge>
                  ) : t.status === "failed" ? (
                    <Badge tone="danger">
                      <ArrowDownRight className="size-3" /> Échec
                    </Badge>
                  ) : (
                    <Badge tone="warning">En attente</Badge>
                  )}
                </td>
                <td className="text-[12px] ad-muted">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
