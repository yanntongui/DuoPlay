import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Layers,
  Plus,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Avatar, Badge, Card, PageHeader, StatusBadge } from "@/components/admin/ui";

/* ------------------------------------------------------------------ */
/*  Données de démonstration (fictives)                                */
/* ------------------------------------------------------------------ */

const kpis = [
  {
    label: "Utilisateurs actifs",
    value: "24 582",
    delta: "+12,4 %",
    trend: "up" as const,
    note: "vs mois dernier",
    primary: true,
    href: "/admin/users",
  },
  {
    label: "Couples connectés",
    value: "8 145",
    delta: "+6,1 %",
    trend: "up" as const,
    note: "vs mois dernier",
    href: "/admin/couples",
  },
  {
    label: "Revenus du mois",
    value: "45 678 €",
    delta: "+9,3 %",
    trend: "up" as const,
    note: "vs mois dernier",
    href: "/admin/finance",
  },
  {
    label: "Signalements à traiter",
    value: "12",
    delta: "-18 %",
    trend: "down" as const,
    note: "vs hier",
    href: "/admin/moderation",
  },
];

const week = [
  { d: "L", v: 58, active: false },
  { d: "M", v: 82, active: false },
  { d: "M", v: 74, active: true },
  { d: "J", v: 96, active: false },
  { d: "V", v: 44, active: false },
  { d: "S", v: 52, active: false },
  { d: "D", v: 38, active: false },
];

const pending = [
  { icon: ShieldAlert, label: "Signalements", count: 12, tone: "danger" as const, href: "/admin/moderation" },
  { icon: Users, label: "Vérifications de compte", count: 7, tone: "warning" as const, href: "/admin/users" },
  { icon: CreditCard, label: "Remboursements à valider", count: 3, tone: "info" as const, href: "/admin/finance" },
];

const contents = [
  { title: "Soirée à deux — édition hiver", date: "Échéance 4 nov.", color: "#7d4a72" },
  { title: "Parcours « Retrouvailles »", date: "Échéance 6 nov.", color: "#4d6e5f" },
  { title: "Cartes — niveau passionné", date: "Échéance 8 nov.", color: "#8a5f3a" },
  { title: "Traduction espagnole (v2.4)", date: "Échéance 9 nov.", color: "#4a5f8a" },
  { title: "Défi hebdomadaire automatique", date: "Échéance 12 nov.", color: "#8a4a4a" },
];

const activity = [
  { name: "Amina Diallo", action: "a publié « Soirée à deux »", status: "completed" },
  { name: "Marc Lefèvre", action: "a remboursé la transaction #tx_2291", status: "completed" },
  { name: "Sofia Rossi", action: "traite 3 signalements", status: "in_progress" },
  { name: "Yann Tongui", action: "a modifié les permissions du rôle Finance", status: "pending" },
];

/* ------------------------------------------------------------------ */

