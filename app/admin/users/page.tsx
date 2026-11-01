"use client";

import { useMemo, useState } from "react";
import { Download, Filter, MoreHorizontal, Search, UserPlus } from "lucide-react";
import {
  Avatar,
  PageHeader,
  StatTile,
  StatusBadge,
  TableCard,
} from "@/components/admin/ui";

type Row = {
  id: string;
  name: string;
  email: string;
  status: string;
  plan: string;
  country: string;
  created: string;
  seen: string;
};

const ROWS: Row[] = [
  { id: "u_10428", name: "Camille Rousseau", email: "camille.r@example.com", status: "active", plan: "Premium mensuel", country: "France", created: "12 oct. 2026", seen: "il y a 4 min" },
  { id: "u_10427", name: "Lukas Brandt", email: "l.brandt@example.de", status: "active", plan: "Premium annuel", country: "Allemagne", created: "11 oct. 2026", seen: "il y a 21 min" },
  { id: "u_10426", name: "Sofia Marchetti", email: "sofia.m@example.it", status: "suspended", plan: "Gratuit", country: "Italie", created: "10 oct. 2026", seen: "il y a 2 j" },
  { id: "u_10425", name: "Nadia El Amrani", email: "nadia.ea@example.fr", status: "active", plan: "Premium mensuel", country: "France", created: "09 oct. 2026", seen: "il y a 1 h" },
  { id: "u_10424", name: "Diego Fernández", email: "d.fernandez@example.es", status: "active", plan: "Gratuit", country: "Espagne", created: "08 oct. 2026", seen: "il y a 3 h" },
  { id: "u_10423", name: "Marta Nowak", email: "marta.n@example.pl", status: "pending", plan: "Gratuit", country: "Pologne", created: "07 oct. 2026", seen: "jamais" },
];

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [plan, setPlan] = useState("all");

  const rows = useMemo(
    () =>
      ROWS.filter((r) => {
        const q = search.trim().toLowerCase();
        if (q && !`${r.name} ${r.email} ${r.id}`.toLowerCase().includes(q)) return false;
        if (status !== "all" && r.status !== status) return false;
        if (plan !== "all" && !r.plan.toLowerCase().includes(plan)) return false;
        return true;
      }),
    [search, status, plan],
  );

  return (
    <div className="ad-enter">
      <PageHeader
        title="Utilisateurs"
        subtitle="Recherchez, vérifiez et accompagnez les comptes. Les données intimes restent masquées par défaut."
        actions={
          <>
            <button className="ad-btn ad-btn-outline">
              <Download className="size-4" strokeWidth={1.9} />
              Exporter
            </button>
            <button className="ad-btn ad-btn-primary">
              <UserPlus className="size-4" strokeWidth={2} />
              Inviter un admin
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Comptes inscrits" value="128 402" delta="+3,1 %" tone="positive" />
        <StatTile label="Actifs (7 jours)" value="28 456" delta="+5,2 %" tone="positive" />
        <StatTile label="Abonnés premium" value="12 340" delta="+0,9 %" tone="plum" />
        <StatTile label="Comptes suspendus" value="84" delta="-12" tone="warning" />
      </div>

      <TableCard
        title="Tous les comptes"
        subtitle={`${rows.length} résultat(s) sur 128 402`}
        toolbar={
          <>
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="E-mail, nom ou identifiant…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
              />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="ad-select h-9 text-[12.5px]">
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
              <option value="pending">En attente</option>
            </select>
            <select value={plan} onChange={(e) => setPlan(e.target.value)} className="ad-select h-9 text-[12.5px]">
              <option value="all">Toutes les offres</option>
              <option value="premium">Premium</option>
              <option value="gratuit">Gratuit</option>
            </select>
            <button className="ad-btn ad-btn-outline h-9 px-3 text-[12.5px]">
              <Filter className="size-3.5" />
              Plus de filtres
            </button>
          </>
        }
        footer={
          <>
            <span>1–{rows.length} sur 128 402</span>
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
              <th>Utilisateur</th>
              <th>Statut</th>
              <th>Offre</th>
              <th>Pays</th>
              <th>Inscription</th>
              <th>Dernière activité</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={r.name} size={32} />
                    <div>
                      <p className="text-[12.5px] font-medium ad-ink">{r.name}</p>
                      <p className="text-[11px] ad-faint">{r.email}</p>
                    </div>
                  </div>
                </td>
                <td><StatusBadge status={r.status} /></td>
                <td className="text-[12.5px]">{r.plan}</td>
                <td className="text-[12.5px]">{r.country}</td>
                <td className="text-[12.5px]">{r.created}</td>
                <td className="text-[12.5px] ad-muted">{r.seen}</td>
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

      <p className="mt-3 text-[11.5px] ad-faint">
        Rappel : les réponses intimes, notes privées et médias sensibles ne sont
        jamais affichés dans la console. Un accès encadré nécessite une
        autorisation légale documentée.
      </p>
    </div>
  );
}
