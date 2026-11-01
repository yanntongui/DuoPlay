"use client";

import { useState } from "react";

export default function ExperiencesPage() {
  const [experiences] = useState([
    {
      id: "exp_001",
      title: "Questions complices",
      category: "connexion",
      status: "published",
      duration: 15,
      depth: "moyen",
      usageCount: 1234,
      createdAt: "2026-09-01",
      updatedAt: "2026-10-15",
    },
    {
      id: "exp_002",
      title: "Défis du soir",
      category: "defis",
      status: "published",
      duration: 20,
      depth: "leger",
      usageCount: 987,
      createdAt: "2026-09-05",
      updatedAt: "2026-10-20",
    },
    {
      id: "exp_003",
      title: "Confessions intimes",
      category: "fantasmes",
      status: "draft",
      duration: 25,
      depth: "profond",
      usageCount: 0,
      createdAt: "2026-10-25",
      updatedAt: "2026-10-30",
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expériences</h1>
          <p className="text-slate-600">
            Gérez les jeux, parcours et cartes
          </p>
        </div>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Créer
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{exp.title}</h3>
                <p className="text-sm text-slate-600">{exp.category}</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  exp.status === "published"
                    ? "bg-green-100 text-green-800"
                    : exp.status === "draft"
                      ? "bg-slate-100 text-slate-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {exp.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">Durée</span>
                <p className="font-medium text-slate-900">{exp.duration} min</p>
              </div>
              <div>
                <span className="text-slate-500">Profondeur</span>
                <p className="font-medium text-slate-900">{exp.depth}</p>
              </div>
              <div>
                <span className="text-slate-500">Utilisations</span>
                <p className="font-medium text-slate-900">
                  {exp.usageCount.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Modifié</span>
                <p className="font-medium text-slate-900">{exp.updatedAt}</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200">
                Modifier
              </button>
              {exp.status === "draft" && (
                <button className="flex-1 rounded bg-indigo-100 px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-200">
                  Publier
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Workflows :</strong> Le contenu passe par un workflow de validation
          (brouillon → révision → approuvé → publié) avec double validation pour les
          contenus sensibles.
        </p>
      </div>
    </div>
  );
}
