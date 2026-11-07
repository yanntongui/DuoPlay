"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  Copy,
  HeartHandshake,
  Link2Off,
  RefreshCw,
  RotateCcw,
  Search,
} from "lucide-react";
import {
  Badge,
  PageHeader,
  StatTile,
  StatusBadge,
  TableCard,
} from "@/components/admin/ui";
import {
  DemoPagination,
  DemoPill,
  DemoToast,
  RowMenu,
  exportCsv,
  useDemoRows,
} from "@/components/admin/demo-kit";
import { copyText } from "@/lib/clipboard";

type CoupleStatus = "active" | "pending" | "suspended";
type SyncState = "ok" | "pending" | "failed";

type Couple = {
  id: string;
  a: string;
  b: string;
  status: CoupleStatus;
  plan: string;
  created: string;
  seen: string;
  sync: SyncState;
};

const SEED: Couple[] = [
  { id: "c_2208", a: "Camille R.", b: "Lukas B.", status: "active", plan: "Premium", created: "2026-09-14", seen: "il y a 4 min", sync: "ok" },
  { id: "c_2207", a: "Nadia E.", b: "Yassine E.", status: "active", plan: "Premium annuel", created: "2026-09-11", seen: "il y a 1 h", sync: "ok" },
  { id: "c_2206", a: "Diego F.", b: "—", status: "pending", plan: "Gratuit", created: "2026-09-08", seen: "invitation envoyée", sync: "pending" },
  { id: "c_2205", a: "Sofia M.", b: "Marco M.", status: "suspended", plan: "Gratuit", created: "2026-09-02", seen: "il y a 9 j", sync: "failed" },
  { id: "c_2204", a: "Marta N.", b: "Piotr N.", status: "active", plan: "Premium", created: "2026-08-28", seen: "il y a 2 h", sync: "ok" },
  { id: "c_2203", a: "Léa D.", b: "Samir K.", status: "active", plan: "Premium annuel", created: "2026-08-21", seen: "hier", sync: "ok" },
  { id: "c_2202", a: "Ana P.", b: "—", status: "pending", plan: "Gratuit", created: "2026-08-19", seen: "invitation envoyée", sync: "pending" },
  { id: "c_2201", a: "Inès B.", b: "Thomas B.", status: "active", plan: "Premium", created: "2026-08-12", seen: "il y a 3 j", sync: "ok" },
  { id: "c_2200", a: "Clara V.", b: "Hugo V.", status: "active", plan: "Gratuit", created: "2026-08-04", seen: "il y a 6 j", sync: "failed" },
];

const PAGE_SIZE = 5;
const STORAGE_KEY = "duoplay.admin.couples.v1";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date);
}

function syncBadge(sync: SyncState) {
  if (sync === "ok") return <Badge tone="positive">Synchronisé</Badge>;
  if (sync === "failed") return <Badge tone="danger">Échec</Badge>;
  return <Badge tone="warning">En attente</Badge>;
}

