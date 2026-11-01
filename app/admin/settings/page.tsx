export default function AdminSettings() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-600">Configuration de la plateforme</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="font-semibold text-slate-900">Plateforme</h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nom de l'application</label>
            <input type="text" defaultValue="DuoPlay" className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Langues disponibles</label>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" defaultChecked /> Français
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" defaultChecked /> English
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" /> Español
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="font-semibold text-slate-900">Rôles et permissions</h3>
        </div>
        <div className="p-4">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-500">Rôle</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-500">Admins</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-4 py-3 text-sm text-slate-900">Super Admin</td>
                <td className="px-4 py-3 text-sm text-slate-600">2</td>
                <td className="px-4 py-3 text-sm"><button className="text-slate-600 hover:text-slate-900">Éditer</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
