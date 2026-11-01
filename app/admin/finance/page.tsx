export default function AdminFinance() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Finance</h1>
        <p className="text-slate-600">Gérez les paiements et revenus</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Revenus (mois)</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">45,678 €</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Abonnements actifs</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">12,340</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Remboursements (mois)</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">234 €</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="font-semibold text-slate-900">Transactions récentes</h3>
        </div>
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Montant</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3 text-sm font-mono text-slate-500">tx123</td>
              <td className="px-4 py-3 text-sm text-slate-600">Abonnement</td>
              <td className="px-4 py-3 text-sm text-slate-900">9.99 €</td>
              <td className="px-4 py-3 text-sm"><span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Succès</span></td>
              <td className="px-4 py-3 text-sm text-slate-600">2026-11-01</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
