"use client";

import { useState } from "react";

export default function AuditPage() {
  const [logs] = useState([
    {
      id: "log_001",
      timestamp: "2026-10-31T14:23:45Z",
      admin: "admin@duoplay.com",
      role: "super_admin",
      action: "user_suspended",
      target: "usr_003",
      ip: "192.168.1.100",
      reason: "Violation des CGU",
    },
    {
      id: "log_002",
      timestamp: "2026-10-31T13:45:22Z",
      admin: "support@duoplay.com",
      role: "support",
      action: "ticket_resolved",
      target: "tkt_045",
      ip: "192.168.1.101",
      reason: "",
    },
    {
      id: "log_003",
      timestamp: "2026-10-31T12:30:11Z",
      admin: "admin@duoplay.com",
      role: "super_admin",
      action: "export_users",
      target: "all_users",
      ip: "192.168.1.100",
      reason: "Audit trimestriel",
    },
    {
      id: "log_004",
      timestamp: "2026-10-31T11:15:33Z",
      admin: "content@duoplay.com",
      role: "content",
      action: "experience_published",
      target: "exp_004",
      ip: "192.168.1.102",
      reason: "",
    },
  ]);

  const actions = {
    user_suspended: "bg-red-100 text-red-800",
    user_deleted: "bg-red-100 text-red-800",
    export_users: "bg-yellow-100 text-yellow-800",
    ticket_resolved: "bg-green-100 text-green-800",
    experience_published: "bg-indigo-100 text-indigo-800",
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
              <option>export_users</option>
              <option>permission_changed</option>
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
                  Rôle
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Cible
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  IP
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                  Justification
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">{log.admin}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">{log.role}</td>
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
                  <td className="px-4 py-3 text-sm text-slate-900">{log.target}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">{log.ip}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">{log.reason || "-"}</td>
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
