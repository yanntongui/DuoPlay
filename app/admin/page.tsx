import { KpiCard } from "@/components/admin/kpi-card";
import { ChartPlaceholder } from "@/components/admin/chart-placeholder";

const kpis = [
  { label: "Utilisateurs actifs (jour)", value: "5,234", change: "+2.3%", trend: "up" },
  { label: "Utilisateurs actifs (7j)", value: "28,456", change: "+5.1%", trend: "up" },
  { label: "Nouveaux couples", value: "423", change: "+1.8%", trend: "up" },
  { label: "Abonnements premium", value: "12,340", change: "+0.9%", trend: "up" },
  { label: "Revenus (jour)", value: "2,345 €", change: "+3.2%", trend: "up" },
  { label: "Revenus (mois)", value: "45,678 €", change: "+8.4%", trend: "up" },
  { label: "Tickets support", value: "23", change: "-4.2%", trend: "down" },
  { label: "Signalements en attente", value: "12", change: "0%", trend: "flat" },
];

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-600">Vue globale de la plateforme</p>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <KpiCard key={i} {...kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-4 font-semibold text-slate-900">Inscriptions</h3>
          <ChartPlaceholder />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-4 font-semibold text-slate-900">Rétention</h3>
          <ChartPlaceholder />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="font-semibold text-slate-900">Activité récente</h3>
        </div>
        <ul className="divide-y divide-slate-200">
          <li className="px-4 py-3 text-sm text-slate-600">
            12 nouveaux utilisateurs inscrits - il y a 5 minutes
          </li>
          <li className="px-4 py-3 text-sm text-slate-600">
            3 signalements en attente de modération - il y a 12 minutes
          </li>
          <li className="px-4 py-3 text-sm text-slate-600">
            Nouveau ticket support (#1234) - il y a 25 minutes
          </li>
          <li className="px-4 py-3 text-sm text-slate-600">
            Expérience "Soirée romantique" publiée - il y a 1 heure
          </li>
        </ul>
      </div>
    </div>
  );
}
