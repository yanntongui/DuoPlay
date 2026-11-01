"use client";

import { useState } from "react";

const users = [
  { id: "u123", email: "user1@example.com", status: "active", subscription: "premium", country: "FR", createdAt: "2026-10-15" },
  { id: "u456", email: "user2@example.com", status: "active", subscription: "free", country: "DE", createdAt: "2026-10-14" },
  { id: "u789", email: "user3@example.com", status: "suspended", subscription: "premium", country: "ES", createdAt: "2026-10-12" },
  { id: "u012", email: "user4@example.com", status: "active", subscription: "annual", country: "IT", createdAt: "2026-10-10" },
  { id: "u345", email: "user5@example.com", status: "active", subscription: "free", country: "FR", createdAt: "2026-10-08" },
];

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredUsers = users.filter((u) => {
    if (search && !u.email.includes(search)) return false;
    if (filterStatus !== "all" && u.status !== filterStatus) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Utilisateurs</h1>
        <p className="text-slate-600">Gérez les comptes utilisateurs</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Rechercher par email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="suspended">Suspendu</option>
          <option value="deleted">Supprimé</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Abonnement</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Pays</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Inscription</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 text-sm font-mono text-slate-500">{u.id}</td>
                <td className="px-4 py-3 text-sm text-slate-900">{u.email}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={
                      u.status === "active"
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
                        : u.status === "suspended"
                          ? "rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700"
                          : "rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                    }
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{u.subscription}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{u.country}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{u.createdAt}</td>
                <td className="px-4 py-3 text-sm">
                  <button className="text-slate-600 hover:text-slate-900">Éditer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-slate-500">{filteredUsers.length} utilisateur(s)</p>
    </div>
  );
}
