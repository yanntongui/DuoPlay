"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  Lock,
  Search,
  Trash2,
  UserX,
} from "lucide-react";
import {
  Badge,
  Card,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";

type Request = {
  id: string;
  type: "export" | "deletion" | "rectification" | "access";
  user: string;
  received: string;
  due: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
};

const REQUESTS: Request[] = [
  { id: "rgpd_3312", type: "deletion", user: "Sofia Marchetti", received: "28 oct. 2026", due: "27 nov. 2026", status: "in_progress" },
  { id: "rgpd_3311", type: "export", user: "Lukas Brandt", received: "30 oct. 2026", due: "29 nov. 2026", status: "pending" },
  { id: "rgpd_3310", type: "access", user: "Camille Rousseau", received: "31 oct. 2026", due: "30 nov. 2026", status: "pending" },
  { id: "rgpd_3309", type: "rectification", user: "Diego Fernández", received: "26 oct. 2026", due: "25 nov. 2026", status: "completed" },
  { id: "rgpd_3308", type: "deletion", user: "Ancien compte anonymisé", received: "01 oct. 2026", due: "31 oct. 2026", status: "overdue" },
];

const TYPE_LABEL: Record<Request["type"], string> = {
  export: "Droit d'accès / portabilité",
  deletion: "Droit à l'effacement",
  rectification: "Rectification",
  access: "Droit d'accès",
};

const RETENTION = [
  { data: "Comptes utilisateurs", duration: "Jusqu'à suppression + 30 j", basis: "Contrat", action: "Purge automatique" },
  { data: "Réponses intimes", duration: "90 jours", basis: "Consentement", action: "Anonymisation" },
  { data: "Notes privées", duration: "Jusqu'à suppression par l'utilisateur", basis: "Consentement", action: "Suppression immédiate" },
  { data: "Médias sensibles", duration: "30 jours après suppression", basis: "Consentement", action: "Effacement chiffré" },
  { data: "Journaux d'audit", duration: "24 mois", basis: "Obligation légale", action: "Archivage scellé" },
  { data: "Données de facturation", duration: "10 ans", basis: "Obligation comptable", action: "Archivage légal" },
];

export default function AdminGdpr() {
  const [search, setSearch] = useState("");

  const rows = REQUESTS.filter((r) =>
    `${r.id} ${r.user} ${TYPE_LABEL[r.type]}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="ad-enter">
      <PageHeader
        title="RGPD & conformité"
        subtitle="Demandes des personnes concernées, durées de conservation et registre des traitements. Chaque action est motivée et tracée."
        actions={
          <>
            <button className="ad-btn ad-btn-outline">
              <Download className="size-4" strokeWidth={1.9} />
              Registre des traitements
            </button>
            <button className="ad-btn ad-btn-primary">Nouvelle demande</button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Demandes ouvertes" value="5" delta="1 en retard" tone="danger" />
        <StatTile label="Délai de réponse" value="12 j" delta="max 30 j" tone="positive" />
        <StatTile label="Demandes traitées (30 j)" value="18" delta="+5" tone="plum" />
        <StatTile label="Comptes anonymisés" value="142" delta="ce mois" tone="neutral" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            icon: Lock,
            title: "Chiffrement au repos",
            text: "Les réponses intimes et médias sont chiffrés (AES-256) avec des clés séparées.",
            label: "Actif",
            tone: "positive" as const,
          },
          {
            icon: FileCheck2,
            title: "Minimisation",
            text: "La console n'expose jamais les contenus intimes sans habilitation et motif.",
            label: "Politique appliquée",
            tone: "plum" as const,
          },
          {
            icon: UserX,
            title: "Droit à l'oubli",
            text: "Suppression en cascade sous 30 jours, sauvegardes incluses (90 j).",
            label: "Procédure définie",
            tone: "neutral" as const,
          },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.title}>
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl ad-bg-plum-50 ad-plum">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold ad-ink">{c.title}</p>
                  <p className="mt-1 text-[11.5px] leading-snug ad-muted">{c.text}</p>
                  <div className="mt-2">
                    <Badge tone={c.tone}>{c.label}</Badge>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <TableCard
        className="mb-4"
        title="Demandes des personnes concernées"
        subtitle={`${rows.length} demande(s) · délai légal de 30 jours`}
        action={
          <div className="relative min-w-[210px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une demande…"
              className="ad-input h-9 ad-pl-9 text-[12.5px]"
            />
          </div>
        }
        footer={
          <>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" /> Horloge déclenchée à la réception
            </span>
            <span className="ad-faint">Effacement définitif : double validation obligatoire</span>
          </>
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Type de demande</th>
              <th>Personne</th>
              <th>Reçue le</th>
              <th>Échéance</th>
              <th>Statut</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="font-mono text-[11.5px] ad-faint">{r.id}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg ad-bg-plum-50 ad-plum">
                      {r.type === "deletion" ? (
                        <Trash2 className="size-3.5" />
                      ) : r.type === "export" ? (
                        <Download className="size-3.5" />
                      ) : r.type === "rectification" ? (
                        <FileCheck2 className="size-3.5" />
                      ) : (
                        <Lock className="size-3.5" />
                      )}
                    </span>
                    <span className="text-[12.5px]">{TYPE_LABEL[r.type]}</span>
                  </div>
                </td>
                <td className="text-[12.5px] font-medium ad-ink">{r.user}</td>
                <td className="text-[12px] ad-muted">{r.received}</td>
                <td className="text-[12px] ad-muted">{r.due}</td>
                <td>
                  {r.status === "completed" ? (
                    <Badge tone="positive">
                      <CheckCircle2 className="size-3" /> Traitée
                    </Badge>
                  ) : r.status === "overdue" ? (
                    <Badge tone="danger">
                      <AlertTriangle className="size-3" /> En retard
                    </Badge>
                  ) : r.status === "in_progress" ? (
                    <Badge tone="info">En cours</Badge>
                  ) : (
                    <Badge tone="warning">À traiter</Badge>
                  )}
                </td>
                <td className="text-right">
                  <button className="ad-btn ad-btn-outline h-8 px-3 text-[11.5px]">
                    Ouvrir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <TableCard
        title="Durées de conservation"
        subtitle="Politique appliquée automatiquement par les tâches planifiées"
        footer={<span>Dernière revue : 12 octobre 2026 · prochaine revue : 12 janvier 2027</span>}
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Catégorie de données</th>
              <th>Durée</th>
              <th>Base légale</th>
              <th>Action en fin de vie</th>
            </tr>
          </thead>
          <tbody>
            {RETENTION.map((r) => (
              <tr key={r.data}>
                <td className="text-[12.5px] font-medium ad-ink">{r.data}</td>
                <td className="text-[12.5px]">{r.duration}</td>
                <td className="text-[12px] ad-muted">{r.basis}</td>
                <td>
                  <Badge tone="neutral">{r.action}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
