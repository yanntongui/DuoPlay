"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function Dashboard() {
  const stats = useQuery(api.admin.getStats);
  const [recentActivity, setRecentActivity] = useState<Array<{
    action: string;
    time: string;
    type: "success" | "warning" | "error";
  }>>([]);

  const auditLogs = useQuery(api.admin.getAuditLogs, { limit: 5 });

  useEffect(() => {
    if (auditLogs) {
      const activities = auditLogs.logs.slice(0, 5).map((log) => {
        const time = new Date(log.createdAt).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        let type: "success" | "warning" | "error" = "success";
        if (log.action.includes("suspend") || log.action.includes("delete")) {
          type = "error";
        } else if (log.action.includes("publish")) {
          type = "success";
        } else if (log.action.includes("export")) {
          type = "warning";
        }
        return { action: log.action, time, type };
      });
      setRecentActivity(activities);
    }
  }, [auditLogs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-600">Vue synthétique de la plateforme</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Utilisateurs totaux"
          value={stats?.usersTotal?.toLocaleString() ?? "0"}
          change="+12%"
          trend="up"
        />
        <KPICard
          title="Couples créés"
          value={stats?.couplesTotal?.toLocaleString() ?? "0"}
          change="+8%"
          trend="up"
        />
        <KPICard
          title="Sessions totales"
          value={stats?.sessionsTotal?.toLocaleString() ?? "0"}
          change="+15%"
          trend="up"
        />
        <KPICard
          title="Abonnements actifs"
          value="1,234"
          change="+5%"
          trend="up"
        />
      </div>

      {/* Revenue & Growth */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900">Revenus</h3>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Aujourd&apos;hui</span>
              <span className="font-medium text-slate-900">€1,567.89</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Ce mois</span>
              <span className="font-medium text-slate-900">€45,678.90</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Cette année</span>
              <span className="font-medium text-slate-900">€456,789.12</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900">Support & Modération</h3>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Tickets ouverts</span>
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">23</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Signalements en attente</span>
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Erreurs aujourd&apos;hui</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-800">12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">Activité récente</h3>
        <div className="mt-4 space-y-3">
          {recentActivity.map((item, index) => (
            <ActivityItem key={index} action={item.action} time={item.time} type={item.type} />
          ))}
        </div>
      </div>
    </div>
  );
}

function KPICard({
  title,
  value,
  change,
  trend,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}) {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-slate-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-sm text-slate-600">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className={`mt-2 text-sm font-medium ${trendColors[trend]}`}>{change}</p>
    </div>
  );
}

function ActivityItem({
  action,
  time,
  type,
}: {
  action: string;
  time: string;
  type: "success" | "warning" | "error";
}) {
  const types = {
    success: "text-green-600",
    warning: "text-yellow-600",
    error: "text-red-600",
  };

  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <div className="flex items-center gap-3">
        <span className={`text-sm font-medium ${types[type]}`}>{action}</span>
      </div>
      <span className="text-sm text-slate-500">{time}</span>
    </div>
  );
}
