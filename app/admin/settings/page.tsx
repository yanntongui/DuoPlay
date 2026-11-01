"use client";

import { useState } from "react";
import {
  Bell,
  Check,
  Globe,
  KeyRound,
  Laptop,
  ShieldCheck,
  Smartphone,
  UserCog,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Card,
  Field,
  PageHeader,
  TableCard,
} from "@/components/admin/ui";

const TABS = [
  { id: "profil", label: "Profil" },
  { id: "securite", label: "Sécurité" },
  { id: "roles", label: "Rôles & permissions" },
  { id: "notifications", label: "Notifications" },
  { id: "environnement", label: "Environnement" },
];

const ROLE_ROWS = [
  { role: "Super administrateur", people: 2, scope: "Accès complet", tone: "plum" as const, mfa: true },
  { role: "Admin produit", people: 3, scope: "Contenus, analytics, couples", tone: "neutral" as const, mfa: true },
  { role: "Support", people: 6, scope: "Comptes, tickets, couples", tone: "neutral" as const, mfa: true },
  { role: "Modération", people: 4, scope: "Signalements, comptes", tone: "neutral" as const, mfa: true },
  { role: "Finance", people: 2, scope: "Paiements, remboursements", tone: "neutral" as const, mfa: true },
  { role: "Analyste", people: 2, scope: "Analytics, exports", tone: "neutral" as const, mfa: false },
  { role: "Auditeur", people: 1, scope: "Lecture seule, audit", tone: "neutral" as const, mfa: true },
];

const SESSIONS = [
  { device: "MacBook Pro · Chrome", place: "Paris, France", ip: "82.64.12.4", last: "Session actuelle", current: true },
  { device: "iPhone 15 · Safari", place: "Paris, France", ip: "82.64.12.4", last: "il y a 2 h", current: false },
  { device: "Windows · Edge", place: "Lyon, France", ip: "90.112.4.88", last: "hier à 18:42", current: false },
];

