export default function AdminIncidents() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Incidents</h1>
          <p className="text-slate-600">Gérez les incidents techniques</p>
        </div>
        <button className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          Créer incident
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Titre</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Service</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Gravité</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3 text-sm font-mono text-slate-500">inc001</td>
              <td className="px-4 py-3 text-sm text-slate-900">Notifications en retard</td>
              <td className="px-4 py-3 text-sm text-slate-600">Notifications</td>
              <td className="px-4 py-3 text-sm"><span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">Modéré</span></td>
              <td className="px-4 py-3 text-sm"><span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">Investigation</span></td>
              <td className="px-4 py-3 text-sm"><button className="text-slate-600 hover:text-slate-900">Voir</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
