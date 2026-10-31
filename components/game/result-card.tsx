"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrack } from "@/lib/analytics";
import { LOCALE_TAG, useT, type Translator } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Carte souvenir partageable (§4, §19.1) — « partage viral léger ».
 *
 * La carte est **dessinée localement** sur un canvas (aucun envoi, aucune
 * dépendance) à partir de la seule partie terminée : les deux prénoms, le taux
 * de ressemblance, le nombre de questions traversées, le titre de
 * l'expérience et la date. **Aucune réponse, aucun énoncé, aucun thème écarté
 * n'y figure** : ce qui s'est dit pendant la partie reste entre les deux
 * joueurs (cf. §15).
 */

const WIDTH = 1080;
const HEIGHT = 1080;

type Props = {
  meName: string;
  partnerName: string | null;
  percentage: number | null;
  comparable: number;
  sameCount: number;
  experienceTitle: string | null;
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, width, height, radius);
    return;
  }
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function family(variable: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
  return value || fallback;
}

function centered(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  font: string,
  paint: string | CanvasGradient,
) {
  ctx.font = font;
  ctx.fillStyle = paint;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, WIDTH / 2, y, WIDTH - 200);
}

async function drawCard(
  props: Props,
  t: Translator["t"],
  tp: Translator["tp"],
  locale: Translator["locale"],
): Promise<Blob> {
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      /* les polices locales ne sont pas indispensables au dessin */
    }
  }

  const display = family("--font-cormorant", "Georgia, serif");
  const sans = family("--font-inter", "system-ui, sans-serif");

  const canvas = document.createElement("canvas");
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = WIDTH * ratio;
  canvas.height = HEIGHT * ratio;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error(t("result.canvasError"));
  ctx.scale(ratio, ratio);

  // Fond : obsidienne + halos champagne / rubis, comme l'application.
  const base = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  base.addColorStop(0, "#0B0710");
  base.addColorStop(1, "#040205");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const glow = (
    x: number,
    y: number,
    radius: number,
    color: string,
  ) => {
    const radial = ctx.createRadialGradient(x, y, 0, x, y, radius);
    radial.addColorStop(0, color);
    radial.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  };
  glow(140, 60, 620, "rgba(226,184,135,0.30)");
  glow(WIDTH - 120, HEIGHT - 40, 640, "rgba(225,29,72,0.28)");
  glow(WIDTH / 2, HEIGHT / 2, 520, "rgba(167,154,178,0.12)");

  // Filet lumineux (hairline) en incrustation.
  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 2;
  roundRect(ctx, 40, 40, WIDTH - 80, HEIGHT - 80, 48);
  ctx.stroke();

  const eyebrow = "DuoPlay".toUpperCase();
  ctx.save();
  ctx.font = `600 30px ${sans}`;
  ctx.fillStyle = "rgba(226,184,135,0.92)";
  ctx.textAlign = "center";
  const spacing = 10;
  const letters = eyebrow.split("");
  const totalWidth =
    letters.reduce((sum, letter) => sum + ctx.measureText(letter).width, 0) +
    spacing * (letters.length - 1);
  let cursor = WIDTH / 2 - totalWidth / 2;
  letters.forEach((letter) => {
    const letterWidth = ctx.measureText(letter).width;
    ctx.fillText(letter, cursor + letterWidth / 2, 168);
    cursor += letterWidth + spacing;
  });
  ctx.restore();

  const headline =
    props.percentage !== null ? `${props.percentage} %` : `${props.comparable}`;
  const subline =
    props.percentage !== null
      ? tp("result.shareIdentical", props.comparable)
      : tp("result.shareTraversed", props.comparable);

  const headlineSize = props.percentage !== null ? 300 : 220;
  const headlineFont = `500 ${headlineSize}px ${display}`;
  ctx.font = headlineFont;
  const headlineWidth = ctx.measureText(headline).width;
  const gradient = ctx.createLinearGradient(
    WIDTH / 2 - headlineWidth / 2,
    0,
    WIDTH / 2 + headlineWidth / 2,
    0,
  );
  gradient.addColorStop(0, "#F6E7D2");
  gradient.addColorStop(0.5, "#FFFFFF");
  gradient.addColorStop(1, "#F1C9A8");
  centered(ctx, headline, 620, headlineFont, gradient);

  centered(ctx, subline, 700, `400 34px ${sans}`, "rgba(255,255,255,0.66)");

  const duo = props.partnerName
    ? `${props.meName} & ${props.partnerName}`
    : props.meName;
  centered(ctx, duo, 830, `500 62px ${display}`, "rgba(255,255,255,0.95)");

  if (props.comparable > 0 && props.sameCount === props.comparable) {
    centered(
      ctx,
      t("result.youKnowByHeart"),
      880,
      `500 30px ${sans}`,
      "rgba(226,184,135,0.92)",
    );
  } else if (props.experienceTitle) {
    centered(
      ctx,
      props.experienceTitle,
      884,
      `400 30px ${sans}`,
      "rgba(255,255,255,0.55)",
    );
  }

  const date = new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2 - 120, 950);
  ctx.lineTo(WIDTH / 2 + 120, 950);
  ctx.stroke();

  centered(ctx, date, 1000, `400 26px ${sans}`, "rgba(255,255,255,0.48)");

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error(t("result.renderError")));
    }, "image/png");
  });
}

