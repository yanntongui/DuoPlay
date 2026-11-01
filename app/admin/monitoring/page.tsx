"use client";

import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Cloud,
  Cpu,
  Database,
  Globe,
  HardDrive,
  RefreshCw,
  Server,
  Zap,
} from "lucide-react";
import {
  Badge,
  Card,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";

const SERVICES = [
  { name: "API DuoPlay", region: "eu-west-3", latency: "112 ms", uptime: "99,99 %", status: "operational" },
  { name: "Base de données Convex", region: "eu-west-1", latency: "24 ms", uptime: "99,99 %", status: "operational" },
  { name: "Stockage médias", region: "eu-west-3", latency: "86 ms", uptime: "99,98 %", status: "operational" },
  { name: "Webhooks Stripe", region: "global", latency: "340 ms", uptime: "99,91 %", status: "degraded" },
  { name: "File d'e-mails", region: "eu-west-1", latency: "1,2 s", uptime: "99,95 %", status: "operational" },
  { name: "Recherche", region: "eu-west-3", latency: "38 ms", uptime: "100 %", status: "operational" },
];

const POINTS = [28, 32, 26, 41, 38, 30, 34, 52, 44, 36, 31, 29, 33, 47, 39, 28, 26, 31, 34, 29];

export default function AdminMonitoring() {
  const [live, setLive] = useState(true);

  return (
    <div className="ad-enter">
      <PageHeader
        title="Monitoring"
        subtitle="Disponibilité, latence et files d'attente en temps réel. Les alertes critiques sont escaladées automatiquement."
        actions={
          <>
            <button
              onClick={() => setLive((v) => !v)}
              className={`ad-btn ${live ? "ad-btn-outline" : "ad-btn-primary"}`}
            >
              <RefreshCw className={`size-4 ${live ? "animate-spin" : ""}`} strokeWidth={1.9} />
              {live ? "Temps réel actif" : "Reprendre le direct"}
            </button>
            <button className="ad-btn ad-btn-outline">Configurer les alertes</button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Disponibilité (30 j)" value="99,99 %" delta="SLA 99,9 %" tone="positive" />
        <StatTile label="Latence p95" value="142 ms" delta="-12 ms" tone="positive" />
        <StatTile label="Taux d'erreur" value="0,14 %" delta="-0,03 pt" tone="positive" />
        <StatTile label="Files en attente" value="1" delta="webhooks" tone="warning" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card
          title="Latence de l'API"
          subtitle="p95 · 20 dernières minutes"
          className="xl:col-span-8"
          action={<Badge tone="positive">Sous le seuil</Badge>}
        >
          <svg viewBox="0 0 640 180" className="h-[180px] w-full" role="img" aria-label="Latence API">
            <defs>
              <linearGradient id="mono-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#633a5d" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#633a5d" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1="0"
                x2="640"
                y1={24 + i * 42}
                y2={24 + i * 42}
                stroke="#eee9e4"
                strokeWidth="1"
              />
            ))}
            <path
              d={`M0 150 ${POINTS.map((p, i) => `L${(i / (POINTS.length - 1)) * 640} ${160 - p * 2.4}`).join(" ")} L640 180 L0 180 Z`}
              fill="url(#mono-fill)"
            />
            <polyline
              points={POINTS.map((p, i) => `${(i / (POINTS.length - 1)) * 640},${160 - p * 2.4}`).join(" ")}
              fill="none"
              stroke="var(--ad-plum-600)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="640" cy={160 - POINTS[POINTS.length - 1] * 2.4} r="4" fill="var(--ad-plum-600)" />
          </svg>
          <div className="mt-1 flex justify-between text-[10.5px] ad-faint">
            <span>-20 min</span>
            <span>-10 min</span>
            <span>maintenant</span>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
          {[
            { icon: Cpu, label: "CPU moyen", value: "38 %", hint: "8 instances · autoscaling", w: 38 },
            { icon: HardDrive, label: "Mémoire", value: "61 %", hint: "sur 6 nœuds", w: 61 },
            { icon: Database, label: "Connexions DB", value: "142 / 500", hint: "pool sain", w: 28 },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.label}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[12px] ad-muted">
                    <Icon className="size-4 ad-plum" /> {m.label}
                  </span>
                  <span className="text-[13px] font-semibold ad-ink">{m.value}</span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full ad-bg-sunk">
                  <div className="h-full rounded-full ad-bg-plum" style={{ width: `${m.w}%` }} />
                </div>
                <p className="mt-1.5 text-[10.5px] ad-faint">{m.hint}</p>
              </Card>
            );
          })}
        </div>
      </div>

      <TableCard
        className="mb-4"
        title="Services"
        subtitle="État consolidé des dépendances"
        footer={<span>Dernière vérification il y a 12 s · interrogation toutes les 30 s</span>}
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Région</th>
              <th>Latence</th>
              <th>Disponibilité</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {SERVICES.map((s) => (
              <tr key={s.name}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg ad-bg-plum-50 ad-plum">
                      {s.name.includes("Base") ? (
                        <Database className="size-4" />
                      ) : s.name.includes("Stockage") ? (
                        <HardDrive className="size-4" />
                      ) : s.name.includes("Webhooks") ? (
                        <Zap className="size-4" />
                      ) : s.name.includes("e-mails") ? (
                        <Globe className="size-4" />
                      ) : s.name.includes("Recherche") ? (
                        <Server className="size-4" />
                      ) : (
                        <Cloud className="size-4" />
                      )}
                    </span>
                    <span className="text-[12.5px] font-medium ad-ink">{s.name}</span>
                  </div>
                </td>
                <td className="font-mono text-[11.5px] ad-muted">{s.region}</td>
                <td className="text-[12.5px]">{s.latency}</td>
                <td className="text-[12.5px]">{s.uptime}</td>
                <td>
                  {s.status === "operational" ? (
                    <Badge tone="positive">
                      <CheckCircle2 className="size-3" /> Opérationnel
                    </Badge>
                  ) : (
                    <Badge tone="warning">Dégradé</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { icon: Activity, title: "Journaux d'erreurs", value: "12", hint: "sur 24 h · 0 critique", tone: "positive" as const, label: "Sous contrôle" },
          { icon: Zap, title: "File webhooks", value: "3", hint: "événements en retard", tone: "warning" as const, label: "À surveiller" },
          { icon: Globe, title: "Jobs asynchrones", value: "148", hint: "exécutés cette heure", tone: "neutral" as const, label: "Normal" },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.title}>
              <div className="flex items-start justify-between">
                <span className="flex size-9 items-center justify-center rounded-xl ad-bg-plum-50 ad-plum">
                  <Icon className="size-4" />
                </span>
                <Badge tone={c.tone}>{c.label}</Badge>
              </div>
              <p className="mt-3 text-[24px] font-semibold leading-none tracking-[-0.03em] ad-ink">
                {c.value}
              </p>
              <p className="mt-1 text-[12px] ad-muted">{c.title}</p>
              <p className="mt-0.5 text-[10.5px] ad-faint">{c.hint}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
