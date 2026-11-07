"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Copy,
  LifeBuoy,
  MessageSquare,
  RotateCcw,
  Search,
  UserCheck,
} from "lucide-react";
import {
  Avatar,
  Badge,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";
import {
  DemoCreateDialog,
  DemoPagination,
  DemoPill,
  DemoToast,
  RowMenu,
  exportCsv,
  useDemoRows,
} from "@/components/admin/demo-kit";
import { copyText } from "@/lib/clipboard";

type TicketStatus = "pending" | "in_progress" | "resolved";
type Priority = "high" | "medium" | "low";

type Ticket = {
  id: string;
  subject: string;
  user: string;
  category: string;
  priority: Priority;
  status: TicketStatus;
  sla: string;
  assignee: string;
};

const SEED: Ticket[] = [
  { id: "#4821", subject: "Impossible de connecter mon partenaire", user: "Camille R.", category: "Invitation", priority: "high", status: "in_progress", sla: "2 h 10", assignee: "Amina D." },
  { id: "#4820", subject: "Double prélèvement en octobre", user: "Lukas B.", category: "Paiement", priority: "high", status: "pending", sla: "45 min", assignee: "Marc L." },
  { id: "#4819", subject: "Demande de suppression de compte", user: "Sofia M.", category: "Confidentialité", priority: "medium", status: "in_progress", sla: "1 j", assignee: "Sofia R." },
  { id: "#4818", subject: "L'application se ferme au lancement", user: "Diego F.", category: "Technique", priority: "medium", status: "pending", sla: "3 h", assignee: "—" },
  { id: "#4817", subject: "Question sur l'abonnement annuel", user: "Nadia E.", category: "Abonnement", priority: "low", status: "resolved", sla: "—", assignee: "Marc L." },
  { id: "#4816", subject: "Le code de session a expiré", user: "Marta N.", category: "Session", priority: "medium", status: "pending", sla: "1 h 20", assignee: "—" },
  { id: "#4815", subject: "Cartes non synchronisées", user: "Léa D.", category: "Technique", priority: "high", status: "in_progress", sla: "30 min", assignee: "Amina D." },
  { id: "#4814", subject: "Facture introuvable", user: "Hugo V.", category: "Paiement", priority: "low", status: "resolved", sla: "—", assignee: "Marc L." },
];

const TABS: { id: string; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "pending", label: "À prendre" },
  { id: "in_progress", label: "En cours" },
  { id: "resolved", label: "Résolus" },
];

const PAGE_SIZE = 5;
const STORAGE_KEY = "duoplay.admin.support.v1";

function PriorityBadge({ value }: { value: Priority }) {
  if (value === "high") return <Badge tone="danger">Haute</Badge>;
  if (value === "medium") return <Badge tone="warning">Moyenne</Badge>;
  return <Badge tone="neutral">Basse</Badge>;
}

function statusBadge(status: TicketStatus) {
  if (status === "resolved") return <Badge tone="positive">Résolu</Badge>;
  if (status === "in_progress") return <Badge tone="info">En cours</Badge>;
  return <Badge tone="warning">À prendre</Badge>;
}