export default function AdminDashboard() {
  return (
    <div className="ad-enter">
      <PageHeader
        title="Tableau de bord"
        subtitle="Pilotez la plateforme : activité, revenus, contenus et santé technique en un coup d'œil."
        actions={
          <>
            <Link href="/admin/experiences" className="ad-btn ad-btn-primary">
              <Plus className="size-4" strokeWidth={2.2} />
              Nouveau contenu
            </Link>
            <Link href="/admin/reports" className="ad-btn ad-btn-outline">
              <Download className="size-4" strokeWidth={1.9} />
              Exporter
            </Link>
          </>
        }
      />

      {/* ---------------- KPI ---------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className={`group relative block rounded-[22px] p-[22px] transition-transform duration-200 hover:-translate-y-0.5 ${
              kpi.primary
                ? "ad-card-dark"
                : "ad-card"
            }`}
          >
            <div className="relative z-10 flex items-start justify-between gap-3">
              <p
                className={`text-[13px] font-medium ${
                  kpi.primary ? "text-white/70" : "ad-muted"
                }`}
              >
                {kpi.label}
              </p>
              <span
                className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  kpi.primary
                    ? "border-white/25 text-white group-ad-hover-white-12"
                    : "ad-bd-strong ad-ink group-ad-hover-sunk"
                }`}
              >
                <ArrowUpRight className="size-4" strokeWidth={1.9} />
              </span>
            </div>

            <p
              className={`relative z-10 mt-4 text-[34px] font-semibold leading-none tracking-[-0.035em] ${
                kpi.primary ? "text-white" : "ad-ink"
              }`}
            >
              {kpi.value}
            </p>

            <div className="relative z-10 mt-4 flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10.5px] font-semibold ${
                  kpi.primary
                    ? "ad-bg-white-12 text-[#bfe3cd]"
                    : kpi.trend === "up"
                      ? "ad-bg-positive-soft ad-positive"
                      : "ad-bg-positive-soft ad-positive"
                }`}
              >
                {kpi.trend === "up" ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {kpi.delta}
              </span>
              <span
                className={`text-[11px] ${
                  kpi.primary ? "text-white/50" : "ad-faint"
                }`}
              >
                {kpi.note}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* ---------------- Ligne 2 ---------------- */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Analytics */}
        <Card
          title="Activité de la semaine"
          subtitle="Sessions de jeu démarrées par jour"
          className="xl:col-span-6"
          action={<Badge tone="plum">7 derniers jours</Badge>}
        >
          <div className="flex h-[212px] items-end justify-between gap-2 px-1 sm:gap-4">
            {week.map((day, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full max-w-[62px] items-end justify-center" style={{ height: 172 }}>
                  {day.active && (
                    <span className="absolute -top-1 z-10 rounded-md ad-bg-plum px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      74 %
                    </span>
                  )}
                  <div
                    className={day.active ? "ad-bar w-full" : "ad-bar-muted w-full"}
                    style={{ height: `${day.v}%` }}
                  />
                </div>
                <span
                  className={`text-[11px] ${
                    day.active
                      ? "font-semibold ad-ink"
                      : "ad-faint"
                  }`}
                >
                  {day.d}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* À traiter */}
        <Card
          title="À traiter"
          className="xl:col-span-3"
          action={
            <Link
              href="/admin/moderation"
              className="ad-iab -mr-1"
              aria-label="Ouvrir la file"
            >
              <ArrowRight className="size-4" />
            </Link>
          }
        >
          <p className="text-[17px] font-semibold leading-snug tracking-[-0.02em] ad-ink">
            22 éléments attendent une décision
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[11.5px] ad-muted">
            <Clock className="size-3.5" />
            Délai moyen de traitement : 3 h 12
          </p>

          <div className="mt-4 space-y-1">
            {pending.map((row) => {
              const Icon = row.icon;
              return (
                <Link
                  key={row.label}
                  href={row.href}
                  className="flex items-center gap-2.5 rounded-xl px-1 py-1.5 transition-colors ad-hover-soft"
                >
                  <span
                    className={`flex size-7 items-center justify-center rounded-lg ad-pill-${row.tone}`}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <span className="flex-1 text-[12px] ad-soft">
                    {row.label}
                  </span>
                  <span className="text-[12px] font-semibold ad-ink">
                    {row.count}
                  </span>
                </Link>
              );
            })}
          </div>

          <Link
            href="/admin/moderation"
            className="ad-btn ad-btn-primary mt-4 h-10 w-full text-[12.5px]"
          >
            Ouvrir la file
          </Link>
        </Card>

        {/* Contenus */}
        <Card
          title="Contenus à valider"
          className="xl:col-span-3"
          action={
            <Link href="/admin/experiences" className="ad-btn ad-btn-outline h-8 px-3 text-[11.5px]">
              <Plus className="size-3.5" />
              Nouveau
            </Link>
          }
        >
          <div className="space-y-0.5">
            {contents.map((c) => (
              <Link
                key={c.title}
                href="/admin/experiences"
                className="flex items-center gap-2.5 rounded-xl px-1 py-2 transition-colors ad-hover-soft"
              >
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${c.color}14`, color: c.color }}
                >
                  <Layers className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-medium ad-ink">
                    {c.title}
                  </span>
                  <span className="block text-[10.5px] ad-faint">{c.date}</span>
                </span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* ---------------- Ligne 3 ---------------- */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Activité équipe */}
        <Card
          title="Activité de l'équipe"
          className="xl:col-span-5"
          action={
            <Link href="/admin/audit" className="ad-btn ad-btn-outline h-8 px-3 text-[11.5px]">
              <Plus className="size-3.5" />
              Journal complet
            </Link>
          }
        >
          <div className="space-y-1">
            {activity.map((a) => (
              <div
                key={a.name}
                className="flex items-center gap-3 rounded-xl px-1 py-2.5 transition-colors ad-hover-soft"
              >
                <Avatar name={a.name} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium ad-ink">
                    {a.name}
                  </p>
                  <p className="truncate text-[11.5px] ad-muted">{a.action}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </Card>

        {/* Santé */}
        <Card title="Santé de la plateforme" className="xl:col-span-4">
          <div className="flex flex-col items-center">
            <Gauge value={96} />
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {[
                { label: "Résolus", color: "var(--ad-positive)" },
                { label: "En cours", color: "var(--ad-warning)" },
                { label: "En attente", color: "var(--ad-line-strong)" },
              ].map((l) => (
                <span key={l.label} className="flex items-center gap-1.5 text-[11px] ad-muted">
                  <span className="size-2 rounded-full" style={{ background: l.color }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Live */}
        <div className="ad-card-dark flex flex-col justify-between p-[22px] xl:col-span-3">
          <div className="relative z-10 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[#8ee0b4]" />
            <p className="text-[12.5px] font-medium text-white/70">Sessions en direct</p>
          </div>
          <div className="relative z-10 mt-6">
            <p className="font-mono text-[36px] font-semibold leading-none tracking-[-0.02em] text-white">
              1 284
            </p>
            <p className="mt-2 text-[11px] text-white/50">mise à jour il y a 4 s</p>
          </div>
          <div className="relative z-10 mt-5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-medium text-white/80">
              <CheckCircle2 className="size-3" />
              Tous services actifs
            </span>
            <Link
              href="/admin/monitoring"
              className="inline-flex size-9 items-center justify-center rounded-full ad-bg-white-12 text-white transition-colors ad-hover-white-20"
              aria-label="Voir le monitoring"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Gauge({ value }: { value: number }) {
  const arc = Math.PI * 90;
  return (
    <svg viewBox="0 0 220 132" className="w-full max-w-[236px]" role="img" aria-label={`${value} % de tickets résolus`}>
      <path
        d="M20 112 A90 90 0 0 1 200 112"
        fill="none"
        stroke="#efebe7"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <path
        d="M20 112 A90 90 0 0 1 200 112"
        fill="none"
        stroke="var(--ad-plum-600)"
        strokeWidth="18"
        strokeLinecap="round"
        strokeDasharray={`${(value / 100) * arc} ${arc}`}
      />
      <text
        x="110"
        y="98"
        textAnchor="middle"
        fontSize="32"
        fontWeight="600"
        fill="var(--ad-ink)"
        letterSpacing="-1"
      >
        {value}%
      </text>
      <text x="110" y="118" textAnchor="middle" fontSize="10.5" fill="#9a939e">
        tickets résolus
      </text>
    </svg>
  );
}
