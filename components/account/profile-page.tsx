"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import {
  Check,
  Copy,
  Heart,
  KeyRound,
  Lock,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/surface";
import {
  clearAccount,
  getAccount,
  setAccount,
  type StoredAccount,
} from "@/lib/game/storage";
import { useDeviceToken } from "@/lib/game/use-device";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-12 w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 text-base outline-none transition-shadow focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60";

export function ProfilePage() {
  const deviceToken = useDeviceToken();
  const mine = useQuery(
    api.accounts.mine,
    deviceToken ? { deviceToken } : "skip",
  );

  if (!deviceToken || mine === undefined) {
    return <ProfileLoading />;
  }

  if (!mine) {
    return <ProfileSetup deviceToken={deviceToken} />;
  }

  return <ProfileView deviceToken={deviceToken} mine={mine} />;
}

function ProfileLoading() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="skel h-32 rounded-xl border border-ivory-200/70"
        />
      ))}
    </div>
  );
}

function ProfileSetup({ deviceToken }: { deviceToken: string }) {
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
              Sans mot de passe. Sans vérification. Vos données restent les vôtres.
            </p>
          </div>
        </div>

        <div
          role="tablist"
          className="flex gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1 text-[13px]"
        >
          {([
            ["create", "Créer un compte"],
            ["signin", "J'ai un code"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
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
  const create = useMutation(api.accounts.create);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await create({ deviceToken, displayName: name.trim(), analyticsConsent: false, notificationsConsent: false });
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
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Votre nom ou pseudonyme</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={24}
            placeholder="Ex. Camille"
            className={fieldClass}
            disabled={busy}
          />
        </label>
        <p className="text-xs text-muted-foreground">
          Ce nom est visible pour votre partenaire dans « Notre espace ».
        </p>

        {error && (
          <p className="flex items-center gap-2 rounded-xl bg-coral-500/10 px-3 py-2 text-xs text-coral-200">
            <TriangleAlert className="size-3.5 shrink-0" />
            {error}
          </p>
        )}

        <Button type="submit" disabled={busy || !name.trim()}>
          Créer le compte
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
          Ce code vous a été remis à la création. Il relie cet appareil à votre espace.
        </p>

        {error && (
          <p className="flex items-center gap-2 rounded-xl bg-coral-500/10 px-3 py-2 text-xs text-coral-200">
            <TriangleAlert className="size-3.5 shrink-0" />
            {error}
          </p>
        )}

        <Button type="submit" disabled={busy}>
          <KeyRound />
          {busy ? "Connexion…" : "Me reconnecter"}
        </Button>
      </form>
    </Card>
  );
}

function ProfileView({
  deviceToken,
  mine,
}: {
  deviceToken: string;
  mine: any;
}) {
  const local = getAccount();
  const couple = useQuery(api.couples.mine, { deviceToken });
  const consents = useQuery(api.consents.get, { deviceToken });

  const renamePartner = useMutation(api.accounts.renamePartner);
  const dissolve = useMutation(api.accounts.dissolve);
  const updateConsents = useMutation(api.accounts.updateConsents);
  const unlink = useMutation(api.accounts.unlink);

  const partner = couple?.partner.name ?? null;
  const analytics = consents?.analytics ?? mine.analyticsConsent ?? false;
  const notifications = consents?.notifications ?? mine.notificationsConsent ?? false;

  const [partnerName, setPartnerName] = useState("");
  const [confirmingDissolve, setConfirmingDissolve] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function copyCode() {
    if (!local?.recoveryCode) return;
    try {
      await navigator.clipboard.writeText(local.recoveryCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
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
      setNotice("Votre espace couple est dissous. Chacun garde ses propres réponses.");
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

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête du profil */}
      <Card className="flex items-center gap-4 p-5">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-lavender-500/15 text-lavender-300 ring-1 ring-inset ring-lavender-500/25">
          <UserRound className="size-8" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold">{mine.displayName ?? "Votre compte"}</h1>
          <p className="text-sm text-muted-foreground">
            Membre DuoPlay depuis {new Date(mine.since).toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Pill tone="neutral">
              <Lock className="size-3" />
              Profil privé
            </Pill>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Code de récupération */}
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <KeyRound className="size-4 text-lavender-300" />
              <p className="text-sm font-medium">Code de récupération</p>
            </div>
            {local?.recoveryCode ? (
              <>
                <div className="mt-3 flex items-center gap-2">
                  <code
                    className="min-w-0 flex-1 truncate rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 font-mono text-base tracking-widest"
                  >
                    {local.recoveryCode}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="iconSm"
                    onClick={copyCode}
                  >
                    {copied ? <Check /> : <Copy />}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Notez-le : c'est le seul moyen de retrouver votre espace sur un autre appareil.
                </p>
              </>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                Le code a été remis à la création de ce compte.
              </p>
            )}
          </Card>

          {/* Préférences de confidentialité */}
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-lavender-300" />
              <p className="text-sm font-medium">Confidentialité</p>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              <label className="flex items-start justify-between gap-4">
                <span className="flex flex-col">
                  <span className="text-sm">Mesures anonymes</span>
                  <span className="text-xs text-muted-foreground">
                    Nous aider à améliorer DuoPlay, sans profilage publicitaire.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => toggle("analytics", e.target.checked)}
                  className="mt-1 size-5 shrink-0 accent-lavender-500"
                />
              </label>
              <label className="flex items-start justify-between gap-4">
                <span className="flex flex-col">
                  <span className="text-sm">Rappels doux</span>
                  <span className="text-xs text-muted-foreground">
                    Une partie attend votre partenaire : nous pouvons vous le rappeler.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => toggle("notifications", e.target.checked)}
                  className="mt-1 size-5 shrink-0 accent-lavender-500"
                />
              </label>
              <Link
                href="/confidentialite"
                className="text-xs text-primary hover:underline"
              >
                Lire la politique de confidentialité
              </Link>
            </div>
          </Card>

          {/* Zone sensible */}
          <Card className="p-5">
            <p className="text-sm font-medium">Gérer ce compte</p>
            <div className="mt-3 flex flex-col gap-2">
              {couple?.partner ? (
                confirmingDissolve ? (
                  <div className="flex flex-col gap-2 rounded-xl bg-coral-500/10 p-3">
                    <p className="text-xs text-coral-200">
                      Dissoudre l'espace couple ? Vous pourrez toujours jouer, mais l'espace partagé ne sera plus mis en avant.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
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
                    className="self-start"
                    onClick={() => setConfirmingDissolve(true)}
                  >
                    Dissoudre l'espace couple
                  </Button>
                )
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start text-muted-foreground"
                onClick={doUnlink}
              >
                <LogOut />
                Dissocier cet appareil
              </Button>
            </div>
          </Card>
        </div>

        {/* Colonne secondaire */}
        <div className="flex flex-col gap-6">
          {/* Carte du couple */}
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Heart className="size-4 text-coral-300" />
              <p className="text-sm font-medium">Notre connexion</p>
            </div>
            {partner || couple?.me.name ? (
              <>
                <p className="mt-3 text-sm">
                  Vous êtes connectés avec {partner || couple?.me.name}.
                </p>
                <Link
                  href="/notre-espace"
                  className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  Voir Notre espace
                </Link>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Aucun couple relié pour l'instant. Lancez une expérience et partagez le lien.
              </p>
            )}
          </Card>

          {/* Actions rapides */}
          <Card className="p-5">
            <div className="flex flex-col gap-3">
              <Link
                href="/notre-espace"
                className="press flex items-center gap-3 rounded-xl border border-ivory-200/80 bg-card/60 p-3 hover:border-lavender-300"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-lavender-100 text-lavender-700">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Notre espace</p>
                  <p className="text-xs text-muted-foreground">Vos envies et souvenirs</p>
                </div>
              </Link>
              <Link
                href="/parametres"
                className="press flex items-center gap-3 rounded-xl border border-ivory-200/80 bg-card/60 p-3 hover:border-lavender-300"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-ivory-100">
                  <Settings className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Paramètres</p>
                  <p className="text-xs text-muted-foreground">Configuration avancée</p>
                </div>
              </Link>
              <Button
                variant="outline"
                className="flex w-full items-center justify-center gap-2"
                onClick={() => {
                  clearAccount();
                  window.location.reload();
                }}
              >
                <LogOut />
                Se déconnecter
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {notice && (
        <p
          className="rounded-xl bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground"
        >
          {notice}
        </p>
      )}
    </div>
  );
}