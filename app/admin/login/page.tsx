"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import { login } from "@/lib/admin/actions";

/**
 * Connexion à la console interne.
 *
 * Le formulaire poste vers une **Server Action** : le mot de passe est comparé
 * côté serveur à `ADMIN_PASSWORD`, puis un cookie HttpOnly signé est posé. Rien
 * n'est stocké en `localStorage`, rien n'est validable depuis le navigateur.
 */
export default function AdminLogin() {
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) {
      setError("Identifiants incorrects.");
    }
  }, []);

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Panneau de marque */}
      <div className="ad-card-dark relative m-3 hidden flex-1 flex-col justify-between overflow-hidden p-10 lg:m-4 lg:flex">
        <div className="relative z-10 flex items-center gap-3">
          <span
            className="inline-flex size-10 items-center justify-center rounded-xl border border-white/15"
            style={{ background: "linear-gradient(155deg,#6b3d62,#2a1425)" }}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none">
              <circle cx="9.2" cy="12" r="5.2" stroke="#fff" strokeWidth="1.6" />
              <circle cx="14.8" cy="12" r="5.2" stroke="#d9a7c9" strokeWidth="1.6" />
            </svg>
          </span>
          <div>
            <p className="text-[15px] font-semibold leading-none text-white">DuoPlay</p>
            <p className="mt-1 text-[10.5px] uppercase tracking-[0.16em] text-white/40">
              Administration
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-[13px] uppercase tracking-[0.14em] text-white/40">
            Console interne
          </p>
          <h1 className="mt-4 text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] text-white">
            La plateforme,
            <br />
            sous contrôle.
          </h1>
          <p className="mt-4 text-[13.5px] leading-relaxed text-white/60">
            Utilisateurs, contenus, revenus, conformité. Un accès unique pour
            l&apos;équipe.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
          {[
            { k: "24 582", v: "utilisateurs actifs" },
            { k: "8 145", v: "couples connectés" },
            { k: "99,99 %", v: "disponibilité" },
          ].map((s) => (
            <div key={s.v}>
              <p className="text-[19px] font-semibold leading-none text-white">{s.k}</p>
              <p className="mt-1.5 text-[10.5px] leading-tight text-white/45">{s.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <span
                className="inline-flex size-9 items-center justify-center rounded-[11px]"
                style={{ background: "linear-gradient(155deg,#5b3354,#2a1425)" }}
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none">
                  <circle cx="9.2" cy="12" r="5.2" stroke="#fff" strokeWidth="1.6" />
                  <circle cx="14.8" cy="12" r="5.2" stroke="#d9a7c9" strokeWidth="1.6" />
                </svg>
              </span>
              <p className="text-[15px] font-semibold ad-ink">DuoPlay</p>
            </div>
          </div>

          <h2 className="text-[27px] font-semibold tracking-[-0.03em] ad-ink">
            Connexion
          </h2>
          <p className="mt-1.5 text-[13px] ad-muted">
            Accès réservé aux administrateurs autorisés.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border ad-bd-danger ad-bg-danger-soft px-3.5 py-2.5 text-[12.5px] ad-danger"
            >
              {error}
            </div>
          )}

          <form action={login} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-[12px] font-medium ad-soft"
              >
                Identifiant
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 ad-faint" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  autoFocus
                  placeholder="admin"
                  className="ad-input h-11 ad-pl-10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[12px] font-medium ad-soft"
              >
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 ad-faint" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••"
                  className="ad-input h-11 ad-pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              className="ad-btn ad-btn-primary mt-2 h-11 w-full"
            >
              Se connecter
              <ArrowRight className="size-4" strokeWidth={2} />
            </button>
          </form>

          <div className="mt-6 flex items-start gap-2.5 rounded-xl border ad-bd ad-bg-soft p-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 ad-plum" />
            <p className="text-[11.5px] leading-snug ad-muted">
              Session signée, valable 7 jours. Déconnexion immédiate depuis le
              menu du compte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
