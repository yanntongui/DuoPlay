"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, MoreHorizontal, X } from "lucide-react";
import { adminPortalHost } from "@/lib/admin/portal";

/* ------------------------------------------------------------------ */
/*  Persistance locale d'une liste de démonstration                    */
/* ------------------------------------------------------------------ */

/**
 * Liste de démonstration conservée dans le `localStorage` du navigateur.
 *
 * La console n'étant pas encore branchée sur Convex, chaque écran gère ses
 * propres lignes fictives. On garde néanmoins les modifications d'une visite à
 * l'autre, sans jamais prétendre à une persistance serveur.
 */
export function useDemoRows<T>(storageKey: string, seed: T[]) {
  const [rows, setRows] = useState<T[]>(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setRows(parsed as T[]);
      }
    } catch {
      // Stockage indisponible (navigation privée) : on garde les données en mémoire.
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(rows));
    } catch {
      // Quota dépassé : la démo reste utilisable, sans persistance.
    }
  }, [rows, hydrated, storageKey]);

  return [rows, setRows] as const;
}

/* ------------------------------------------------------------------ */
/*  Étiquette « démonstration »                                        */
/* ------------------------------------------------------------------ */

export function DemoPill() {
  return (
    <span
      className="ad-pill ad-pill-warning"
      title="Données fictives, conservées dans ce navigateur"
    >
      Démonstration
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Notification d'action                                              */
/* ------------------------------------------------------------------ */

export function DemoToast({
  message,
  onClose,
}: {
  message: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onClose, 6000);
    return () => window.clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2"
    >
      <div className="pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-medium text-white shadow-lg ad-bg-plum">
        {message}
        <button
          type="button"
          aria-label="Masquer la notification"
          onClick={onClose}
          className="ml-1 opacity-70 hover:opacity-100"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>,
    adminPortalHost() ?? document.body,
  );
}

/* ------------------------------------------------------------------ */
/*  Menu d'actions d'une ligne                                         */
/* ------------------------------------------------------------------ */

export type RowMenuItem = {
  label: string;
  icon?: ReactNode;
  tone?: "neutral" | "danger";
  /** Message de confirmation affiché avant d'exécuter l'action. */
  confirm?: string;
  onSelect: () => void;
};

export function RowMenu({
  label,
  items,
}: {
  label: string;
  items: RowMenuItem[];
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null);

  const open = coords !== null;

  const close = useCallback(() => {
    setCoords(null);
    setConfirmIndex(null);
  }, []);

  const toggle = useCallback(() => {
    if (open) {
      close();
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const estimatedHeight = 60 + items.length * 38 + (confirmIndex !== null ? 70 : 0);
    setCoords({
      top: Math.max(12, Math.min(rect.bottom + 6, window.innerHeight - estimatedHeight)),
      right: Math.max(12, window.innerWidth - rect.right),
    });
  }, [open, close, items.length, confirmIndex]);

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

  const host = adminPortalHost();
  const confirming = confirmIndex === null ? null : items[confirmIndex];

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="ad-iab ml-auto"
        aria-label={`Actions pour ${label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open &&
        host &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={`Actions pour ${label}`}
            style={{ top: coords.top, right: coords.right }}
            className="fixed z-50 w-[236px] rounded-xl border ad-bd ad-bg-surface p-1 shadow-xl"
          >
            {confirming && confirmIndex !== null ? (
              <div className="p-2">
                <p className="text-[12.5px] font-medium ad-ink">Confirmer ?</p>
                <p className="mt-1 text-[11.5px] ad-muted">{confirming.confirm}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    className="ad-btn ad-btn-wine h-8 flex-1 px-3 text-[11.5px]"
                    onClick={() => {
                      confirming.onSelect();
                      close();
                    }}
                  >
                    Confirmer
                  </button>
                  <button
                    type="button"
                    className="ad-btn ad-btn-outline h-8 flex-1 px-3 text-[11.5px]"
                    onClick={() => setConfirmIndex(null)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              items.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    if (item.confirm) {
                      setConfirmIndex(index);
                      return;
                    }
                    item.onSelect();
                    close();
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] transition-colors ${
                    item.tone === "danger"
                      ? "ad-danger ad-hover-danger-soft"
                      : "ad-ink ad-hover-soft"
                  }`}
                >
                  {item.icon && (
                    <span className={item.tone === "danger" ? "ad-danger" : "ad-muted"}>
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              ))
            )}
          </div>,
          host,
        )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Dialogue de création générique                                     */
