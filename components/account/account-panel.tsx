"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import {
  BadgeCheck,
  Check,
  Copy,
  Heart,
  KeyRound,
  LogOut,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  clearAccount,
  getAccount,
  setAccount,
  type StoredAccount,
} from "@/lib/game/storage";
import { useDeviceToken } from "@/lib/game/use-device";

/**
 * Mon profil (§12 — Phase 6). Un compte **léger** qui ne demande ni mot de
 * passe ni vérification : il fédère simplement les appareils autour d'une même
 * identité pour que « Notre espace » ne soit plus cloisonné. Sans compte, le
 * jeu reste entièrement accessible — le profil est un confort, jamais un
 * péage.
 */

const fieldClass =
  "h-12 w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 text-base outline-none transition-shadow focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60";

export function AccountPanel() {
  const deviceToken = useDeviceToken();
  const mine = useQuery(
    api.accounts.mine,
    deviceToken ? { deviceToken } : "skip",
  );

  if (!deviceToken || mine === undefined) {
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

  if (mine) {
    return <AccountView deviceToken={deviceToken} />;
  }

  return <AccountSetup deviceToken={deviceToken} />;
}

/** Création d'un compte ou reconnexion via le code de récupération. */
function AccountSetup({ deviceToken }: { deviceToken: string }) {
  const [mode, setMode] = useState<"create" | "signin">("create");

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-lavender-500/15 text-lavender-300 ring-1 ring-inset ring-lavender-500/25">
            <UserRound className="size-5" />
          </div>
          <div>
            <p className="font-medium">Retrouvez votre espace partout</p>
            <p className="text-xs text-muted-foreground">
              Sans mot de passe. Sans vérification. Vos données restent les
              vôtres.
            </p>
          </div>
        </div>

        <div
          role="tablist"
          className="flex gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1 text-[13px]"
        >
          {(
            [
              ["create", "Créer un compte"],
              ["signin", "J'ai un code"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              data-testid={`account-tab-${value}`}
              onClick={() => setMode(value)}
              className={
                mode === value
                  ? "press flex-1 rounded-full bg-white/[0.10] px-3 py-1.5 font-medium text-foreground"
                  : "press flex-1 rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground"
              }
            >
              {label}
            </button>
          ))}
        </div>
      </Card>

      {mode === "create" ? (
        <CreateForm deviceToken={deviceToken} />
      ) : (
        <SignInForm deviceToken={deviceToken} />
      )}
    </div>
  );
}

function CreateForm({ deviceToken }: { deviceToken: string }) {
  const consents = useQuery(api.consents.get, { deviceToken });
  const create = useMutation(api.accounts.create);

  const [name, setName] = useState("");
  const [kind, setKind] = useState<"none" | "email" | "phone">("none");
  const [contact, setContact] = useState("");
  const [analytics, setAnalytics] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!consents) return;
    setAnalytics(consents.analytics);
    setNotifications(consents.notifications);
  }, [consents]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await create({
        deviceToken,
        displayName: name,
        contactKind: kind,
        contact: kind === "none" ? undefined : contact,
        analyticsConsent: analytics,
        notificationsConsent: notifications,
      });
      setAccount({
        accountId: result.accountId,
        displayName: result.displayName,
        primaryDeviceToken: result.primaryDeviceToken,
        recoveryCode: result.recoveryCode,
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Impossible de créer le compte.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5">
      <form onSubmit={submit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Votre prénom</span>
          <input
            data-testid="account-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={24}
            autoComplete="given-name"
            placeholder="Ex. Awa"
            className={fieldClass}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Un contact (facultatif)</span>
          <select
            data-testid="account-contact-kind"
            value={kind}
            onChange={(event) =>
              setKind(event.target.value as "none" | "email" | "phone")
            }
            className={fieldClass}
          >
            <option value="none">Aucun pour l&apos;instant</option>
            <option value="email">Adresse e-mail</option>
            <option value="phone">Numéro de téléphone</option>
          </select>
          {kind !== "none" && (
            <input
              data-testid="account-contact"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              inputMode={kind === "phone" ? "tel" : "email"}
              autoComplete={kind === "phone" ? "tel" : "email"}
              placeholder={kind === "phone" ? "Ex. +229 90 00 00 00" : "vous@exemple.com"}
              className={fieldClass}
            />
          )}
          <span className="text-xs text-muted-foreground">
            Sert uniquement à vous rappeler vos parties. Il n&apos;est pas encore
            vérifié.
          </span>
        </label>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium">Préférences</legend>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              data-testid="account-consent-analytics"
              checked={analytics}
              onChange={(event) => setAnalytics(event.target.checked)}
              className="mt-1 size-4 accent-lavender-500"
            />
            <span className="text-muted-foreground">
              Mesures anonymes pour améliorer DuoPlay.
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              data-testid="account-consent-notifications"
              checked={notifications}
              onChange={(event) => setNotifications(event.target.checked)}
              className="mt-1 size-4 accent-lavender-500"
            />
            <span className="text-muted-foreground">
              Rappels doux quand une partie attend votre partenaire.
            </span>
          </label>
        </fieldset>

        {error && (
          <p
            data-testid="account-error"
            className="flex items-center gap-2 rounded-xl bg-coral-500/10 px-3 py-2 text-xs text-coral-200"
          >
            <TriangleAlert className="size-3.5 shrink-0" />
            {error}
          </p>
        )}

        <Button type="submit" data-testid="account-create" disabled={busy}>
          <Sparkles />
          {busy ? "Création…" : "Créer mon compte"}
        </Button>
      </form>
    </Card>
  );
}

function SignInForm({ deviceToken }: { deviceToken: string }) {
  const signIn = useMutation(api.accounts.signIn);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await signIn({ deviceToken, recoveryCode: code });
      setAccount({
        accountId: result.accountId,
        displayName: result.displayName,
        primaryDeviceToken: result.primaryDeviceToken,
        recoveryCode: result.recoveryCode,
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Code de récupération invalide.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Code de récupération</span>
          <input
            data-testid="account-recovery-input"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            placeholder="XXXX-XXXX-XXXX"
            className={`${fieldClass} font-mono tracking-widest`}
          />
        </label>
        <p className="text-xs text-muted-foreground">
          Ce code vous a été remis à la création. Il relie cet appareil à votre
          espace et à tout ce que vous y avez déjà fait.
        </p>

        {error && (
          <p
            data-testid="account-error"
            className="flex items-center gap-2 rounded-xl bg-coral-500/10 px-3 py-2 text-xs text-coral-200"
          >
            <TriangleAlert className="size-3.5 shrink-0" />
            {error}
          </p>
        )}

        <Button type="submit" data-testid="account-signin" disabled={busy}>
          <KeyRound />
          {busy ? "Connexion…" : "Me reconnecter"}
        </Button>
      </form>
    </Card>
  );
}

/** Vue du compte relié : identité, code, partenaire, préférences. */
function AccountView({ deviceToken }: { deviceToken: string }) {
  const mine = useQuery(api.accounts.mine, { deviceToken });
  const couple = useQuery(api.couples.mine, { deviceToken });
  const consents = useQuery(api.consents.get, { deviceToken });

  const renamePartner = useMutation(api.accounts.renamePartner);
  const dissolve = useMutation(api.accounts.dissolve);
  const updateConsents = useMutation(api.accounts.updateConsents);
  const unlink = useMutation(api.accounts.unlink);

  const [local, setLocal] = useState<StoredAccount | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [confirmingDissolve, setConfirmingDissolve] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLocal(getAccount());
  }, []);

  const analytics = consents?.analytics ?? mine?.analyticsConsent ?? false;
  const notifications =
    consents?.notifications ?? mine?.notificationsConsent ?? false;

  async function copyCode() {
    if (!local?.recoveryCode) return;
    try {
      await navigator.clipboard.writeText(local.recoveryCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* presse-papiers indisponible : le code reste lisible à l'écran */
    }
  }

  async function submitRename(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      await renamePartner({ deviceToken, partnerName });
      setPartnerName("");
      setNotice("Le prénom de votre partenaire est à jour.");
    } catch {
      setNotice("Impossible de renommer pour l'instant.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(kindKey: "analytics" | "notifications", value: boolean) {
    try {
      await updateConsents({
        deviceToken,
        analytics: kindKey === "analytics" ? value : analytics,
        notifications: kindKey === "notifications" ? value : notifications,
      });
    } catch {
      setNotice("Impossible d'enregistrer la préférence.");
    }
  }

  async function doDissolve() {
    setBusy(true);
    try {
      await dissolve({ deviceToken });
      setConfirmingDissolve(false);
      setNotice(
        "Votre espace couple est dissous. Chacun garde ses propres réponses.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function doUnlink() {
    try {
      await unlink({ deviceToken });
      clearAccount();
    } catch {
      setNotice("Impossible de dissocier cet appareil.");
    }
  }

  const partner = couple?.partner.name ?? null;

  return (
    <div data-testid="account-panel" className="flex flex-col gap-5">
      <Card tone="dark" className="grain relative overflow-hidden p-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-lavender-300/25 blur-3xl"
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm">
            <BadgeCheck className="size-6" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg text-white">
              {mine?.displayName ?? "Votre compte"}
            </h2>
            <p className="text-xs text-white/70">
              Compte léger ·{" "}
              {mine
                ? `depuis le ${new Date(mine.since).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}`
                : ""}
            </p>
          </div>
        </div>
      </Card>

      {/* Code de récupération ------------------------------------- */}
      <Card className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <KeyRound className="size-4 text-lavender-300" />
          <p className="text-sm font-medium">Code de récupération</p>
        </div>
        {local?.recoveryCode ? (
          <>
            <div className="flex items-center gap-2">
              <code
                data-testid="account-recovery-code"
                className="min-w-0 flex-1 truncate rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 font-mono text-base tracking-widest"
              >
                {local.recoveryCode}
              </code>
              <Button
                type="button"
                variant="outline"
                size="iconSm"
                aria-label="Copier le code"
                onClick={copyCode}
              >
                {copied ? <Check /> : <Copy />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Notez-le : c&apos;est le seul moyen de retrouver votre espace sur un
              autre appareil. Il ne vous sera jamais demandé par un tiers.
            </p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            Le code a été remis à la création de ce compte. S&apos;il est perdu,
            créez un nouveau compte : vos parties restent sur cet appareil.
          </p>
        )}
      </Card>

      {/* Partenaire ------------------------------------------------- */}
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-2">
          <Heart className="size-4 text-coral-300" />
          <p className="text-sm font-medium">Votre partenaire</p>
        </div>
        {partner || couple?.me.name ? (
          <>
            <p className="text-sm text-muted-foreground">
              {partner
                ? `Relié à ${partner}.`
                : "Votre partenaire n'est pas encore relié à cet espace."}
            </p>
            <form onSubmit={submitRename} className="flex flex-col gap-2 sm:flex-row">
              <input
                data-testid="account-partner-name"
                value={partnerName}
                onChange={(event) => setPartnerName(event.target.value)}
                maxLength={24}
                placeholder={partner ? `Renommer ${partner}` : "Prénom du partenaire"}
                className={fieldClass}
                disabled={!partner}
              />
              <Button
                type="submit"
                variant="outline"
                data-testid="account-rename"
                disabled={!partner || busy}
                className="shrink-0"
              >
                Renommer
              </Button>
            </form>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucun couple relié pour l&apos;instant. Lancez une expérience et
            partagez le lien — votre espace s&apos;ouvrira automatiquement ici.
          </p>
        )}
      </Card>

      {/* Préférences ------------------------------------------------- */}
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-lavender-300" />
          <p className="text-sm font-medium">Confidentialité</p>
        </div>
        <ToggleRow
          testid="account-toggle-analytics"
          label="Mesures anonymes"
          description="Nous aider à améliorer DuoPlay, sans profilage publicitaire."
          checked={analytics}
          onChange={(value) => toggle("analytics", value)}
        />
        <ToggleRow
          testid="account-toggle-notifications"
          label="Rappels doux"
          description="Une partie attend votre partenaire : nous pouvons vous le rappeler."
          checked={notifications}
          onChange={(value) => toggle("notifications", value)}
        />
        <Link
          href="/confidentialite"
          className="text-xs text-primary hover:underline"
        >
          Lire la politique de confidentialité
        </Link>
      </Card>

      {notice && (
        <p
          data-testid="account-notice"
          className="rounded-xl bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground"
        >
          {notice}
        </p>
      )}

      {/* Zone sensible ---------------------------------------------- */}
      <Card className="flex flex-col gap-3 p-5">
        <p className="text-sm font-medium">Gérer ce compte</p>

        {couple?.partner ? (
          confirmingDissolve ? (
            <div className="flex flex-col gap-2 rounded-xl bg-coral-500/10 p-3">
              <p className="text-xs text-coral-200">
                Dissoudre l&apos;espace couple ? Vous pourrez toujours jouer, mais
                l&apos;espace partagé ne sera plus mis en avant.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-testid="account-dissolve-confirm"
                  onClick={doDissolve}
                  disabled={busy}
                >
                  Confirmer
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmingDissolve(false)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="account-dissolve"
              className="self-start"
              onClick={() => setConfirmingDissolve(true)}
            >
              Dissoudre l&apos;espace couple
            </Button>
          )
        ) : null}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-testid="account-unlink"
          className="self-start text-muted-foreground"
          onClick={doUnlink}
        >
          <LogOut />
          Dissocier cet appareil
        </Button>
      </Card>
    </div>
  );
}

function ToggleRow({
  testid,
  label,
  description,
  checked,
  onChange,
}: {
  testid: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4">
      <span className="flex flex-col">
        <span className="text-sm">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
      <input
        type="checkbox"
        data-testid={testid}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-5 shrink-0 accent-lavender-500"
      />
    </label>
  );
}
