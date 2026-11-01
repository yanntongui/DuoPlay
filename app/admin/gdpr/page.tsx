export default function AdminGDPR() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">RGPD</h1>
        <p className="text-slate-600">Gestion des données personnelles</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Demandes en attente</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">5</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Données à supprimer</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">234</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Exports générés</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">12</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="font-semibold text-slate-900">Demandes RGPD</h3>
        </div>
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Utilisateur</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3 text-sm font-mono text-slate-500">gdpr001</td>
              <td className="px-4 py-3 text-sm text-slate-600">Suppression</td>
              <td className="px-4 py-3 text-sm text-slate-600">u123</td>
              <td className="px-4 py-3 text-sm text-slate-600">2026-10-28</td>
              <td className="px-4 py-3 text-sm"><span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">En cours</span></td>
              <td className="px-4 py-3 text-sm"><button className="text-slate-600 hover:text-slate-900">Traiter</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
