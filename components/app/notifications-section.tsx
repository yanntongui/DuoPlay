"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { Bell, MessageCircle, Timer, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/surface";
import { useDeviceToken } from "@/lib/game/use-device";
import { useT } from "@/lib/i18n";

/**
 * Rappels doux (§14). Alimentés par le cycle de vie différé (§13) : une partie
 * laissée en attente déclenche un rappel J+1 puis J+3, jamais plus. Chaque
 * rappel est écartable ; aucun n'est obligatoire pour continuer à jouer.
 */
export function NotificationsSection({ id }: { id?: string }) {
  const { t } = useT();
  const deviceToken = useDeviceToken();
  const data = useQuery(
    api.notifications.list,
    deviceToken ? { deviceToken } : "skip",
  );
  const markAllRead = useMutation(api.notifications.markAllRead);
  const dismiss = useMutation(api.notifications.dismiss);

  // Consulter la liste vaut lecture : le badge s'éteint à l'affichage.
  const unread = data?.unread ?? 0;
  useEffect(() => {
    if (!deviceToken || unread === 0) return;
    void markAllRead({ deviceToken }).catch(() => {});
  }, [deviceToken, unread, markAllRead]);

  if (!deviceToken || data === undefined) return null;

  return (
    <section id={id} data-testid="notifications-section" className="scroll-mt-24">
      <SectionTitle
        eyebrow={t("notifications.eyebrow")}
        title={t("notifications.title")}
        action={
          data.items.length > 0 ? (
            <span className="text-xs text-muted-foreground">
              {data.items.length}
            </span>
          ) : undefined
        }
      />

      {data.items.length === 0 ? (
        <Card className="flex items-center gap-3 p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-muted-foreground ring-1 ring-inset ring-white/[0.08]">
            <Bell className="size-4" />
          </div>
          <p className="text-sm text-muted-foreground">
            {t("notifications.empty")}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {data.items.map((item) => (
            <NotificationCard
              key={item.id}
              title={item.title}
              body={item.body}
              kind={item.kind}
              sessionToken={item.sessionToken}
              onDismiss={() => {
                void dismiss({ id: item.id, deviceToken }).catch(() => {});
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function NotificationCard({
  title,
  body,
  kind,
  sessionToken,
  onDismiss,
}: {
  title: string;
  body: string;
  kind: string;
  sessionToken: string | null;
  onDismiss: () => void;
}) {
  const { t } = useT();
  return (
    <Card className="flex items-start gap-3 p-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-lavender-500/15 text-lavender-300 ring-1 ring-inset ring-lavender-500/25">
        <Timer className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {body}
        </p>
        {sessionToken && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/partie/${sessionToken}`}
              className="press gradient-primary top-light inline-flex h-9 items-center justify-center rounded-full px-4 text-[13px] font-medium text-white shadow-[var(--shadow-glow)] hover:brightness-[1.06]"
            >
              {t("notifications.open")}
            </Link>
            {kind === "relance" && (
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  t("notifications.nudgeMessage", {
                    url: `${typeof window !== "undefined" ? window.location.origin : ""}/partie/${sessionToken}`,
                  }),
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="press inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.03] px-4 text-[13px] font-medium hover:bg-white/[0.06]"
              >
                <MessageCircle className="size-3.5" />
                {t("notifications.nudge")}
              </a>
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        aria-label={t("notifications.dismissAria")}
        onClick={onDismiss}
        className="press -mr-1 -mt-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </Card>
  );
}
