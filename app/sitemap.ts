import type { MetadataRoute } from "next";

/** Base absolue : le sitemap n'accepte que des URL absolues. */
const BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://duoplay.app";

/**
 * Seules les pages publiques et stables sont listées. Les salles de jeu
 * (`/partie`, `/remote`, `/soiree/[code]`) dépendent d'un token privé : elles
 * ne doivent jamais entrer dans un index de moteur de recherche.
 */
const PAGES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/explorer", priority: 0.9, changeFrequency: "weekly" },
  { path: "/accueil", priority: 0.8, changeFrequency: "weekly" },
  { path: "/defi", priority: 0.8, changeFrequency: "daily" },
  { path: "/parcours", priority: 0.7, changeFrequency: "weekly" },
  { path: "/soiree", priority: 0.6, changeFrequency: "monthly" },
  { path: "/roue", priority: 0.6, changeFrequency: "monthly" },
  { path: "/remote", priority: 0.5, changeFrequency: "monthly" },
  { path: "/confidentialite", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cgu", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PAGES.map((page) => ({
    url: `${BASE}${page.path}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
