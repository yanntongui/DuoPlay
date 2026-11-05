"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  Calendar,
  ChevronRight,
  Clock,
  Flag,
  Heart,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  Plus,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmojiTile, Pill } from "@/components/ui/surface";
import { useDeviceToken } from "@/lib/game/use-device";
import { cn } from "@/lib/utils";

type CustomItem = NonNullable<
  FunctionReturnType<typeof api.customItems.list>
>[number];

type VisibilityKind =
  | "private"
  | "shared"
  | "common"
  | "to_discuss"
  | "deleted";

const VISIBILITY_LABELS: Record<VisibilityKind, string> = {
  private: "Privé",
  shared: "Partagé",
  common: "Commun",
  to_discuss: "À discuter",
  deleted: "Supprimé",
};

const VISIBILITY_EMOJIS: Record<VisibilityKind, string> = {
  private: "🔒",
  shared: "🤝",
  common: "👥",
  to_discuss: "💬",
  deleted: "🗑️",
};

const KIND_EMOJIS: Record<CustomItem["kind"], string> = {
  desire: "✨",
  memory: "📷",
  favorite: "⭐",
  upcoming: "📅",
  date: "📆",
  custom_experience: "🧩",
};

function itemTitle(item: CustomItem) {
  return item.title;
}

function itemSubtitle(item: CustomItem) {
  if (item.kind === "memory") return item.data?.place ?? "Souvenir";
  if (item.kind === "upcoming") return item.data?.location ?? "À venir";
  if (item.kind === "date") return item.data?.date ?? "Date importante";
  return item.description ?? "";
}

