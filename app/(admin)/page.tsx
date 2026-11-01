"use client";

import { useState, useEffect } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    usersTotal: 12453,
    usersToday: 234,
    usersLast7Days: 1876,
    usersLast30Days: 7234,
    couplesCreated: 4567,
    sessionsStarted: 8934,
    sessionsCompleted: 6721,
    subscriptionsActive: 1234,
    revenueToday: 1567.89,
    revenueMonth: 45678.90,
    revenueYear: 456789.12,
    ticketsOpen: 23,
    reportsPending: 5,
    errorsToday: 12,
  });

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
          value={stats.usersTotal.toLocaleString()}
          change="+12%"
          trend="up"
        />
        <KPICard
          title="Utilisateurs actifs (7j)"
          value={stats.usersLast7Days.toLocaleString()}
          change="+8%"
          trend="up"
        />
        <KPICard
          title="Sessions complétées"
          value={stats.sessionsCompleted.toLocaleString()}
          change="+15%"
          trend="up"
        />
        <KPICard
          title="Abonnements actifs"
          value={stats.subscriptionsActive.toLocaleString()}
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
              <span className="font-medium text-slate-900">
                {stats.revenueToday.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Ce mois</span>
              <span className="font-medium text-slate-900">
                {stats.revenueMonth.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Cette année</span>
              <span className="font-medium text-slate-900">
                {stats.revenueYear.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900">Support & Modération</h3>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Tickets ouverts</span>
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                {stats.ticketsOpen}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Signalements en attente</span>
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                {stats.reportsPending}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Erreurs aujourd&apos;hui</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-800">
                {stats.errorsToday}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">Activité récente</h3>
        <div className="mt-4 space-y-3">
          <ActivityItem
            action="Nouveau couple créé"
            time="Il y a 2 minutes"
            type="success"
          />
          <ActivityItem
            action="Abonnement premium souscrit"
            time="Il y a 5 minutes"
            type="success"
          />
          <ActivityItem
            action="Ticket support créé"
            time="Il y a 12 minutes"
            type="warning"
          />
          <ActivityItem
            action="Signalement reçu"
            time="Il y a 23 minutes"
            type="error"
          />
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
