"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { id } from "../../../convex/_generated/dataModel";

export default function ExperiencesPage() {
  const experiencesQuery = useQuery(api.admin.listExperiences);
  const experiences = experiencesQuery?.experiences ?? [];
  const publish = useMutation(api.admin.publishExperience);
  const archive = useMutation(api.admin.archiveExperience);

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
            key={exp._id.toString()}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{exp.title}</h3>
                <p className="text-sm text-slate-600">{exp.type}</p>
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
                <p className="font-medium text-slate-900">{exp.estimatedMinutes} min</p>
              </div>
              <div>
                <span className="text-slate-500">Profondeur</span>
                <p className="font-medium text-slate-900">{exp.depth}</p>
              </div>
              <div>
                <span className="text-slate-500">Créé</span>
                <p className="font-medium text-slate-900">
                  {new Date(exp._creationTime).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Catégorie</span>
                <p className="font-medium text-slate-900">{exp.categoryId.toString()}</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200">
                Modifier
              </button>
              {exp.status === "draft" && (
                <button
                  onClick={async () => {
                    await publish({
                      experienceId: exp._id,
                      adminId: "admin_001",
                    });
                  }}
                  className="flex-1 rounded bg-indigo-100 px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-200"
                >
                  Publier
                </button>
              )}
              {exp.status === "published" && (
                <button
                  onClick={async () => {
                    if (confirm("Archiver cette expérience ?")) {
                      await archive({
                        experienceId: exp._id,
                        adminId: "admin_001",
                      });
                    }
                  }}
                  className="flex-1 rounded bg-yellow-100 px-3 py-2 text-sm text-yellow-700 hover:bg-yellow-200"
                >
                  Archiver
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
