"use client";

import { useState } from "react";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [subscriptionFilter, setSubscriptionFilter] = useState("");
  const [users] = useState([
    {
      id: "usr_001",
      email: "marie.dupont@example.com",
      displayName: "Marie",
      status: "active",
      subscription: "premium",
      createdAt: "2026-10-15",
      lastActivity: "2026-10-30",
      country: "FR",
      couples: 1,
    },
    {
      id: "usr_002",
      email: "jean.leroy@example.com",
      displayName: "Jean",
      status: "active",
      subscription: "free",
      createdAt: "2026-10-20",
      lastActivity: "2026-10-31",
      country: "FR",
      couples: 1,
    },
    {
      id: "usr_003",
      email: "sophie.martin@example.com",
      displayName: "Sophie",
      status: "suspended",
      subscription: "premium",
      createdAt: "2026-09-10",
      lastActivity: "2026-10-25",
      country: "CA",
      couples: 1,
    },
    {
      id: "usr_004",
      email: "pierre.bernard@example.com",
      displayName: "Pierre",
      status: "active",
      subscription: "annual",
      createdAt: "2026-08-05",
      lastActivity: "2026-10-31",
      country: "FR",
      couples: 1,
    },
    {
      id: "usr_005",
      email: "claire.romain@example.com",
      displayName: "Claire",
      status: "active",
      subscription: "free",
      createdAt: "2026-10-28",
      lastActivity: "2026-10-29",
      country: "BE",
      couples: 0,
    },
  ]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || user.status === statusFilter;
    const matchesSubscription =
      !subscriptionFilter || user.subscription === subscriptionFilter;
    return matchesSearch && matchesStatus && matchesSubscription;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Utilisateurs</h1>
        <p className="text-slate-600">Gérez les comptes utilisateurs</p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Recherche
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Email, nom, ID..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Tous</option>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
              <option value="deleted">Supprimé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Abonnement
            </label>
            <select
              value={subscriptionFilter}
              onChange={(e) => setSubscriptionFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Tous</option>
              <option value="free">Gratuit</option>
              <option value="premium">Premium</option>
              <option value="annual">Annuel</option>
            </select>
          </div>
          <div className="flex items-end">
            <span className="text-sm text-slate-600">
              {filteredUsers.length} utilisateur(s)
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Utilisateur
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Abonnement
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Pays
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Inscription
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Dernière activité
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{user.displayName}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                      <p className="text-xs text-slate-400">{user.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : user.status === "suspended"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-900">{user.subscription}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-900">{user.country}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-900">{user.createdAt}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-900">{user.lastActivity}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="rounded bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200">
                        Voir
                      </button>
                      <button className="rounded bg-yellow-100 px-3 py-1 text-sm text-yellow-800 hover:bg-yellow-200">
                        Suspendre
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
