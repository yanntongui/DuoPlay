import type { LucideIcon } from "lucide-react";
import {
  Compass,
  Gamepad2,
  Heart,
  Home,
  Settings,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import type { MessageKey } from "@/lib/i18n/messages";

/**
 * Configuration de la navigation du dashboard (§6).
 *
 * Elle est partagée par la sidebar (desktop/tablette), la barre inférieure
 * (mobile) et l'en-tête contextuel, afin que les libellés, les icônes et
 * l'état actif restent cohérents partout.
 *
 * Les libellés sont des **clés de traduction** (§22), résolues par l'interface
 * dans la langue active.
 *
 * `soon: true` marque une entrée réellement pas encore disponible : elle est
 * affichée mais **non cliquable**, signalée « Bientôt » — jamais présentée
 * comme fonctionnelle (§4.3, §24). Aucune entrée n'est dans ce cas aujourd'hui ;
 * le mécanisme reste pour les prochaines fonctionnalités.
 */

export type NavItem = {
  href: string;
  labelKey: MessageKey;
  icon: LucideIcon;
  soon?: boolean;
};

export const PRIMARY_NAV: NavItem[] = [
  { href: "/accueil", labelKey: "nav.home", icon: Home },
  { href: "/explorer", labelKey: "nav.experiences", icon: Compass },
  { href: "/ai", labelKey: "nav.ai", icon: Sparkles },
  { href: "/mes-parties", labelKey: "nav.games", icon: Gamepad2 },
  { href: "/mes-favoris", labelKey: "nav.favorites", icon: Star },
];

export const PERSONAL_NAV: NavItem[] = [
  { href: "/notre-espace", labelKey: "nav.space", icon: Heart },
  { href: "/compte", labelKey: "nav.profile", icon: User },
  { href: "/parametres", labelKey: "nav.settings", icon: Settings },
];

/**
 * Barre inférieure mobile (§6.7). Quatre entrées, toutes opérationnelles : on
 * garde les gestes du quotidien (jouer, explorer, reprendre, l'espace du
 * couple) et les réglages vivent derrière « Mon profil » et « Paramètres ».
 */
export const MOBILE_NAV: NavItem[] = [
  { href: "/accueil", labelKey: "nav.home", icon: Home },
  { href: "/explorer", labelKey: "nav.experiences", icon: Compass },
  { href: "/remote", labelKey: "nav.remoteShort", icon: Sparkles },
  { href: "/notre-espace", labelKey: "nav.spaceShort", icon: Heart },
];

const TITLES: { match: string; titleKey: MessageKey }[] = [
  { match: "/accueil", titleKey: "nav.home" },
  { match: "/explorer", titleKey: "nav.experiences" },
  { match: "/ai", titleKey: "title.ai" },
  { match: "/mes-parties", titleKey: "nav.games" },
  { match: "/mes-favoris", titleKey: "nav.favorites" },
  { match: "/notre-espace", titleKey: "nav.space" },
  { match: "/compte", titleKey: "nav.profile" },
  { match: "/parametres", titleKey: "nav.settings" },
  { match: "/defi", titleKey: "title.defi" },
  { match: "/parcours", titleKey: "title.journeys" },
  { match: "/roue", titleKey: "title.wheel" },
  { match: "/nouvelle", titleKey: "title.newGame" },
];

/** Clé du titre affiché dans l'en-tête contextuel, dérivée de la route. */
export function titleKeyForPath(pathname: string): MessageKey {
  const found = TITLES.find(
    (item) => pathname === item.match || pathname.startsWith(`${item.match}/`),
  );
  return found?.titleKey ?? "title.app";
}

/** Vrai si l'entrée correspond à la route courante (page active). */
export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
