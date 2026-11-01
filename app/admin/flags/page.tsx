export default function AdminFlags() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Feature Flags</h1>
          <p className="text-slate-600">Activer/désactiver des fonctionnalités</p>
        </div>
        <button className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          Nouveau flag
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Nom</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Ciblage</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3 text-sm font-mono text-slate-900">new_game_ui</td>
              <td className="px-4 py-3 text-sm text-slate-600">Nouvelle interface de jeu</td>
              <td className="px-4 py-3 text-sm text-slate-600">10% des utilisateurs</td>
              <td className="px-4 py-3 text-sm"><span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Actif</span></td>
              <td className="px-4 py-3 text-sm"><button className="text-slate-600 hover:text-slate-900">Éditer</button></td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-mono text-slate-900">annual_promo</td>
              <td className="px-4 py-3 text-sm text-slate-600">Offre annuelle promotionnelle</td>
              <td className="px-4 py-3 text-sm text-slate-600">FR, ES</td>
              <td className="px-4 py-3 text-sm"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">Désactivé</span></td>
              <td className="px-4 py-3 text-sm"><button className="text-slate-600 hover:text-slate-900">Éditer</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
