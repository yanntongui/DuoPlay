"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AuditPage() {
  const auditLogs = useQuery(api.admin.getAuditLogs, { limit: 20 });
  const logs = auditLogs?.logs ?? [];

  const actions = {
    user_suspended: "bg-red-100 text-red-800",
    user_activated: "bg-green-100 text-green-800",
    user_deleted: "bg-red-100 text-red-800",
    export_users: "bg-yellow-100 text-yellow-800",
    ticket_resolved: "bg-green-100 text-green-800",
    experience_published: "bg-indigo-100 text-indigo-800",
    experience_archived: "bg-slate-100 text-slate-800",
    permission_changed: "bg-orange-100 text-orange-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Journal d'audit</h1>
        <p className="text-slate-600">
          Historique immuable de toutes les actions administratives
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Action</label>
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option>Toutes</option>
              <option>user_suspended</option>
              <option>user_activated</option>
              <option>experience_published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Admin</label>
            <input
              type="text"
              placeholder="Email..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Date début</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Date fin</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Heure
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Admin
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Cible
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Justification
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id.toString()} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {new Date(log.createdAt).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">{log.adminId || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        actions[log.action as keyof typeof actions] ||
                        "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {typeof log.target === "string" ? log.target : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {log.reason || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warning */}
      <div className="rounded-lg bg-orange-50 p-4">
        <p className="text-sm text-orange-800">
          <strong>Attention :</strong> Ce journal est immuable. Les actions critiques
          (export massif, modification de permissions, suppression) génèrent des alertes.
        </p>
      </div>
    </div>
  );
}
