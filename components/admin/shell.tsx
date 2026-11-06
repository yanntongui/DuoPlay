"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  Command,
  LogOut,
  Mail,
  Menu,
  Search,
  X,
} from "lucide-react";
import { ADMIN_NAV } from "./nav";
import { logout as endAdminSession } from "@/lib/admin/actions";

/* ---------------------------------------------------------------- */
/*  Marque                                                           */
/* ---------------------------------------------------------------- */

function Mark({ className = "size-9" }: { className?: string }) {
  return (
    <span
      className={`${className} inline-flex shrink-0 items-center justify-center rounded-[11px]`}
      style={{
        background:
          "linear-gradient(155deg, #5b3354 0%, #40203c 55%, #2a1425 100%)",
      }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <circle cx="9.2" cy="12" r="5.2" stroke="#f5ecf3" strokeWidth="1.6" />
        <circle cx="14.8" cy="12" r="5.2" stroke="#d9a7c9" strokeWidth="1.6" />
      </svg>
    </span>
  );
}

/* ---------------------------------------------------------------- */
/*  Navigation                                                       */
/* ---------------------------------------------------------------- */

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="relative min-h-0 flex-1">
      <nav className="h-full overflow-y-auto px-3 pb-6">
        {ADMIN_NAV.map((section) => (
          <div key={section.label} className="mt-5 first:mt-2">
            <p className="ad-nav-label px-3 pb-2">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-active={active}
                    onClick={onNavigate}
                    className="ad-nav-item"
                  >
                    <Icon
                      className="size-[17px] shrink-0"
                      strokeWidth={active ? 2.1 : 1.7}
                    />
                    <span className="truncate">{item.label}</span>
                    {typeof item.count === "number" && (
                      <span className="ad-nav-count">{item.count}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      {/* Dégradé de fin de liste : signale que la section « Système » continue
          sous la ligne de flottaison. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-9"
        style={{
          background:
            "linear-gradient(to top, rgba(255,255,255,0.96), rgba(255,255,255,0))",
        }}
      />
    </div>
  );
}

function SidebarFooter() {

  // Server Action : le cookie HttpOnly est supprimé côté serveur, puis
  // redirection vers l'écran de connexion.
  const logout = () => {
    void endAdminSession();
  };

  return (
    <div className="shrink-0 px-3 pb-3">
      {/* Carte d'information — rappel de gouvernance */}
      <div className="ad-card-dark relative mb-2 p-4">
        <div className="relative z-10">
          <span className="mb-2 inline-flex size-7 items-center justify-center rounded-full ad-bg-white-12">
            <LockIcon />
          </span>
          <p className="text-[13px] font-semibold leading-tight text-white">
            Console sécurisée
          </p>
          <p className="mt-1 text-[11px] leading-snug text-white/60">
            Chaque action est horodatée et journalisée.
          </p>
          <Link
            href="/admin/audit"
            className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-full bg-white/92 text-[11.5px] font-semibold text-[#2a1425] transition-colors hover:bg-white"
          >
            Voir le journal
          </Link>
        </div>
      </div>

      <button
        onClick={logout}
        className="ad-nav-item w-full text-left"
        style={{ color: "var(--ad-muted)" }}
      >
        <LogOut className="size-[17px]" strokeWidth={1.7} />
        <span>Déconnexion</span>
      </button>
    </div>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="#fff" strokeWidth="1.8">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 pb-5 pt-5">
        <Mark />
        <div>
          <p className="text-[15px] font-semibold leading-none tracking-tight ad-ink">
            DuoPlay
          </p>
          <p className="mt-1 text-[10.5px] uppercase tracking-[0.14em] ad-faint">
            Administration
          </p>
        </div>
      </div>
      <SidebarNav onNavigate={onNavigate} />
      <SidebarFooter />
    </div>
  );
}

/* ---------------------------------------------------------------- */
/*  Barre supérieure                                                 */
/* ---------------------------------------------------------------- */

function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Server Action : le cookie HttpOnly est supprimé côté serveur, puis
  // redirection vers l'écran de connexion.
  const logout = () => {
    void endAdminSession();
  };

  return (
    <header className="ad-card mb-4 flex items-center gap-3 px-3 py-2.5 sm:px-4">
      <button
        onClick={onOpenMenu}
        className="ad-iab ad-mobile-trigger"
        aria-label="Ouvrir le menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Recherche globale */}
      <div className="relative hidden flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 ad-faint" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Rechercher un utilisateur, un couple, un ticket…"
          className="h-11 w-full rounded-full border ad-bd ad-bg-soft pl-10 pr-20 text-[13px] ad-ink outline-none transition-colors placeholder:ad-faint focus:ad-bd-plum focus:bg-white"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border ad-bd-strong bg-white px-1.5 py-1 text-[10px] font-medium ad-faint sm:flex">
          <Command className="size-2.5" /> K
        </kbd>
      </div>

      <button className="ad-iab ad-iab-light ad-search-mobile" aria-label="Rechercher">
        <Search className="size-[18px]" strokeWidth={1.7} />
      </button>

      <div className="flex-1 sm:hidden" />

      {/* Environnement */}
      <span className="hidden items-center gap-1.5 rounded-full border ad-bd px-3 py-1.5 text-[11px] font-medium ad-muted lg:inline-flex">
        <span className="size-1.5 rounded-full ad-bg-positive-solid" />
        Production
      </span>

      <button className="ad-iab ad-iab-light hidden sm:inline-flex" aria-label="Messagerie">
        <Mail className="size-[18px]" strokeWidth={1.7} />
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setBellOpen((v) => !v)}
          className="ad-iab ad-iab-light relative"
          aria-label="Notifications"
        >
          <Bell className="size-[18px]" strokeWidth={1.7} />
          <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full ad-bg-danger-solid ring-2 ring-white" />
        </button>

        {bellOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
            <div className="ad-card ad-enter absolute right-0 top-12 z-50 w-80 p-2">
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] ad-faint">
                Notifications
              </p>
              {[
                { t: "Pic de signalements", d: "12 nouveaux signalements en attente", tone: "danger" },
                { t: "Webhook Stripe en retard", d: "3 événements non distribués", tone: "warning" },
                { t: "Export terminé", d: "rapport-utilisateurs-2026-11.csv", tone: "positive" },
              ].map((n) => (
                <div
                  key={n.t}
                  className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 ad-hover-soft"
                >
                  <span
                    className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                      n.tone === "danger"
                        ? "ad-bg-danger-solid"
                        : n.tone === "warning"
                          ? "ad-bg-warning-solid"
                          : "ad-bg-positive-solid"
                    }`}
                  />
                  <div>
                    <p className="text-[12.5px] font-medium ad-ink">{n.t}</p>
                    <p className="text-[11.5px] ad-muted">{n.d}</p>
                  </div>
                </div>
              ))}
              <Link
                href="/admin/monitoring"
                onClick={() => setBellOpen(false)}
                className="mt-1 block rounded-xl px-3 py-2 text-center text-[12px] font-medium ad-plum ad-hover-plum-50"
              >
                Tout voir
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="mx-1 hidden h-7 w-px ad-bg-sunk sm:block" />

      {/* Profil */}
      <div className="relative">
        <button
          onClick={() => setProfileOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 transition-colors ad-hover-soft sm:pr-2"
        >
          <span
            className="flex size-9 items-center justify-center rounded-full text-[12px] font-semibold text-white"
            style={{ background: "linear-gradient(150deg,#7d4a72,#40203c)" }}
          >
            YT
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-[12.5px] font-semibold leading-tight ad-ink">
              Yann Tongui
            </span>
            <span className="block text-[11px] leading-tight ad-faint">
              yann@duoplay.com
            </span>
          </span>
          <ChevronDown className="hidden size-3.5 ad-faint sm:block" />
        </button>

        {profileOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
            <div className="ad-card ad-enter absolute right-0 top-12 z-50 w-56 p-1.5">
              <Link
                href="/admin/settings"
                onClick={() => setProfileOpen(false)}
                className="block rounded-lg px-3 py-2 text-[12.5px] ad-soft ad-hover-soft"
              >
                Mon profil
              </Link>
              <Link
                href="/admin/settings"
                onClick={() => setProfileOpen(false)}
                className="block rounded-lg px-3 py-2 text-[12.5px] ad-soft ad-hover-soft"
              >
                Rôles & permissions
              </Link>
              <button
                onClick={logout}
                className="mt-1 flex w-full items-center gap-2 rounded-lg border-t ad-bd px-3 py-2 text-left text-[12.5px] ad-danger ad-hover-danger-soft"
              >
                <LogOut className="size-3.5" />
                Déconnexion
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- */
/*  Shell                                                            */
/* ---------------------------------------------------------------- */

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Les écrans d'authentification occupent tout l'écran, sans navigation.
  if (pathname === "/admin/login") {
    return <div className="admin-shell min-h-dvh">{children}</div>;
  }

  return (
    <div className="admin-shell min-h-dvh w-full p-3 sm:p-4">
      <div className="mx-auto flex w-full max-w-[1680px] gap-4">
        {/* Sidebar desktop */}
        <aside className="ad-card ad-sidebar-desktop sticky top-4 h-[calc(100dvh-2rem)] w-[268px] shrink-0 overflow-hidden">
          <Sidebar />
        </aside>

        {/* Sidebar mobile */}
        {mobileOpen && (
          <div className="ad-sidebar-mobile">
            <div className="ad-scrim" onClick={() => setMobileOpen(false)} />
            <aside className="ad-card ad-enter fixed inset-y-3 left-3 z-50 w-[280px] overflow-hidden">
              <button
                onClick={() => setMobileOpen(false)}
                className="ad-iab absolute right-2.5 top-3 z-10"
                aria-label="Fermer"
              >
                <X className="size-4" />
              </button>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        {/* Colonne principale */}
        <div className="min-w-0 flex-1">
          <Topbar onOpenMenu={() => setMobileOpen(true)} />
          <main className="pb-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
