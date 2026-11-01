export default function AdminSegments() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Segments</h1>
          <p className="text-slate-600">Créez des audiences ciblées</p>
        </div>
        <button className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          Nouveau segment
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Nom</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Taille</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3 text-sm text-slate-900">Utilisateurs inactifs</td>
              <td className="px-4 py-3 text-sm text-slate-600">Inactifs depuis 30 jours</td>
              <td className="px-4 py-3 text-sm text-slate-600">2,345</td>
              <td className="px-4 py-3 text-sm"><button className="text-slate-600 hover:text-slate-900">Éditer</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