export default function AdminSettings() {
  const [tab, setTab] = useState("profil");
  const [notif, setNotif] = useState<Record<string, boolean>>({
    incidents: true,
    reports: true,
    payments: true,
    digest: false,
    product: false,
  });

  return (
    <div className="ad-enter">
      <PageHeader
        title="Paramètres"
        subtitle="Profil, sécurité, rôles et préférences de la console. Les modifications sensibles exigent une double validation."
        actions={
          <button className="ad-btn ad-btn-primary">
            <Check className="size-4" strokeWidth={2.2} />
            Enregistrer
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Navigation locale */}
        <nav className="ad-card h-fit p-2 xl:col-span-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[12.5px] transition-colors ${
                tab === t.id ? "ad-bg-plum-50 font-semibold ad-plum" : "ad-soft ad-hover-soft"
              }`}
            >
              {t.label}
            </button>
          ))}
          <div className="mt-2 rounded-xl ad-bg-soft p-3 text-[11px] leading-snug ad-muted">
            Dernière connexion : 1 nov. 2026 à 09:12 depuis Paris.
          </div>
        </nav>

        <div className="space-y-4 xl:col-span-9">
          {tab === "profil" && (
            <>
              <Card title="Identité">
                <div className="mb-5 flex items-center gap-4">
                  <Avatar name="Yann Tongui" size={56} />
                  <div>
                    <p className="text-[14px] font-semibold ad-ink">Yann Tongui</p>
                    <p className="text-[12px] ad-muted">Super administrateur · Paris</p>
                  </div>
                  <button className="ad-btn ad-btn-outline ml-auto h-9 text-[12px]">
                    Changer la photo
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-medium ad-soft">Prénom</span>
                    <input defaultValue="Yann" className="ad-input" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-medium ad-soft">Nom</span>
                    <input defaultValue="Tongui" className="ad-input" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-medium ad-soft">E-mail professionnel</span>
                    <input defaultValue="yann@duoplay.com" className="ad-input" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-medium ad-soft">Fuseau horaire</span>
                    <select className="ad-select w-full" defaultValue="Europe/Paris">
                      <option>Europe/Paris</option>
                      <option>Europe/London</option>
                      <option>America/Montreal</option>
                    </select>
                  </label>
                </div>
              </Card>

              <Card title="Informations du compte">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Field label="Identifiant" value={<span className="font-mono text-[11.5px]">adm_0001</span>} />
                  <Field label="Rôle" value="Super administrateur" />
                  <Field label="Créé le" value="12 mars 2024" />
                  <Field label="Dernière connexion" value="1 nov. 2026" />
                </div>
              </Card>
            </>
          )}

          {tab === "securite" && (
            <>
              <Card
                title="Authentification à deux facteurs"
                action={<Badge tone="positive">Activée</Badge>}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl ad-bg-plum-50 ad-plum">
                      <KeyRound className="size-4" />
                    </span>
                    <div>
                      <p className="text-[13px] font-medium ad-ink">Application d&apos;authentification</p>
                      <p className="mt-0.5 text-[11.5px] ad-muted">
                        Configurée le 4 avril 2026 · 8 codes de secours restants
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="ad-btn ad-btn-outline h-9 text-[12px]">Codes de secours</button>
                    <button className="ad-btn ad-btn-outline h-9 text-[12px]">Reconfigurer</button>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-2 rounded-xl ad-bg-soft p-3 text-[11.5px] ad-muted">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 ad-positive" />
                  La 2FA est obligatoire pour tous les rôles disposant d&apos;un accès
                  en écriture. Les analystes en lecture seule peuvent en être exemptés.
                </div>
              </Card>

              <Card title="Sessions actives" padded={false}>
                <div className="divide-y ad-bd">
                  {SESSIONS.map((s) => (
                    <div key={s.device} className="flex flex-wrap items-center gap-3 px-[22px] py-3">
                      <span className="flex size-8 items-center justify-center rounded-lg ad-bg-sunk ad-muted">
                        {s.device.includes("iPhone") ? (
                          <Smartphone className="size-4" />
                        ) : (
                          <Laptop className="size-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-medium ad-ink">{s.device}</p>
                        <p className="text-[11px] ad-faint">
                          {s.place} · {s.ip}
                        </p>
                      </div>
                      {s.current ? (
                        <Badge tone="positive">Actuelle</Badge>
                      ) : (
                        <button className="ad-btn ad-btn-outline h-8 px-3 text-[11.5px]">
                          Révoquer
                        </button>
                      )}
                      <span className="w-[90px] text-right text-[11px] ad-faint">{s.last}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {tab === "roles" && (
            <TableCard
              title="Rôles et périmètres"
              subtitle="Principe du moindre privilège — toute élévation est journalisée"
              action={
                <button className="ad-btn ad-btn-primary h-9 text-[12px]">
                  <UserCog className="size-3.5" />
                  Nouveau rôle
                </button>
              }
              footer={<span>24 administrateurs · revue trimestrielle des accès</span>}
            >
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Rôle</th>
                    <th>Membres</th>
                    <th>Périmètre</th>
                    <th>2FA</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ROLE_ROWS.map((r) => (
                    <tr key={r.role}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-[12.5px] font-medium ad-ink">{r.role}</span>
                          {r.tone === "plum" && <Badge tone="plum">Élevé</Badge>}
                        </div>
                      </td>
                      <td className="text-[12.5px]">{r.people}</td>
                      <td className="text-[12px] ad-muted">{r.scope}</td>
                      <td>
                        {r.mfa ? (
                          <Badge tone="positive">Obligatoire</Badge>
                        ) : (
                          <Badge tone="neutral">Optionnelle</Badge>
                        )}
                      </td>
                      <td className="text-right">
                        <button className="ad-btn ad-btn-outline h-8 px-3 text-[11.5px]">
                          Modifier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableCard>
          )}

          {tab === "notifications" && (
            <Card
              title="Préférences de notification"
              subtitle="Choisissez ce qui doit vous alerter en dehors de la console"
            >
              <div className="space-y-1">
                {[
                  { id: "incidents", title: "Incidents et indisponibilités", desc: "Alerte immédiate par e-mail et push" },
                  { id: "reports", title: "Nouveaux signalements critiques", desc: "Contenus à gravité élevée en attente" },
                  { id: "payments", title: "Échecs de paiement et remboursements", desc: "Anomalies de facturation" },
                  { id: "digest", title: "Résumé hebdomadaire", desc: "Synthèse des indicateurs chaque lundi" },
                  { id: "product", title: "Nouveautés produit", desc: "Mises à jour de la console et des outils" },
                ].map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center justify-between gap-4 rounded-xl px-1 py-3"
                  >
                    <div>
                      <p className="text-[12.5px] font-medium ad-ink">{n.title}</p>
                      <p className="text-[11.5px] ad-muted">{n.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotif((v) => ({ ...v, [n.id]: !v[n.id] }))}
                      aria-pressed={notif[n.id]}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                        notif[n.id] ? "ad-bg-plum" : "ad-bg-sunk ad-bd border"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all ${
                          notif[n.id] ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl ad-bg-soft p-3 text-[11.5px] ad-muted">
                <Bell className="size-4 shrink-0 ad-plum" />
                Les alertes critiques ne peuvent pas être désactivées pour les rôles
                techniques.
              </div>
            </Card>
          )}

          {tab === "environnement" && (
            <>
              <Card title="Environnement" action={<Badge tone="positive">Production</Badge>}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Région" value={<span className="inline-flex items-center gap-1.5"><Globe className="size-3.5 ad-faint" /> Europe de l&apos;Ouest (Paris)</span>} />
                  <Field label="Hébergeur" value="Vercel · Convex Cloud" />
                  <Field label="Version de la console" value={<span className="font-mono text-[11.5px]">2.4.0</span>} />
                  <Field label="Dernier déploiement" value="1 nov. 2026 · 08:14" />
                </div>
              </Card>

              <Card title="Mode maintenance">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-medium ad-ink">Fermer l&apos;application aux utilisateurs</p>
                    <p className="mt-0.5 max-w-lg text-[11.5px] ad-muted">
                      Affiche une page d&apos;attente aux utilisateurs. La console reste
                      accessible. Action réservée aux super administrateurs.
                    </p>
                  </div>
                  <button className="ad-btn ad-btn-outline">Planifier une maintenance</button>
                </div>
              </Card>

              <Card title="Zone sensible">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-medium ad-danger">Réinitialiser les données de démonstration</p>
                    <p className="mt-0.5 max-w-lg text-[11.5px] ad-muted">
                      Irréversible. Nécessite une double validation et déclenche une
                      entrée d&apos;audit.
                    </p>
                  </div>
                  <button className="ad-btn ad-btn-wine">Réinitialiser</button>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
