import type { NextConfig } from "next";

/**
 * Sans URL Convex, tout écran qui interroge la base rendrait un arbre React
 * dépourvu de `ConvexProvider` : le prérendu planterait sur un message obscur
 * (« could not find Convex client »). On échoue donc **au build** avec une
 * consigne actionnable, plutôt que de laisser Next échouer page par page.
 *
 * En développement, l'application reste utilisable sans backend : le
 * `ConvexClientProvider` affiche alors un bandeau explicite.
 */
if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error(
    [
      "NEXT_PUBLIC_CONVEX_URL est manquant.",
      "",
      "Ce projet ne peut pas être construit sans son backend Convex :",
      "  1. npx convex dev            (renseigne .env.local en local)",
      "  2. ou, sur Netlify : Site settings → Environment variables",
      "     NEXT_PUBLIC_CONVEX_URL=https://<deployment>.convex.cloud",
      "",
      "Rappel : les variables NEXT_PUBLIC_* sont figées à la compilation ;",
      "les ajouter après coup impose un redéploiement.",
    ].join("\n"),
  );
}

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
