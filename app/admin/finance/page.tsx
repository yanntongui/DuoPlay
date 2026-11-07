"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Badge, PageHeader, StatTile, TableCard } from "@/components/admin/ui";
import { DemoCreateDialog, DemoPagination, DemoToast, RowMenu } from "@/components/admin/demo-kit";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

type Transaction = {
  _id: string;
  user: string;
  type: string;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed";
  createdAt: number;
};

const PAGE_SIZE = 5;

export default function AdminFinance() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const data = useQuery(api.finance.list, {
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });

  const stats = useQuery(api.finance.getStats, {});

  useEffect(() => {
    setPage(0);
  }, [search]);

  const isLoading = data === undefined;
  const transactions = (data?.transactions as Transaction[]) || [];
  const totalCount = data?.totalCount || 0;

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);

  const upsert = useMutation(api.finance.upsert);
  const remove = useMutation(api.finance.remove);

  async function create(values: Record<string, string>) {
    try {
      await upsert({
        adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY || "",
        user: values.user,
        type: values.type,
        amount: Number.parseFloat(values.amount || "0"),
        currency: "EUR",
        status: "pending",
      });
      setToast(`Transaction créée.`);
      setDialogOpen(false);
      setPage(0);
    } catch (err) {
      setToast("Erreur lors de la création.");
      console.error(err);
    }
  }

  async function handleRemove(tx: Transaction) {
    try {
      await remove({
        adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY || "",
        id: tx._id,
      });
      setToast(`Transaction supprimée.`);
    } catch (err) {
      setToast("Erreur lors de la suppression.");
      console.error(err);
    }
  }

  return (
    <div className="ad-enter">
      <PageHeader
        title="Finance"
        subtitle="Transactions, revenus et facturation."
        actions={
          <>
            <button
              type="button"
              className="ad-btn ad-btn-primary"
              onClick={() => setDialogOpen(true)}
              disabled={isLoading}
            >
              <Plus className="size-4" strokeWidth={2.2} />
              Nouvelle transaction
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Revenus (30 j)" value="12.4k €" delta="+1.2k" tone="positive" />
        <StatTile label="Transactions" value={String(stats?.total || 0)} delta="+47" tone="plum" />
        <StatTile label="Taux d'échec" value="2.1 %" delta="-0.3 pt" tone="positive" />
        <StatTile label="MRR" value="34.2k €" delta="+8.2 %" tone="plum" />
      </div>

      <TableCard
        title="Transactions"
        subtitle={`${transactions.length} transaction(s) sur ${totalCount}`}
        toolbar={
          <>
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
                aria-label="Rechercher une transaction"
                disabled={isLoading}
              />
            </div>
          </>
        }
        footer={
          <DemoPagination
            page={safePage}
            pageCount={pageCount}
            rangeStart={transactions.length === 0 ? 0 : safePage * PAGE_SIZE + 1}
            rangeEnd={safePage * PAGE_SIZE + transactions.length}
            total={totalCount}
            onPage={setPage}
          />
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Type</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="py-10 text-center">
                  Chargement…
                </td>
              </tr>
            )}
            {!isLoading && transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[12.5px] ad-muted">
                  Aucune transaction ne correspond à cette recherche.
                </td>
              </tr>
            )}
            {!isLoading &&
              transactions.map((tx) => (
                <tr key={tx._id}>
                  <td>
                    <p className="text-[12.5px] font-medium ad-ink">{tx.user}</p>
                  </td>
                  <td className="text-[12.5px] ad-ink">{tx.type}</td>
                  <td className="text-[12.5px] font-medium ad-ink">{tx.amount} {tx.currency}</td>
                  <td>
                    <Badge tone={tx.status === "completed" ? "positive" : tx.status === "pending" ? "warning" : "danger"}>{tx.status}</Badge>
                  </td>
                  <td className="text-[11.5px] ad-faint">
                    {new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }).format(new Date(tx.createdAt))}
                  </td>
                  <td className="text-right">
                    <RowMenu
                      label={tx.user}
                      items={[
                        {
                          label: "Supprimer",
                          icon: <Badge tone="danger">✕</Badge>,
                          tone: "danger",
                          onSelect: () => handleRemove(tx),
                        },
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
          title="Créer une transaction"
          description="La transaction sera créée en statut « en attente »."
          submitLabel="Créer"
          fields={[
            { key: "user", label: "Utilisateur", required: true, placeholder: "Nom ou email" },
            { key: "type", label: "Type", placeholder: "Abonnement" },
            { key: "amount", label: "Montant", placeholder: "9.99" },
          ]}
          onClose={() => setDialogOpen(false)}
          onSubmit={create}
        />
      )}
    </div>
  );
}
