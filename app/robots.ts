import type { MetadataRoute } from "next";

/** Base absolue : indispensable pour `Sitemap:` et pour les URL du sitemap. */
const BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://duoplay.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Les salles de jeu portent un code ou un token privé : jamais d'index.
        disallow: [
          "/admin",
          "/partie/",
          "/join/",
          "/remote/",
          "/soiree/",
          "/nouvelle/",
          "/jouer/",
          "/hors-ligne",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
