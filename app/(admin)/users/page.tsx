"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { id } from "../../../convex/_generated/dataModel";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [subscriptionFilter, setSubscriptionFilter] = useState("");
  
  const usersQuery = useQuery(api.admin.listUsers);
  const users = usersQuery?.users ?? [];
  const nextPage = usersQuery?.nextPage;
  const loadMore = useMutation(api.admin.listUsers); // This would be a proper fetch

  const suspendUser = useMutation(api.admin.suspendUser);
  const activateUser = useMutation(api.admin.activateUser);

  const [suspendTarget, setSuspendTarget] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState("");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId.toString().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || user.status === statusFilter;
    const matchesSubscription = !subscriptionFilter || user.plan === subscriptionFilter;
    return matchesSearch && matchesStatus && matchesSubscription;
  });

  const handleSuspend = async (userId: string) => {
    if (!suspendReason) {
      alert("Veuillez fournir une raison pour la suspension");
      return;
    }
    try {
      await suspendUser({
        userId: id(userId),
        reason: suspendReason,
        adminId: "admin_001",
      });
      setSuspendTarget(null);
      setSuspendReason("");
    } catch (error) {
      alert("Erreur lors de la suspension");
    }
  };

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
              placeholder="Nom, ID..."
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
                  Inscrit
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
                <tr key={user._id.toString()} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{user.displayName}</p>
                      <p className="text-xs text-slate-400">{user.userId.toString()}</p>
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
                    <span className="text-sm text-slate-900 capitalize">{user.plan}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-900">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-900">
                      {new Date(user.lastActiveAt).toLocaleDateString("fr-FR")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.status === "active" ? (
                      <button
                        onClick={() => setSuspendTarget(user._id.toString())}
                        className="rounded bg-red-100 px-3 py-1 text-sm text-red-800 hover:bg-red-200"
                      >
                        Suspendre
                      </button>
                    ) : user.status === "suspended" ? (
                      <button
                        onClick={async () => {
                          await activateUser({
                            userId: user._id,
                            adminId: "admin_001",
                          });
                        }}
                        className="rounded bg-green-100 px-3 py-1 text-sm text-green-800 hover:bg-green-200"
                      >
                        Réactiver
                      </button>
                    ) : (
                      <span className="text-sm text-slate-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspension Modal */}
      {suspendTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Suspension du compte
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Veuillez fournir une raison obligatoire pour cette action :
            </p>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Raison de la suspension..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm mb-4"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSuspendTarget(null);
                  setSuspendReason("");
                }}
                className="rounded bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
              >
                Annuler
              </button>
              <button
                onClick={() => handleSuspend(suspendTarget)}
                className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
