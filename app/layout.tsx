import type { Metadata, Viewport } from "next";
import "./globals.css";
import { displayFont, sansFont } from "./fonts";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { ServiceWorkerRegistrar } from "@/components/pwa/service-worker-registrar";
import { ConsentBanner } from "@/components/consent-banner";
import { SkipLink } from "@/components/i18n/skip-link";
import { HydrationMarker } from "@/components/app/hydration-marker";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "DuoPlay — Retrouvez-vous autrement",
    template: "%s · DuoPlay",
  },
  description:
    "DuoPlay est une plateforme de jeux, de défis et d'expériences pour aider les couples à renforcer leurs liens, briser la routine et raviver la flamme.",
  applicationName: "DuoPlay",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "DuoPlay",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: "DuoPlay — Retrouvez-vous autrement",
    description:
      "Des jeux, des défis et des expériences à vivre à deux, où que vous soyez.",
    type: "website",
    locale: "fr_FR",
  },
};

export const viewport: Viewport = {
  themeColor: "#040205",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "dark",
};

/** Origine Convex : le temps réel passe par son propre WebSocket (§9.4).
 *  Un `preconnect` évite un aller-retour DNS+TLS sur les réseaux lents (§16). */
function convexOrigin() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const convex = convexOrigin();

  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${displayFont.variable} ${sansFont.variable}`}
    >
      <head>
        {/* Ambiance « Douceur Jour » : posée avant la première peinture pour
            qu'aucun flash d'obsidienne froide ne trahisse le choix. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{if(localStorage.getItem("duoplay:ambiance")==="douceur"){document.documentElement.setAttribute("data-ambiance","douceur")}}catch(e){}',
          }}
        />
        {/* Langue (§22) : posée avant la première peinture, depuis `?lang=`,
            le choix enregistré ou le navigateur — jamais de mauvaise langue
            annoncée aux lecteurs d'écran. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var q=new URLSearchParams(location.search).get("lang");var v=(q==="fr"||q==="en")?q:(localStorage.getItem("duoplay:lang")||((navigator.language||"").toLowerCase().indexOf("en")===0?"en":"fr"));if(v!=="fr"&&v!=="en")v="fr";document.documentElement.lang=v;document.documentElement.setAttribute("data-lang",v)}catch(e){}',
          }}
        />
        {convex && (
          <>
            <link rel="preconnect" href={convex} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={convex} />
          </>
        )}
      </head>
      <body className="min-h-dvh antialiased">
        <SkipLink />
        <ConvexClientProvider>
          {children}
          <ConsentBanner />
          <HydrationMarker />
        </ConvexClientProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
