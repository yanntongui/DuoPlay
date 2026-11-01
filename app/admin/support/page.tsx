"use client";

import { useState } from "react";
import { Clock, LifeBuoy, MessageSquare, Search } from "lucide-react";
import {
  Avatar,
  Badge,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";

const TICKETS = [
  { id: "#4821", subject: "Impossible de connecter mon partenaire", user: "Camille R.", category: "Invitation", priority: "high", status: "in_progress", sla: "2 h 10", assignee: "Amina D." },
  { id: "#4820", subject: "Double prélèvement en octobre", user: "Lukas B.", category: "Paiement", priority: "high", status: "pending", sla: "45 min", assignee: "Marc L." },
  { id: "#4819", subject: "Demande de suppression de compte", user: "Sofia M.", category: "Confidentialité", priority: "medium", status: "in_progress", sla: "1 j", assignee: "Sofia R." },
  { id: "#4818", subject: "L'application se ferme au lancement", user: "Diego F.", category: "Technique", priority: "medium", status: "pending", sla: "3 h", assignee: "—" },
  { id: "#4817", subject: "Question sur l'abonnement annuel", user: "Nadia E.", category: "Abonnement", priority: "low", status: "resolved", sla: "—", assignee: "Marc L." },
];

const TABS = [
  { id: "all", label: "Tous" },
  { id: "pending", label: "À prendre" },
  { id: "in_progress", label: "En cours" },
  { id: "resolved", label: "Résolus" },
];

function Priority({ value }: { value: string }) {
  if (value === "high") return <Badge tone="danger">Haute</Badge>;
  if (value === "medium") return <Badge tone="warning">Moyenne</Badge>;
  return <Badge tone="neutral">Basse</Badge>;
}

export default function AdminSupport() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const rows = TICKETS.filter((t) => {
    if (tab !== "all" && t.status !== tab) return false;
    if (search && !`${t.subject} ${t.user} ${t.id}`.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="ad-enter">
      <PageHeader
        title="Support"
        subtitle="Répondez vite, sans jamais accéder aux contenus intimes. Le contexte affiché est limité au strict nécessaire."
        actions={
          <button className="ad-btn ad-btn-outline">
            <MessageSquare className="size-4" strokeWidth={1.9} />
            Macros de réponse
          </button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Tickets ouverts" value="23" delta="+5" tone="warning" />
        <StatTile label="SLA respecté" value="96,4 %" delta="+1,2 pt" tone="positive" />
        <StatTile label="Temps de 1ʳᵉ réponse" value="42 min" delta="-8 min" tone="positive" />
        <StatTile label="Satisfaction" value="4,7 / 5" delta="+0,1" tone="plum" />
      </div>

      <TableCard
        title="File de support"
        subtitle={`${rows.length} ticket(s)`}
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
            <div className="relative ml-auto min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un ticket…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
              />
            </div>
          </>
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Client</th>
              <th>Catégorie</th>
              <th>Priorité</th>
              <th>Assigné à</th>
              <th>SLA</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="cursor-pointer">
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg ad-bg-plum-50 ad-plum">
                      <LifeBuoy className="size-4" />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-medium ad-ink">{t.subject}</p>
                      <p className="text-[11px] ad-faint">{t.id}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Avatar name={t.user} size={26} />
                    <span className="text-[12px]">{t.user}</span>
                  </div>
                </td>
                <td className="text-[12px]">{t.category}</td>
                <td><Priority value={t.priority} /></td>
                <td className="text-[12px] ad-muted">{t.assignee}</td>
                <td>
                  <span className="inline-flex items-center gap-1 text-[12px] ad-muted">
                    <Clock className="size-3" />
                    {t.sla}
                  </span>
                </td>
                <td>
                  {t.status === "resolved" ? (
                    <Badge tone="positive">Résolu</Badge>
                  ) : t.status === "in_progress" ? (
                    <Badge tone="info">En cours</Badge>
                  ) : (
                    <Badge tone="warning">À prendre</Badge>
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
