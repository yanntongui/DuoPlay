"use client";

import { useState } from "react";
import { ArrowUpRight, CalendarDays, Download, TrendingUp, Users } from "lucide-react";
import {
  Badge,
  Card,
  PageHeader,
  StatTile,
  TableCard,
} from "@/components/admin/ui";

const MONTHS = [
  { m: "Déc.", v: 42 },
  { m: "Janv.", v: 48 },
  { m: "Févr.", v: 45 },
  { m: "Mars", v: 56 },
  { m: "Avr.", v: 61 },
  { m: "Mai", v: 58 },
  { m: "Juin", v: 69 },
  { m: "Juil.", v: 64 },
  { m: "Août", v: 72 },
  { m: "Sept.", v: 79 },
  { m: "Oct.", v: 88 },
  { m: "Nov.", v: 82 },
];

const SOURCES = [
  { l: "Recherche organique", v: "38 %", w: 38, tone: "plum" },
  { l: "Bouche à oreille", v: "24 %", w: 24, tone: "plum" },
  { l: "Réseaux sociaux", v: "18 %", w: 18, tone: "plum" },
  { l: "Campagnes payantes", v: "12 %", w: 12, tone: "plum" },
  { l: "Partenariats", v: "8 %", w: 8, tone: "plum" },
];

const COHORTS = [
  { c: "Juin 2026", size: "4 120", m1: "82 %", m2: "68 %", m3: "57 %", m4: "49 %", m5: "44 %" },
  { c: "Juillet 2026", size: "4 890", m1: "84 %", m2: "71 %", m3: "60 %", m4: "52 %", m5: "—" },
  { c: "Août 2026", size: "5 210", m1: "81 %", m2: "66 %", m3: "58 %", m4: "—", m5: "—" },
  { c: "Sept. 2026", size: "5 640", m1: "86 %", m2: "72 %", m3: "—", m4: "—", m5: "—" },
  { c: "Oct. 2026", size: "6 102", m1: "88 %", m2: "—", m3: "—", m4: "—", m5: "—" },
];

const RANGES = ["7 jours", "30 jours", "90 jours", "12 mois"];

export default function AdminAnalytics() {
  const [range, setRange] = useState("30 jours");

  return (
    <div className="ad-enter">
      <PageHeader
        title="Analytics"
        subtitle="Acquisition, engagement et rétention. Les chiffres sont agrégés et ne permettent jamais de réidentifier un couple."
        actions={
          <>
            <div className="flex items-center gap-1 rounded-full border ad-bd ad-bg-surface p-1">
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`h-8 rounded-full px-3 text-[12px] font-medium transition-colors ${
                    range === r ? "ad-bg-plum text-white" : "ad-muted ad-hover-soft"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <button className="ad-btn ad-btn-outline">
              <Download className="size-4" strokeWidth={1.9} />
              Exporter
            </button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Sessions de jeu" value="412 806" delta="+14,2 %" tone="positive" />
        <StatTile label="Utilisateurs actifs" value="24 582" delta="+12,4 %" tone="positive" />
        <StatTile label="Rétention M1" value="86 %" delta="+1,8 pt" tone="plum" />
        <StatTile label="Durée moyenne" value="18 min 40 s" delta="+52 s" tone="positive" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card
          title="Croissance des utilisateurs actifs"
          subtitle="Moyenne mensuelle sur 12 mois"
          className="xl:col-span-8"
          action={
            <Badge tone="positive">
              <ArrowUpRight className="size-3" /> +12,4 %
            </Badge>
          }
        >
          <div className="flex h-[240px] items-end gap-1.5 sm:gap-3">
            {MONTHS.map((m, i) => (
              <div key={m.m} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full items-end justify-center" style={{ height: 196 }}>
                  {i === MONTHS.length - 2 && (
                    <span className="absolute -top-1 z-10 rounded-md ad-bg-plum px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      88 k
                    </span>
                  )}
                  <div
                    className={i >= MONTHS.length - 2 ? "ad-bar w-full max-w-[42px]" : "ad-bar-muted w-full max-w-[42px]"}
                    style={{ height: `${m.v}%` }}
                  />
                </div>
                <span
                  className={`hidden text-[10.5px] sm:block ${
                    i === MONTHS.length - 2 ? "font-semibold ad-ink" : "ad-faint"
                  }`}
                >
                  {m.m}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Sources d'acquisition" className="xl:col-span-4">
          <div className="space-y-3.5">
            {SOURCES.map((s) => (
              <div key={s.l}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[12px] ad-soft">{s.l}</span>
                  <span className="text-[12px] font-semibold ad-ink">{s.v}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full ad-bg-sunk">
                  <div className="h-full rounded-full ad-bg-plum" style={{ width: `${s.w}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-start gap-2 rounded-xl ad-bg-soft p-3 text-[11.5px] leading-snug ad-muted">
            <Users className="mt-0.5 size-4 shrink-0 ad-plum" />
            68 % des nouveaux couples arrivent via un partage d&apos;invitation. Le
            canal est suivi de façon agrégée uniquement.
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <TableCard
          title="Cohortes de rétention"
          subtitle="Part des couples encore actifs après l'inscription"
          className="xl:col-span-8"
          footer={
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" /> Cohortes mensuelles — mises à jour à J+1
            </span>
          }
        >
          <table className="ad-table">
            <thead>
              <tr>
                <th>Cohorte</th>
                <th>Couples</th>
                <th>M1</th>
                <th>M2</th>
                <th>M3</th>
                <th>M4</th>
                <th>M5</th>
              </tr>
            </thead>
            <tbody>
              {COHORTS.map((c) => (
                <tr key={c.c}>
                  <td className="text-[12.5px] font-medium ad-ink">{c.c}</td>
                  <td className="text-[12.5px]">{c.size}</td>
                  {[c.m1, c.m2, c.m3, c.m4, c.m5].map((v, i) => (
                    <td key={i}>
                      <span
                        className={`inline-flex min-w-[46px] justify-center rounded-md px-2 py-1 text-[11.5px] font-semibold ${
                          v === "—"
                            ? "ad-faint"
                            : parseInt(v) >= 70
                              ? "ad-pill-positive"
                              : parseInt(v) >= 55
                                ? "ad-pill-warning"
                                : "ad-pill-danger"
                        }`}
                      >
                        {v}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        <Card title="Expériences les plus jouées" className="xl:col-span-4">
          <div className="space-y-3">
            {[
              { l: "Soirée à deux", v: "38 %" },
              { l: "Quiz découverte", v: "27 %" },
              { l: "Roue des envies", v: "18 %" },
              { l: "Défis du week-end", v: "11 %" },
              { l: "Autres", v: "6 %" },
            ].map((e, i) => (
              <div key={e.l} className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full ad-bg-sunk text-[11px] font-semibold ad-muted">
                  {i + 1}
                </span>
                <span className="flex-1 truncate text-[12.5px] ad-soft">{e.l}</span>
                <span className="text-[12px] font-semibold ad-ink">{e.v}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl ad-bg-soft p-3 text-[11.5px] ad-muted">
            <TrendingUp className="size-4 shrink-0 ad-plum" />
            « Soirée à deux » gagne 6 points sur 30 jours.
          </div>
        </Card>
      </div>
    </div>
  );
}
