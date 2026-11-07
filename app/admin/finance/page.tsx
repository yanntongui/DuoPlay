"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  FileText,
  RefreshCw,
  Search,
  Undo2,
  Wallet,
} from "lucide-react";
import {
  Badge,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";
import {
  DemoCreateDialog,
  DemoPagination,
  DemoPill,
  DemoToast,
  RowMenu,
  exportCsv,
  useDemoRows,
} from "@/components/admin/demo-kit";

type TxStatus = "completed" | "failed" | "pending";

type Transaction = {
  id: string;
  user: string;
  type: string;
  amount: string;
  status: TxStatus;
  date: string;
  method: string;
};

const SEED: Transaction[] = [
  { id: "tx_2291", user: "Camille R.", type: "Abonnement", amount: "9,99 €", status: "completed", date: "2026-11-01", method: "Visa •• 4021" },
  { id: "tx_2290", user: "Lukas B.", type: "Abonnement annuel", amount: "79,00 €", status: "completed", date: "2026-11-01", method: "Mastercard •• 8812" },
  { id: "tx_2289", user: "Diego F.", type: "Abonnement", amount: "9,99 €", status: "failed", date: "2026-10-31", method: "Visa •• 1190" },
  { id: "tx_2288", user: "Nadia E.", type: "Remboursement", amount: "-9,99 €", status: "completed", date: "2026-10-31", method: "Visa •• 7743" },
  { id: "tx_2287", user: "Marta N.", type: "Abonnement", amount: "9,99 €", status: "pending", date: "2026-10-30", method: "SEPA" },
  { id: "tx_2286", user: "Léa D.", type: "Abonnement annuel", amount: "79,00 €", status: "completed", date: "2026-10-29", method: "Visa •• 2245" },
  { id: "tx_2285", user: "Samir K.", type: "Abonnement", amount: "9,99 €", status: "completed", date: "2026-10-28", method: "Mastercard •• 5510" },
  { id: "tx_2284", user: "Clara V.", type: "Abonnement", amount: "9,99 €", status: "failed", date: "2026-10-27", method: "Visa •• 9032" },
  { id: "tx_2283", user: "Hugo V.", type: "Achat ponctuel", amount: "4,99 €", status: "completed", date: "2026-10-26", method: "Apple Pay" },
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

const PAGE_SIZE = 5;
const STORAGE_KEY = "duoplay.admin.finance.v1";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date);
}

function parseAmount(amount: string): number {
  const normalised = amount.replace(/\s/g, "").replace("€", "").replace(",", ".");
  const value = Number.parseFloat(normalised);
  return Number.isFinite(value) ? value : 0;
}

function formatAmount(value: number): string {
  return `${value.toFixed(2).replace(".", ",")} €`;
}

function statusBadge(status: TxStatus) {
  if (status === "completed") return <Badge tone="positive">Réussi</Badge>;
  if (status === "failed") {
    return (
      <Badge tone="danger">
        <ArrowDownRight className="size-3" /> Échec
      </Badge>
    );
  }
  return <Badge tone="warning">En attente</Badge>;
}

