"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Filter,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import {
  Avatar,
  PageHeader,
  StatTile,
  StatusBadge,
  TableCard,
} from "@/components/admin/ui";
import { UserActions } from "@/components/admin/user-actions";
import { UserDialog, type UserDraft } from "@/components/admin/user-dialog";
import {
  COUNTRIES,
  DEMO_TOTALS,
  DEMO_USERS,
  downloadCsv,
  formatDate,
  loadUsers,
  nextUserId,
  saveUsers,
  usersToCsv,
  type DemoUser,
} from "@/lib/admin/demo-users";

const PAGE_SIZE = 5;

const numberFormat = new Intl.NumberFormat("fr-FR");

function countBy(users: DemoUser[], predicate: (user: DemoUser) => boolean) {
  return users.filter(predicate).length;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<DemoUser[]>(DEMO_USERS);
  const [hydrated, setHydrated] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [plan, setPlan] = useState("all");
  const [country, setCountry] = useState("all");
  const [moreFilters, setMoreFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [dialog, setDialog] = useState<{ mode: "create" } | { mode: "view"; user: DemoUser } | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  // La liste vit dans le navigateur : on la recharge après le montage pour
  // éviter toute divergence d'hydratation avec le rendu serveur.
  useEffect(() => {
    const stored = loadUsers();
    if (stored) setUsers(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveUsers(users);
  }, [users, hydrated]);

  useEffect(() => {
    setPage(0);
  }, [search, status, plan, country]);

  // La notification d'action s'efface d'elle-même.
  useEffect(() => {
    if (!lastAction) return;
    const timer = window.setTimeout(() => setLastAction(null), 6000);
    return () => window.clearTimeout(timer);
  }, [lastAction]);

  const filtered = useMemo(
    () =>
      users.filter((user) => {
        const query = search.trim().toLowerCase();
        if (query && !`${user.name} ${user.email} ${user.id}`.toLowerCase().includes(query)) return false;
        if (status !== "all" && user.status !== status) return false;
        if (plan !== "all" && !user.plan.toLowerCase().includes(plan)) return false;
        if (country !== "all" && user.country !== country) return false;
        return true;
      }),
    [users, search, status, plan, country],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeEnd = safePage * PAGE_SIZE + visible.length;

  const createdDelta = users.length - DEMO_USERS.length;
  const premiumDelta =
    countBy(users, (user) => user.plan.startsWith("Premium")) -
    countBy(DEMO_USERS, (user) => user.plan.startsWith("Premium"));
  const suspendedDelta =
    countBy(users, (user) => user.status === "suspended") -
    countBy(DEMO_USERS, (user) => user.status === "suspended");

  const filtersActive = status !== "all" || plan !== "all" || country !== "all";

  function announce(message: string) {
    setLastAction(message);
  }

  function resetFilters() {
    setSearch("");
    setStatus("all");
    setPlan("all");
    setCountry("all");
  }

  function handleCreate(draft: UserDraft) {
    const user: DemoUser = {
      id: nextUserId(users),
      name: draft.name,
      email: draft.email,
      status: draft.status,
      plan: draft.plan,
      country: draft.country,
      createdAt: new Date().toISOString().slice(0, 10),
      lastSeen: "jamais",
    };
    setUsers((current) => [user, ...current]);
    setDialog(null);
    setPage(0);
    announce(`Compte ${user.name} créé (${user.id}).`);
  }

  function handleToggleStatus(user: DemoUser) {
    const nextStatus = user.status === "suspended" ? "active" : "suspended";
    setUsers((current) =>
      current.map((row) => (row.id === user.id ? { ...row, status: nextStatus } : row)),
    );
    announce(
      nextStatus === "suspended"
        ? `Compte ${user.name} suspendu.`
        : `Compte ${user.name} réactivé.`,
    );
  }

  function handleDelete(user: DemoUser) {
    setUsers((current) => current.filter((row) => row.id !== user.id));
    announce(`Compte ${user.name} supprimé.`);
  }

  function handleExport() {
    if (filtered.length === 0) {
      announce("Aucun compte à exporter avec ces filtres.");
      return;
    }
    downloadCsv(`duoplay-utilisateurs-${new Date().toISOString().slice(0, 10)}.csv`, usersToCsv(filtered));
    announce(`${filtered.length} compte(s) exporté(s) en CSV.`);
  }

  return (
    <div className="ad-enter">
      <PageHeader
        title="Utilisateurs"
        subtitle="Recherchez, vérifiez et accompagnez les comptes. Les données intimes restent masquées par défaut."
        actions={
          <>
            <span className="ad-pill ad-pill-warning" title="Données fictives, stockées dans ce navigateur">
              Démonstration
            </span>
            <button type="button" className="ad-btn ad-btn-outline" onClick={handleExport}>
              <Download className="size-4" strokeWidth={1.9} />
              Exporter
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-primary"
              onClick={() => setDialog({ mode: "create" })}
            >
              <UserPlus className="size-4" strokeWidth={2} />
              Créer un utilisateur
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Comptes inscrits"
          value={numberFormat.format(DEMO_TOTALS.accounts + createdDelta)}
          delta="+3,1 %"
          tone="positive"
        />
        <StatTile label="Actifs (7 jours)" value={numberFormat.format(DEMO_TOTALS.active7d)} delta="+5,2 %" tone="positive" />
        <StatTile
          label="Abonnés premium"
          value={numberFormat.format(DEMO_TOTALS.premium + premiumDelta)}
          delta="+0,9 %"
          tone="plum"
        />
        <StatTile
          label="Comptes suspendus"
          value={numberFormat.format(DEMO_TOTALS.suspended + suspendedDelta)}
          delta={suspendedDelta === 0 ? "-12" : `${suspendedDelta > 0 ? "+" : ""}${suspendedDelta}`}
          tone="warning"
        />
      </div>

      <TableCard
        title="Tous les comptes"
        subtitle={`${filtered.length} résultat(s) sur ${numberFormat.format(DEMO_TOTALS.accounts + createdDelta)}`}
        toolbar={
          <>
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="E-mail, nom ou identifiant…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
                aria-label="Rechercher un compte"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="ad-select h-9 text-[12.5px]"
              aria-label="Filtrer par statut"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
              <option value="pending">En attente</option>
            </select>
            <select
              value={plan}
              onChange={(event) => setPlan(event.target.value)}
              className="ad-select h-9 text-[12.5px]"
              aria-label="Filtrer par offre"
            >
              <option value="all">Toutes les offres</option>
              <option value="premium">Premium</option>
              <option value="gratuit">Gratuit</option>
            </select>
            <button
              type="button"
              className={`ad-btn h-9 px-3 text-[12.5px] ${moreFilters || filtersActive ? "ad-btn-primary" : "ad-btn-outline"}`}
              aria-expanded={moreFilters}
              onClick={() => setMoreFilters((open) => !open)}
            >
              <Filter className="size-3.5" />
              Plus de filtres
            </button>
            {filtersActive && (
              <button
                type="button"
                className="ad-btn ad-btn-ghost h-9 px-2.5 text-[12.5px]"
                onClick={resetFilters}
              >
                <X className="size-3.5" />
                Réinitialiser
              </button>
            )}

            {moreFilters && (
              <div className="flex w-full flex-wrap items-center gap-2 border-t ad-bd pt-3">
                <label htmlFor="filter-country" className="text-[12px] ad-muted">
                  Pays
                </label>
                <select
                  id="filter-country"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="ad-select h-9 text-[12.5px]"
                >
                  <option value="all">Tous les pays</option>
                  {COUNTRIES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <span className="text-[11.5px] ad-faint">
                  Filtres combinables avec la recherche et les statuts.
                </span>
              </div>
            )}
          </>
        }
        footer={
          <>
            <span>
              {rangeStart}–{rangeEnd} sur {filtered.length}
              {createdDelta !== 0 && (
                <span className="ad-faint"> · {createdDelta > 0 ? "+" : ""}{createdDelta} compte(s) local(aux)</span>
              )}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="ad-btn ad-btn-outline h-8 px-3 text-[11.5px] disabled:opacity-40"
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                disabled={safePage === 0}
              >
                Précédent
              </button>
              <span className="px-2 text-[11.5px] ad-muted">
                {safePage + 1} / {pageCount}
              </span>
              <button
                type="button"
                className="ad-btn ad-btn-primary h-8 px-3 text-[11.5px] disabled:opacity-40"
                onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
                disabled={safePage >= pageCount - 1}
              >
                Suivant
              </button>
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
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[12.5px] ad-muted">
                  Aucun compte ne correspond à ces filtres.
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="ml-2 font-medium ad-plum underline underline-offset-2"
                  >
                    Réinitialiser
                  </button>
                </td>
              </tr>
            )}
            {visible.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={user.name} size={32} />
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-medium ad-ink">{user.name}</p>
                      <p className="truncate text-[11px] ad-faint">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <StatusBadge status={user.status} />
                </td>
                <td className="text-[12.5px]">{user.plan}</td>
                <td className="text-[12.5px]">{user.country}</td>
                <td className="text-[12.5px]">{formatDate(user.createdAt)}</td>
                <td className="text-[12.5px] ad-muted">{user.lastSeen}</td>
                <td className="text-right">
                  <UserActions
                    user={user}
                    onView={() => setDialog({ mode: "view", user })}
                    onToggleStatus={() => handleToggleStatus(user)}
                    onDelete={() => handleDelete(user)}
                  />
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

      {lastAction && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-medium text-white shadow-lg ad-bg-plum">
            {lastAction}
            <button
              type="button"
              aria-label="Masquer la notification"
              onClick={() => setLastAction(null)}
              className="ml-1 opacity-70 hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {dialog?.mode === "create" && (
        <UserDialog
          existingEmails={users.map((user) => user.email)}
          onClose={() => setDialog(null)}
          onCreate={handleCreate}
        />
      )}

      {dialog?.mode === "view" && (
        <UserDialog
          user={users.find((user) => user.id === dialog.user.id) ?? dialog.user}
          existingEmails={[]}
          onClose={() => setDialog(null)}
          onCreate={handleCreate}
          onToggleStatus={handleToggleStatus}
        />
      )}
    </div>
  );
}
