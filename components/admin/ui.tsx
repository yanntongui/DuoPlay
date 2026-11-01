import type { ReactNode } from "react";

/* ---------------------------------------------------------------- */
/*  En-tête de page                                                  */
/* ---------------------------------------------------------------- */

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0 sm:flex-1">
        <h1 className="text-[30px] leading-tight font-semibold tracking-[-0.03em] ad-ink sm:text-[34px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 max-w-2xl text-[13.5px] ad-muted">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/*  Carte                                                            */
/* ---------------------------------------------------------------- */

export function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
  padded = true,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={`ad-card ${className}`}>
      {(title || action) && (
        <div className="ad-card-head pb-4">
          <div>
            {title && <h2 className="ad-card-title">{title}</h2>}
            {subtitle && (
              <p className="mt-0.5 text-[12px] ad-muted">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={padded ? "p-[22px] pt-4" : ""}>{children}</div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Pastille                                                         */
/* ---------------------------------------------------------------- */

type Tone = "positive" | "warning" | "danger" | "info" | "plum" | "neutral";

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`ad-pill ad-pill-${tone}`}>{children}</span>;
}

const STATUS_MAP: Record<string, { tone: Tone; label: string }> = {
  active: { tone: "positive", label: "Actif" },
  actif: { tone: "positive", label: "Actif" },
  published: { tone: "positive", label: "Publié" },
  publie: { tone: "positive", label: "Publié" },
  completed: { tone: "positive", label: "Terminé" },
  resolved: { tone: "positive", label: "Résolu" },
  operational: { tone: "positive", label: "Opérationnel" },
  suspended: { tone: "warning", label: "Suspendu" },
  pending: { tone: "warning", label: "En attente" },
  draft: { tone: "warning", label: "Brouillon" },
  brouillon: { tone: "warning", label: "Brouillon" },
  review: { tone: "info", label: "En révision" },
  scheduled: { tone: "info", label: "Programmé" },
  in_progress: { tone: "info", label: "En cours" },
  degraded: { tone: "warning", label: "Dégradé" },
  deleted: { tone: "danger", label: "Supprimé" },
  failed: { tone: "danger", label: "Échec" },
  blocked: { tone: "danger", label: "Bloqué" },
  archived: { tone: "neutral", label: "Archivé" },
};

export function StatusBadge({ status }: { status: string }) {
  const entry = STATUS_MAP[status.toLowerCase()] ?? {
    tone: "neutral" as Tone,
    label: status,
  };
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}

/* ---------------------------------------------------------------- */
/*  État vide                                                        */
/* ---------------------------------------------------------------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex size-11 items-center justify-center rounded-full ad-bg-sunk ad-faint">
        {icon ?? "○"}
      </div>
      <p className="text-[14px] font-medium ad-ink">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-[12.5px] ad-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/*  Avatar initiales                                                 */
/* ---------------------------------------------------------------- */

const AVATAR_TONES = [
  "linear-gradient(150deg,#8a5a7e,#4e2a4a)",
  "linear-gradient(150deg,#7d8a5a,#3f4e2a)",
  "linear-gradient(150deg,#5a7d8a,#2a444e)",
  "linear-gradient(150deg,#8a6a5a,#4e352a)",
  "linear-gradient(150deg,#6a5a8a,#2f2a4e)",
];

export function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  const tone = AVATAR_TONES[name.charCodeAt(0) % AVATAR_TONES.length];
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, background: tone, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/* ---------------------------------------------------------------- */
/*  Ligne d'information (fiche)                                      */
/* ---------------------------------------------------------------- */

export function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] ad-faint">
        {label}
      </p>
      <p className="mt-1 text-[13px] ad-ink">{value}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/*  Carte de tableau                                                 */
/* ---------------------------------------------------------------- */

export function TableCard({
  title,
  subtitle,
  action,
  toolbar,
  children,
  footer,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`ad-card overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-[22px] pb-4 pt-[20px]">
          <div>
            {title && <h2 className="ad-card-title">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-[12px] ad-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {toolbar && (
        <div className="flex flex-wrap items-center gap-2 border-y ad-bd ad-bg-soft px-[22px] py-3">
          {toolbar}
        </div>
      )}
      <p className="px-[22px] pt-2.5 text-[10.5px] ad-faint md:hidden">
        Faites glisser le tableau horizontalement pour voir toutes les colonnes.
      </p>
      <div className="overflow-x-auto">{children}</div>
      {footer && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t ad-bd px-[22px] py-3 text-[12px] ad-muted">
          {footer}
        </div>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Tuile statistique compacte                                       */
/* ---------------------------------------------------------------- */

export function StatTile({
  label,
  value,
  delta,
  tone = "neutral",
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "positive" | "warning" | "danger" | "neutral" | "plum";
}) {
  return (
    <div className="ad-card p-[18px]">
      <p className="text-[12px] ad-muted">{label}</p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1.5">
        <p className="text-[22px] font-semibold leading-none tracking-[-0.03em] whitespace-nowrap ad-ink sm:text-[25px]">
          {value}
        </p>
        {delta && <span className={`ad-pill ad-pill-${tone}`}>{delta}</span>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/*  Barre de progression                                             */
/* ---------------------------------------------------------------- */

export function ProgressBar({
  value,
  tone = "plum",
}: {
  value: number;
  tone?: "plum" | "positive" | "warning" | "danger";
}) {
  const colors: Record<string, string> = {
    plum: "var(--ad-plum-600)",
    positive: "var(--ad-positive)",
    warning: "var(--ad-warning)",
    danger: "var(--ad-danger)",
  };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full ad-bg-sunk">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min(100, value)}%`, background: colors[tone] }}
      />
    </div>
  );
}