/* ------------------------------------------------------------------ */

export type DemoField = {
  key: string;
  label: string;
  type?: "text" | "email" | "number" | "textarea";
  options?: string[];
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  half?: boolean;
};

export function DemoCreateDialog({
  title,
  description,
  submitLabel = "Créer",
  fields,
  onSubmit,
  onClose,
}: {
  title: string;
  description?: string;
  submitLabel?: string;
  fields: DemoField[];
  onSubmit: (values: Record<string, string>) => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields.map((field) => [field.key, field.defaultValue ?? field.options?.[0] ?? ""]),
    ),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstFieldRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  function update(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    for (const field of fields) {
      const value = (values[field.key] ?? "").trim();
      if (field.required && value.length === 0) {
        setError(`Le champ « ${field.label} » est obligatoire.`);
        return;
      }
      if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        setError("Adresse e-mail invalide.");
        return;
      }
    }

    onSubmit(
      Object.fromEntries(
        Object.entries(values).map(([key, value]) => [key, value.trim()]),
      ),
    );
  }

  const host = adminPortalHost();
  if (!host) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button type="button" aria-label="Fermer" onClick={onClose} className="ad-scrim" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="ad-card relative z-50 max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-b-none p-5 sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-[18px] font-semibold tracking-[-0.02em] ad-ink">
              {title}
            </h2>
            {description && <p className="mt-1 text-[12.5px] ad-muted">{description}</p>}
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

        <form className="mt-5 space-y-3.5" onSubmit={submit} noValidate>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {fields.map((field, index) => {
              const id = `demo-field-${field.key}`;
              const wide = !field.half && (field.type === "textarea" || !field.options);
              return (
                <div key={field.key} className={wide ? "sm:col-span-2" : ""}>
                  <label htmlFor={id} className="mb-1.5 block text-[12px] font-medium ad-soft">
                    {field.label}
                    {field.required && <span className="ad-danger"> *</span>}
                  </label>
                  {field.options ? (
                    <select
                      id={id}
                      className="ad-select h-10 w-full"
                      value={values[field.key] ?? ""}
                      onChange={(event) => update(field.key, event.target.value)}
                    >
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      id={id}
                      className="ad-input min-h-[80px] w-full py-2"
                      value={values[field.key] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(event) => update(field.key, event.target.value)}
                    />
                  ) : (
                    <input
                      ref={index === 0 ? firstFieldRef : undefined}
                      id={id}
                      type={field.type ?? "text"}
                      className="ad-input h-10 w-full"
                      value={values[field.key] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(event) => update(field.key, event.target.value)}
                      autoComplete="off"
                    />
                  )}
                </div>
              );
            })}
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
              <Check className="size-4" />
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>,
    host,
  );
}

/* ------------------------------------------------------------------ */
/*  Pagination                                                         */
/* ------------------------------------------------------------------ */

export function DemoPagination({
  page,
  pageCount,
  rangeStart,
  rangeEnd,
  total,
  onPage,
  note,
}: {
  page: number;
  pageCount: number;
  rangeStart: number;
  rangeEnd: number;
  total: number;
  onPage: (page: number) => void;
  note?: ReactNode;
}) {
  return (
    <>
      <span>
        {rangeStart}–{rangeEnd} sur {total}
        {note && <span className="ad-faint"> · {note}</span>}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="ad-btn ad-btn-outline h-8 px-3 text-[11.5px] disabled:opacity-40"
          onClick={() => onPage(Math.max(0, page - 1))}
          disabled={page === 0}
        >
          Précédent
        </button>
        <span className="px-2 text-[11.5px] ad-muted">
          {page + 1} / {pageCount}
        </span>
        <button
          type="button"
          className="ad-btn ad-btn-primary h-8 px-3 text-[11.5px] disabled:opacity-40"
          onClick={() => onPage(Math.min(pageCount - 1, page + 1))}
          disabled={page >= pageCount - 1}
        >
          Suivant
        </button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Export CSV                                                         */
/* ------------------------------------------------------------------ */

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function exportCsv(
  filename: string,
  columns: { key: string; label: string }[],
  rows: Record<string, string>[],
): boolean {
  if (rows.length === 0) return false;

  const header = columns.map((column) => csvCell(column.label)).join(",");
  const lines = rows.map((row) =>
    columns.map((column) => csvCell(row[column.key] ?? "")).join(","),
  );
  const csv = [header, ...lines].join("\r\n");

  // BOM UTF-8 : sans lui, Excel affiche mal les accents.
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
}
