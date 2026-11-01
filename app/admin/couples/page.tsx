"use client";

import { useState } from "react";
import { HeartHandshake, MoreHorizontal, RefreshCw, Search } from "lucide-react";
import {
  Badge,
  PageHeader,
  StatTile,
  StatusBadge,
  TableCard,
} from "@/components/admin/ui";

const ROWS = [
  { id: "c_2201", a: "Camille R.", b: "Lukas B.", status: "active", plan: "Premium", created: "14 sept. 2026", seen: "il y a 4 min", sync: "OK" },
  { id: "c_2200", a: "Nadia E.", b: "Yassine E.", status: "active", plan: "Premium annuel", created: "11 sept. 2026", seen: "il y a 1 h", sync: "OK" },
  { id: "c_2199", a: "Diego F.", b: "—", status: "pending", plan: "Gratuit", created: "08 sept. 2026", seen: "invitation envoyée", sync: "En attente" },
  { id: "c_2198", a: "Sofia M.", b: "Marco M.", status: "suspended", plan: "Gratuit", created: "02 sept. 2026", seen: "il y a 9 j", sync: "Échec" },
];

export default function AdminCouples() {
  const [search, setSearch] = useState("");

  const rows = ROWS.filter((r) =>
    `${r.a} ${r.b} ${r.id}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="ad-enter">
      <PageHeader
        title="Couples"
        subtitle="Suivez les invitations, la synchronisation et les abonnements partagés — sans jamais exposer les échanges privés."
        actions={
          <button className="ad-btn ad-btn-outline">
            <RefreshCw className="size-4" strokeWidth={1.9} />
            Resynchroniser
          </button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Couples actifs" value="8 145" delta="+6,1 %" tone="positive" />
        <StatTile label="Invitations en attente" value="312" delta="+18" tone="warning" />
        <StatTile label="Synchronisations en échec" value="7" delta="à traiter" tone="danger" />
        <StatTile label="Abonnements partagés" value="4 902" delta="+2,4 %" tone="plum" />
      </div>

      <TableCard
        title="Tous les couples"
        subtitle={`${rows.length} résultat(s)`}
        action={
          <div className="relative min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un couple…"
              className="ad-input h-9 ad-pl-9 text-[12.5px]"
            />
          </div>
        }
        footer={
          <>
            <span>Page 1 sur 204</span>
            <div className="flex items-center gap-1">
              <button className="ad-btn ad-btn-outline h-8 px-3 text-[11.5px]">Précédent</button>
              <button className="ad-btn ad-btn-primary h-8 px-3 text-[11.5px]">Suivant</button>
            </div>
          </>
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Couple</th>
              <th>Statut</th>
              <th>Offre</th>
              <th>Créé le</th>
              <th>Dernière activité</th>
              <th>Synchronisation</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-full ad-bg-plum-50 ad-plum">
                      <HeartHandshake className="size-4" />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-medium ad-ink">
                        {r.a} <span className="ad-faint">·</span> {r.b}
                      </p>
                      <p className="text-[11px] ad-faint">{r.id}</p>
                    </div>
                  </div>
                </td>
                <td><StatusBadge status={r.status} /></td>
                <td className="text-[12.5px]">{r.plan}</td>
                <td className="text-[12.5px]">{r.created}</td>
                <td className="text-[12.5px] ad-muted">{r.seen}</td>
                <td>
                  {r.sync === "OK" ? (
                    <Badge tone="positive">Synchronisé</Badge>
                  ) : r.sync === "Échec" ? (
                    <Badge tone="danger">Échec</Badge>
                  ) : (
                    <Badge tone="warning">En attente</Badge>
                  )}
                </td>
                <td className="text-right">
                  <button className="ad-iab ml-auto" aria-label="Actions">
                    <MoreHorizontal className="size-4" />
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
