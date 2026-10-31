"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrack } from "@/lib/analytics";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Partage d'un lien d'invitation (§14) : copie, WhatsApp, et partage natif du
 * navigateur lorsqu'il est disponible. Aucune donnée n'est inventée : le lien
 * pointe toujours vers la session réelle (`/partie/<token>`).
 */
export function ShareInvite({
  token,
  className,
}: {
  token: string;
  className?: string;
}) {
  const { t } = useT();
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const track = useTrack();

  useEffect(() => {
    setOrigin(window.location.origin);
    setCanShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
  }, []);

  const inviteUrl = origin ? `${origin}/partie/${token}` : "";
  const message = t("invite.message", { url: inviteUrl });

  async function copy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      track("invite_link_shared", { channel: "copy" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: "DuoPlay", text: message, url: inviteUrl });
      track("invite_link_shared", { channel: "native" });
    } catch {
      /* partage annulé : rien à signaler */
    }
  }

  const linkClass =
    "press gradient-primary top-light inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-white shadow-[var(--shadow-glow)] hover:brightness-[1.06]";

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("invite_link_shared", { channel: "whatsapp" })}
        className={linkClass}
      >
        <Share2 className="size-4" />
        WhatsApp
      </a>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={copy}
        disabled={!inviteUrl}
        className="h-11"
      >
        {copied ? (
          <Check className="size-4" />
        ) : (
          <Copy className="size-4" />
        )}
        {copied ? t("invite.copied") : t("invite.copyLink")}
      </Button>
      {canShare && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={nativeShare}
          className="h-11"
        >
          <Share2 className="size-4" />
          {t("invite.share")}
        </Button>
      )}
    </div>
  );
}
