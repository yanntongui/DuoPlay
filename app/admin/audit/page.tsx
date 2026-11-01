export default function AdminAudit() {
  const logs = [
    { id: "al001", admin: "john@duoplay.com", action: "Suspendre compte", module: "users", target: "u456", timestamp: "2026-11-01 10:23", reason: "Demande utilisateur" },
    { id: "al002", admin: "jane@duoplay.com", action: "Remboursement", module: "finance", target: "tx789", timestamp: "2026-11-01 09:45", reason: "Problème technique" },
    { id: "al003", admin: "admin@duoplay.com", action: "Publier expérience", module: "experiences", target: "e123", timestamp: "2026-10-31 16:00", reason: "" },
    { id: "al004", admin: "moderator@duoplay.com", action: "Résoudre signalement", module: "moderation", target: "r001", timestamp: "2026-10-31 14:30", reason: "Contenu validé" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Journal d'audit</h1>
        <p className="text-slate-600">Historique de toutes les actions administratives</p>
      </div>

      <div className="mb-4 flex gap-4">
        <input type="text" placeholder="Filtrer par admin..." className="rounded border border-slate-300 px-3 py-2 text-sm" />
        <input type="date" className="rounded border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Admin</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Action</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Module</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Cible</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Justification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3 text-sm text-slate-600">{log.admin}</td>
                <td className="px-4 py-3 text-sm text-slate-900">{log.action}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{log.module}</td>
                <td className="px-4 py-3 text-sm font-mono text-slate-500">{log.target}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{log.timestamp}</td>
                <td className="px-4 py-3 text-sm text-slate-500 italic">{log.reason || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
