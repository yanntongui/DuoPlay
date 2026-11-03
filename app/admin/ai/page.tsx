"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Gauge,
  Languages,
  LockKeyhole,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  Badge,
  Card,
  PageHeader,
  ProgressBar,
  StatTile,
  StatusBadge,
  TableCard,
} from "@/components/admin/ui";

/* ------------------------------------------------------------------ */
/*  Démonstration : ce que l'admin verrait une fois la passerelle      */
/*  branchée. Aucune action réelle, aucun contenu publié.              */
/* ------------------------------------------------------------------ */

type DraftKind = "carte" | "question" | "parcours";
type DraftState = "empty" | "draft" | "verified" | "approved" | "published";

const DRAFTS: Record<DraftKind, string[]> = {
  carte: [
    "Quel petit geste de l’autre vous a fait vous sentir vu cette semaine ?",
    "Racontez un moment où vous avez ri ensemble sans raison sérieuse.",
    "Qu’aimeriez-vous que l’autre remarque davantage, sans le lui reprocher ?",
  ],
  question: [
    "Si vous pouviez réserver dix minutes ce soir, à quoi les consacreriez-vous ?",
    "Qu’est-ce qui vous aide à vous sentir proche, même dans une semaine chargée ?",
    "Quelle petite habitude aimeriez-vous inventer à deux, sans pression ?",
  ],
  parcours: [
    "Trois jours pour se retrouver : un souvenir, une question douce, une attention concrète.",
    "Cinq jours de reconnexion : chaque jour un mot, une écoute, un geste simple.",
    "Sept jours de complicité : des propositions courtes, jamais obligatoires.",
  ],
};

const TONES = ["Doux", "Complice", "Romantique", "Léger"] as const;
const INTENSITIES = ["Doux", "Moyen", "Profond"] as const;
const LOCALES = ["Espagnol", "Anglais", "Allemand"] as const;

const SAFETY = [
  {
    id: "s_2041",
    date: "02 nov. 09:12",
    category: "Coercition",
    severity: "critique",
    action: "Refus + ressources",
    status: "review",
  },
  {
    id: "s_2040",
    date: "02 nov. 08:47",
    category: "Contenu explicite",
    severity: "eleve",
    action: "Régénération adoucie",
    status: "resolved",
  },
  {
    id: "s_2039",
    date: "01 nov. 22:05",
    category: "Demande de diagnostic",
    severity: "moyen",
    action: "Reformulation + limites",
    status: "resolved",
  },
  {
    id: "s_2038",
    date: "01 nov. 19:33",
    category: "Données personnelles",
    severity: "eleve",
    action: "Masquage + revue humaine",
    status: "review",
  },
];

const WEEK = [42, 58, 51, 74, 88, 63, 46];