export default function AdminSupport() {
  const [rows, setRows] = useDemoRows<Ticket>(STORAGE_KEY, SEED);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [macroOpen, setMacroOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setPage(0);
  }, [tab, search]);

  const filtered = useMemo(
    () =>
      rows.filter((ticket) => {
        if (tab !== "all" && ticket.status !== tab) return false;
        const query = search.trim().toLowerCase();
        if (query && !`${ticket.subject} ${ticket.user} ${ticket.id}`.toLowerCase().includes(query)) {
          return false;
        }
        return true;
      }),
    [rows, tab, search],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeEnd = safePage * PAGE_SIZE + visible.length;

  const open = rows.filter((ticket) => ticket.status !== "resolved").length;
  const unassigned = rows.filter((ticket) => ticket.assignee === "—").length;
  const resolved = rows.filter((ticket) => ticket.status === "resolved").length;

  function take(ticket: Ticket) {
    setRows((current) =>
      current.map((row) =>
        row.id === ticket.id
          ? { ...row, status: "in_progress" as TicketStatus, assignee: "Vous", sla: "1 h 55" }
          : row,
      ),
    );
    setToast(`Ticket ${ticket.id} assigné à vous.`);
  }

  function resolve(ticket: Ticket) {
    setRows((current) =>
      current.map((row) =>
        row.id === ticket.id
          ? { ...row, status: "resolved" as TicketStatus, sla: "—" }
          : row,
      ),
    );
    setToast(`Ticket ${ticket.id} marqué comme résolu.`);
  }

  function reopen(ticket: Ticket) {
    setRows((current) =>
      current.map((row) =>
        row.id === ticket.id
          ? { ...row, status: "pending" as TicketStatus, sla: "2 h", assignee: "—" }
          : row,
      ),
    );
    setToast(`Ticket ${ticket.id} rouvert.`);
  }

  function handleExport() {
    const ok = exportCsv(
      `duoplay-support-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: "id", label: "Ticket" },
        { key: "subject", label: "Sujet" },
        { key: "user", label: "Client" },
        { key: "category", label: "Catégorie" },
        { key: "priority", label: "Priorité" },
        { key: "status", label: "Statut" },
        { key: "assignee", label: "Assigné à" },
        { key: "sla", label: "SLA" },
      ],
      filtered,
    );
    setToast(
      ok
        ? `${filtered.length} ticket(s) exporté(s) en CSV.`
        : "Aucun ticket à exporter avec ces filtres.",
    );
  }

  return (
    <div className="ad-enter">
      <PageHeader
        title="Support"
        subtitle="Répondez vite, sans jamais accéder aux contenus intimes. Le contexte affiché est limité au strict nécessaire."
        actions={
          <>
            <DemoPill />
            <button
              type="button"
              className="ad-btn ad-btn-outline"
              onClick={handleExport}
            >
              Exporter
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-primary"
              onClick={() => setMacroOpen(true)}
            >
              <MessageSquare className="size-4" strokeWidth={1.9} />
              Macros de réponse
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Tickets ouverts" value={String(open)} delta={`${unassigned} non assigné(s)`} tone="warning" />
        <StatTile label="SLA respecté" value="96,4 %" delta="+1,2 pt" tone="positive" />
        <StatTile label="Temps de 1ʳᵉ réponse" value="42 min" delta="-8 min" tone="positive" />
        <StatTile label="Résolus" value={String(resolved)} delta="sur cette page" tone="plum" />
      </div>

      <TableCard
        title="File de support"
        subtitle={`${filtered.length} ticket(s) sur ${rows.length}`}
        toolbar={
          <>
            <div className="flex flex-wrap items-center gap-1">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  aria-pressed={tab === item.id}
                  className={`h-8 rounded-full px-3 text-[12px] font-medium transition-colors ${
                    tab === item.id ? "ad-bg-plum text-white" : "ad-muted ad-hover-soft"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="relative ml-auto min-w-[220px] flex-1 sm:max-w-[280px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un ticket…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
                aria-label="Rechercher un ticket"
              />
            </div>
          </>
        }
        footer={
          <DemoPagination
            page={safePage}
            pageCount={pageCount}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            total={filtered.length}
            onPage={setPage}
          />
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
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-[12.5px] ad-muted">
                  Aucun ticket ne correspond à ces critères.
                </td>
              </tr>
            )}
            {visible.map((ticket) => (
              <tr key={ticket.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg ad-bg-plum-50 ad-plum">
                      <LifeBuoy className="size-4" />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-medium ad-ink">{ticket.subject}</p>
                      <p className="text-[11px] ad-faint">{ticket.id}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Avatar name={ticket.user} size={26} />
                    <span className="text-[12px]">{ticket.user}</span>
                  </div>
                </td>
                <td className="text-[12px]">{ticket.category}</td>
                <td>
                  <PriorityBadge value={ticket.priority} />
                </td>
                <td className="text-[12px] ad-muted">{ticket.assignee}</td>
                <td>
                  <span className="inline-flex items-center gap-1 text-[12px] ad-muted">
                    <Clock className="size-3" />
                    {ticket.sla}
                  </span>
                </td>
                <td>{statusBadge(ticket.status)}</td>
                <td className="text-right">
                  <RowMenu
                    label={ticket.id}
                    items={[
                      ...(ticket.status === "resolved"
                        ? [
                            {
                              label: "Rouvrir le ticket",
                              icon: <RotateCcw className="size-3.5" />,
                              onSelect: () => reopen(ticket),
                            },
                          ]
                        : [
                            {
                              label:
                                ticket.assignee === "Vous"
                                  ? "Prendre en charge à nouveau"
                                  : "Prendre le ticket",
                              icon: <UserCheck className="size-3.5" />,
                              onSelect: () => take(ticket),
                            },
                            {
                              label: "Marquer comme résolu",
                              icon: <CheckCircle2 className="size-3.5" />,
                              onSelect: () => resolve(ticket),
                            },
                          ]),
                      {
                        label: "Copier l’identifiant",
                        icon: <Copy className="size-3.5" />,
                        onSelect: async () => {
                          const copied = await copyText(ticket.id);
                          setToast(copied ? "Identifiant copié." : "Copie impossible.");
                        },
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <DemoToast message={toast} onClose={() => setToast(null)} />

      {macroOpen && (
        <DemoCreateDialog
          title="Nouvelle macro de réponse"
          description="Les macros restent locales à cette démonstration."
          submitLabel="Enregistrer la macro"
          fields={[
            { key: "name", label: "Nom de la macro", required: true, placeholder: "Relance d’invitation" },
            {
              key: "category",
              label: "Catégorie",
              options: ["Invitation", "Paiement", "Confidentialité", "Technique", "Abonnement"],
              half: true,
            },
            { key: "body", label: "Texte", type: "textarea", required: true, placeholder: "Bonjour, …" },
          ]}
          onClose={() => setMacroOpen(false)}
          onSubmit={(values) => {
            setMacroOpen(false);
            setToast(`Macro « ${values.name} » enregistrée.`);
          }}
        />
      )}
    </div>
  );
}