export default function AdminFinance() {
  const [rows, setRows] = useDemoRows<Transaction>(STORAGE_KEY, SEED);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setPage(0);
  }, [search, status]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        const query = search.trim().toLowerCase();
        if (query && !`${row.id} ${row.user} ${row.method}`.toLowerCase().includes(query)) {
          return false;
        }
        if (status !== "all" && row.status !== status) return false;
        return true;
      }),
    [rows, search, status],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeEnd = safePage * PAGE_SIZE + visible.length;

  const refunded = rows.filter((row) => row.type === "Remboursement").length;
  const pending = rows.filter((row) => row.status === "pending").length;
  const failed = rows.filter((row) => row.status === "failed").length;

  function nextTxId(): string {
    const highest = rows.reduce((max, row) => {
      const match = /^tx_(\d+)$/.exec(row.id);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 2_283);
    return `tx_${highest + 1}`;
  }

  function retry(row: Transaction) {
    setRows((current) =>
      current.map((item) =>
        item.id === row.id ? { ...item, status: "completed" as TxStatus } : item,
      ),
    );
    setToast(`Paiement ${row.id} relancé et accepté.`);
  }

  function refund(row: Transaction) {
    const amount = parseAmount(row.amount);
    const value = amount < 0 ? -amount : amount;
    const refundRow: Transaction = {
      id: nextTxId(),
      user: row.user,
      type: "Remboursement",
      amount: formatAmount(-value),
      status: "completed",
      date: new Date().toISOString().slice(0, 10),
      method: row.method,
    };
    setRows((current) => [refundRow, ...current]);
    setPage(0);
    setToast(`Remboursement de ${formatAmount(value)} enregistré (${row.user}).`);
  }

  function handleExport() {
    const ok = exportCsv(
      `duoplay-comptable-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: "id", label: "Transaction" },
        { key: "user", label: "Client" },
        { key: "type", label: "Type" },
        { key: "amount", label: "Montant" },
        { key: "method", label: "Moyen" },
        { key: "status", label: "Statut" },
        { key: "date", label: "Date" },
      ],
      filtered.map((row) => ({ ...row, date: formatDate(row.date) })),
    );
    setToast(
      ok
        ? `${filtered.length} transaction(s) exportée(s).`
        : "Aucune transaction à exporter avec ces filtres.",
    );
  }

  return (
    <div className="ad-enter">
      <PageHeader
        title="Finance"
        subtitle="Paiements, abonnements et remboursements. Aucune donnée bancaire complète n'est stockée dans DuoPlay."
        actions={
          <>
            <DemoPill />
            <button
              type="button"
              className="ad-btn ad-btn-outline"
              onClick={handleExport}
            >
              <Download className="size-4" strokeWidth={1.9} />
              Export comptable
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-primary"
              onClick={() => setDialogOpen(true)}
            >
              Enregistrer un remboursement
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Revenus du mois" value="45 678 €" delta="+9,3 %" tone="positive" />
        <StatTile label="MRR" value="38 420 €" delta="+4,1 %" tone="positive" />
        <StatTile label="Abonnements actifs" value="12 340" delta="+112" tone="plum" />
        <StatTile
          label="Remboursements"
          value={String(refunded)}
          delta={`${pending} en attente · ${failed} échec(s)`}
          tone="warning"
        />
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
        subtitle={`${filtered.length} transaction(s) sur ${rows.length}`}
        toolbar={
          <>
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ID, client ou moyen de paiement…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
                aria-label="Rechercher une transaction"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="ad-select h-9 text-[12.5px]"
              aria-label="Filtrer par statut"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Réussi</option>
              <option value="pending">En attente</option>
              <option value="failed">Échec</option>
            </select>
          </>
        }
        footer={
          <DemoPagination
            page={safePage}
            pageCount={pageCount}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            total={filtered.length}
            onPage={setPage}
            note="Les remboursements supérieurs à 100 € exigent une double validation."
          />
        }
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
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-[12.5px] ad-muted">
                  Aucune transaction ne correspond à ces critères.
                </td>
              </tr>
            )}
            {visible.map((row) => (
              <tr key={row.id}>
                <td className="font-mono text-[11.5px] ad-faint">{row.id}</td>
                <td className="text-[12.5px] font-medium ad-ink">{row.user}</td>
                <td className="text-[12.5px]">{row.type}</td>
                <td className={`text-[12.5px] font-semibold ${row.amount.startsWith("-") ? "ad-danger" : "ad-ink"}`}>
                  {row.amount}
                </td>
                <td className="text-[12px] ad-muted">{row.method}</td>
                <td>{statusBadge(row.status)}</td>
                <td className="text-[12px] ad-muted">{formatDate(row.date)}</td>
                <td className="text-right">
                  <RowMenu
                    label={row.id}
                    items={[
                      {
                        label: "Voir le reçu",
                        icon: <FileText className="size-3.5" />,
                        onSelect: () =>
                          setToast(`Reçu ${row.id} · ${row.amount} · ${formatDate(row.date)}`),
                      },
                      ...(row.status === "completed"
                        ? [
                            {
                              label: "Rembourser",
                              icon: <Undo2 className="size-3.5" />,
                              tone: "danger" as const,
                              confirm: `Rembourser ${row.amount} à ${row.user} ? Un remboursement sera ajouté à la liste.`,
                              onSelect: () => refund(row),
                            },
                          ]
                        : [
                            {
                              label: "Relancer le paiement",
                              icon: <RefreshCw className="size-3.5" />,
                              onSelect: () => retry(row),
                            },
                          ]),
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <DemoToast message={toast} onClose={() => setToast(null)} />

      {dialogOpen && (
        <DemoCreateDialog
          title="Enregistrer un remboursement"
          description="Le remboursement est ajouté à cette démonstration, dans ce navigateur."
          submitLabel="Enregistrer"
          fields={[
            { key: "user", label: "Client", required: true, placeholder: "Camille R." },
            { key: "amount", label: "Montant (€)", type: "number", required: true, placeholder: "9.99", half: true },
            {
              key: "method",
              label: "Moyen de remboursement",
              options: ["Visa •• 4021", "Mastercard •• 8812", "SEPA", "Apple Pay"],
              half: true,
            },
            { key: "reason", label: "Motif", type: "textarea", placeholder: "Demande du client" },
          ]}
          onClose={() => setDialogOpen(false)}
          onSubmit={(values) => {
            const amount = Math.abs(Number.parseFloat(values.amount.replace(",", ".")));
            if (!Number.isFinite(amount) || amount <= 0) {
              setToast("Montant invalide : le remboursement n’a pas été enregistré.");
              return;
            }
            const row: Transaction = {
              id: nextTxId(),
              user: values.user,
              type: "Remboursement",
              amount: formatAmount(-amount),
              status: "completed",
              date: new Date().toISOString().slice(0, 10),
              method: values.method,
            };
            setRows((current) => [row, ...current]);
            setPage(0);
            setDialogOpen(false);
            setToast(`Remboursement de ${formatAmount(amount)} enregistré (${values.user}).`);
          }}
        />
      )}
    </div>
  );
}
