"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Camera,
  Check,
  NotebookPen,
  Pencil,
  Plus,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmojiTile, Pill, SectionTitle } from "@/components/ui/surface";
import { LOCALE_TAG, useT } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/store";
import type { MessageKey } from "@/lib/i18n/messages";
import { getPlayerName } from "@/lib/game/storage";
import { useDeviceToken } from "@/lib/game/use-device";
import { cn } from "@/lib/utils";

/**
 * Journal du couple (§4) — souvenirs conservés à deux : moments issus des
 * parties et parcours terminés, notes libres et photos. Rien du contenu des
 * réponses n'est exposé ici : seulement ce que le couple choisit de garder.
 */

type Feed = FunctionReturnType<typeof api.journal.feed>;
type JournalItem = Feed["items"][number];
type Favorite = FunctionReturnType<typeof api.favorites.list>[number];

const INPUT_CLASS =
  "w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 text-base outline-none transition-shadow focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60";

function shortDate(value: number, locale: Locale) {
  return new Date(value).toLocaleDateString(LOCALE_TAG[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const SOURCE_KEY: Record<JournalItem["source"], MessageKey> = {
  partie: "journal.sourcePartie",
  parcours: "journal.sourceParcours",
  favori: "journal.sourceFavori",
  libre: "journal.sourceLibre",
};

export function Journal() {
  const { t } = useT();
  const deviceToken = useDeviceToken();
  const feed = useQuery(
    api.journal.feed,
    deviceToken !== undefined ? { deviceToken } : "skip",
  );
  const favorites = useQuery(
    api.favorites.list,
    deviceToken !== undefined ? { deviceToken } : "skip",
  );

  const [composing, setComposing] = useState(false);
  const add = useMutation(api.journal.add);

  if (deviceToken === undefined || feed === undefined) {
    return <div className="skel h-40 rounded-xl border border-ivory-200/70" />;
  }

  const empty = feed.items.length === 0;

  return (
    <section data-testid="journal" data-loaded="true">
      <SectionTitle
        eyebrow="À garder"
        title="Journal du couple"
        action={
          feed.total > 0 ? (
            <Pill tone="neutral" data-testid="journal-count">
              {feed.total}
            </Pill>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3">
        {composing ? (
          <JournalComposer
            submitLabel={t("journal.addSubmit")}
            onCancel={() => setComposing(false)}
            onSubmit={async (draft) => {
              await add({
                deviceToken,
                authorName: getPlayerName() || undefined,
                title: draft.title,
                note: draft.note || undefined,
                mediaId: draft.mediaId,
              });
              setComposing(false);
            }}
          />
        ) : (
          <button
            type="button"
            data-testid="journal-add"
            onClick={() => setComposing(true)}
            className="press flex items-center gap-3 rounded-xl border border-dashed border-ivory-300 bg-white/[0.02] p-4 text-left transition-colors hover:border-lavender-300"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.05] text-lavender-300 ring-1 ring-inset ring-white/[0.08]">
              <Plus className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-medium">
                {t("journal.write")}
              </span>
              <span className="block text-xs text-muted-foreground">
                {t("journal.writeHint")}
              </span>
            </span>
          </button>
        )}

        {empty && !composing ? (
          <JournalEmpty />
        ) : (
          feed.items.map((item) => (
            <JournalCard key={item.id} item={item} />
          ))
        )}

        <FavoriteSuggestions
          favorites={favorites ?? []}
          disabled={composing}
        />
      </div>
    </section>
  );
}

function JournalEmpty() {
  const { t } = useT();
  return (
    <Card
      data-testid="journal-empty"
      tone="ivory"
      className="flex flex-col items-center gap-2 p-6 text-center"
    >
      <div className="flex size-11 items-center justify-center rounded-2xl bg-white/[0.08] text-lavender-700 ring-1 ring-inset ring-white/[0.10]">
        <NotebookPen className="size-5" />
      </div>
      <p className="font-medium">{t("journal.emptyTitle")}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t("journal.emptyBody")}
      </p>
    </Card>
  );
}

function FavoriteSuggestions({
  favorites,
  disabled,
}: {
  favorites: Favorite[];
  disabled: boolean;
}) {
  const { t } = useT();
  const add = useMutation(api.journal.add);
  const deviceToken = useDeviceToken();
  const [busy, setBusy] = useState<string | null>(null);
  const [kept, setKept] = useState<Set<string>>(new Set());

  if (favorites.length === 0) return null;

  const suggestions = favorites.filter(
    (favorite) => !kept.has(favorite.experience._id),
  );
  if (suggestions.length === 0) return null;

  async function keep(favorite: Favorite) {
    if (deviceToken === undefined) return;
    setBusy(favorite.favoriteId);
    try {
      await add({
        deviceToken,
        authorName: getPlayerName() || undefined,
        title: favorite.experience.title,
        experienceId: favorite.experience._id,
      });
      setKept((prev) => new Set(prev).add(favorite.experience._id));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="eyebrow mb-3 flex items-center gap-1.5">
        <Star className="size-3.5" />
        Depuis vos favoris
      </p>
      <div className="flex flex-col gap-2">
        {suggestions.slice(0, 3).map((favorite) => (
          <div
            key={favorite.favoriteId}
            className="flex items-center gap-3"
          >
            <EmojiTile tone="coral" size="sm">
              {favorite.category?.emoji ?? "💞"}
            </EmojiTile>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {favorite.experience.title}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="journal-favorite-keep"
              disabled={disabled || busy === favorite.favoriteId}
              onClick={() => keep(favorite)}
            >
              {t("journal.keep")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function JournalCard({ item }: { item: JournalItem }) {
  const { t, locale } = useT();
  const update = useMutation(api.journal.update);
  const remove = useMutation(api.journal.remove);
  const deviceToken = useDeviceToken();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onRemove() {
    if (deviceToken === undefined) return;
    setBusy(true);
    try {
      await remove({ deviceToken, entryId: item.id });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      data-testid="journal-card"
      data-kind={item.kind}
      className="flex flex-col gap-3 overflow-hidden p-0"
    >
      {item.mediaUrl && !editing && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          data-testid="journal-media"
          src={item.mediaUrl}
          alt={t("journal.mediaAlt", { title: item.title })}
          className="h-44 w-full object-cover"
        />
      )}

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <EmojiTile tone={item.kind === "moment" ? "lavender" : "coral"} size="sm">
            {item.kind === "moment" ? <Sparkles className="size-4" /> : <NotebookPen className="size-4" />}
          </EmojiTile>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground">
              {shortDate(item.occurredAt, locale)}
              {item.authorName
                ? ` · ${item.mine ? t("journal.mine") : item.authorName}`
                : ""}
            </p>
          </div>
          <Pill tone={item.source === "parcours" ? "lavender" : "neutral"} className="shrink-0">
            {t(SOURCE_KEY[item.source])}
          </Pill>
        </div>

        {item.note && (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {item.note}
          </p>
        )}

        {editing ? (
          <JournalEdit
            item={item}
            onCancel={() => setEditing(false)}
            onSave={async (draft) => {
              if (deviceToken === undefined) return;
              await update({ deviceToken, entryId: item.id, ...draft });
              setEditing(false);
            }}
          />
        ) : (
          item.canEdit && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                data-testid="journal-edit"
                onClick={() => setEditing(true)}
                className="gap-1.5"
              >
                <Pencil className="size-3.5" />
                Modifier
              </Button>

              {confirming ? (
                <>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    data-testid="journal-remove-confirm"
                    disabled={busy}
                    onClick={onRemove}
                  >
                    {t("journal.confirm")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirming(false)}
                  >
                    {t("journal.cancel")}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-testid="journal-remove"
                  onClick={() => setConfirming(true)}
                  className="gap-1.5 text-muted-foreground"
                >
                  <Trash2 className="size-3.5" />
                  {t("journal.remove")}
                </Button>
              )}
            </div>
          )
        )}
      </div>
    </Card>
  );
}

/** Édition en ligne d'une note existante (titre, texte, photo). */
function JournalEdit({
  item,
  onSave,
  onCancel,
}: {
  item: JournalItem;
  onSave: (draft: {
    title: string;
    note: string;
    mediaId?: Id<"_storage">;
    clearMedia?: boolean;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useT();
  return (
    <JournalComposer
      initial={{ title: item.title, note: item.note ?? "", hasMedia: item.hasMedia }}
      submitLabel={t("common.save")}
      onCancel={onCancel}
      onSubmit={onSave}
    />
  );
}

/**
 * Formulaire de souvenir (création ou édition) : titre, texte, photo. La
 * photo est envoyée via le stockage Convex puis référencée par son
 * identifiant — le serveur en revérifie le type et le poids.
 */
function JournalComposer({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: { title: string; note: string; hasMedia: boolean };
  submitLabel: string;
  onSubmit: (draft: {
    title: string;
    note: string;
    mediaId?: Id<"_storage">;
    clearMedia?: boolean;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const generateUploadUrl = useMutation(api.journal.generateUploadUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [media, setMedia] = useState<{ id: Id<"_storage">; preview: string } | null>(
    null,
  );
  const [removedMedia, setRemovedMedia] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { t } = useT();
  const [error, setError] = useState<string | null>(null);

  async function pick(file: File | null) {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(t("journal.errorImages"));
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setError(t("journal.errorTooBig"));
      return;
    }
    setUploading(true);
    try {
      const url = await generateUploadUrl();
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!response.ok) throw new Error("upload");
      const payload = (await response.json()) as { storageId?: string };
      if (!payload.storageId) throw new Error("upload");
      setMedia({ id: payload.storageId as Id<"_storage">, preview: URL.createObjectURL(file) });
      setRemovedMedia(false);
    } catch {
      setError(t("journal.errorUpload"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError(t("journal.errorTitle"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        note: note.trim(),
        mediaId: media?.id,
        clearMedia: removedMedia && !media,
      });
    } catch {
      setError(t("journal.errorSave"));
      setSaving(false);
    }
  }

  const hasExistingPhoto = Boolean(initial?.hasMedia) && !removedMedia;

  return (
    <form
      data-testid="journal-form"
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-xl border border-ivory-200/80 bg-card p-4"
    >
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">{t("journal.titleLabel")}</span>
        <input
          data-testid="journal-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          placeholder={t("journal.titlePlaceholder")}
          className={cn(INPUT_CLASS, "h-11")}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">
          {t("journal.wordLabel")}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            {t("journal.optional")}
          </span>
        </span>
        <textarea
          data-testid="journal-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={2000}
          rows={3}
          placeholder={t("journal.notePlaceholder")}
          className={cn(INPUT_CLASS, "resize-none py-2.5")}
        />
      </label>

      <div className="flex flex-col gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          data-testid="journal-photo"
          className="hidden"
          onChange={(event) => pick(event.target.files?.[0] ?? null)}
        />

        {media ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={media.preview}
              alt="Aperçu du souvenir"
              className="size-16 rounded-xl object-cover"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMedia(null)}
              className="gap-1.5 text-muted-foreground"
            >
              <X className="size-3.5" />
              {t("journal.remove")}
            </Button>
          </div>
        ) : hasExistingPhoto ? (
          <div className="flex items-center gap-3">
            <span className="flex size-16 items-center justify-center rounded-xl bg-white/[0.05] text-lavender-300 ring-1 ring-inset ring-white/[0.08]">
              <Camera className="size-5" />
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-testid="journal-photo-remove"
              onClick={() => setRemovedMedia(true)}
              className="gap-1.5 text-muted-foreground"
            >
              <X className="size-3.5" />
              {t("journal.removePhoto")}
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="press flex items-center gap-2 self-start rounded-xl border border-dashed border-ivory-300 px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:border-lavender-300 disabled:opacity-60"
          >
            <Camera className="size-4" />
            {uploading ? t("journal.uploading") : t("journal.addPhoto")}
          </button>
        )}
      </div>

      {error && (
        <p data-testid="journal-error" className="text-xs text-coral-600">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          size="sm"
          data-testid="journal-submit"
          disabled={saving || uploading}
          className="gap-1.5"
        >
          <Check className="size-4" />
          {submitLabel}
        </Button>
        <button
          type="button"
          data-testid="journal-cancel"
          onClick={onCancel}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          {t("journal.cancel")}
        </button>
      </div>
    </form>
  );
}
