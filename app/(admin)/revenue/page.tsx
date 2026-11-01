"use client";

import { useState } from "react";

export default function RevenuePage() {
  const [timeRange] = useState("month");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Revenus</h1>
        <p className="text-slate-600">Suivi financier et abonnements</p>
      </div>

      {/* Time Range */}
      <div className="flex gap-2">
        {["day", "week", "month", "year"].map((range) => (
          <button
            key={range}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              timeRange === range
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {range === "day" && "Aujourd'hui"}
            {range === "week" && "Cette semaine"}
            {range === "month" && "Ce mois"}
            {range === "year" && "Cette année"}
          </button>
        ))}
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-600">Revenu brut</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            €45,678.90
          </p>
          <p className="mt-1 text-sm text-green-600">+12% vs mois précédent</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-600">Revenu net</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            €38,234.56
          </p>
          <p className="mt-1 text-sm text-slate-500">Après frais</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-600">Abonnements actifs</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">1,234</p>
          <p className="mt-1 text-sm text-green-600">+58 nouveaux</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-600">Taux de conversion</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">8.4%</p>
          <p className="mt-1 text-sm text-green-600">+1.2% vs mois précédent</p>
        </div>
      </div>

      {/* Subscription Breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">Répartition par type</h3>
        <div className="mt-4 space-y-3">
          {[
            { label: "Premium mensuel", value: 567, percent: 46, color: "bg-indigo-500" },
            { label: "Abonnement annuel", value: 423, percent: 34, color: "bg-green-500" },
            { label: "Essai gratuit", value: 189, percent: 15, color: "bg-yellow-500" },
            { label: "Gratuit", value: 55, percent: 5, color: "bg-slate-500" },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm">
                <span className="text-slate-700">{item.label}</span>
                <span className="font-medium text-slate-900">
                  {item.value} ({item.percent}%)
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100">
                <div
                  className={`h-2 rounded-full ${item.color}`}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refunds */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h3 className="text-lg font-semibold text-red-900">Remboursements</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-red-700">Remboursements (mois)</p>
            <p className="mt-1 text-2xl font-bold text-red-900">23</p>
          </div>
          <div>
            <p className="text-sm text-red-700">Montant remboursé</p>
            <p className="mt-1 text-2xl font-bold text-red-900">€1,234.00</p>
          </div>
          <div>
            <p className="text-sm text-red-700">Taux de remboursement</p>
            <p className="mt-1 text-2xl font-bold text-red-900">1.9%</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-red-700">
          <strong>Note :</strong> Les remboursements > €50 nécessitent une double validation.
        </p>
      </div>

      {/* Security Notice */}
      <div className="rounded-lg bg-slate-100 p-4">
        <p className="text-sm text-slate-700">
          <strong>Conformité :</strong> Les données bancaires complètes ne sont pas stockées.
          Seuls les tokens et identifiants du prestataire de paiement sont conservés.
        </p>
      </div>
    </div>
  );
}
