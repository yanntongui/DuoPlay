export default function AdminCampaigns() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campagnes</h1>
          <p className="text-slate-600">Gérez les notifications et e-mails</p>
        </div>
        <button className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          Nouvelle campagne
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Nom</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Segment</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3 text-sm text-slate-900">Rappel semaine 44</td>
              <td className="px-4 py-3 text-sm text-slate-600">Push</td>
              <td className="px-4 py-3 text-sm text-slate-600">Utilisateurs actifs</td>
              <td className="px-4 py-3 text-sm"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">Planifiée</span></td>
              <td className="px-4 py-3 text-sm"><button className="text-slate-600 hover:text-slate-900">Éditer</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
