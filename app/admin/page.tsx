export default function AdminPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-600">Console d'administration DuoPlay</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500">Utilisateurs</h3>
          <p className="mt-2 text-2xl font-bold text-slate-900">2,543</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500">Couples actifs</h3>
          <p className="mt-2 text-2xl font-bold text-slate-900">1,234</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500">Revenus (mois)</h3>
          <p className="mt-2 text-2xl font-bold text-slate-900">12,450 €</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500">Expériences</h3>
          <p className="mt-2 text-2xl font-bold text-slate-900">334</p>
        </div>
      </div>
    </div>
  );
}
