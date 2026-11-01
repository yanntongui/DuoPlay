export default function AdminCouples() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Couples</h1>
        <p className="text-slate-600">Gérez les relations entre utilisateurs</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <input
            type="text"
            placeholder="Rechercher un couple..."
            className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Inscription</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Dernière activité</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3 text-sm font-mono text-slate-500">c001</td>
              <td className="px-4 py-3 text-sm"><span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Actif</span></td>
              <td className="px-4 py-3 text-sm text-slate-600">2026-09-15</td>
              <td className="px-4 py-3 text-sm text-slate-600">2026-11-01</td>
              <td className="px-4 py-3 text-sm"><button className="text-slate-600 hover:text-slate-900">Détails</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
