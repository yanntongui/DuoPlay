"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  BadgePercent,
  Check,
  Copy,
  PauseCircle,
  PlayCircle,
  Plus,
  Search,
  Tag,
  Ticket,
  Trash2,
} from "lucide-react";
import {
  Badge,
  Card,
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
import { adminPortalHost } from "@/lib/admin/portal";
import { copyText } from "@/lib/clipboard";

type PromoStatus = "active" | "expired" | "paused";

type Promo = {
  code: string;
  type: string;
  value: string;
  uses: string;
  expiry: string;
  status: PromoStatus;
};

type Plan = {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  tone: "neutral" | "plum" | "positive";
  current: boolean;
};

const SEED: Promo[] = [
  { code: "AMOUR2026", type: "Pourcentage", value: "-30 %", uses: "412 / 1 000", expiry: "31 déc. 2026", status: "active" },
  { code: "SAINTVALENTIN", type: "Pourcentage", value: "-50 %", uses: "1 890 / 2 000", expiry: "14 févr. 2027", status: "active" },
  { code: "BIENVENUE7", type: "Essai", value: "7 jours", uses: "3 204 / ∞", expiry: "—", status: "active" },
  { code: "RENTREE25", type: "Pourcentage", value: "-25 %", uses: "874 / 1 000", expiry: "30 sept. 2026", status: "expired" },
  { code: "PARTENAIRE50", type: "Montant fixe", value: "-50 €", uses: "12 / 200", expiry: "31 janv. 2027", status: "paused" },
  { code: "DUO10", type: "Pourcentage", value: "-10 %", uses: "96 / 500", expiry: "31 mars 2027", status: "active" },
  { code: "NOEL2026", type: "Montant fixe", value: "-15 €", uses: "640 / 800", expiry: "25 déc. 2026", status: "paused" },
];

const PROMO_TYPES = ["Pourcentage", "Montant fixe", "Essai"];

const INITIAL_PLANS: Plan[] = [
  {
    name: "Gratuit",
    price: "0 €",
    period: "pour toujours",
    desc: "Découverte de l'application, 2 expériences par semaine.",
    features: ["2 expériences / semaine", "1 couple", "Historique 7 jours"],
    tone: "neutral",
    current: false,
  },
  {
    name: "Premium mensuel",
    price: "9,99 €",
    period: "par mois",
    desc: "L'accès complet, sans engagement.",
    features: ["Expériences illimitées", "Tous les niveaux d'intensité", "Historique complet", "Support prioritaire"],
    tone: "plum",
    current: true,
  },
  {
    name: "Premium annuel",
    price: "79 €",
    period: "par an · soit 6,58 €/mois",
    desc: "Deux mois offerts par rapport au mensuel.",
    features: ["Tout Premium", "2 mois offerts", "Accès anticipé aux nouveautés", "Badge ambassadeur"],
    tone: "positive",
    current: false,
  },
];

const HISTORY = [
  { code: "RENTREE25", type: "Pourcentage", value: "-25 %", used: 874, expired: "30 sept. 2026" },
  { code: "PRINTEMPS26", type: "Pourcentage", value: "-20 %", used: 1204, expired: "31 mai 2026" },
  { code: "LANCEMENT", type: "Essai", value: "14 jours", used: 986, expired: "1 mars 2026" },
];

const PAGE_SIZE = 5;
const STORAGE_KEY = "duoplay.admin.offers.v1";
const PLANS_KEY = "duoplay.admin.plans.v1";

function statusBadge(status: PromoStatus) {
  if (status === "active") return <Badge tone="positive">Actif</Badge>;
  if (status === "expired") return <Badge tone="neutral">Expiré</Badge>;
  return <Badge tone="warning">En pause</Badge>;
}

export default function AdminOffers() {
  const [rows, setRows] = useDemoRows<Promo>(STORAGE_KEY, SEED);
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [dialog, setDialog] = useState<"promo" | "history" | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PLANS_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) setPlans(parsed as Plan[]);
      }
    } catch {
      // Stockage indisponible : on garde les plans par défaut.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
    } catch {
      // Quota dépassé : la démo reste utilisable en mémoire.
    }
  }, [plans]);

  useEffect(() => {
    setPage(0);
  }, [search, status]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        const query = search.trim().toLowerCase();
        if (query && !`${row.code} ${row.type}`.toLowerCase().includes(query)) {
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

  const activeCodes = rows.filter((row) => row.status === "active").length;

  function togglePause(promo: Promo) {
    const nextStatus: PromoStatus = promo.status === "paused" ? "active" : "paused";
    setRows((current) =>
      current.map((row) =>
        row.code === promo.code ? { ...row, status: nextStatus } : row,
      ),
    );
    setToast(
      nextStatus === "paused"
        ? `Code ${promo.code} mis en pause.`
        : `Code ${promo.code} réactivé.`,
    );
  }

  function remove(promo: Promo) {
    setRows((current) => current.filter((row) => row.code !== promo.code));
    setToast(`Code ${promo.code} supprimé.`);
  }

  function handleExport() {
    const ok = exportCsv(
      `duoplay-promotions-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: "code", label: "Code" },
        { key: "type", label: "Type" },
        { key: "value", label: "Valeur" },
        { key: "uses", label: "Utilisations" },
        { key: "expiry", label: "Expiration" },
        { key: "status", label: "Statut" },
      ],
      filtered,
    );
    setToast(
      ok
        ? `${filtered.length} code(s) exporté(s).`
        : "Aucun code à exporter avec ces filtres.",
    );
  }

  return (
    <div className="ad-enter">
      <PageHeader
        title="Offres & promotions"
        subtitle="Structurez les plans et pilotez les codes promo. Toute remise supérieure à 50 % nécessite une validation finance."
        actions={
          <>
            <DemoPill />
            <button
              type="button"
              className="ad-btn ad-btn-outline"
              onClick={() => setDialog("history")}
            >
              <Ticket className="size-4" strokeWidth={1.9} />
              Historique des remises
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-primary"
              onClick={() => setDialog("promo")}
            >
              <Plus className="size-4" strokeWidth={2.2} />
              Nouveau code promo
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Abonnés premium" value="12 340" delta="+0,9 %" tone="plum" />
        <StatTile label="Part d'annuel" value="31 %" delta="+2,1 pts" tone="positive" />
        <StatTile label="Codes actifs" value={String(activeCodes)} delta={`${rows.length - activeCodes} inactif(s)`} tone="warning" />
        <StatTile label="Remises (30 j)" value="4 218 €" delta="-8,2 %" tone="positive" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`ad-card flex flex-col p-[22px] ${
              plan.current ? "ring-1 ring-[#c9b3c4]" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] font-semibold ad-ink">{plan.name}</p>
                <p className="mt-0.5 text-[11px] ad-muted">{plan.desc}</p>
              </div>
              {plan.current && <Badge tone="plum">Populaire</Badge>}
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-[30px] font-semibold leading-none tracking-[-0.03em] ad-ink">
                {plan.price}
              </span>
              <span className="text-[11.5px] ad-faint">{plan.period}</span>
            </div>
            <ul className="mt-4 flex-1 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-[11.5px] ad-soft">
                  <Check className="mt-0.5 size-3.5 shrink-0 ad-positive" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="ad-btn ad-btn-outline mt-4 h-9 w-full text-[12px]"
              onClick={() => setEditingPlan(plan)}
            >
              Modifier le plan
            </button>
          </div>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card
          title="Répartition des revenus"
          subtitle="Par offre · novembre 2026"
          className="xl:col-span-7"
        >
          <div className="space-y-3.5">
            {[
              { l: "Premium mensuel", v: "62 %", w: 62 },
              { l: "Premium annuel", v: "31 %", w: 31 },
              { l: "Achats ponctuels", v: "7 %", w: 7 },
            ].map((row) => (
              <div key={row.l}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[12px] ad-soft">{row.l}</span>
                  <span className="text-[12px] font-semibold ad-ink">{row.v}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full ad-bg-sunk">
                  <div className="h-full rounded-full ad-bg-plum" style={{ width: `${row.w}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Garde-fous promotions" className="xl:col-span-5">
          <div className="space-y-3 text-[11.5px] leading-snug ad-muted">
            <div className="flex items-start gap-2">
              <BadgePercent className="mt-0.5 size-3.5 shrink-0 ad-plum" />
              Remise maximale cumulée : 50 %.
            </div>
            <div className="flex items-start gap-2">
              <Copy className="mt-0.5 size-3.5 shrink-0 ad-plum" />
              Un code ne peut être utilisé qu&apos;une fois par compte.
            </div>
            <div className="flex items-start gap-2">
              <Tag className="mt-0.5 size-3.5 shrink-0 ad-plum" />
              Les codes partenaires sont limités dans le temps et suivis par source.
            </div>
          </div>
          <div className="mt-4 rounded-xl ad-bg-soft p-3 text-[11px] leading-snug ad-muted">
            Un code expiré reste visible 12 mois en lecture seule pour l&apos;audit
            comptable.
          </div>
        </Card>
      </div>

      <TableCard
        title="Codes promotionnels"
        subtitle={`${filtered.length} code(s) sur ${rows.length}`}
        toolbar={
          <>
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un code…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
                aria-label="Rechercher un code promo"
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
              <option value="paused">En pause</option>
              <option value="expired">Expiré</option>
            </select>
            <button
              type="button"
              onClick={handleExport}
              className="ad-btn ad-btn-outline h-9 px-3 text-[12.5px]"
            >
              Exporter
            </button>
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
            note="Les remises sont appliquées côté serveur, jamais dans le client."
          />
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Valeur</th>
              <th>Utilisations</th>
              <th>Expiration</th>
              <th>Statut</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[12.5px] ad-muted">
                  Aucun code ne correspond à ces critères.
                </td>
              </tr>
            )}
            {visible.map((promo) => (
              <tr key={promo.code}>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg ad-bg-plum-50 ad-plum">
                      <Tag className="size-3.5" />
                    </span>
                    <span className="font-mono text-[12px] font-medium ad-ink">{promo.code}</span>
                  </div>
                </td>
                <td className="text-[12px]">{promo.type}</td>
                <td className="text-[12.5px] font-semibold ad-ink">{promo.value}</td>
                <td className="text-[12px] ad-muted">{promo.uses}</td>
                <td className="text-[12px] ad-muted">{promo.expiry}</td>
                <td>{statusBadge(promo.status)}</td>
                <td className="text-right">
                  <RowMenu
                    label={promo.code}
                    items={[
                      {
                        label: "Copier le code",
                        icon: <Copy className="size-3.5" />,
                        onSelect: async () => {
                          const copied = await copyText(promo.code);
                          setToast(copied ? "Code copié." : "Copie impossible.");
                        },
                      },
                      ...(promo.status === "expired"
                        ? []
                        : [
                            {
                              label:
                                promo.status === "paused" ? "Réactiver" : "Mettre en pause",
                              icon:
                                promo.status === "paused" ? (
                                  <PlayCircle className="size-3.5" />
                                ) : (
                                  <PauseCircle className="size-3.5" />
                                ),
                              onSelect: () => togglePause(promo),
                            },
                          ]),
                      {
                        label: "Supprimer",
                        icon: <Trash2 className="size-3.5" />,
                        tone: "danger",
                        confirm: `Supprimer le code ${promo.code} ? Action locale à la démonstration.`,
                        onSelect: () => remove(promo),
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

      {dialog === "promo" && (
        <DemoCreateDialog
          title="Nouveau code promo"
          description="Le code est ajouté à cette démonstration, dans ce navigateur."
          submitLabel="Créer le code"
          fields={[
            { key: "code", label: "Code", required: true, placeholder: "AMOUR2027" },
            { key: "type", label: "Type", options: PROMO_TYPES, half: true },
            { key: "value", label: "Valeur", required: true, placeholder: "-20 %", half: true },
            { key: "max", label: "Utilisations max.", type: "number", placeholder: "1000", half: true },
            { key: "expiry", label: "Expiration", placeholder: "31 déc. 2027", half: true },
          ]}
          onClose={() => setDialog(null)}
          onSubmit={(values) => {
            const code = values.code.toUpperCase().replace(/\s+/g, "");
            if (rows.some((row) => row.code === code)) {
              setToast(`Le code ${code} existe déjà.`);
              return;
            }
            const max = values.max || "∞";
            setRows((current) => [
              {
                code,
                type: values.type,
                value: values.value,
                uses: `0 / ${max}`,
                expiry: values.expiry || "—",
                status: "active",
              },
              ...current,
            ]);
            setDialog(null);
            setPage(0);
            setToast(`Code ${code} créé.`);
          }}
        />
      )}

      {dialog === "history" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
            <button
              type="button"
              aria-label="Fermer"
              className="ad-scrim"
              onClick={() => setDialog(null)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Historique des remises"
              className="ad-card relative z-50 max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-b-none p-5 sm:rounded-2xl sm:p-6"
            >
              <h2 className="text-[18px] font-semibold tracking-[-0.02em] ad-ink">
                Historique des remises
              </h2>
              <p className="mt-1 text-[12.5px] ad-muted">
                Codes expirés conservés 12 mois en lecture seule.
              </p>
              <div className="mt-4 divide-y ad-bd">
                {HISTORY.map((entry) => (
                  <div key={entry.code} className="flex items-center justify-between py-2.5">
                    <span className="font-mono text-[12px] ad-ink">{entry.code}</span>
                    <span className="text-[11.5px] ad-muted">{entry.type} · {entry.value}</span>
                    <span className="text-[11.5px] ad-faint">{entry.expired}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  className="ad-btn ad-btn-primary h-10 px-4 text-[12.5px]"
                  onClick={() => setDialog(null)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>,
          adminPortalHost() ?? document.body,
        )}

      {editingPlan && (
        <DemoCreateDialog
          title={`Modifier « ${editingPlan.name} »`}
          description="Le tarif est mis à jour pour cette démonstration uniquement."
          submitLabel="Enregistrer"
          fields={[
            { key: "price", label: "Prix", required: true, defaultValue: editingPlan.price, half: true },
            { key: "period", label: "Période", defaultValue: editingPlan.period, half: true },
            { key: "desc", label: "Description", type: "textarea", defaultValue: editingPlan.desc },
          ]}
          onClose={() => setEditingPlan(null)}
          onSubmit={(values) => {
            setPlans((current) =>
              current.map((plan) =>
                plan.name === editingPlan.name
                  ? { ...plan, price: values.price, period: values.period, desc: values.desc }
                  : plan,
              ),
            );
            setEditingPlan(null);
            setToast(`Plan « ${editingPlan.name} » mis à jour.`);
          }}
        />
      )}
    </div>
  );
}
