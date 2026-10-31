"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  ArrowDown,
  ArrowUp,
  Check,
  FolderPlus,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmojiTile } from "@/components/ui/surface";
import { FavoriteButton } from "@/components/app/favorite-button";
import { modeTitle } from "@/lib/content";
import { useT } from "@/lib/i18n";
import { useDeviceToken } from "@/lib/game/use-device";
import { cn } from "@/lib/utils";

/**
 * « Mes favoris » (§4, §6.3) : les expériences gardées, triables en
 * **collections nommées**. Rattaché à l'appareil ; état vide explicite.
 */

type Favorite = FunctionReturnType<typeof api.favorites.list>[number];

const FILTER_ALL = "all";
const FILTER_NONE = "none";

const SELECT_CLASS =
  "rounded-lg border border-ivory-300 bg-white/[0.04] px-2.5 py-1.5 text-xs outline-none transition-shadow focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60";

export function MesFavoris() {
  const { t, locale } = useT();
  const deviceToken = useDeviceToken();
  const ready = deviceToken !== undefined;
  const favorites = useQuery(
    api.favorites.list,
    ready ? { deviceToken } : "skip",
  );
  const collections = useQuery(
    api.collections.list,
    ready ? { deviceToken } : "skip",
  );
  const create = useMutation(api.collections.create);
  const rename = useMutation(api.collections.rename);
  const reorderCollections = useMutation(api.collections.reorder);
  const removeCollection = useMutation(api.collections.remove);
  const assign = useMutation(api.favorites.assign);
  const reorderFavorites = useMutation(api.favorites.reorder);

  const [filter, setFilter] = useState<string>(FILTER_ALL);
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!ready || favorites === undefined || collections === undefined) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="skel h-20 rounded-xl border border-ivory-200/70"
          />
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card tone="ivory" className="flex flex-col items-center gap-3 p-7 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.08] text-lavender-700 ring-1 ring-inset ring-white/[0.10]">
          <Star className="size-6" />
        </div>
        <h2 className="text-lg">{t("space.noFavorites")}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("favorites.emptyBody")}
        </p>
        <Link
          href="/explorer"
          className={cn(buttonVariants({ size: "lg" }), "mt-1 gap-2")}
        >
          <Plus className="size-4" />
          {t("space.exploreUniverses")}
        </Link>
      </Card>
    );
  }

  const collectionList = collections.collections;
  const valid = new Set<string>(collectionList.map((item) => item.id));
  const selected =
    filter !== FILTER_ALL && filter !== FILTER_NONE && valid.has(filter)
      ? collectionList.find((item) => item.id === filter) ?? null
      : null;

  const visible = favorites.filter((item) => {
    if (filter === FILTER_ALL) return true;
    const cid = item.collectionId ? String(item.collectionId) : null;
    if (filter === FILTER_NONE) return !cid || !valid.has(cid);
    return cid === filter;
  });

  const move = async (item: Favorite, direction: -1 | 1) => {
    if (!deviceToken) return;
    const index = visible.findIndex((row) => row.favoriteId === item.favoriteId);
    const neighbour = visible[index + direction];
    if (!neighbour) return;
    const full = favorites.map((row) => row.favoriteId);
    const a = full.indexOf(item.favoriteId);
    const b = full.indexOf(neighbour.favoriteId);
    [full[a], full[b]] = [full[b], full[a]];
    await reorderFavorites({ deviceToken, ids: full });
  };

  const moveCollection = async (direction: -1 | 1) => {
    if (!deviceToken || !selected) return;
    const ids = collectionList.map((item) => item.id);
    const index = ids.indexOf(selected.id);
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    await reorderCollections({ deviceToken, ids });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Barre de collections --------------------------------------- */}
      <div
        data-testid="collections-bar"
        className="flex flex-wrap items-center gap-2"
      >
        <FilterChip
          active={filter === FILTER_ALL}
          testid="collection-filter-all"
          onClick={() => setFilter(FILTER_ALL)}
          label={t("favorites.filterAll")}
          count={collections.total}
        />

        {collectionList.map((item) => (
          <FilterChip
            key={item.id}
            active={filter === item.id}
            testid="collection-filter"
            onClick={() => {
              setFilter(item.id);
              setRenaming(false);
              setConfirmingDelete(false);
            }}
            label={`${item.emoji} ${item.name}`}
            count={item.count}
          />
        ))}

        {collections.unfiled > 0 && collectionList.length > 0 && (
          <FilterChip
            active={filter === FILTER_NONE}
            testid="collection-filter-none"
            onClick={() => setFilter(FILTER_NONE)}
            label={t("favorites.filterNone")}
            count={collections.unfiled}
          />
        )}

        {creating ? (
          <form
            data-testid="collection-form"
            className="flex items-center gap-2"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!deviceToken || !draftName.trim()) return;
              const result = await create({
                deviceToken,
                name: draftName.trim(),
              });
              setDraftName("");
              setCreating(false);
              setFilter(String(result.id));
            }}
          >
            <input
              data-testid="collection-name"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              maxLength={40}
              placeholder={t("favorites.namePlaceholder")}
              className={cn(SELECT_CLASS, "h-9 w-44 px-3")}
            />
            <Button type="submit" size="sm" data-testid="collection-create">
              <Check className="size-4" />
            </Button>
          </form>
        ) : (
          <button
            type="button"
            data-testid="collection-add"
            onClick={() => setCreating(true)}
            className="press inline-flex items-center gap-1.5 rounded-full border border-dashed border-ivory-300 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-lavender-300"
          >
            <FolderPlus className="size-3.5" />
            {t("favorites.newCollection")}
          </button>
        )}
      </div>

      {/* Barre d'outils de la collection sélectionnée ---------------- */}
      {selected && (
        <div
          data-testid="collection-toolbar"
          className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
        >
          {renaming ? (
            <form
              className="flex items-center gap-2"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!deviceToken || !draftName.trim()) return;
                await rename({
                  deviceToken,
                  collectionId: selected.id,
                  name: draftName.trim(),
                });
                setDraftName("");
                setRenaming(false);
              }}
            >
              <input
                data-testid="collection-rename-input"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                maxLength={40}
                className={cn(SELECT_CLASS, "h-9 w-44 px-3")}
              />
              <Button
                type="submit"
                size="sm"
                data-testid="collection-rename-save"
              >
                <Check className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRenaming(false)}
              >
                {t("journal.cancel")}
              </Button>
            </form>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="collection-rename"
              onClick={() => {
                setDraftName(selected.name);
                setRenaming(true);
              }}
              className="gap-1.5"
            >
              <Pencil className="size-3.5" />
              {t("favorites.rename")}
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-testid="collection-move-up"
            aria-label={t("favorites.moveLeft")}
            disabled={collectionList[0]?.id === selected.id}
            onClick={() => moveCollection(-1)}
          >
            <ArrowUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-testid="collection-move-down"
            aria-label={t("favorites.moveRight")}
            disabled={collectionList[collectionList.length - 1]?.id === selected.id}
            onClick={() => moveCollection(1)}
          >
            <ArrowDown className="size-4" />
          </Button>

          {confirmingDelete ? (
            <>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                data-testid="collection-delete-confirm"
                onClick={async () => {
                  if (!deviceToken) return;
                  await removeCollection({
                    deviceToken,
                    collectionId: selected.id,
                  });
                  setFilter(FILTER_ALL);
                  setConfirmingDelete(false);
                }}
              >
                {t("favorites.deleteCollection")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingDelete(false)}
              >
                {t("journal.cancel")}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-testid="collection-delete"
              onClick={() => setConfirmingDelete(true)}
              className="gap-1.5 text-muted-foreground"
            >
              <Trash2 className="size-3.5" />
              {t("favorites.delete")}
            </Button>
          )}
        </div>
      )}

      {/* Liste des favoris ------------------------------------------- */}
      {visible.length === 0 ? (
        <Card
          data-testid="collection-empty"
          tone="ivory"
          className="flex flex-col items-center gap-2 p-6 text-center"
        >
          <p className="font-medium">{t("favorites.emptyCollection")}</p>
          <p className="text-sm text-muted-foreground">
            {t("favorites.emptyCollectionBody")}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((item, index) => (
            <Card
              key={item.favoriteId}
              data-testid="favorite-item"
              className="flex flex-col gap-3 p-4"
            >
              <div className="flex items-start gap-3">
                <EmojiTile tone="coral" size="sm">
                  {item.category?.emoji ?? "💞"}
                </EmojiTile>
                <div className="min-w-0 flex-1">
                  <p className="eyebrow truncate">
                    {item.category?.title ?? t("space.favoriteFallback")}
                  </p>
                  <p className="truncate font-medium">
                    {item.experience.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.experience.estimatedMinutes} min ·{" "}
                    {item.experience.modes
                      .map((mode) => modeTitle(mode, locale))
                      .join(", ")}
                  </p>
                </div>
                <FavoriteButton experienceId={item.experience._id} />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {t("favorites.collectionLabel")}
                  <select
                    data-testid="favorite-collection"
                    className={SELECT_CLASS}
                    value={item.collectionId ?? ""}
                    onChange={async (event) => {
                      if (!deviceToken) return;
                      const value = event.target.value;
                      const collection =
                        collectionList.find((row) => row.id === value) ?? null;
                      await assign({
                        deviceToken,
                        favoriteId: item.favoriteId,
                        collectionId: collection ? collection.id : null,
                      });
                    }}
                  >
                    <option value="">
                      {t("favorites.filterNone")}
                    </option>
                    {collectionList.map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.emoji} {row.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    data-testid="favorite-move-up"
                    aria-label={t("favorites.moveUp", {
                      title: item.experience.title,
                    })}
                    disabled={index === 0}
                    onClick={() => move(item, -1)}
                    className="size-9 p-0"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    data-testid="favorite-move-down"
                    aria-label={t("favorites.moveDown", {
                      title: item.experience.title,
                    })}
                    disabled={index === visible.length - 1}
                    onClick={() => move(item, 1)}
                    className="size-9 p-0"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                </div>

                <Link
                  href={`/nouvelle/${item.experience.slug}`}
                  className="press gradient-primary top-light ml-auto inline-flex h-11 shrink-0 items-center rounded-full px-4 text-[13px] font-medium text-white shadow-[var(--shadow-glow)] hover:brightness-[1.06]"
                >
                  {t("space.launch")}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  label,
  count,
  testid,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  testid: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-testid={testid}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "press inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
        active
          ? "border-lavender-400 bg-lavender-100 text-lavender-700"
          : "border-ivory-300 text-muted-foreground hover:border-lavender-300",
      )}
    >
      <span className="max-w-[10rem] truncate">{label}</span>
      <span className="rounded-full bg-black/10 px-1.5 text-[10px] font-medium">
        {count}
      </span>
    </button>
  );
}