export default function AdminCouples() {
  const [rows, setRows] = useDemoRows<Couple>(STORAGE_KEY, SEED);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setPage(0);
  }, [search, status]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        const query = search.trim().toLowerCase();
        if (query && !`${row.a} ${row.b} ${row.id}`.toLowerCase().includes(query)) {
          return false;
        }
        if (status !== "all" && row.status !== status) return false;
        return true;
      }),
    [rows, search, status],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeEnd = safePage * PAGE_SIZE + visible.length;

  const active = rows.filter((row) => row.status === "active").length;
  const pending = rows.filter((row) => row.status === "pending").length;
  const failed = rows.filter((row) => row.sync === "failed").length;

  function resync(couple: Couple) {
    setRows((current) =>
      current.map((row) =>
        row.id === couple.id ? { ...row, sync: "ok", seen: "à l’instant" } : row,
      ),
    );
    setToast(`Couple ${couple.id} resynchronisé.`);
  }

  function resyncAll() {
    const broken = rows.filter((row) => row.sync !== "ok").length;
    if (broken === 0) {
      setToast("Tous les couples sont déjà synchronisés.");
      return;
    }
    setRows((current) =>
      current.map((row) => (row.sync === "ok" ? row : { ...row, sync: "ok" })),
    );
    setToast(`${broken} couple(s) resynchronisé(s).`);
  }

  function toggleStatus(couple: Couple) {
    const nextStatus: CoupleStatus =
      couple.status === "suspended" ? "active" : "suspended";
    setRows((current) =>
      current.map((row) =>
        row.id === couple.id ? { ...row, status: nextStatus } : row,
      ),
    );
    setToast(
      nextStatus === "suspended"
        ? `Couple ${couple.id} suspendu.`
        : `Couple ${couple.id} réactivé.`,
    );
  }

  function unlink(couple: Couple) {
    setRows((current) => current.filter((row) => row.id !== couple.id));
    setToast(`Couple ${couple.id} dissocié.`);
  }

  function handleExport() {
    const ok = exportCsv(
      `duoplay-couples-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: "id", label: "Identifiant" },
        { key: "a", label: "Membre A" },
        { key: "b", label: "Membre B" },
        { key: "status", label: "Statut" },
        { key: "plan", label: "Offre" },
        { key: "sync", label: "Synchronisation" },
        { key: "created", label: "Créé le" },
      ],
      filtered.map((row) => ({ ...row, created: formatDate(row.created) })),
    );
    setToast(
      ok
        ? `${filtered.length} couple(s) exporté(s) en CSV.`
        : "Aucun couple à exporter avec ces filtres.",
    );
  }

  return (
    <div className="ad-enter">
      <PageHeader
        title="Couples"
        subtitle="Suivez les invitations, la synchronisation et les abonnements partagés — sans jamais exposer les échanges privés."
        actions={
          <>
            <DemoPill />
            <button
              type="button"
              className="ad-btn ad-btn-outline"
              onClick={handleExport}
            >
              <RotateCcw className="size-4" strokeWidth={1.9} />
              Exporter
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-primary"
              onClick={resyncAll}
            >
              <RefreshCw className="size-4" strokeWidth={1.9} />
              Resynchroniser
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Couples actifs" value={String(active)} delta="+6,1 %" tone="positive" />
        <StatTile label="Invitations en attente" value={String(pending)} delta="+18" tone="warning" />
        <StatTile label="Synchronisations en échec" value={String(failed)} delta="à traiter" tone="danger" />
        <StatTile label="Abonnements partagés" value={String(active * 2)} delta="+2,4 %" tone="plum" />
      </div>

      <TableCard
        title="Tous les couples"
        subtitle={`${filtered.length} résultat(s) sur ${rows.length}`}
        toolbar={
          <>
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un couple…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
                aria-label="Rechercher un couple"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="ad-select h-9 text-[12.5px]"
              aria-label="Filtrer par statut"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="pending">En attente</option>
              <option value="suspended">Suspendu</option>
            </select>
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
              <th>Couple</th>
              <th>Statut</th>
              <th>Offre</th>
              <th>Créé le</th>
              <th>Dernière activité</th>
              <th>Synchronisation</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[12.5px] ad-muted">
                  Aucun couple ne correspond à ces critères.
                </td>
              </tr>
            )}
            {visible.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-full ad-bg-plum-50 ad-plum">
                      <HeartHandshake className="size-4" />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-medium ad-ink">
                        {row.a} <span className="ad-faint">·</span> {row.b}
                      </p>
                      <p className="text-[11px] ad-faint">{row.id}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <StatusBadge status={row.status} />
                </td>
                <td className="text-[12.5px]">{row.plan}</td>
                <td className="text-[12.5px]">{formatDate(row.created)}</td>
                <td className="text-[12.5px] ad-muted">{row.seen}</td>
                <td>{syncBadge(row.sync)}</td>
                <td className="text-right">
                  <RowMenu
                    label={row.id}
                    items={[
                      {
                        label: "Resynchroniser",
                        icon: <RefreshCw className="size-3.5" />,
                        onSelect: () => resync(row),
                      },
                      {
                        label: "Copier l’identifiant",
                        icon: <Copy className="size-3.5" />,
                        onSelect: async () => {
                          const copied = await copyText(row.id);
                          setToast(copied ? "Identifiant copié." : "Copie impossible.");
                        },
                      },
                      {
                        label:
                          row.status === "suspended"
                            ? "Réactiver le couple"
                            : "Suspendre le couple",
                        icon:
                          row.status === "suspended" ? (
                            <RotateCcw className="size-3.5" />
                          ) : (
                            <Ban className="size-3.5" />
                          ),
                        onSelect: () => toggleStatus(row),
                      },
                      {
                        label: "Dissocier",
                        icon: <Link2Off className="size-3.5" />,
                        tone: "danger",
                        confirm: `${row.a} et ${row.b} seront dissociés. Action locale à la démonstration.`,
                        onSelect: () => unlink(row),
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
    </div>
  );
}
