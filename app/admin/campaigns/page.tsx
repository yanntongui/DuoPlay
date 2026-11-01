"use client";

import { useState } from "react";
import {
  BarChart3,
  Mail,
  Megaphone,
  Plus,
  Search,
  Send,
  Smartphone,
  SquareStack,
} from "lucide-react";
import {
  Badge,
  Card,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";

type Channel = "email" | "push" | "in-app";

type Campaign = {
  name: string;
  channel: Channel;
  audience: string;
  sent: string;
  open: string;
  click: string;
  status: "completed" | "in_progress" | "scheduled" | "draft";
  date: string;
};

const CAMPAIGNS: Campaign[] = [
  { name: "Rétrospective de novembre", channel: "email", audience: "Actifs hebdomadaires", sent: "18 402", open: "46,2 %", click: "12,8 %", status: "completed", date: "28 oct." },
  { name: "Invitation partenaire — relance J+3", channel: "push", audience: "Invitations non acceptées", sent: "2 108", open: "61,4 %", click: "22,1 %", status: "in_progress", date: "1 nov." },
  { name: "Offre annuelle — dernière semaine", channel: "email", audience: "Abonnés mensuels", sent: "4 902", open: "38,7 %", click: "9,4 %", status: "completed", date: "24 oct." },
  { name: "Nouvelle expérience : Roue des envies", channel: "in-app", audience: "Tous les couples", sent: "—", open: "—", click: "18,3 %", status: "scheduled", date: "4 nov." },
  { name: "Réactivation — 21 jours d'inactivité", channel: "email", audience: "À risque de churn", sent: "—", open: "—", click: "—", status: "draft", date: "—" },
];

const TABS = [
  { id: "all", label: "Toutes" },
  { id: "in_progress", label: "En cours" },
  { id: "scheduled", label: "Programmées" },
  { id: "draft", label: "Brouillons" },
];

function ChannelBadge({ channel }: { channel: Channel }) {
  if (channel === "email")
    return (
      <Badge tone="info">
        <Mail className="size-3" /> E-mail
      </Badge>
    );
  if (channel === "push")
    return (
      <Badge tone="plum">
        <Smartphone className="size-3" /> Push
      </Badge>
    );
  return (
    <Badge tone="neutral">
      <SquareStack className="size-3" /> In-app
    </Badge>
  );
}

export default function AdminCampaigns() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const rows = CAMPAIGNS.filter((c) => {
    if (tab !== "all" && c.status !== tab) return false;
    if (search && !`${c.name} ${c.audience}`.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="ad-enter">
      <PageHeader
        title="Campagnes"
        subtitle="Communiquez au bon moment, sans jamais franchir la ligne du respect. Chaque envoi respecte les préférences et le consentement."
        actions={
          <>
            <button className="ad-btn ad-btn-outline">
              <BarChart3 className="size-4" strokeWidth={1.9} />
              Rapport
            </button>
            <button className="ad-btn ad-btn-primary">
              <Plus className="size-4" strokeWidth={2.2} />
              Nouvelle campagne
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Campagnes ce mois" value="14" delta="+3" tone="plum" />
        <StatTile label="Taux d'ouverture" value="43,1 %" delta="+2,4 pts" tone="positive" />
        <StatTile label="Taux de clic" value="11,6 %" delta="+0,9 pt" tone="positive" />
        <StatTile label="Désabonnements" value="0,42 %" delta="-0,06 pt" tone="positive" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card
          title="Performance des envois"
          subtitle="Taux d'ouverture · 8 dernières semaines"
          className="xl:col-span-8"
          action={<Badge tone="positive">Tendance haussière</Badge>}
        >
          <div className="flex h-[190px] items-end gap-2 sm:gap-4">
            {[32, 38, 34, 41, 39, 46, 44, 43].map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full max-w-[46px] items-end" style={{ height: 158 }}>
                  <div
                    className={i === 7 ? "ad-bar w-full" : "ad-bar-muted w-full"}
                    style={{ height: `${(v / 50) * 100}%` }}
                  />
                </div>
                <span className={`text-[10px] ${i === 7 ? "font-semibold ad-ink" : "ad-faint"}`}>
                  S{i + 1}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div className="ad-card-dark flex flex-col justify-between p-[22px] xl:col-span-4">
          <div className="relative z-10 flex items-center gap-2">
            <Send className="size-4 text-white/70" />
            <p className="text-[12.5px] font-medium text-white/70">Prochain envoi</p>
          </div>
          <div className="relative z-10 mt-4">
            <p className="text-[15px] font-semibold leading-snug text-white">
              Roue des envies — annonce in-app
            </p>
            <p className="mt-1 text-[11.5px] text-white/55">
              4 novembre · 10:00 · 8 145 couples
            </p>
          </div>
          <div className="relative z-10 mt-4 flex items-center justify-between">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-medium text-white/80">
              Validée par 2 admins
            </span>
            <button className="inline-flex size-9 items-center justify-center rounded-full bg-white/12 ad-hover-white-20 text-white">
              <Megaphone className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <TableCard
        title="Toutes les campagnes"
        subtitle={`${rows.length} campagne(s)`}
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
                placeholder="Rechercher…"
                className="ad-input h-9 ad-pl-9 text-[12.5px]"
              />
            </div>
          </>
        }
        footer={
          <>
            <span>Aucun envoi entre 22:00 et 08:00 (heure locale).</span>
            <span className="ad-faint">Consentement vérifié à l&apos;envoi</span>
          </>
        }
      >
        <table className="ad-table">
          <thead>
            <tr>
              <th>Campagne</th>
              <th>Canal</th>
              <th>Audience</th>
              <th>Envoyés</th>
              <th>Ouverture</th>
              <th>Clic</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.name}>
                <td className="max-w-[260px]">
                  <p className="truncate text-[12.5px] font-medium ad-ink">{c.name}</p>
                </td>
                <td>
                  <ChannelBadge channel={c.channel} />
                </td>
                <td className="text-[12px] ad-muted">{c.audience}</td>
                <td className="text-[12px]">{c.sent}</td>
                <td className="text-[12px] font-medium ad-ink">{c.open}</td>
                <td className="text-[12px]">{c.click}</td>
                <td>
                  {c.status === "completed" ? (
                    <Badge tone="positive">Envoyée</Badge>
                  ) : c.status === "in_progress" ? (
                    <Badge tone="info">En cours</Badge>
                  ) : c.status === "scheduled" ? (
                    <Badge tone="plum">Programmée</Badge>
                  ) : (
                    <Badge tone="warning">Brouillon</Badge>
                  )}
                </td>
                <td className="text-[11.5px] ad-faint">{c.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
