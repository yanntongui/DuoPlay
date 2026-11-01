"use client";

import { useState } from "react";

export default function ModerationPage() {
  const [reports] = useState([
    {
      id: "rpt_001",
      type: "content",
      severity: "high",
      reportedBy: "usr_023",
      reportedContent: "exp_012",
      reason: "Contenu inapproprié",
      status: "pending",
      createdAt: "2026-10-31T10:23:45Z",
    },
    {
      id: "rpt_002",
      type: "user",
      severity: "medium",
      reportedBy: "usr_045",
      reportedUser: "usr_089",
      reason: "Comportement abusif",
      status: "pending",
      createdAt: "2026-10-31T09:15:22Z",
    },
    {
      id: "rpt_003",
      type: "content",
      severity: "low",
      reportedBy: "usr_067",
      reportedContent: "exp_034",
      reason: "Question non conforme",
      status: "reviewed",
      reviewedAt: "2026-10-30T16:45:00Z",
    },
  ]);

  const severityColors = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-slate-100 text-slate-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Modération</h1>
        <p className="text-slate-600">
          Traitez les signalements et contenus inappropriés
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">En attente</p>
          <p className="text-2xl font-bold text-red-900">
            {reports.filter((r) => r.status === "pending").length}
          </p>
        </div>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-700">En revue</p>
          <p className="text-2xl font-bold text-yellow-900">2</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-700">Traités (24h)</p>
          <p className="text-2xl font-bold text-green-900">15</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">Total (7j)</p>
          <p className="text-2xl font-bold text-slate-900">87</p>
        </div>
      </div>

      {/* Reports Queue */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <h3 className="text-lg font-semibold text-slate-900">
            File d'attente de modération
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Gravité
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Raison
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {report.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {report.type}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        severityColors[report.severity as keyof typeof severityColors]
                      }`}
                    >
                      {report.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {report.reason}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {report.status}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="rounded bg-indigo-100 px-3 py-1 text-sm text-indigo-700 hover:bg-indigo-200">
                        Examiner
                      </button>
                      {report.status === "pending" && (
                        <button className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200">
                          Bloquer
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

      {/* Privacy Notice */}
      <div className="rounded-lg bg-orange-50 p-4">
        <p className="text-sm text-orange-800">
          <strong>Privacy :</strong> Les modérateurs ne voient que le minimum
          nécessaire pour évaluer un signalement. Les réponses intimes ne sont jamais
          exposées sauf avec consentement documenté.
        </p>
      </div>
    </div>
  );
}
