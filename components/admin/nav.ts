import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  HeartHandshake,
  LifeBuoy,
  ShieldAlert,
  Sparkles,
  Layers,
  Dices,
  Route,
  Wallet,
  BadgePercent,
  FileBarChart,
  UsersRound,
  Megaphone,
  FlaskConical,
  Flag,
  Activity,
  Siren,
  LockKeyhole,
  ScrollText,
  Settings,
} from "lucide-react";

export type NavEntry = {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
};

export type NavSection = {
  label: string;
  items: NavEntry[];
};

export const ADMIN_NAV: NavSection[] = [
  {
    label: "Pilotage",
    items: [
      { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Utilisateurs",
    items: [
      { href: "/admin/users", label: "Utilisateurs", icon: Users },
      { href: "/admin/couples", label: "Couples", icon: HeartHandshake },
      { href: "/admin/support", label: "Support", icon: LifeBuoy, count: 23 },
      { href: "/admin/moderation", label: "Modération", icon: ShieldAlert, count: 12 },
    ],
  },
  {
    label: "Contenus",
    items: [
      { href: "/admin/experiences", label: "Expériences", icon: Sparkles },
      { href: "/admin/cards", label: "Cartes", icon: Layers },
      { href: "/admin/dice", label: "Dés", icon: Dices },
      { href: "/admin/journeys", label: "Parcours", icon: Route },
    ],
  },
  {
    label: "Revenus",
    items: [
      { href: "/admin/finance", label: "Finance", icon: Wallet },
      { href: "/admin/offers", label: "Offres & promos", icon: BadgePercent },
      { href: "/admin/reports", label: "Rapports", icon: FileBarChart },
    ],
  },
  {
    label: "Croissance",
    items: [
      { href: "/admin/segments", label: "Segments", icon: UsersRound },
      { href: "/admin/campaigns", label: "Campagnes", icon: Megaphone },
      { href: "/admin/ab-tests", label: "Tests A/B", icon: FlaskConical },
      { href: "/admin/flags", label: "Feature flags", icon: Flag },
    ],
  },
  {
    label: "Système",
    items: [
      { href: "/admin/monitoring", label: "Monitoring", icon: Activity },
      { href: "/admin/incidents", label: "Incidents", icon: Siren, count: 2 },
      { href: "/admin/gdpr", label: "RGPD", icon: LockKeyhole, count: 5 },
      { href: "/admin/audit", label: "Journal d'audit", icon: ScrollText },
      { href: "/admin/settings", label: "Paramètres", icon: Settings },
    ],
  },
];
