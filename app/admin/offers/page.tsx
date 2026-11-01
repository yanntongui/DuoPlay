"use client";

import { useState } from "react";
import { BadgePercent, Check, Copy, Plus, Search, Tag, Ticket } from "lucide-react";
import {
  Badge,
  Card,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";

const PLANS = [
  {
    name: "Gratuit",
    price: "0 €",
    period: "pour toujours",
    desc: "Découverte de l'application, 2 expériences par semaine.",
    features: ["2 expériences / semaine", "1 couple", "Historique 7 jours"],
    tone: "neutral" as const,
    current: false,
  },
  {
    name: "Premium mensuel",
    price: "9,99 €",
    period: "par mois",
    desc: "L'accès complet, sans engagement.",
    features: ["Expériences illimitées", "Tous les niveaux d'intensité", "Historique complet", "Support prioritaire"],
    tone: "plum" as const,
    current: true,
  },
  {
    name: "Premium annuel",
    price: "79 €",
    period: "par an · soit 6,58 €/mois",
    desc: "Deux mois offerts par rapport au mensuel.",
    features: ["Tout Premium", "2 mois offerts", "Accès anticipé aux nouveautés", "Badge ambassadeur"],
    tone: "positive" as const,
    current: false,
  },
];

const PROMOS = [
  { code: "AMOUR2026", type: "Pourcentage", value: "-30 %", uses: "412 / 1 000", expiry: "31 déc. 2026", status: "active" },
  { code: "SAINTVALENTIN", type: "Pourcentage", value: "-50 %", uses: "1 890 / 2 000", expiry: "14 févr. 2027", status: "active" },
  { code: "BIENVENUE7", type: "Essai", value: "7 jours", uses: "3 204 / ∞", expiry: "—", status: "active" },
  { code: "RENTREE25", type: "Pourcentage", value: "-25 %", uses: "874 / 1 000", expiry: "30 sept. 2026", status: "expired" },
  { code: "PARTENAIRE50", type: "Montant fixe", value: "-50 €", uses: "12 / 200", expiry: "31 janv. 2027", status: "paused" },
];

export default function AdminOffers() {
  const [search, setSearch] = useState("");

  const rows = PROMOS.filter((p) =>
    `${p.code} ${p.type}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="ad-enter">
      <PageHeader
        title="Offres & promotions"
        subtitle="Structurez les plans et pilotez les codes promo. Toute remise supérieure à 50 % nécessite une validation finance."
        actions={
          <>
            <button className="ad-btn ad-btn-outline">
              <Ticket className="size-4" strokeWidth={1.9} />
              Historique des remises
            </button>
            <button className="ad-btn ad-btn-primary">
              <Plus className="size-4" strokeWidth={2.2} />
              Nouveau code promo
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Abonnés premium" value="12 340" delta="+0,9 %" tone="plum" />
        <StatTile label="Part d'annuel" value="31 %" delta="+2,1 pts" tone="positive" />
        <StatTile label="Codes actifs" value="3" delta="2 expirent bientôt" tone="warning" />
        <StatTile label="Remises (30 j)" value="4 218 €" delta="-8,2 %" tone="positive" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`ad-card flex flex-col p-[22px] ${
              p.current ? "ring-1 ring-[#c9b3c4]" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] font-semibold ad-ink">{p.name}</p>
                <p className="mt-0.5 text-[11px] ad-muted">{p.desc}</p>
              </div>
              {p.current && <Badge tone="plum">Populaire</Badge>}
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-[30px] font-semibold leading-none tracking-[-0.03em] ad-ink">
                {p.price}
              </span>
              <span className="text-[11.5px] ad-faint">{p.period}</span>
            </div>
            <ul className="mt-4 flex-1 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[11.5px] ad-soft">
                  <Check className="mt-0.5 size-3.5 shrink-0 ad-positive" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="ad-btn ad-btn-outline mt-4 h-9 w-full text-[12px]">
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
            ].map((r) => (
              <div key={r.l}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[12px] ad-soft">{r.l}</span>
                  <span className="text-[12px] font-semibold ad-ink">{r.v}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full ad-bg-sunk">
                  <div className="h-full rounded-full ad-bg-plum" style={{ width: `${r.w}%` }} />
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
        subtitle={`${rows.length} code(s)`}
        action={
          <div className="relative min-w-[190px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 ad-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un code…"
              className="ad-input h-9 ad-pl-9 text-[12.5px]"
            />
          </div>
        }
        footer={<span>Les remises sont appliquées côté serveur, jamais dans le client.</span>}
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
            {rows.map((p) => (
              <tr key={p.code}>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg ad-bg-plum-50 ad-plum">
                      <Tag className="size-3.5" />
                    </span>
                    <span className="font-mono text-[12px] font-medium ad-ink">{p.code}</span>
                  </div>
                </td>
                <td className="text-[12px]">{p.type}</td>
                <td className="text-[12.5px] font-semibold ad-ink">{p.value}</td>
                <td className="text-[12px] ad-muted">{p.uses}</td>
                <td className="text-[12px] ad-muted">{p.expiry}</td>
                <td>
                  {p.status === "active" ? (
                    <Badge tone="positive">Actif</Badge>
                  ) : p.status === "expired" ? (
                    <Badge tone="neutral">Expiré</Badge>
                  ) : (
                    <Badge tone="warning">En pause</Badge>
                  )}
                </td>
                <td className="text-right">
                  <button className="ad-btn ad-btn-outline h-8 px-3 text-[11.5px]">Modifier</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
