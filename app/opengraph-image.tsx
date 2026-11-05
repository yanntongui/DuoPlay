import { ImageResponse } from "next/og";

/**
 * Image de partage (Open Graph / Twitter). Le produit se transmet par lien
 * privé (WhatsApp) : sans visuel, un lien partagé ressemble à une URL nue.
 *
 * Générée avec `next/og` — aucun asset binaire à maintenir, aucune requête
 * réseau au build.
 */
export const runtime = "nodejs";
export const alt = "DuoPlay — Retrouvez-vous autrement";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: "#08040a",
          padding: "68px 76px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Halos de marque : corail et or, très diffus. */}
        <div
          style={{
            position: "absolute",
            top: -220,
            right: -160,
            width: 620,
            height: 620,
            borderRadius: "50%",
            background: "#e11d48",
            opacity: 0.2,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -260,
            left: -180,
            width: 640,
            height: 640,
            borderRadius: "50%",
            background: "#e2b887",
            opacity: 0.14,
          }}
        />

        {/* Marque */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              position: "relative",
              width: 62,
              height: 62,
              display: "flex",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 9,
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#d8a96f",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 18,
                top: 9,
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#e11d48",
                opacity: 0.9,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: -1,
              color: "#ffffff",
            }}
          >
            <span>Duo</span>
            <span style={{ color: "#fb7185" }}>Play</span>
          </div>
        </div>

        {/* Accroche */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              lineHeight: 1.02,
              letterSpacing: -3,
              fontWeight: 700,
              color: "#ffffff",
              maxWidth: 900,
            }}
          >
            Retrouvez-vous autrement
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              lineHeight: 1.4,
              color: "rgba(255,255,255,0.62)",
              maxWidth: 780,
            }}
          >
            Des jeux, des défis et des expériences à vivre à deux, ensemble ou à
            distance.
          </div>
        </div>

        {/* Signature */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 22px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.16)",
              color: "rgba(255,255,255,0.82)",
              fontSize: 22,
            }}
          >
            Sans compte · Un lien privé · Jouable à deux
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
