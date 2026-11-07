"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader, StatTile, TableCard } from "@/components/admin/ui";
import { DemoPagination, DemoToast } from "@/components/admin/demo-kit";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

type Die = {
  _id: string;
  category: string;
  ambiance: string;
  durationMinutes: number;
  createdAt: number;
};

const PAGE_SIZE = 5;

export default function AdminDice() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const data = useQuery(api.dice.adminList, {
    page,
    pageSize: PAGE_SIZE,
  });

  const stats = useQuery(api.dice.adminGetStats, {});

  useEffect(() => {
    setPage(0);
  }, [search]);

  const isLoading = data === undefined;
  const results = (data?.results as Die[]) || [];
  const totalCount = data?.totalCount || 0;

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);

  return (
    <div className="ad-enter">
      <PageHeader
        title="Dés"
        subtitle="Historique des lancers de dés et statistiques d'usage."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Lancers (30 j)" value={String(stats?.total || 0)} delta="+89" tone="positive" />
        <StatTile label="Catégorie dominante" value="Connexion" delta="32 %" tone="neutral" />
        <StatTile label="Durée moyenne" value="12 min" delta="3 min" tone="positive" />
        <StatTile label="Séquences complètes" value="542" delta="+47" tone="positive" />
      </div>

      <TableCard
        title="Historique des lancers"
        subtitle={`${results.length} lancer(s) sur ${totalCount}`}
        toolbar={
          <>
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
                aria-label="Rechercher un lancer"
                disabled={isLoading}
              />
            </div>
          </>
        }
        footer={
          <DemoPagination
            page={safePage}
            pageCount={pageCount}
            rangeStart={results.length === 0 ? 0 : safePage * PAGE_SIZE + 1}
            rangeEnd={safePage * PAGE_SIZE + results.length}
            total={totalCount}
            onPage={setPage}
          />
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Catégorie</th>
              <th>Ambiance</th>
              <th>Durée</th>
              <th>Date</th>
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
            {!isLoading && results.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-[12.5px] ad-muted">
                  Aucun lancer ne correspond à cette recherche.
                </td>
              </tr>
            )}
            {!isLoading &&
              results.map((result) => (
                <tr key={result._id}>
                  <td>
                    <p className="text-[12.5px] font-medium ad-ink">{result.category}</p>
                  </td>
                  <td>
                    <Badge tone="neutral" className="capitalize">{result.ambiance}</Badge>
                  </td>
                  <td className="text-[12.5px] ad-ink">{result.durationMinutes} min</td>
                  <td className="text-[11.5px] ad-faint">
                    {new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }).format(new Date(result.createdAt))}
                  </td>
                  <td className="text-right">
                    <Badge tone="neutral">Historique</Badge>
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

function Badge({ children, tone = "neutral", className = "" }: { children: React.ReactNode; tone?: string; className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium ${className}`}>{children}</span>;
}
