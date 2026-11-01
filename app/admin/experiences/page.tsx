export default function AdminExperiences() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expériences</h1>
          <p className="text-slate-600">Gérez le contenu de la plateforme</p>
        </div>
        <button className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          Créer
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Titre</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Catégorie</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Intensité</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Utilisations</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3 text-sm text-slate-900">Soirée romantique</td>
              <td className="px-4 py-3 text-sm text-slate-600">Intimité</td>
              <td className="px-4 py-3 text-sm text-slate-600">Passionnée</td>
              <td className="px-4 py-3 text-sm"><span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Publié</span></td>
              <td className="px-4 py-3 text-sm text-slate-600">1,234</td>
              <td className="px-4 py-3 text-sm"><button className="text-slate-600 hover:text-slate-900">Éditer</button></td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-slate-900">Défis du week-end</td>
              <td className="px-4 py-3 text-sm text-slate-600">Activités</td>
              <td className="px-4 py-3 text-sm text-slate-600">Légère</td>
              <td className="px-4 py-3 text-sm"><span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">Brouillon</span></td>
              <td className="px-4 py-3 text-sm text-slate-600">0</td>
              <td className="px-4 py-3 text-sm"><button className="text-slate-600 hover:text-slate-900">Éditer</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
