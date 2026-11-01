"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";

const LENGTH = 6;

export default function AdminTwoFactor() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const setDigit = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      setDigits((prev) => prev.map((d, i) => (i === index ? "" : d)));
      return;
    }
    setDigits((prev) => {
      const next = [...prev];
      clean.split("").forEach((char, offset) => {
        if (index + offset < LENGTH) next[index + offset] = char;
      });
      return next;
    });
    const target = Math.min(index + clean.length, LENGTH - 1);
    refs.current[target]?.focus();
  };

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < LENGTH - 1) refs.current[index + 1]?.focus();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (digits.join("").length !== LENGTH) {
      setError("Saisissez les 6 chiffres de votre application d'authentification.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    localStorage.setItem("admin_token", "demo_token");
    localStorage.setItem("admin_role", "super_admin");
    document.cookie = "admin_token=demo_token; path=/; max-age=86400; SameSite=Lax";
    router.push("/admin");
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex items-center gap-2.5">
          <span
            className="inline-flex size-10 items-center justify-center rounded-[12px]"
            style={{ background: "linear-gradient(155deg,#5b3354,#2a1425)" }}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none">
              <circle cx="9.2" cy="12" r="5.2" stroke="#fff" strokeWidth="1.6" />
              <circle cx="14.8" cy="12" r="5.2" stroke="#d9a7c9" strokeWidth="1.6" />
            </svg>
          </span>
          <div>
            <p className="text-[15px] font-semibold leading-none ad-ink">DuoPlay</p>
            <p className="mt-1 text-[10.5px] uppercase tracking-[0.16em] ad-faint">
              Administration
            </p>
          </div>
        </div>

        <div className="ad-card p-6 sm:p-7">
          <span className="inline-flex size-10 items-center justify-center rounded-xl ad-bg-plum-50 ad-plum">
            <KeyRound className="size-5" />
          </span>
          <h1 className="mt-4 text-[25px] font-semibold tracking-[-0.03em] ad-ink">
            Vérification en deux étapes
          </h1>
          <p className="mt-1.5 text-[13px] leading-snug ad-muted">
            Saisissez le code à 6 chiffres généré par votre application
            d&apos;authentification.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border ad-bd-danger ad-bg-danger-soft px-3.5 py-2.5 text-[12.5px] ad-danger">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-5">
            <div className="flex justify-between gap-2">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  aria-label={`Chiffre ${i + 1} sur ${LENGTH}`}
                  className="ad-input h-14 w-full text-center text-[20px] font-semibold"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="ad-btn ad-btn-primary mt-5 h-11 w-full disabled:opacity-60"
            >
              {loading ? (
                "Vérification…"
              ) : (
                <>
                  Valider le code
                  <ArrowRight className="size-4" strokeWidth={2} />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-[11.5px]">
            <button type="button" className="ad-plum hover:underline">
              Utiliser un code de secours
            </button>
            <Link href="/admin/login" className="ad-muted hover:underline">
              Revenir à la connexion
            </Link>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-2.5 rounded-xl border ad-bd ad-bg-soft p-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 ad-plum" />
          <p className="text-[11.5px] leading-snug ad-muted">
            Environnement de démonstration — n&apos;importe quel code à 6
            chiffres est accepté.
          </p>
        </div>
      </div>
    </div>
  );
}
