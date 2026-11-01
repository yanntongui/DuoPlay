export default function AdminModeration() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Modération</h1>
        <p className="text-slate-600">Gérez les signalements</p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">En attente</p>
          <p className="mt-1 text-2xl font-bold text-red-900">12</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Traités (7j)</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">87</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Suspensions (7j)</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">5</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Utilisateur</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Gravité</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3 text-sm font-mono text-slate-500">r001</td>
              <td className="px-4 py-3 text-sm text-slate-600">Contenu inapproprié</td>
              <td className="px-4 py-3 text-sm text-slate-600">u456</td>
              <td className="px-4 py-3 text-sm"><span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">Haute</span></td>
              <td className="px-4 py-3 text-sm text-slate-600">2026-11-01</td>
              <td className="px-4 py-3 text-sm"><button className="text-slate-600 hover:text-slate-900">Examiner</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