export default function AdminAi() {
  const [killSwitch, setKillSwitch] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [communication, setCommunication] = useState(true);
  const [kind, setKind] = useState<DraftKind>("carte");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Doux");
  const [intensity, setIntensity] = useState<(typeof INTENSITIES)[number]>("Moyen");
  const [variant, setVariant] = useState(0);
  const [draft, setDraft] = useState<string | null>(null);
  const [state, setState] = useState<DraftState>("empty");
  const [notice, setNotice] = useState<string | null>(null);

  const [source, setSource] = useState(
    "Cette expérience vous invite à partager un souvenir récent, sans obligation.",
  );
  const [locale, setLocale] = useState<(typeof LOCALES)[number]>("Espagnol");
  const [translation, setTranslation] = useState<string | null>(null);

  function generate() {
    const bank = DRAFTS[kind];
    setDraft(bank[variant % bank.length]);
    setVariant((value) => value + 1);
    setState("draft");
    setNotice(null);
  }

  function verify() {
    setState("verified");
    setNotice(
      "Vérification automatique terminée : longueur, doublons, vocabulaire et ton. Une relecture humaine reste obligatoire.",
    );
  }

  function approve() {
    setState("approved");
    setNotice(
      "Brouillon approuvé par un humain. La publication reste une action distincte et tracée.",
    );
  }

  function publish() {
    setState("published");
    setNotice(
      "Publication simulée dans cette démonstration. En production, elle exige une double validation journalisée.",
    );
  }

  function translate() {
    const map: Record<(typeof LOCALES)[number], string> = {
      Espagnol:
        "Esta experiencia te invita a compartir un recuerdo reciente, sin obligación.",
      Anglais:
        "This experience invites you to share a recent memory, with no obligation.",
      Allemand:
        "Diese Erfahrung lädt dich ein, eine recente Erinnerung zu teilen, ohne Verpflichtung.",
    };
    setTranslation(map[locale]);
  }

  const availability = enabled && !killSwitch;

  return (
    <div className="ad-enter flex flex-col gap-5">
      <PageHeader
        title="DuoPlay AI"
        subtitle="Pilotage de l’assistant : disponibilité, coûts, qualité, sécurité et copilote éditorial. Aucune publication ni décision sensible n’est automatique."
        actions={
          <>
            <Badge tone={availability ? "positive" : "danger"}>
              {availability ? "En service" : "Suspendu"}
            </Badge>
            <button
              type="button"
              onClick={() => {
                setKillSwitch((value) => !value);
                setNotice(
                  !killSwitch
                    ? "Kill switch activé : les nouvelles générations sont bloquées immédiatement. Les sessions en cours sont clôturées proprement."
                    : "Kill switch désactivé : DuoPlay AI peut reprendre du service.",
                );
              }}
              className={`ad-btn ${killSwitch ? "ad-btn-primary" : "ad-btn-wine"}`}
            >
              {killSwitch ? (
                <PlayCircle className="size-4" strokeWidth={1.9} />
              ) : (
                <PauseCircle className="size-4" strokeWidth={1.9} />
              )}
              {killSwitch ? "Réactiver" : "Kill switch"}
            </button>
          </>
        }
      />

      <div className="flex items-start gap-2 rounded-xl border border-[var(--ad-warning)]/30 bg-[color-mix(in_srgb,var(--ad-warning)_10%,transparent)] px-4 py-3 text-[12.5px] ad-ink">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p>
          Démonstration : les chiffres et les actions de cette page sont
          fictifs. La console réelle appellera les fonctions d’administration
          protégées et journalisera chaque changement.
        </p>
      </div>

      {notice ? (
        <div className="flex items-start gap-2 rounded-xl border border-[var(--ad-plum-300)]/40 bg-[var(--ad-plum-50)] px-4 py-3 text-[12.5px] ad-ink">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <p>{notice}</p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Générations (30 j)" value="18 420" delta="+14 %" tone="positive" />
        <StatTile label="Taux d’acceptation" value="72 %" delta="cible ≥ 60 %" tone="positive" />
        <StatTile label="Refus de sécurité" value="0,7 %" delta="cible < 1 %" tone="positive" />
        <StatTile label="Coût / session" value="0,004 €" delta="budget 500 €/mois" tone="plum" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <Card
          title="Volume et qualité"
          subtitle="30 derniers jours · agrégats uniquement, aucun contenu individuel"
          action={<Badge tone="plum">p95 1,8 s</Badge>}
        >
          <div className="flex h-36 items-end gap-2" role="img" aria-label="Générations par jour, du lundi au dimanche">
            {WEEK.map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-28 w-full items-end">
                  <div
                    className="w-full rounded-t-md"
                    style={{
                      height: `${value}%`,
                      background:
                        index === 4
                          ? "var(--ad-plum-600)"
                          : "color-mix(in srgb, var(--ad-plum-600) 38%, transparent)",
                    }}
                  />
                </div>
                <span className="text-[10.5px] ad-faint">
                  {["L", "M", "M", "J", "V", "S", "D"][index]}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Quality label="Taux de passage" value={16} tone="positive" />
            <Quality label="Taux de modification" value={21} tone="plum" />
            <Quality label="Sessions terminées" value={64} tone="positive" />
            <Quality label="Repli catalogue" value={2} tone="warning" />
          </div>
        </Card>

        <Card
          title="Garde-fous"
          subtitle="Flags, versions et limites de coût"
        >
          <div className="flex flex-col gap-3">
            <FlagRow
              label="DuoPlay AI"
              hint="Accès utilisateur à l’espace IA"
              enabled={enabled}
              onChange={() => setEnabled((value) => !value)}
            />
            <FlagRow
              label="Assistant de communication"
              hint="Formulations d’envies et de limites"
              enabled={communication}
              onChange={() => setCommunication((value) => !value)}
            />
            <FlagRow
              label="Kill switch global"
              hint="Blocage immédiat de toute génération"
              enabled={killSwitch}
              onChange={() => setKillSwitch((value) => !value)}
              danger
            />
          </div>

          <div className="mt-4 rounded-xl ad-bg-sunk p-3 text-[12px]">
            <div className="flex items-center justify-between gap-3">
              <span className="ad-muted">Budget mensuel</span>
              <span className="font-medium ad-ink">212 € / 500 €</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={42} tone="warning" />
            </div>
            <p className="mt-2 ad-faint">
              Alerte automatique à 80 % · coupure du flag au-delà.
            </p>
          </div>

          <div className="mt-4 space-y-1.5 text-[11.5px] ad-muted">
            <p className="flex items-center gap-1.5">
              <LockKeyhole className="size-3.5" />
              Modèle : duoplay-local-1.0 (déterministe)
            </p>
            <p className="flex items-center gap-1.5">
              <FileText className="size-3.5" />
              Prompt session.fr.v1 · Règles safety.fr.v1
            </p>
            <p className="flex items-center gap-1.5">
              <Gauge className="size-3.5" />
              Quota : 30 générations / couple / mois
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <Card
          title="Copilote éditorial"
          subtitle="Générer · vérifier · relire · approuver · publier"
          action={
            <Badge tone={state === "published" ? "positive" : "info"}>
              {state === "empty"
                ? "Aucun brouillon"
                : state === "draft"
                  ? "Brouillon"
                  : state === "verified"
                    ? "Vérifié"
                    : state === "approved"
                      ? "Approuvé"
                      : "Publié"}
            </Badge>
          }
        >
          <div className="grid gap-2 sm:grid-cols-3">
            <Select
              label="Type"
              value={kind}
              onChange={(value) => setKind(value as DraftKind)}
              options={[
                { value: "carte", label: "Carte" },
                { value: "question", label: "Question" },
                { value: "parcours", label: "Parcours" },
              ]}
            />
            <Select
              label="Ton"
              value={tone}
              onChange={(value) => setTone(value as (typeof TONES)[number])}
              options={TONES.map((value) => ({ value, label: value }))}
            />
            <Select
              label="Intensité"
              value={intensity}
              onChange={(value) => setIntensity(value as (typeof INTENSITIES)[number])}
              options={INTENSITIES.map((value) => ({ value, label: value }))}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="ad-btn ad-btn-primary" onClick={generate}>
              <Sparkles className="size-4" />
              Générer
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-outline"
              onClick={verify}
              disabled={state === "empty"}
            >
              <ClipboardCheck className="size-4" />
              Vérifier
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-outline"
              onClick={approve}
              disabled={state !== "verified"}
            >
              <Check className="size-4" />
              Approuver
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-wine"
              onClick={publish}
              disabled={state !== "approved"}
            >
              <Send className="size-4" />
              Publier
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-ghost"
              onClick={() => {
                setState("empty");
                setDraft(null);
                setNotice(null);
              }}
            >
              Archiver
            </button>
          </div>

          <div className="mt-4 rounded-xl border ad-bd ad-bg-sunk p-4">
            {draft ? (
              <>
                <p className="text-[11px] uppercase tracking-[0.14em] ad-faint">
                  Brouillon · {kind} · ton {tone.toLowerCase()} · intensité{" "}
                  {intensity.toLowerCase()}
                </p>
                <p className="mt-2 text-[14px] leading-relaxed ad-ink">
                  {draft}
                </p>
              </>
            ) : (
              <p className="text-[12.5px] ad-muted">
                Aucun contenu généré. Lancez une génération pour voir un
                brouillon — il ne sera jamais publié automatiquement.
              </p>
            )}
          </div>

          {state !== "empty" ? (
            <div className="mt-4 grid gap-2 text-[11.5px] sm:grid-cols-2">
              <CheckLine ok label="Longueur dans la cible (≤ 180 caractères)" />
              <CheckLine ok label="Aucun doublon détecté dans le catalogue" />
              <CheckLine ok label="Vocabulaire conforme au glossaire DuoPlay" />
              <CheckLine ok={state !== "draft"} label="Relecture humaine effectuée" />
            </div>
          ) : null}
        </Card>

        <Card title="Traduction assistée" subtitle="Pré-traduction à relire, jamais publiée seule">
          <label className="text-[12px] font-medium ad-ink" htmlFor="ai-source">
            Texte source
          </label>
          <textarea
            id="ai-source"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            rows={3}
            className="mt-1.5 w-full resize-none rounded-xl border ad-bd ad-bg-sunk px-3 py-2.5 text-[13px] ad-ink outline-none focus:border-[var(--ad-plum-400)]"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Languages className="size-4 ad-muted" />
            {LOCALES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setLocale(value)}
                className={`ad-pill ${locale === value ? "ad-pill-plum" : "ad-pill-neutral"}`}
              >
                {value}
              </button>
            ))}
            <button type="button" className="ad-btn ad-btn-outline ml-auto" onClick={translate}>
              <RefreshCw className="size-4" />
              Traduire
            </button>
          </div>

          {translation ? (
            <div className="mt-3 rounded-xl border ad-bd p-3">
              <p className="text-[11px] uppercase tracking-[0.14em] ad-faint">
                {locale} · proposition IA
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed ad-ink">{translation}</p>
              <p className="mt-2 text-[11px] ad-muted">
                À relire par un traducteur avant toute publication.
              </p>
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-dashed ad-bd px-4 py-6 text-center">
              <Languages className="mx-auto size-5 ad-faint" />
              <p className="mt-2 text-[12px] ad-muted">
                La traduction n’est pas automatiquement publiée.
              </p>
            </div>
          )}
        </Card>
      </div>

      <TableCard
        title="Événements de sécurité"
        subtitle="File de revue humaine · signaux expliqués, décision motivée, recours possible"
        action={<Badge tone="danger">2 à traiter</Badge>}
      >
        <div className="overflow-x-auto">
          <table className="ad-table w-full min-w-[720px]">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Date</th>
                <th>Catégorie</th>
                <th>Gravité</th>
                <th>Action</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {SAFETY.map((event) => (
                <tr key={event.id}>
                  <td className="font-medium ad-ink">{event.id}</td>
                  <td className="ad-muted">{event.date}</td>
                  <td className="ad-ink">{event.category}</td>
                  <td>
                    <Badge
                      tone={
                        event.severity === "critique"
                          ? "danger"
                          : event.severity === "eleve"
                            ? "warning"
                            : "info"
                      }
                    >
                      {event.severity}
                    </Badge>
                  </td>
                  <td className="ad-muted">{event.action}</td>
                  <td>
                    <StatusBadge status={event.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableCard>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Ce que l’IA peut faire seule" subtitle="Rien d’irréversible">
          <ul className="space-y-2 text-[12.5px] ad-muted">
            <li className="flex gap-2"><Check className="mt-0.5 size-3.5 shrink-0" /> Classer et proposer</li>
            <li className="flex gap-2"><Check className="mt-0.5 size-3.5 shrink-0" /> Résumer des agrégats</li>
            <li className="flex gap-2"><Check className="mt-0.5 size-3.5 shrink-0" /> Rédiger un brouillon</li>
            <li className="flex gap-2"><Check className="mt-0.5 size-3.5 shrink-0" /> Ouvrir une revue humaine</li>
          </ul>
        </Card>
        <Card title="Validation humaine obligatoire" subtitle="Toujours tracée">
          <ul className="space-y-2 text-[12.5px] ad-muted">
            <li className="flex gap-2"><Bot className="mt-0.5 size-3.5 shrink-0" /> Publication d’un contenu</li>
            <li className="flex gap-2"><Bot className="mt-0.5 size-3.5 shrink-0" /> Bannissement ou suspension</li>
            <li className="flex gap-2"><Bot className="mt-0.5 size-3.5 shrink-0" /> Remboursement important</li>
            <li className="flex gap-2"><Bot className="mt-0.5 size-3.5 shrink-0" /> Suppression de compte, prix</li>
          </ul>
        </Card>
        <Card title="Accès aux données" subtitle="Minimisation par défaut">
          <ul className="space-y-2 text-[12.5px] ad-muted">
            <li className="flex gap-2"><XCircle className="mt-0.5 size-3.5 shrink-0" /> Aucune réponse intime</li>
            <li className="flex gap-2"><XCircle className="mt-0.5 size-3.5 shrink-0" /> Aucune note privée</li>
            <li className="flex gap-2"><XCircle className="mt-0.5 size-3.5 shrink-0" /> Aucun média sensible</li>
            <li className="flex gap-2"><ShieldAlert className="mt-0.5 size-3.5 shrink-0" /> Journal d’accès admin</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Quality({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "positive" | "warning" | "plum";
}) {
  return (
    <div className="rounded-xl ad-bg-sunk p-3">
      <div className="flex items-center justify-between gap-2 text-[11.5px]">
        <span className="ad-muted">{label}</span>
        <span className="font-medium ad-ink">{value} %</span>
      </div>
      <div className="mt-2">
        <ProgressBar value={value} tone={tone} />
      </div>
    </div>
  );
}

function FlagRow({
  label,
  hint,
  enabled,
  onChange,
  danger,
}: {
  label: string;
  hint: string;
  enabled: boolean;
  onChange: () => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border ad-bd px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[12.5px] font-medium ad-ink">{label}</p>
        <p className="text-[11px] ad-muted">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
          enabled
            ? danger
              ? "border-[var(--ad-danger)] bg-[color-mix(in_srgb,var(--ad-danger)_55%,transparent)]"
              : "border-[var(--ad-plum-500)] bg-[var(--ad-plum-600)]"
            : "border-[var(--ad-line)] ad-bg-sunk"
        }`}
      >
        <span
          className={`absolute top-0.5 size-4.5 rounded-full bg-white shadow transition-[left] ${
            enabled ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="text-[11.5px] ad-muted">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border ad-bd ad-bg-soft px-2.5 py-2 text-[12.5px] ad-ink outline-none focus:border-[var(--ad-plum-400)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckLine({ ok, label }: { ok: boolean; label: string }) {
  return (
    <p className={`flex gap-1.5 ${ok ? "ad-ink" : "ad-muted"}`}>
      {ok ? (
        <Check className="mt-0.5 size-3.5 shrink-0" />
      ) : (
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
      )}
      {label}
    </p>
  );
}