function itemMeta(item: CustomItem): string {
  if (item.kind === "desire") return "Envie";
  if (item.kind === "memory") return "Souvenir";
  if (item.kind === "upcoming") return "À venir";
  if (item.kind === "date") return "Date importante";
  if (item.kind === "favorite") return "Favori";
  if (item.kind === "custom_experience") return "Expérience";
  return "";
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function VisibilityBadge({ visibility }: { visibility: VisibilityKind }) {
  return (
    <Pill tone={visibility === "private" ? "neutral" : "lavender"}>
      <span aria-hidden="true">{VISIBILITY_EMOJIS[visibility]}</span>
      {VISIBILITY_LABELS[visibility]}
    </Pill>
  );
}

function ConfirmDelete({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-900/80 p-5 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-coral-100 text-coral-600">
            <Trash2 className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium">Supprimer cet élément</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Vous pouvez le restaurer depuis la corbeille si besoin.
            </p>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Annuler
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={onConfirm}
          >
            Supprimer
          </Button>
        </div>
      </Card>
    </div>
  );
}

function EditDialog({
  item,
  open,
  onClose,
}: {
  item: CustomItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const update = useMutation(api.customItems.update);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<VisibilityKind>("shared");

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description ?? "");
      setVisibility(item.visibility as VisibilityKind);
    }
  }, [item, open]);

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-graphite-900/80 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <Card className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl p-5 shadow-[var(--shadow-lift)] sm:rounded-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">Modifier</p>
            <h2 className="text-xl leading-tight">Élément</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="press inline-flex size-10 items-center justify-center rounded-full border border-ivory-200 bg-card text-graphite-500 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Titre</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 outline-none focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 py-3 outline-none focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60"
            />
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Visibilité</legend>
            <div className="grid grid-cols-2 gap-2">
              {(["private", "shared", "common", "to_discuss"] as VisibilityKind[]).map(
                (v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisibility(v)}
                    className={cn(
                      "press min-h-10 rounded-xl border px-3 py-2 text-left text-sm transition-all",
                      visibility === v
                        ? "border-lavender-300 bg-lavender-200/60 text-lavender-700"
                        : "border-ivory-200 bg-white/[0.03] text-foreground hover:border-lavender-300/70",
                    )}
                  >
                    <span aria-hidden="true">
                      {VISIBILITY_EMOJIS[v]}
                    </span>{" "}
                    {VISIBILITY_LABELS[v]}
                  </button>
                ),
              )}
            </div>
          </fieldset>

          <Button
            size="sm"
            onClick={async () => {
              await update({ id: item._id, title, description, visibility });
              onClose();
            }}
          >
            Enregistrer
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ItemCard({
  item,
  onEdit,
}: {
  item: CustomItem;
  onEdit: (item: CustomItem) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const remove = useMutation(api.customItems.remove);

  return (
    <>
      <Card className="flex h-full flex-col gap-3 p-4">
        <div className="relative">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="eyebrow mb-1">{itemMeta(item)}</p>
              <h3 className="text-lg leading-tight">{itemTitle(item)}</h3>
            </div>
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="press inline-flex size-9 items-center justify-center rounded-lg border border-ivory-200 bg-card text-graphite-500 hover:text-foreground"
            >
              <Settings className="size-4" />
            </button>
          </div>

          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {itemSubtitle(item)}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <VisibilityBadge visibility={item.visibility as VisibilityKind} />
            {item.data?.place && (
              <Pill tone="neutral">
                <ImageIcon className="size-3" />
                {item.data.place}
              </Pill>
            )}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-ivory-200/70 pt-3">
          {item.updatedAt && (
            <p className="text-xs text-muted-foreground">
              Modifié le {formatDate(item.updatedAt)}
            </p>
          )}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="press inline-flex min-h-9 items-center gap-1.5 rounded-full px-2 text-xs text-muted-foreground underline decoration-ivory-300 underline-offset-4 hover:text-foreground"
            >
              <Trash2 className="size-3.5" />
              Supprimer
            </button>
          </div>
        </div>
      </Card>

      <ConfirmDelete
        open={confirming}
        onCancel={() => setConfirming(false)}
        onConfirm={async () => {
          await remove({ id: item._id });
          setConfirming(false);
        }}
      />
    </>
  );
}

function SectionHeader({
  title,
  emoji,
  onAdd,
  count,
}: {
  title: string;
  emoji: string;
  onAdd: () => void;
  count: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-lavender-100 text-lg">
          {emoji}
        </span>
        <h2 className="text-lg font-medium">{title}</h2>
        <Pill tone="neutral">{count}</Pill>
      </div>
      <Button size="sm" onClick={onAdd}>
        <Plus className="size-4" />
        Ajouter
      </Button>
    </div>
  );
}

export function Space() {
  const deviceToken = useDeviceToken();
  const items = useQuery(
    api.customItems.list,
    deviceToken ? { deviceToken } : "skip",
  );
  const [section, setSection] = useState<CustomItem["kind"]>("desire");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<CustomItem | null>(null);

  const filtered = useMemo(() => {
    if (!items) return [];
    return items.filter((item) => item.kind === section);
  }, [items, section]);

  if (!deviceToken) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-2xl">Notre espace</h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Connectez-vous pour accéder à votre espace personnel.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex flex-col gap-6">
      <section>
        <p className="eyebrow mb-2">Espace personnel</p>
        <h1 className="text-[2rem] leading-[1.1]">Notre espace</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Vos envies, souvenirs, dates et expériences personnalisées. Chaque
          élément peut être privé, partagé, commun ou à discuter.
        </p>
      </section>

      <nav
        aria-label="Sections de l'espace"
        className="overflow-x-auto rounded-xl border border-ivory-200/70 bg-card/60"
      >
        <div className="flex gap-2 p-2">
          {[
            { kind: "desire", label: "Envies", emoji: "✨" },
            { kind: "memory", label: "Souvenirs", emoji: "📷" },
            { kind: "upcoming", label: "À venir", emoji: "📅" },
            { kind: "date", label: "Dates", emoji: "📆" },
          ].map((s) => (
            <button
              key={s.kind}
              type="button"
              onClick={() => setSection(s.kind as CustomItem["kind"])}
              className={cn(
                "press inline-flex min-h-10 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-all",
                section === s.kind
                  ? "gradient-primary text-white shadow-[var(--shadow-glow)]"
                  : "border border-ivory-200 bg-card/80 text-foreground hover:border-lavender-300",
              )}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </nav>

      <Card className="flex flex-col gap-4 p-5">
        <SectionHeader
          title={
            section === "desire"
              ? "Nos envies"
              : section === "memory"
                ? "Nos souvenirs"
                : section === "upcoming"
                  ? "Nos prochaines étapes"
                  : "Nos dates importantes"
          }
          emoji={section === "desire" ? "✨" : section === "memory" ? "📷" : section === "upcoming" ? "📅" : "📆"}
          onAdd={() => setAdding(true)}
          count={filtered.length}
        />

        {filtered.length === 0 ? (
          <Card tone="lavender" className="flex flex-col items-center gap-3 p-8 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-lavender-100 text-2xl">
              {section === "desire" ? "✨" : section === "memory" ? "📷" : section === "upcoming" ? "📅" : "📆"}
            </span>
            <div>
              <p className="text-sm font-medium">
                {section === "desire"
                  ? "Aucune envie pour le moment"
                  : section === "memory"
                    ? "Aucun souvenir enregistré"
                    : section === "upcoming"
                      ? "Rien à venir"
                      : "Aucune date importante"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {section === "desire"
                  ? "Enregistrez une envie partagée pour plus tard."
                  : section === "memory"
                    ? "Ajoutez un souvenir pour le garder avec vous."
                    : "Ajoutez un élément pour commencer."}
              </p>
            </div>
            <Button variant="outline" onClick={() => setAdding(true)}>
              <Plus className="size-4" />
              Ajouter
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                onEdit={setEditing}
              />
            ))}
          </div>
        )}
      </Card>

      <EditDialog
        item={editing}
        open={!!editing}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}
