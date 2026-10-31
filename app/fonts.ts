import localFont from "next/font/local";

/**
 * Typographie « Quiet Sensuality », auto-hébergée : les fichiers sont servis
 * depuis notre propre domaine, aucune requête vers Google au chargement
 * (cf. PRD §16 — contrainte de perf sur les réseaux mobiles).
 *
 * Les deux fontes sont **versionnées dans le dépôt** (`app/fonts/`) et servies
 * via `next/font/local`. C'est délibéré : avec `next/font/google`, un build
 * sans réseau retombait silencieusement sur une police de substitution (le
 * sérif Cormorant Garamond a été perdu ainsi), ce qui trahissait la direction
 * artistique sans le moindre avertissement. Ici, le build ne dépend plus du
 * réseau et le rendu est déterministe.
 *
 * Display : Cormorant Garamond, sérif éditorial sculptural (romain + italique,
 * variable 300–700), réservé aux titres et aux citations — jamais à
 * l'interface.
 * Interface : Inter, néo-grotesque précise (variable 100–900), pour le texte,
 * les données et les micro-interactions.
 */
export const displayFont = localFont({
  src: [
    {
      path: "./fonts/cormorant-garamond/cormorant-garamond-latin.woff2",
      weight: "300 700",
      style: "normal",
    },
    {
      path: "./fonts/cormorant-garamond/cormorant-garamond-italic-latin.woff2",
      weight: "300 700",
      style: "italic",
    },
  ],
  variable: "--font-cormorant",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const sansFont = localFont({
  src: [
    {
      path: "./fonts/inter/inter-latin.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "./fonts/inter/inter-italic-latin.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "Segoe UI", "Roboto", "Helvetica Neue", "Arial"],
});
