"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { RotateCw, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/components/convex-client-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/surface";
import { GENTLE_SPRING, prefersReducedMotion, springEasing } from "@/lib/motion/spring";
import { useT, type MessageKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const SECTOR_COUNT = 8;
const TURNS = 5;
const SPIN_MS = 3200;

type Forfeit = {
  _id: string;
  /** Texte du gage (donnée serveur) — ou renvoi vers une clé embarquée. */
  text?: string;
  /** Clé de traduction pour les gages embarqués (secours hors connexion). */
  textKey?: MessageKey;
  intensity: "leger" | "moyen" | "profond";
};

/** Les gages embarqués servent de secours hors connexion / sans Convex. */
const FALLBACK: Forfeit[] = [
  { _id: "f1", textKey: "wheel.fallbackLikes", intensity: "moyen" },
  { _id: "f2", textKey: "wheel.fallbackCompliment", intensity: "leger" },
  { _id: "f3", textKey: "wheel.fallbackMoment", intensity: "profond" },
  { _id: "f4", textKey: "wheel.fallbackLaugh", intensity: "moyen" },
];

const INTENSITY_EMOJI = {
  leger: "✨",
  moyen: "💛",
  profond: "🔥",
} as const;

const INTENSITY_LABEL = {
  leger: "intensity.leger",
  moyen: "intensity.moyen",
  profond: "intensity.profond",
} as const;

function polar(cx: number, cy: number, radius: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function sectorPath(index: number, count: number, radius: number, cx: number, cy: number) {
  const step = 360 / count;
  const start = index * step;
  const end = start + step;
  const a = polar(cx, cy, radius, start);
  const b = polar(cx, cy, radius, end);
  const large = step > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${a.x} ${a.y} A ${radius} ${radius} 0 ${large} 1 ${b.x} ${b.y} Z`;
}

function shuffle<T>(items: T[]): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function Wheel({
  sectors,
  rotation,
  spinning,
  onSettled,
}: {
  sectors: Forfeit[];
  rotation: number;
  spinning: boolean;
  onSettled: () => void;
}) {
  const { t } = useT();
  const cx = 100;
  const cy = 100;
  const radius = 94;
  const count = Math.max(sectors.length, 1);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[22rem]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 rounded-full bg-coral-500/15 blur-3xl"
      />
      <span
        aria-hidden="true"
        data-testid="roue-pointer"
        className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-[38%] drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
      >
        <svg width="26" height="30" viewBox="0 0 26 30" fill="none">
          <path
            d="M13 30L1.5 8.2A4 4 0 0 1 5 2h16a4 4 0 0 1 3.5 6.2L13 30Z"
            fill="url(#pointer)"
          />
          <defs>
            <linearGradient id="pointer" x1="13" y1="0" x2="13" y2="30">
              <stop stopColor="#f0d9b8" />
              <stop offset="1" stopColor="#e11d48" />
            </linearGradient>
          </defs>
        </svg>
      </span>

      <svg
        viewBox="0 0 200 200"
        className="relative z-10 size-full"
        role="img"
        aria-label={t("title.wheel")}
        data-testid="roue-wheel"
        data-spinning={spinning ? "true" : "false"}
        onTransitionEnd={spinning ? onSettled : undefined}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning
            ? `transform ${SPIN_MS}ms ${springEasing(GENTLE_SPRING, 64, 3.2)}`
            : undefined,
          willChange: "transform",
        }}
      >
        <circle cx={cx} cy={cy} r={radius + 3} fill="rgb(255 255 255 / 0.04)" />
        <circle
          cx={cx}
          cy={cy}
          r={radius + 3}
          fill="none"
          stroke="rgb(255 255 255 / 0.1)"
        />
        {sectors.map((sector, index) => {
          const tone = index % 3;
          const fill =
            tone === 0
              ? "rgb(226 184 135 / 0.18)"
              : tone === 1
                ? "rgb(225 29 72 / 0.2)"
                : "rgb(255 255 255 / 0.05)";
          const center = index * (360 / count) + 360 / count / 2;
          const position = polar(cx, cy, radius * 0.66, center);
          return (
            <g key={sector._id}>
              <path
                d={sectorPath(index, count, radius, cx, cy)}
                fill={fill}
                stroke="rgb(255 255 255 / 0.08)"
              />
              <text
                x={position.x}
                y={position.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="17"
                transform={`rotate(${center} ${position.x} ${position.y})`}
              >
                {INTENSITY_EMOJI[sector.intensity]}
              </text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="15" fill="#0b0710" stroke="rgb(226 184 135 / 0.5)" />
        <circle cx={cx} cy={cy} r="4" fill="#e2b887" />
      </svg>
    </div>
  );
}

function RoueConvex() {
  const pool = useQuery(api.roue.pool);
  const items = useMemo<Forfeit[]>(
    () =>
      (pool ?? []).map((row) => ({
        _id: row._id,
        text: row.text,
        intensity: row.intensity,
      })),
    [pool],
  );

  if (pool === undefined) {
    return <div className="skel mx-auto aspect-square w-full max-w-[22rem] rounded-full" />;
  }

  return <RoueBody items={items} />;
}

function RoueBody({ items }: { items: Forfeit[] }) {
  const { t } = useT();
  const usable = items.length >= 2 ? items : FALLBACK;
  const [sectors, setSectors] = useState<Forfeit[]>(() =>
    shuffle(usable).slice(0, Math.min(SECTOR_COUNT, usable.length)),
  );
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Forfeit | null>(null);
  const pendingIndex = useRef(0);

  const reduced = useMemo(() => prefersReducedMotion(), []);

  const spin = useCallback(() => {
    if (spinning) return;
    setResult(null);
    const next = shuffle(usable).slice(0, Math.min(SECTOR_COUNT, usable.length));
    const count = next.length;
    const chosen = Math.floor(Math.random() * count);
    pendingIndex.current = chosen;
    setSectors(next);

    const step = 360 / count;
    const sectorCenter = chosen * step + step / 2;
    const base = Math.ceil(rotation / 360) * 360 + TURNS * 360;
    const target = base - sectorCenter;

    if (reduced) {
      setRotation(target);
      setResult(next[chosen]);
      return;
    }
    setSpinning(true);
    // Laisse les nouveaux secteurs se peindre avant de lancer la rotation.
    requestAnimationFrame(() => setRotation(target));
  }, [reduced, rotation, spinning, usable]);

  const settle = useCallback(() => {
    setSpinning(false);
    setResult(sectors[pendingIndex.current] ?? null);
  }, [sectors]);

  return (
    <div className="flex flex-col items-center gap-6" data-testid="roue">
      <Wheel
        sectors={sectors}
        rotation={rotation}
        spinning={spinning}
        onSettled={settle}
      />

      <Button
        type="button"
        size="lg"
        data-testid="roue-spin"
        onClick={spin}
        disabled={spinning}
        className="w-full max-w-[22rem] gap-2"
      >
        <RotateCw className={cn("size-4", spinning && "animate-spin")} />
        {spinning ? t("wheel.spinning") : t("wheel.spin")}
      </Button>

      <div
        className="min-h-[7rem] w-full max-w-[22rem]"
        aria-live="polite"
        role="status"
      >
        {result ? (
          <Card
            data-testid="roue-result"
            className="reveal-veil pop top-light p-5 text-center"
          >
            <span className="mb-2 inline-flex">
              <Pill tone="lavender">
                <Sparkles className="size-3.5" />
                {t(INTENSITY_LABEL[result.intensity])}
              </Pill>
            </span>
            <p
              data-testid="roue-gage"
              className="font-display text-xl leading-snug"
            >
              {result.textKey ? t(result.textKey) : result.text}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("wheel.challengeNow")}
            </p>
          </Card>
        ) : (
          <p className="pt-6 text-center text-sm text-muted-foreground">
            {t("wheel.emptyHint")}
          </p>
        )}
      </div>
    </div>
  );
}

export function RoueDuHasard() {
  if (!isConvexConfigured) return <RoueBody items={FALLBACK} />;
  return <RoueConvex />;
}
