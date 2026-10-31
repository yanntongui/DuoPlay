"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { ArrowRight, Gamepad2, Plus, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmojiTile, Pill, SectionTitle } from "@/components/ui/surface";
import { ShareInvite } from "@/components/app/share-invite";
import { modeTitle } from "@/lib/content";
import { LOCALE_TAG, useT } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/store";
import { useDeviceToken } from "@/lib/game/use-device";
import { cn } from "@/lib/utils";

type HistoryItem = {
  sessionId: string;
  token: string;
  playerToken: string;
  mode: string;
  status: string;
  createdAt: number;
  expired: boolean;
  experience: { slug: string; title: string } | null;
  category: { slug: string; title: string; emoji: string } | null;
  partnerName: string | null;
  progress: { mine: number; revealed: number; total: number };
  resumable: boolean;
};

function shortDate(value: number, locale: Locale) {
  return new Date(value).toLocaleDateString(LOCALE_TAG[locale], {
    day: "numeric",
    month: "short",
  });
}

/**
 * « Mes parties » (§13) : parties en cours, invitations en attente et parties
 * terminées, dérivées des sessions réelles de l'appareil. Aucune invitation
 * « reçue » n'est simulée : tant que le backend ne modélise pas de boîte de
 * réception, seules les sessions réelles sont montrées.
 */
