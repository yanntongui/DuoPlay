"use client";

import { useState } from "react";

export default function SupportPage() {
  const [tickets] = useState([
    {
      id: "tkt_045",
      subject: "Problème de connexion",
      category: "compte",
      priority: "medium",
      status: "open",
      user: "usr_023",
      createdAt: "2026-10-31T09:00:00Z",
      updatedAt: "2026-10-31T10:30:00Z",
    },
    {
      id: "tkt_046",
      subject: "Question sur abonnement",
      category: "paiement",
      priority: "low",
      status: "open",
      user: "usr_067",
      createdAt: "2026-10-31T08:00:00Z",
      updatedAt: "2026-10-31T08:00:00Z",
    },
    {
      id: "tkt_047",
      subject: "Invitation partenaire",
      category: "invitation",
      priority: "high",
      status: "in_progress",
      user: "usr_089",
      createdAt: "2026-10-30T16:00:00Z",
      updatedAt: "2026-10-31T11:00:00Z",
    },
  ]);

  const priorityColors = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-slate-100 text-slate-800",
  };

  const statusColors = {
    open: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    resolved: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Support</h1>
          <p className="text-slate-600">
            Gérez les tickets et demandes d'assistance
          </p>
        </div>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Nouveau ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">Ouverts</p>
          <p className="text-2xl font-bold text-blue-900">
            {tickets.filter((t) => t.status === "open").length}
          </p>
        </div>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-700">En cours</p>
          <p className="text-2xl font-bold text-yellow-900">
            {tickets.filter((t) => t.status === "in_progress").length}
          </p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-700">Résolus (24h)</p>
          <p className="text-2xl font-bold text-green-900">23</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">Satisfaction</p>
          <p className="text-2xl font-bold text-slate-900">4.6/5</p>
        </div>
      </div>

      {/* Tickets */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Sujet
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Catégorie
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Priorité
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Mis à jour
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {ticket.id}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{ticket.subject}</p>
                    <p className="text-xs text-slate-500">{ticket.user}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {ticket.category}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        priorityColors[ticket.priority as keyof typeof priorityColors]
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        statusColors[ticket.status as keyof typeof statusColors]
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button className="rounded bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200">
                      Ouvrir
                    </button>
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
