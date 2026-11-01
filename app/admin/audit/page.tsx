"use client";

import { useState } from "react";
import {
  Download,
  Fingerprint,
  KeyRound,
  Lock,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Card,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";

type Event = {
  id: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  ip: string;
  at: string;
  result: "success" | "denied";
  sensitive?: boolean;
};

const EVENTS: Event[] = [
  { id: "evt_91f2", actor: "Yann Tongui", role: "Super admin", action: "Modification des permissions", target: "Rôle Finance", ip: "82.64.12.4", at: "1 nov. 2026 · 14:32:08", result: "success", sensitive: true },
  { id: "evt_91f1", actor: "Marc Lefèvre", role: "Finance", action: "Remboursement émis", target: "tx_2288 · 9,99 €", ip: "90.112.4.88", at: "1 nov. 2026 · 14:18:51", result: "success", sensitive: true },
  { id: "evt_91f0", actor: "Sofia Rossi", role: "Modératrice", action: "Signalement clos", target: "sig_8836", ip: "78.201.55.10", at: "1 nov. 2026 · 13:57:22", result: "success" },
  { id: "evt_91ef", actor: "Amina Diallo", role: "Support", action: "Consultation de compte", target: "u_10428", ip: "82.64.12.19", at: "1 nov. 2026 · 13:40:04", result: "success" },
  { id: "evt_91ee", actor: "Inconnu", role: "—", action: "Tentative d'accès à /admin/gdpr", target: "Session expirée", ip: "185.44.9.201", at: "1 nov. 2026 · 12:12:47", result: "denied" },
  { id: "evt_91ed", actor: "Yann Tongui", role: "Super admin", action: "Export du journal d'audit", target: "audit-2026-10.csv", ip: "82.64.12.4", at: "1 nov. 2026 · 11:02:13", result: "success", sensitive: true },
  { id: "evt_91ec", actor: "Amina Diallo", role: "Support", action: "Réinitialisation 2FA", target: "u_10402", ip: "82.64.12.19", at: "1 nov. 2026 · 10:45:06", result: "success", sensitive: true },
];

const TABS = [
  { id: "all", label: "Tous" },
  { id: "sensitive", label: "Actions sensibles" },
  { id: "denied", label: "Accès refusés" },
];

export default function AdminAudit() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const rows = EVENTS.filter((e) => {
    if (tab === "sensitive" && !e.sensitive) return false;
    if (tab === "denied" && e.result !== "denied") return false;
    if (search && !`${e.actor} ${e.action} ${e.target}`.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="ad-enter">
      <PageHeader
        title="Journal d'audit"
        subtitle="Chaque action d'administration est enregistrée et scellée. Le journal est en lecture seule, y compris pour les super administrateurs."
        actions={
          <button className="ad-btn ad-btn-outline">
            <Download className="size-4" strokeWidth={1.9} />
            Exporter (CSV)
          </button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Événements (24 h)" value="1 284" delta="+6,2 %" tone="neutral" />
        <StatTile label="Actions sensibles" value="37" delta="revue requise" tone="warning" />
        <StatTile label="Accès refusés" value="4" delta="= stable" tone="danger" />
        <StatTile label="Rétention" value="24 mois" delta="conforme" tone="positive" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            title: "Chaîne d'intégrité valide",
            text: "Dernier scellement il y a 4 min. Aucune rupture détectée sur les 30 derniers jours.",
            tone: "positive" as const,
            label: "Vérifié",
          },
          {
            icon: Fingerprint,
            title: "Signature des entrées",
            text: "Chaque événement est haché (SHA-256) et chaîné au précédent.",
            tone: "plum" as const,
            label: "HMAC-SHA256",
          },
          {
            icon: Lock,
            title: "Immuabilité",
            text: "Écriture en append-only. Toute suppression nécessite une procédure légale.",
            tone: "neutral" as const,
            label: "Append-only",
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
        title="Événements récents"
        subtitle={`${rows.length} entrée(s) · fuseau Europe/Paris`}
        toolbar={
          <>
            <div className="flex items-center gap-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`h-8 rounded-full px-3 text-[12px] font-medium transition-colors ${
                    tab === t.id ? "ad-bg-plum text-white" : "ad-muted ad-hover-soft"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="relative ml-auto min-w-[210px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Acteur, action, cible…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
              />
            </div>
          </>
        }
        footer={
          <>
            <span>Conservation 24 mois — purge automatique ensuite.</span>
            <span className="ad-faint">Horodatage serveur, non modifiable</span>
          </>
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Horodatage</th>
              <th>Acteur</th>
              <th>Action</th>
              <th>Cible</th>
              <th>Adresse IP</th>
              <th>Résultat</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id}>
                <td className="whitespace-nowrap font-mono text-[11.5px] ad-faint">{e.at}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <Avatar name={e.actor} size={26} />
                    <div>
                      <p className="text-[12px] font-medium ad-ink">{e.actor}</p>
                      <p className="text-[10.5px] ad-faint">{e.role}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="inline-flex items-center gap-1.5 text-[12px]">
                    {e.sensitive && <KeyRound className="size-3 ad-plum" />}
                    {e.action}
                  </span>
                </td>
                <td className="max-w-[200px] truncate text-[12px] ad-muted">{e.target}</td>
                <td className="font-mono text-[11px] ad-faint">{e.ip}</td>
                <td>
                  {e.result === "success" ? (
                    <Badge tone="positive">Succès</Badge>
                  ) : (
                    <Badge tone="danger">
                      <ShieldAlert className="size-3" /> Refusé
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
