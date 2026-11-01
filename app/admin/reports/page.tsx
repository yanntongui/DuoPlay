export default function AdminReports() {
  const reports = [
    { name: "Utilisateurs", description: "Liste complète des utilisateurs" },
    { name: "Abonnements", description: "État des abonnements actifs" },
    { name: "Chiffre d'affaires", description: "Revenus par période" },
    { name: "Paiements", description: "Transactions détaillées" },
    { name: "Rétention", description: "Courbes de rétention" },
    { name: "Support", description: "Statistiques de support" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Rapports</h1>
        <p className="text-slate-600">Exportez les données</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <div key={report.name} className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-semibold text-slate-900">{report.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{report.description}</p>
            <button className="mt-3 text-sm text-slate-900 underline">Exporter</button>
          </div>
        ))}
      </div>
    </div>
  );
}
