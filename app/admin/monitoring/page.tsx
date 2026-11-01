export default function AdminMonitoring() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Monitoring</h1>
        <p className="text-slate-600">Santé technique de la plateforme</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-700">Disponibilité</p>
          <p className="mt-1 text-2xl font-bold text-green-900">99.99%</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Taux d'erreur</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">0.02%</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Temps de réponse</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">120ms</p>
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-700">Incidents</p>
          <p className="mt-1 text-2xl font-bold text-yellow-900">2</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="font-semibold text-slate-900">Services</h3>
        </div>
        <table className="min-w-full">
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3 text-sm text-slate-900">API</td>
              <td className="px-4 py-3 text-sm"><span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Operational</span></td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-slate-900">WebSocket</td>
              <td className="px-4 py-3 text-sm"><span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Operational</span></td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-slate-900">Notifications</td>
              <td className="px-4 py-3 text-sm"><span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">Degraded</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
