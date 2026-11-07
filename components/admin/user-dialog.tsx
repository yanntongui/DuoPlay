"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, UserPlus, X } from "lucide-react";
import { Avatar, Field, StatusBadge } from "@/components/admin/ui";
import { copyText } from "@/lib/clipboard";
import { adminPortalHost } from "@/lib/admin/portal";
import {
  COUNTRIES,
  PLANS,
  STATUS_LABELS,
  formatDate,
  type DemoUser,
  type DemoUserStatus,
} from "@/lib/admin/demo-users";

export type UserDraft = {
  name: string;
  email: string;
  plan: string;
  status: DemoUserStatus;
  country: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Boîte de dialogue unique : création (`user` absent) ou consultation.
 *
 * Aucune requête réseau : `onCreate` reçoit un brouillon validé et c'est
 * l'appelant qui l'ajoute à sa liste.
 */
export function UserDialog({
  user,
  existingEmails,
  onClose,
  onCreate,
  onToggleStatus,
}: {
  user?: DemoUser;
  existingEmails: string[];
  onClose: () => void;
  onCreate: (draft: UserDraft) => void;
  onToggleStatus?: (user: DemoUser) => void;
}) {
  const titleId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<UserDraft>({
    name: "",
    email: "",
    plan: PLANS[0],
    status: "active",
    country: COUNTRIES[0],
  });
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!user) firstFieldRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, user]);

  function update<K extends keyof UserDraft>(key: K, value: UserDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draft.name.trim();
    const email = draft.email.trim().toLowerCase();

    if (name.length < 2) {
      setError("Le nom doit contenir au moins 2 caractères.");
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setError("Adresse e-mail invalide.");
      return;
    }
    if (existingEmails.some((existing) => existing.toLowerCase() === email)) {
      setError("Un compte utilise déjà cette adresse e-mail.");
      return;
    }

    onCreate({ ...draft, name, email });
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="ad-scrim"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="ad-card relative z-50 max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-b-none p-5 sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-[18px] font-semibold tracking-[-0.02em] ad-ink">
              {user ? "Profil du compte" : "Créer un utilisateur"}
            </h2>
            <p className="mt-1 text-[12.5px] ad-muted">
              {user
                ? "Vue administrateur : aucune donnée intime n’est exposée."
                : "Le compte est ajouté à cette démonstration, dans ce navigateur."}
            </p>
          </div>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="ad-iab -mr-1 -mt-1 shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>

        {user ? (
          <div className="mt-5">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} size={44} />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium ad-ink">{user.name}</p>
                <p className="truncate text-[12px] ad-muted">{user.email}</p>
              </div>
              <div className="ml-auto shrink-0">
                <StatusBadge status={user.status} />
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
              <Field label="Identifiant" value={<span className="font-mono text-[12px]">{user.id}</span>} />
              <Field label="Offre" value={user.plan} />
              <Field label="Pays" value={user.country} />
              <Field label="Statut" value={STATUS_LABELS[user.status]} />
              <Field label="Inscription" value={formatDate(user.createdAt)} />
              <Field label="Dernière activité" value={user.lastSeen} />
            </dl>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="ad-btn ad-btn-outline h-9 px-3 text-[12.5px]"
                onClick={async () => setCopied(await copyText(user.id))}
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copié" : "Copier l’identifiant"}
              </button>
              <div className="ml-auto flex items-center gap-2">
                {onToggleStatus && (
                  <button
                    type="button"
                    className="ad-btn ad-btn-outline h-9 px-3 text-[12.5px]"
                    onClick={() => {
                      onToggleStatus(user);
                      onClose();
                    }}
                  >
                    {user.status === "suspended" ? "Réactiver" : "Suspendre"}
                  </button>
                )}
                <button
                  type="button"
                  className="ad-btn ad-btn-primary h-9 px-3 text-[12.5px]"
                  onClick={onClose}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-5 space-y-3.5" onSubmit={submit} noValidate>
            <div>
              <label htmlFor="user-name" className="mb-1.5 block text-[12px] font-medium ad-soft">
                Nom complet
              </label>
              <input
                ref={firstFieldRef}
                id="user-name"
                className="ad-input h-10"
                value={draft.name}
                onChange={(event) => update("name", event.target.value)}
                placeholder="Camille Rousseau"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label htmlFor="user-email" className="mb-1.5 block text-[12px] font-medium ad-soft">
                Adresse e-mail
              </label>
              <input
                id="user-email"
                type="email"
                className="ad-input h-10"
                value={draft.email}
                onChange={(event) => update("email", event.target.value)}
                placeholder="camille@example.com"
                autoComplete="off"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label htmlFor="user-plan" className="mb-1.5 block text-[12px] font-medium ad-soft">
                  Offre
                </label>
                <select
                  id="user-plan"
                  className="ad-select h-10 w-full"
                  value={draft.plan}
                  onChange={(event) => update("plan", event.target.value)}
                >
                  {PLANS.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="user-status" className="mb-1.5 block text-[12px] font-medium ad-soft">
                  Statut
                </label>
                <select
                  id="user-status"
                  className="ad-select h-10 w-full"
                  value={draft.status}
                  onChange={(event) => update("status", event.target.value as DemoUserStatus)}
                >
                  {(["active", "pending", "suspended"] as DemoUserStatus[]).map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="user-country" className="mb-1.5 block text-[12px] font-medium ad-soft">
                Pays
              </label>
              <select
                id="user-country"
                className="ad-select h-10 w-full"
                value={draft.country}
                onChange={(event) => update("country", event.target.value)}
              >
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border ad-bd-danger ad-bg-danger-soft px-3.5 py-2.5 text-[12.5px] ad-danger"
              >
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-1.5">
              <button
                type="button"
                className="ad-btn ad-btn-outline h-10 px-4 text-[12.5px]"
                onClick={onClose}
              >
                Annuler
              </button>
              <button type="submit" className="ad-btn ad-btn-primary h-10 px-4 text-[12.5px]">
                <UserPlus className="size-4" strokeWidth={2} />
                Créer le compte
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    adminPortalHost() ?? document.body,
  );
}
