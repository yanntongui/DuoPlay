export default function AdminSupport() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Support</h1>
        <p className="text-slate-600">Gérez les tickets clients</p>
      </div>

      <div className="mb-4 flex gap-4">
        <select className="rounded border border-slate-300 px-3 py-2 text-sm">
          <option>Tous les statuts</option>
          <option>Ouvert</option>
          <option>En cours</option>
          <option>Fermé</option>
        </select>
        <select className="rounded border border-slate-300 px-3 py-2 text-sm">
          <option>Toutes les catégories</option>
          <option>Compte</option>
          <option>Paiement</option>
          <option>Technique</option>
        </select>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Sujet</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Catégorie</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Priorité</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3 text-sm font-mono text-slate-500">#1234</td>
              <td className="px-4 py-3 text-sm text-slate-900">Problème de connexion</td>
              <td className="px-4 py-3 text-sm text-slate-600">Technique</td>
              <td className="px-4 py-3 text-sm"><span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">Moyenne</span></td>
              <td className="px-4 py-3 text-sm"><span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">En cours</span></td>
              <td className="px-4 py-3 text-sm"><button className="text-slate-600 hover:text-slate-900">Ouvrir</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
