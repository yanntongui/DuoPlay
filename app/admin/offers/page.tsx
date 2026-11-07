"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Badge, PageHeader, StatTile, TableCard } from "@/components/admin/ui";
import { DemoCreateDialog, DemoPagination, DemoToast, RowMenu } from "@/components/admin/demo-kit";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

type Promo = {
  _id: string;
  code: string;
  type: string;
  value: string;
  maxUses: number;
  expiry?: string;
  status: "active" | "paused" | "expired";
  createdAt: number;
};

const PAGE_SIZE = 5;

export default function AdminOffers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const data = useQuery(api.offers.list, {
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });

  const stats = useQuery(api.offers.getStats, {});

  useEffect(() => {
    setPage(0);
  }, [search]);

  const isLoading = data === undefined;
  const promos = (data?.promos as Promo[]) || [];
  const totalCount = data?.totalCount || 0;

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);

  const upsert = useMutation(api.offers.upsert);
  const remove = useMutation(api.offers.remove);

  async function create(values: Record<string, string>) {
    try {
      await upsert({
        adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY || "",
        code: values.code,
        type: values.type,
        value: values.value,
        maxUses: Number.parseInt(values.maxUses || "100", 10),
        status: "active",
      });
      setToast(`Code promo créé.`);
      setDialogOpen(false);
      setPage(0);
    } catch (err) {
      setToast("Erreur lors de la création.");
      console.error(err);
    }
  }

  async function handleRemove(promo: Promo) {
    try {
      await remove({
        adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY || "",
        id: promo._id,
      });
      setToast(`Code promo supprimé.`);
    } catch (err) {
      setToast("Erreur lors de la suppression.");
      console.error(err);
    }
  }

  return (
    <div className="ad-enter">
      <PageHeader
        title="Codes promo"
        subtitle="Gérez les codes de réduction et les plans d'abonnement."
        actions={
          <>
            <button
              type="button"
              className="ad-btn ad-btn-primary"
              onClick={() => setDialogOpen(true)}
              disabled={isLoading}
            >
              <Plus className="size-4" strokeWidth={2.2} />
              Créer un code
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Codes actifs" value={String(stats?.active || 0)} delta="+3" tone="positive" />
        <StatTile label="Total codes" value={String(stats?.total || 0)} delta="créés" tone="neutral" />
        <StatTile label="Taux d'utilisation" value="67 %" delta="+4 %" tone="positive" />
        <StatTile label="CA généré" value="24.5k €" delta="+8.2k" tone="plum" />
      </div>

      <TableCard
        title="Codes promo"
        subtitle={`${promos.length} code(s) sur ${totalCount}`}
        toolbar={
          <>
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
                aria-label="Rechercher un code"
                disabled={isLoading}
              />
            </div>
          </>
        }
        footer={
          <DemoPagination
            page={safePage}
            pageCount={pageCount}
            rangeStart={promos.length === 0 ? 0 : safePage * PAGE_SIZE + 1}
            rangeEnd={safePage * PAGE_SIZE + promos.length}
            total={totalCount}
            onPage={setPage}
          />
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Valeur</th>
              <th>Statut</th>
              <th>Expire</th>
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
            {!isLoading && promos.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[12.5px] ad-muted">
                  Aucun code ne correspond à cette recherche.
                </td>
              </tr>
            )}
            {!isLoading &&
              promos.map((promo) => (
                <tr key={promo._id}>
                  <td>
                    <p className="text-[12.5px] font-medium ad-ink">{promo.code}</p>
                  </td>
                  <td>
                    <Badge tone="neutral">{promo.type}</Badge>
                  </td>
                  <td className="text-[12.5px] ad-ink">{promo.value}</td>
                  <td>
                    <Badge tone={promo.status === "active" ? "positive" : promo.status === "paused" ? "warning" : "neutral"}>{promo.status}</Badge>
                  </td>
                  <td className="text-[11.5px] ad-faint">{promo.expiry || "—"}</td>
                  <td className="text-right">
                    <RowMenu
                      label={promo.code}
                      items={[
                        {
                          label: "Supprimer",
                          icon: <Badge tone="danger">✕</Badge>,
                          tone: "danger",
                          onSelect: () => handleRemove(promo),
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
          title="Créer un code promo"
          description="Le code sera actif immédiatement."
          submitLabel="Créer"
          fields={[
            { key: "code", label: "Code", required: true, placeholder: "AMOUR2026" },
            { key: "type", label: "Type", options: ["Pourcentage", "Montant fixe", "Essai"], half: true },
            { key: "value", label: "Valeur", placeholder: "-30 %", half: true },
            { key: "maxUses", label: "Usage max", placeholder: "1000" },
          ]}
          onClose={() => setDialogOpen(false)}
          onSubmit={create}
        />
      )}
    </div>
  );
}