export function ResultCard({
  meName,
  partnerName,
  percentage,
  comparable,
  sameCount,
  experienceTitle,
}: Props) {
  const { t, tp, locale } = useT();
  const track = useTrack();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "copied">("idle");
  const [error, setError] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);

  const blobRef = useRef<Blob | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    setCanShare(
      typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function",
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    const props: Props = {
      meName,
      partnerName,
      percentage,
      comparable,
      sameCount,
      experienceTitle,
    };
    drawCard(props, t, tp, locale)
      .then((blob) => {
        if (cancelled) return;
        blobRef.current = blob;
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setPreviewUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError(t("result.cardError"));
      });
    return () => {
      cancelled = true;
    };
  }, [
    meName,
    partnerName,
    percentage,
    comparable,
    sameCount,
    experienceTitle,
    t,
    tp,
    locale,
  ]);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const fileName = "duoplay-souvenir.png";

  const summary =
    percentage !== null
      ? tp("result.summaryIdentical", comparable, {
          title: experienceTitle ?? t("result.summaryFallback"),
          percentage,
        })
      : tp("result.summaryTraversed", comparable);

  const download = useCallback(async () => {
    const blob = blobRef.current;
    if (!blob) return;
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      track("result_card_shared", { channel: "download" });
    } catch {
      setError(t("result.downloadError"));
    }
  }, [t, track]);

  const share = useCallback(async () => {
    const blob = blobRef.current;
    if (!blob) return;
    try {
      const file = new File([blob], fileName, { type: "image/png" });
      if (!navigator.canShare?.({ files: [file] })) {
        await download();
        return;
      }
      await navigator.share({
        files: [file],
        title: "DuoPlay",
        text: summary,
      });
      track("result_card_shared", { channel: "native" });
    } catch {
      /* partage annulé : rien à signaler */
    }
  }, [download, summary, track]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setStatus("copied");
      track("result_card_shared", { channel: "copy" });
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setError(t("result.copyError"));
    }
  }, [summary, t, track]);

  return (
    <section
      data-testid="partage"
      data-loaded={previewUrl ? "true" : "false"}
      className="liquid-glass top-light rise flex flex-col gap-4 rounded-xl p-5"
    >
      <div className="flex flex-col gap-1">
        <p className="eyebrow">{t("result.eyebrow")}</p>
        <h2 className="text-lg leading-tight">{t("result.title")}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("result.body")}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-graphite-900">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            data-testid="partage-preview"
            src={previewUrl}
            alt={t("result.alt")}
            width={WIDTH}
            height={HEIGHT}
            className="block h-auto w-full"
          />
        ) : (
          <div className="skel aspect-square w-full" />
        )}
      </div>

      {error ? (
        <p data-testid="partage-error" className="text-xs text-coral-600">
          {error}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {canShare && (
            <Button
              type="button"
              data-testid="partage-share"
              disabled={!previewUrl}
              onClick={share}
              className="gap-1.5"
            >
              <Share2 className="size-4" />
              {t("invite.share")}
            </Button>
          )}
          <Button
            type="button"
            variant={canShare ? "outline" : "default"}
            data-testid="partage-download"
            disabled={!previewUrl}
            onClick={download}
            className={cn("gap-1.5", canShare && "border-ivory-300")}
          >
            <Download className="size-4" />
            {t("result.download")}
          </Button>
          <a
            data-testid="partage-whatsapp"
            href={`https://wa.me/?text=${encodeURIComponent(summary)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("result_card_shared", { channel: "whatsapp" })}
            className="press inline-flex h-11 items-center gap-2 rounded-full border border-ivory-300 px-4 text-sm font-medium transition-colors hover:border-lavender-300"
          >
            <Share2 className="size-4" />
            WhatsApp
          </a>
          <Button
            type="button"
            variant="ghost"
            data-testid="partage-copy"
            onClick={copy}
          >
            {status === "copied" ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            {status === "copied" ? t("invite.copied") : t("result.copyText")}
          </Button>
        </div>
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">
        {t("result.disclaimer")}
      </p>

      <span data-testid="partage-summary" className="sr-only">
        {summary}
      </span>
    </section>
  );
}
