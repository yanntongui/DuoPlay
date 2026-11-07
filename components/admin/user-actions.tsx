"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Ban, Copy, Eye, MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";
import { copyText } from "@/lib/clipboard";
import { adminPortalHost } from "@/lib/admin/portal";
import type { DemoUser } from "@/lib/admin/demo-users";

/**
 * Menu d'actions d'une ligne du tableau.
 *
 * Le menu est positionné en `fixed` à partir du bouton déclencheur : le
 * tableau vit dans un conteneur `overflow-x-auto` qui rognerait un menu
 * absolu. Il se ferme au clic extérieur, sur Échap, au défilement ou au
 * redimensionnement.
 */
export function UserActions({
  user,
  onView,
  onToggleStatus,
  onDelete,
}: {
  user: DemoUser;
  onView: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  const open = coords !== null;

  const close = useCallback(() => {
    setCoords(null);
    setConfirmingDelete(false);
    setCopied(false);
  }, []);

  const toggle = useCallback(() => {
    if (open) {
      close();
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    // 280 px suffisent pour le menu complet, confirmations incluses.
    const estimatedHeight = 280;
    const top = Math.max(
      12,
      Math.min(rect.bottom + 6, window.innerHeight - estimatedHeight),
    );
    setCoords({ top, right: Math.max(12, window.innerWidth - rect.right) });
  }, [open, close]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (menuRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="ad-iab ml-auto"
        aria-label={`Actions pour ${user.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        <MoreHorizontal className="size-4" />
      </button>

      {coords &&
        adminPortalHost() !== null &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={`Actions pour ${user.name}`}
            style={{ top: coords.top, right: coords.right }}
            className="fixed z-50 w-[228px] rounded-xl border ad-bd ad-bg-surface p-1 shadow-xl"
          >
          {confirmingDelete ? (
            <div className="p-2">
              <p className="text-[12.5px] font-medium ad-ink">
                Supprimer ce compte ?
              </p>
              <p className="mt-1 text-[11.5px] ad-muted">
                {user.name} sera retiré de la liste. Action locale à la démo.
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  className="ad-btn ad-btn-wine h-8 flex-1 px-3 text-[11.5px]"
                  onClick={() => {
                    onDelete();
                    close();
                  }}
                >
                  Supprimer
                </button>
                <button
                  type="button"
                  className="ad-btn ad-btn-outline h-8 flex-1 px-3 text-[11.5px]"
                  onClick={() => setConfirmingDelete(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <>
              <MenuItem
                icon={<Eye className="size-3.5" />}
                onClick={() => {
                  onView();
                  close();
                }}
              >
                Voir le profil
              </MenuItem>
              <MenuItem
                icon={<Copy className="size-3.5" />}
                onClick={async () => {
                  setCopied(await copyText(user.id));
                }}
              >
                {copied ? "Identifiant copié" : "Copier l’identifiant"}
              </MenuItem>
              <div className="my-1 h-px ad-bg-sunk" />
              <MenuItem
                icon={
                  user.status === "suspended" ? (
                    <RotateCcw className="size-3.5" />
                  ) : (
                    <Ban className="size-3.5" />
                  )
                }
                onClick={() => {
                  onToggleStatus();
                  close();
                }}
              >
                {user.status === "suspended" ? "Réactiver le compte" : "Suspendre le compte"}
              </MenuItem>
              <MenuItem
                icon={<Trash2 className="size-3.5" />}
                tone="danger"
                onClick={() => setConfirmingDelete(true)}
              >
                Supprimer
              </MenuItem>
            </>
          )}
          </div>,
          adminPortalHost() ?? document.body,
        )}
    </>
  );
}

function MenuItem({
  icon,
  children,
  onClick,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  tone?: "neutral" | "danger";
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] transition-colors ${
        tone === "danger"
          ? "ad-danger ad-hover-danger-soft"
          : "ad-ink ad-hover-soft"
      }`}
    >
      <span className={tone === "danger" ? "ad-danger" : "ad-muted"}>{icon}</span>
      {children}
    </button>
  );
}
