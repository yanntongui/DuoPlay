/**
 * Données de démonstration de la console `/admin`.
 *
 * La console n'est **pas** branchée sur Convex : ces comptes sont fictifs et
 * les modifications faites dans l'interface sont conservées dans le
 * `localStorage` du navigateur, sur ce poste uniquement. Rien n'est partagé
 * entre deux administrateurs, et vider les données du site remet la liste
 * initiale.
 *
 * Le jour où la console lira Convex, ce module disparaît au profit d'appels
 * serveur : la forme des données est volontairement alignée sur les tables
 * `users` / `profiles`.
 */

export type DemoUserStatus = "active" | "suspended" | "pending";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  status: DemoUserStatus;
  plan: string;
  country: string;
  /** Date ISO (AAAA-MM-JJ) pour un affichage stable. */
  createdAt: string;
  /** Texte relatif, purement indicatif dans la démo. */
  lastSeen: string;
};

export const DEMO_USERS: DemoUser[] = [
  { id: "u_10428", name: "Camille Rousseau", email: "camille.r@example.com", status: "active", plan: "Premium mensuel", country: "France", createdAt: "2026-10-12", lastSeen: "il y a 4 min" },
  { id: "u_10427", name: "Lukas Brandt", email: "l.brandt@example.de", status: "active", plan: "Premium annuel", country: "Allemagne", createdAt: "2026-10-11", lastSeen: "il y a 21 min" },
  { id: "u_10426", name: "Sofia Marchetti", email: "sofia.m@example.it", status: "suspended", plan: "Gratuit", country: "Italie", createdAt: "2026-10-10", lastSeen: "il y a 2 j" },
  { id: "u_10425", name: "Nadia El Amrani", email: "nadia.ea@example.fr", status: "active", plan: "Premium mensuel", country: "France", createdAt: "2026-10-09", lastSeen: "il y a 1 h" },
  { id: "u_10424", name: "Diego Fernández", email: "d.fernandez@example.es", status: "active", plan: "Gratuit", country: "Espagne", createdAt: "2026-10-08", lastSeen: "il y a 3 h" },
  { id: "u_10423", name: "Marta Nowak", email: "marta.n@example.pl", status: "pending", plan: "Gratuit", country: "Pologne", createdAt: "2026-10-07", lastSeen: "jamais" },
];

/** Totaux « plateforme » affichés dans les tuiles, avant ajustements locaux. */
export const DEMO_TOTALS = {
  accounts: 128_402,
  active7d: 28_456,
  premium: 12_340,
  suspended: 84,
};

export const COUNTRIES = [
  "France",
  "Allemagne",
  "Espagne",
  "Italie",
  "Portugal",
  "Belgique",
  "Suisse",
  "Royaume-Uni",
  "Canada",
  "Pologne",
];

export const PLANS = ["Gratuit", "Premium mensuel", "Premium annuel"];

const STORAGE_KEY = "duoplay.admin.users.v1";

/** Charge la liste sauvegardée, ou `null` si aucune / illisible. */
export function loadUsers(): DemoUser[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(isDemoUser);
  } catch {
    return null;
  }
}

export function saveUsers(users: DemoUser[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {
    // Quota dépassé ou navigation privée : la démo reste utilisable en mémoire.
  }
}

function isDemoUser(value: unknown): value is DemoUser {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.name === "string" &&
    typeof row.email === "string" &&
    typeof row.status === "string" &&
    typeof row.plan === "string" &&
    typeof row.country === "string" &&
    typeof row.createdAt === "string" &&
    typeof row.lastSeen === "string"
  );
}

/** Identifiant suivant, dans la même série que les comptes existants. */
export function nextUserId(users: DemoUser[]): string {
  const highest = users.reduce((max, user) => {
    const match = /^u_(\d+)$/.exec(user.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 10_422);
  return `u_${highest + 1}`;
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDate(iso: string): string {
  // `new Date("2026-10-12")` est interprété en UTC : dans un fuseau négatif,
  // la date recule d'un jour. On construit donc une date locale explicite.
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date);
}

export const STATUS_LABELS: Record<DemoUserStatus, string> = {
  active: "Actif",
  suspended: "Suspendu",
  pending: "En attente",
};

/** Échappe une valeur pour un CSV (guillemets doublés). */
function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function usersToCsv(users: DemoUser[]): string {
  const header = ["id", "nom", "email", "statut", "offre", "pays", "inscription"];
  const lines = users.map((user) =>
    [
      user.id,
      user.name,
      user.email,
      STATUS_LABELS[user.status],
      user.plan,
      user.country,
      formatDate(user.createdAt),
    ].map(csvCell).join(","),
  );
  return [header.map(csvCell).join(","), ...lines].join("\r\n");
}

export function downloadCsv(filename: string, csv: string) {
  // BOM UTF-8 : sans lui, Excel affiche mal les accents.
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
