"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [settings] = useState({
    appName: "DuoPlay",
    languages: ["fr", "en", "es", "de"],
    countries: ["FR", "CA", "BE", "CH", "ES"],
    timezone: "Europe/Paris",
    minAppVersion: "1.0.0",
    maintenanceMode: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-600">Configuration de la plateforme</p>
      </div>

      {/* General */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">Général</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Nom de l'application
            </label>
            <input
              type="text"
              defaultValue={settings.appName}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Fuseau horaire
            </label>
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option>Europe/Paris</option>
              <option>America/New_York</option>
              <option>Asia/Tokyo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Langues supportées
            </label>
            <div className="mt-1 flex gap-2">
              {["fr", "en", "es", "de", "it", "pt"].map((lang) => (
                <label key={lang} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    defaultChecked={settings.languages.includes(lang)}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm">{lang}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Version minimale de l'app
            </label>
            <input
              type="text"
              defaultValue={settings.minAppVersion}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Maintenance */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h3 className="text-lg font-semibold text-red-900">Mode maintenance</h3>
        <div className="mt-4 flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              defaultChecked={settings.maintenanceMode}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-red-900">Activer le mode maintenance</span>
          </label>
        </div>
        <p className="mt-2 text-sm text-red-700">
          <strong>Attention :</strong> Le mode maintenance coupe l'accès à l'application
          pour tous les utilisateurs sauf les administrateurs.
        </p>
      </div>

      {/* Countries */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">Pays disponibles</h3>
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {settings.countries.map((country) => (
              <span
                key={country}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
              >
                {country}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Enregistrer
        </button>
      </div>
    </div>
  );
}
