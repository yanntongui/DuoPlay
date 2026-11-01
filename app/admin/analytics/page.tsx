export default function AdminAnalytics() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600">Statistiques et analyses</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-4 font-semibold text-slate-900">Activation</h3>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Inscription → Premier couple</span>
                <span className="text-slate-900">72%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-3/4 rounded-full bg-slate-900"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Premier couple → Première expérience</span>
                <span className="text-slate-900">54%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-1/2 rounded-full bg-slate-900"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-4 font-semibold text-slate-900">Rétention</h3>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Jour 1</span>
                <span className="text-slate-900">45%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-1/2 rounded-full bg-slate-900"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Jour 7</span>
                <span className="text-slate-900">28%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-1/3 rounded-full bg-slate-900"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Jour 30</span>
                <span className="text-slate-900">15%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-1/4 rounded-full bg-slate-900"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="font-semibold text-slate-900">Top catégories</h3>
        </div>
        <table className="min-w-full">
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3 text-sm text-slate-900">Intimité</td>
              <td className="px-4 py-3 text-right text-sm text-slate-600">42%</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-slate-900">Amusant</td>
              <td className="px-4 py-3 text-right text-sm text-slate-600">28%</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-slate-900">Activités</td>
              <td className="px-4 py-3 text-right text-sm text-slate-600">18%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
