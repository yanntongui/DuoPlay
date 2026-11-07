"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Badge, PageHeader, StatTile, TableCard } from "@/components/admin/ui";
import { DemoCreateDialog, DemoPagination, DemoToast, RowMenu } from "@/components/admin/demo-kit";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

type Ticket = {
  _id: string;
  subject: string;
  user: string;
  category: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "resolved";
  createdAt: number;
};

const PAGE_SIZE = 5;

export default function AdminSupport() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const data = useQuery(api.support.list, {
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });

  const stats = useQuery(api.support.getStats, {});

  useEffect(() => {
    setPage(0);
  }, [search]);

  const isLoading = data === undefined;
  const tickets = (data?.tickets as Ticket[]) || [];
  const totalCount = data?.totalCount || 0;

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);

  const upsert = useMutation(api.support.upsert);
  const remove = useMutation(api.support.remove);

  async function create(values: Record<string, string>) {
    try {
      await upsert({
        adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY || "",
        subject: values.subject,
        user: values.user,
        category: values.category,
        priority: "medium",
        status: "pending",
      });
      setToast(`Ticket créé.`);
      setDialogOpen(false);
      setPage(0);
    } catch (err) {
      setToast("Erreur lors de la création.");
      console.error(err);
    }
  }

  async function handleRemove(ticket: Ticket) {
    try {
      await remove({
        adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY || "",
        id: ticket._id,
      });
      setToast(`Ticket supprimé.`);
    } catch (err) {
      setToast("Erreur lors de la suppression.");
      console.error(err);
    }
  }

  return (
    <div className="ad-enter">
      <PageHeader
        title="Support"
        subtitle="Gérez les tickets d'assistance et le service client."
        actions={
          <>
            <button
              type="button"
              className="ad-btn ad-btn-primary"
              onClick={() => setDialogOpen(true)}
              disabled={isLoading}
            >
              <Plus className="size-4" strokeWidth={2.2} />
              Nouveau ticket
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Tickets ouverts" value={String(stats?.open || 0)} delta="à traiter" tone="warning" />
        <StatTile label="Total (30 j)" value={String(stats?.total || 0)} delta="-12" tone="positive" />
        <StatTile label="Temps moyen" value="4 h 32" delta="-1 h" tone="positive" />
        <StatTile label="Satisfaction" value="4.6/5" delta="+0.2" tone="plum" />
      </div>

      <TableCard
        title="Tickets d'assistance"
        subtitle={`${tickets.length} ticket(s) sur ${totalCount}`}
        toolbar={
          <>
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
                aria-label="Rechercher un ticket"
                disabled={isLoading}
              />
            </div>
          </>
        }
        footer={
          <DemoPagination
            page={safePage}
            pageCount={pageCount}
            rangeStart={tickets.length === 0 ? 0 : safePage * PAGE_SIZE + 1}
            rangeEnd={safePage * PAGE_SIZE + tickets.length}
            total={totalCount}
            onPage={setPage}
          />
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Sujet</th>
              <th>Utilisateur</th>
              <th>Catégorie</th>
              <th>Priorité</th>
              <th>Statut</th>
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
            {!isLoading && tickets.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[12.5px] ad-muted">
                  Aucun ticket ne correspond à cette recherche.
                </td>
              </tr>
            )}
            {!isLoading &&
              tickets.map((ticket) => (
                <tr key={ticket._id}>
                  <td>
                    <p className="text-[12.5px] font-medium ad-ink">{ticket.subject}</p>
                  </td>
                  <td className="text-[12.5px] ad-ink">{ticket.user}</td>
                  <td>
                    <Badge tone="neutral">{ticket.category}</Badge>
                  </td>
                  <td>
                    <Badge tone={ticket.priority === "high" ? "danger" : ticket.priority === "medium" ? "warning" : "neutral"}>{ticket.priority}</Badge>
                  </td>
                  <td>
                    <Badge tone={ticket.status === "resolved" ? "positive" : ticket.status === "in_progress" ? "plum" : "warning"}>
                      {ticket.status === "resolved" ? "Résolu" : ticket.status === "in_progress" ? "En cours" : "À traiter"}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <RowMenu
                      label={ticket.subject}
                      items={[
                        {
                          label: "Supprimer",
                          icon: <Badge tone="danger">✕</Badge>,
                          tone: "danger",
                          onSelect: () => handleRemove(ticket),
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
          title="Créer un ticket"
          description="Le ticket sera créé en statut « à traiter »."
          submitLabel="Créer"
          fields={[
            { key: "subject", label: "Sujet", required: true, placeholder: "Problème de connexion" },
            { key: "user", label: "Utilisateur", placeholder: "Nom ou email" },
            { key: "category", label: "Catégorie", options: ["Technique", "Paiement", "Abonnement", "Autre"], half: true },
          ]}
          onClose={() => setDialogOpen(false)}
          onSubmit={create}
        />
      )}
    </div>
  );
}
