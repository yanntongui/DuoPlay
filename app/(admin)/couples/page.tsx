"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function CouplesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pour la démo : on utilise des données statiques
  // En production : appeler une requête Convex listCouples
  const [couples] = useState([
    {
      id: "cpl_001",
      userA: "Marie",
      userB: "Jean",
      status: "actif",
      createdAt: "2026-10-16",
      lastActivity: "2026-10-31",
      sessionsCount: 12,
      subscription: "premium",
    },
    {
      id: "cpl_002",
      userA: "Sophie",
      userB: "Pierre",
      status: "pending",
      createdAt: "2026-10-29",
      lastActivity: "2026-10-29",
      sessionsCount: 0,
      subscription: "free",
    },
    {
      id: "cpl_003",
      userA: "Claire",
      userB: "Thomas",
      status: "dissous",
      createdAt: "2026-09-01",
      lastActivity: "2026-10-15",
      sessionsCount: 8,
      subscription: "free",
    },
  ]);

  const filteredCouples = couples.filter((couple) => {
    const matchesSearch =
      couple.userA.toLowerCase().includes(searchTerm.toLowerCase()) ||
      couple.userB.toLowerCase().includes(searchTerm.toLowerCase()) ||
      couple.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || couple.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Couples</h1>
        <p className="text-slate-600">Gérez les relations entre utilisateurs</p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Recherche</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom, ID..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Tous</option>
              <option value="actif">Actif</option>
              <option value="pending">En attente</option>
              <option value="dissous">Dissous</option>
            </select>
          </div>
          <div className="flex items-end">
            <span className="text-sm text-slate-600">
              {filteredCouples.length} couple(s)
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
                  Couple ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Membres
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Créé
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Dernière activité
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Sessions
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCouples.map((couple) => (
                <tr key={couple.id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-900">{couple.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-900">
                      {couple.userA} ↔ {couple.userB}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        couple.status === "actif"
                          ? "bg-green-100 text-green-800"
                          : couple.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {couple.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {couple.createdAt}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {couple.lastActivity}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {couple.sessionsCount}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="rounded bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200">
                        Détails
                      </button>
                      {couple.status === "pending" && (
                        <button className="rounded bg-indigo-100 px-3 py-1 text-sm text-indigo-700 hover:bg-indigo-200">
                          Renvoyer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Notice */}
      <div className="rounded-lg bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">
          <strong>Confidentialité :</strong> Les données sensibles (réponses aux jeux,
          notes privées) sont chiffrées et accessibles uniquement dans le cadre légal
          défini par les conditions d&apos;utilisation.
        </p>
      </div>
    </div>
  );
}
