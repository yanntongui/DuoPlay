"use client";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600">
          Métriques produit et données agrégées anonymisées
        </p>
      </div>

      {/* Activation Funnel */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">Entonnoir d'activation</h3>
        <div className="mt-6 space-y-4">
          {
            [
            { label: "Inscription", count: 12453, rate: 100 },
            { label: "Invitation du partenaire", count: 8234, rate: 66 },
            { label: "Couple connecté", count: 7123, rate: 57 },
            { label: "Première expérience", count: 6543, rate: 53 },
            { label: "Session complétée", count: 5987, rate: 48 },
          ].map((step, index) => (
            <div key={step.label}>
              <div className="flex justify-between">
                <span className="text-sm text-slate-700">{step.label}</span>
                <span className="text-sm font-medium text-slate-900">
                  {step.count.toLocaleString()} ({step.rate}%)
                </span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-indigo-600"
                  style={{ width: `${step.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Retention */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">Rétention</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-700">Jour 1</p>
            <p className="text-2xl font-bold text-green-900">72%</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-700">Jour 7</p>
            <p className="text-2xl font-bold text-green-900">45%</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-700">Jour 30</p>
            <p className="text-2xl font-bold text-green-900">28%</p>
          </div>
        </div>
      </div>

      {/* Top Features */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Fonctionnalités les plus utilisées
        </h3>
        <div className="mt-4 space-y-3">
          {[
            { feature: "Questions complices", usage: 12453 },
            { feature: "Défi du jour", usage: 8934 },
            { feature: "Parcours guidés", usage: 6721 },
            { feature: "Mode à distance", usage: 4523 },
            { feature: "Favoris", usage: 3456 },
          ].map((item) => (
            <div key={item.feature} className="flex justify-between">
              <span className="text-slate-700">{item.feature}</span>
              <span className="font-medium text-slate-900">
                {item.usage.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Confidentialité :</strong> Ces données sont anonymisées et agrégées.
          Aucun comportement individuel ou réponse intime n'est exposé dans Analytics.
        </p>
      </div>
    </div>
  );
}
