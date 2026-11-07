"use client";

import { useEffect, useState } from "react";
import {
  HeartHandshake,
  Search,
} from "lucide-react";
import {
  Badge,
  PageHeader,
  StatTile,
  StatusBadge,
  TableCard,
} from "@/components/admin/ui";
import {
  DemoPagination,
  DemoToast,
  RowMenu,
} from "@/components/admin/demo-kit";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

type CoupleStatus = "temporaire" | "actif" | "dissous";

type Couple = {
  _id: string;
  nameA: string;
  nameB: string;
  status: CoupleStatus;
  createdAt: number;
  lastActivityAt: number;
};

const PAGE_SIZE = 5;

export default function AdminCouples() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const data = useQuery(api.couples.list, {
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });

  const stats = useQuery(api.couples.getStats, {});

  useEffect(() => {
    setPage(0);
  }, [search]);

  const isLoading = data === undefined;
  const couples = (data?.couples as Couple[]) || [];
  const totalCount = data?.totalCount || 0;

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);

  const updateStatus = useMutation(api.couples.updateStatus);
  const suspend = useMutation(api.couples.suspend);

  async function handleStatus(couple: Couple, status: CoupleStatus) {
    try {
      await updateStatus({
        adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY || "",
        coupleId: couple._id,
        status,
      });
      setToast(`Statut mis à jour.`);
    } catch (err) {
      setToast("Erreur lors de la mise à jour.");
      console.error(err);
    }
  }

  async function handleSuspend(couple: Couple) {
    try {
      await suspend({
        adminKey: process.env.NEXT_PUBLIC_ADMIN_KEY || "",
        coupleId: couple._id,
      });
      setToast(`Couple suspendu.`);
    } catch (err) {
      setToast("Erreur lors de la suspension.");
      console.error(err);
    }
  }

  return (
    <div className="ad-enter">
      <PageHeader
        title="Couples"
        subtitle="Gérez les couples et leurs permissions d'accès."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Couples actifs" value={String(stats?.active || 0)} delta="+12" tone="positive" />
        <StatTile label="En attente" value={String(stats?.pending || 0)} delta="invitations" tone="warning" />
        <StatTile label="Dissous" value={String(stats?.dissolved || 0)} delta="30 jours" tone="neutral" />
        <StatTile label="Taux de rétention" value="87 %" delta="sur 30 j" tone="positive" />
      </div>

      <TableCard
        title="Tous les couples"
        subtitle={`${couples.length} couple(s) sur ${totalCount}`}
        toolbar={
          <>
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
                aria-label="Rechercher un couple"
                disabled={isLoading}
              />
            </div>
          </>
        }
        footer={
          <DemoPagination
            page={safePage}
            pageCount={pageCount}
            rangeStart={couples.length === 0 ? 0 : safePage * PAGE_SIZE + 1}
            rangeEnd={safePage * PAGE_SIZE + couples.length}
            total={totalCount}
            onPage={setPage}
          />
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Partenaires</th>
              <th>Statut</th>
              <th>Depuis</th>
              <th>Dernière activité</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="py-10 text-center">
                  Chargement…
                </td>
              </tr>
            )}
            {!isLoading && couples.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-[12.5px] ad-muted">
                  Aucun couple ne correspond à cette recherche.
                </td>
              </tr>
            )}
            {!isLoading &&
              couples.map((couple) => (
                <tr key={couple._id}>
                  <td>
                    <p className="text-[12.5px] font-medium ad-ink">
                      {couple.nameA || "—"} {couple.nameB ? `& ${couple.nameB}` : ""}
                    </p>
                    <p className="text-[11px] ad-faint">Couple {couple._id.slice(-6)}</p>
                  </td>
                  <td>
                    <StatusBadge status={couple.status === "actif" ? "active" : couple.status === "temporaire" ? "pending" : "suspended"} />
                  </td>
                  <td className="text-[11.5px] ad-faint">
                    {new Intl.DateTimeFormat("fr-FR", { month: "short", day: "numeric", year: "numeric" }).format(new Date(couple.createdAt))}
                  </td>
                  <td className="text-[11.5px] ad-faint">
                    {new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }).format(new Date(couple.lastActivityAt))}
                  </td>
                  <td className="text-right">
                    <RowMenu
                      label={couple.nameA || "—"}
                      items={[
                        {
                          label: "Marquer comme actif",
                          icon: <HeartHandshake className="size-3.5" />,
                          onSelect: () => handleStatus(couple, "actif"),
                        },
                        {
                          label: "Suspendre",
                          icon: <Badge tone="danger">✕</Badge>,
                          tone: "danger",
                          onSelect: () => handleSuspend(couple),
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
    </div>
  );
}
