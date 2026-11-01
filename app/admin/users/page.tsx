export default function AdminUsers() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Utilisateurs</h1>
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Inscription</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-6 py-4 text-sm text-slate-900">user1@example.com</td>
              <td className="px-6 py-4 text-sm text-slate-600">2026-10-15</td>
              <td className="px-6 py-4 text-sm">
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">Actif</span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">Éditer</td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm text-slate-900">user2@example.com</td>
              <td className="px-6 py-4 text-sm text-slate-600">2026-10-14</td>
              <td className="px-6 py-4 text-sm">
                <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">En attente</span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">Éditer</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