export function MesParties() {
  const { t } = useT();
  const deviceToken = useDeviceToken();
  const history = useQuery(
    api.history.byDevice,
    deviceToken !== undefined ? { deviceToken } : "skip",
  );

  if (deviceToken === undefined || history === undefined) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="skel h-28 rounded-xl border border-ivory-200/70"
          />
        ))}
      </div>
    );
  }

  const items = history.items as HistoryItem[];
  const open = items.filter(
    (item) =>
      !item.expired &&
      item.status !== "terminee" &&
      item.status !== "abandonnee",
  );
  const awaiting = open.filter((item) => !item.partnerName);
  const inProgress = open.filter((item) => item.partnerName);
  const finished = items.filter(
    (item) =>
      item.status === "terminee" ||
      item.expired ||
      item.status === "abandonnee",
  );

  if (items.length === 0) {
    return (
      <Card tone="ivory" className="flex flex-col items-center gap-3 p-7 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.08] text-lavender-700 ring-1 ring-inset ring-white/[0.10]">
          <Gamepad2 className="size-6" />
        </div>
        <h2 className="text-lg">{t("space.noGames")}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("parties.emptyBody")}
        </p>
        <Link
          href="/explorer"
          className={cn(buttonVariants({ size: "lg" }), "mt-1 gap-2")}
        >
          <Plus className="size-4" />
          {t("action.createGame")}
        </Link>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-9">
      <div>
        <Link
          href="/explorer"
          className={cn(buttonVariants({ size: "lg" }), "w-full gap-2 sm:w-auto")}
        >
          <Plus className="size-4" />
          {t("action.createGame")}
        </Link>
      </div>

      {inProgress.length > 0 && (
        <section>
          <SectionTitle
            eyebrow={t("parties.inProgressEyebrow")}
            title={t("parties.inProgressTitle")}
          />
          <div className="flex flex-col gap-3">
            {inProgress.map((item) => (
              <PartyCard key={item.sessionId} item={item} />
            ))}
          </div>
        </section>
      )}

      {awaiting.length > 0 && (
        <section>
          <SectionTitle
            eyebrow={t("parties.awaitingEyebrow")}
            title={t("parties.awaitingTitle")}
          />
          <div className="flex flex-col gap-3">
            {awaiting.map((item) => (
              <PartyCard key={item.sessionId} item={item} />
            ))}
          </div>
        </section>
      )}

      {finished.length > 0 && (
        <section>
          <SectionTitle
            eyebrow={t("space.historyEyebrow")}
            title={t("parties.finishedTitle")}
          />
          <div className="flex flex-col gap-3">
            {finished.map((item) => (
              <PartyCard key={item.sessionId} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PartyCard({ item }: { item: HistoryItem }) {
  const { t, locale } = useT();
  const total = item.progress.total || 1;
  const pct = Math.min(100, Math.round((item.progress.mine / total) * 100));

  const closed = item.status === "abandonnee";
  const statusLabel = closed
    ? t("status.closed")
    : item.expired
      ? t("status.expired")
      : item.status === "terminee"
        ? t("status.finished")
        : item.partnerName
          ? t("status.ongoing")
          : t("status.waiting");

  const tone = closed
    ? "neutral"
    : item.expired
      ? "neutral"
      : item.status === "terminee"
        ? "primary"
        : item.partnerName
          ? "lavender"
          : "neutral";

  return (
    <Card data-testid="party-card" className="flex flex-col gap-3 p-4">
      <div className="flex items-start gap-3">
        <EmojiTile tone="coral" size="sm">
          {item.category?.emoji ?? "💞"}
        </EmojiTile>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">
            {item.experience?.title ?? t("activity.untitled")}
          </p>
          <p className="text-xs text-muted-foreground">
            {shortDate(item.createdAt, locale)} · {modeTitle(item.mode, locale)}
            {item.partnerName
              ? ` · ${t("activity.withName", { name: item.partnerName })}`
              : ""}
          </p>
        </div>
        <Pill tone={tone} className="shrink-0">
          {statusLabel}
        </Pill>
      </div>

      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={item.progress.mine}
        aria-label={t("parties.progressLabel")}
      >
        <div
          className="gradient-tendresse h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {t("space.answered", {
            mine: item.progress.mine,
            total: item.progress.total,
            revealed: item.progress.revealed,
          })}
        </span>

        {item.resumable ? (
          <Link
            href={`/partie/${item.token}`}
            className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
          >
            {t("parties.resume")}
            <ArrowRight className="size-3.5" />
          </Link>
        ) : item.status !== "terminee" && !item.expired && !closed ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5" />
            {t("parties.awaitingAnswer")}
          </span>
        ) : null}
      </div>

      {!closed && item.status !== "terminee" && (
        <PartyActions item={item} />
      )}
    </Card>
  );
}

/**
 * Cycle de vie différé (§13) côté interface : relancer (prolonger le lien de
 * 3 jours) ou clôturer en gardant ses réponses. Réservé à l'auteur de la
 * partie ; les actions n'apparaissent que sur les parties non terminées.
 */
function PartyActions({ item }: { item: HistoryItem }) {
  const { t } = useT();
  const relance = useMutation(api.sessions.relance);
  const close = useMutation(api.sessions.close);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const awaiting = !item.partnerName;

  async function doRelance() {
    setBusy(true);
    setNotice(null);
    try {
      await relance({ token: item.token, playerToken: item.playerToken });
      setNotice(t("parties.renewed"));
    } catch {
      setNotice(t("parties.renewError"));
    } finally {
      setBusy(false);
    }
  }

  async function doClose() {
    setBusy(true);
    try {
      await close({ token: item.token, playerToken: item.playerToken });
      setConfirming(false);
    } catch {
      setNotice(t("parties.closeError"));
    } finally {
      setBusy(false);
    }
  }

  if (!awaiting && !item.expired) return null;

  return (
    <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-3">
      {awaiting && !item.expired && (
        <ShareInvite token={item.token} className="text-[13px]" />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid="party-relance"
          disabled={busy}
          onClick={doRelance}
        >
          {item.expired ? t("parties.renew") : t("parties.extend")}
        </Button>

        {confirming ? (
          <>
            <Button
              type="button"
              variant="default"
              size="sm"
              data-testid="party-close-confirm"
              disabled={busy}
              onClick={doClose}
            >
              {t("parties.closeConfirm")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirming(false)}
            >
              {t("journal.cancel")}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-testid="party-close"
            className="text-muted-foreground"
            onClick={() => setConfirming(true)}
          >
            {t("parties.close")}
          </Button>
        )}
      </div>

      {notice && (
        <p
          data-testid="party-notice"
          className="text-xs text-muted-foreground"
        >
          {notice}
        </p>
      )}
    </div>
  );
}
