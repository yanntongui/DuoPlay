"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useDeviceToken } from "@/lib/game/use-device";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { MessageKey } from "@/lib/i18n/messages";

type ContactKind = "email" | "phone" | "none";

export function AccountCreation() {
  const { t, locale } = useT();
  const deviceToken = useDeviceToken();
  const account = useQuery(
    api.accounts.mine,
    deviceToken ? { deviceToken } : "skip",
  );
  const createAccount = useMutation(api.accounts.create);
  const verifyContact = useMutation(api.accounts.verifyContact);
  const resendCode = useMutation(api.accounts.resendVerificationCode);

  const [isCreating, setIsCreating] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [contact, setContact] = useState("");
  const [contactKind, setContactKind] = useState<ContactKind>("none");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState<string | null>(null);

  const alreadyHasAccount = account !== null;

  if (alreadyHasAccount) {
    return (
      <div className="text-sm text-muted-foreground">
        {t("account.alreadyJoined")}
      </div>
    );
  }

  const handleCreate = async () => {
    if (!deviceToken) return;
    setError(null);

    try {
      setIsCreating(true);
      const result = await createAccount({
        deviceToken,
        displayName: displayName.trim(),
        contact: contact.trim(),
        contactKind,
        analyticsConsent: true,
        notificationsConsent: true,
      });

      if (result.verificationCode) {
        setVerificationCode(result.verificationCode);
        setStep(2);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("account.error");
      setError(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleVerify = async () => {
    if (!deviceToken) return;
    setError(null);

    try {
      await verifyContact({ deviceToken, code: verificationCode });
      setStep(3);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("account.error");
      setError(msg);
    }
  };

  const handleResend = async () => {
    if (!deviceToken) return;
    setError(null);

    try {
      await resendCode({ deviceToken });
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("account.error");
      setError(msg);
    }
  };

  if (step === 2) {
    return (
      <div className="rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-white">{t("account.verifyTitle")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {contactKind === "email" 
              ? t("account.verifyEmailHint", { contact })
              : t("account.verifyPhoneHint", { contact })}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            {t("account.verificationCode")}
          </label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
            placeholder="XXXXXX"
            maxLength={6}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-lg tracking-widest text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-lavender-300"
          />
        </div>

        {error && (
          <p className="mb-3 text-sm text-coral-400">{error}</p>
        )}

        <div className="flex gap-2">
          <Button onClick={handleVerify} disabled={verificationCode.length !== 6} size="sm">
            {t("account.verify")}
          </Button>
          <Button onClick={handleResend} variant="ghost" size="sm">
            {t("account.resend")}
          </Button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="rounded-xl bg-lavender-100/30 p-6 ring-1 ring-lavender-300/20">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-lavender-500 text-white">
            ✓
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">{t("account.successTitle")}</h3>
            <p className="text-sm text-lavender-700">
              {t("account.successBody")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white">{t("account.createTitle")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("account.createBody")}
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          {t("account.displayNameLabel")}
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={t("account.displayNamePlaceholder")}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-lavender-300"
        />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          {t("account.contactLabel")}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setContactKind("email")}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm transition-colors",
              contactKind === "email"
                ? "border-lavender-300 bg-lavender-100/50 text-lavender-700"
                : "border-white/10 text-muted-foreground hover:border-white/20",
            )}
          >
            {t("account.email")}
          </button>
          <button
            type="button"
            onClick={() => setContactKind("phone")}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm transition-colors",
              contactKind === "phone"
                ? "border-lavender-300 bg-lavender-100/50 text-lavender-700"
                : "border-white/10 text-muted-foreground hover:border-white/20",
            )}
          >
            {t("account.phone")}
          </button>
          <button
            type="button"
            onClick={() => setContactKind("none")}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm transition-colors",
              contactKind === "none"
                ? "border-lavender-300 bg-lavender-100/50 text-lavender-700"
                : "border-white/10 text-muted-foreground hover:border-white/20",
            )}
          >
            {t("account.later")}
          </button>
        </div>
      </div>

      {contactKind !== "none" && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            {contactKind === "email" ? t("account.emailPlaceholder") : t("account.phonePlaceholder")}
          </label>
          <input
            type={contactKind === "email" ? "email" : "tel"}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={contactKind === "email" ? "vous@email.com" : "+33612345678"}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-lavender-300"
          />
        </div>
      )}

      {error && (
        <p className="mb-3 text-sm text-coral-400">{error}</p>
      )}

      <Button 
        onClick={handleCreate} 
        disabled={isCreating || (contactKind !== "none" && contact.trim() === "")}
        className="w-full"
      >
        {isCreating ? t("account.creating") : t("account.create")}
      </Button>
    </div>
  );
}