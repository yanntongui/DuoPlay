"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { CalendarHeart, Check, Clock, Plus, Trash2, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmojiTile, Pill, SectionTitle } from "@/components/ui/surface";
import { useT } from "@/lib/i18n";
import type { MessageKey } from "@/lib/i18n/messages";
import { getPlayerName } from "@/lib/game/storage";
import { useDeviceToken } from "@/lib/game/use-device";
import { cn } from "@/lib/utils";

/**
 * Calendrier des moments à deux (§4) — section partagée de « Notre espace ».
 * On y propose un rendez-vous, une activité, un anniversaire ou une surprise ;
 * le partenaire relié le voit aussitôt et les deux peuvent le modifier.
 */

type Agenda = FunctionReturnType<typeof api.events.agenda>;
type EventItem = NonNullable<Agenda["next"]>;

const WAT_OFFSET_MS = 60 * 60 * 1000;
const KINDS: { value: EventItem["kind"]; labelKey: MessageKey; emoji: string }[] = [
  { value: "rendez-vous", labelKey: "calendar.kindDate", emoji: "🍷" },
  { value: "anniversaire", labelKey: "calendar.kindBirthday", emoji: "🎂" },
  { value: "activite", labelKey: "calendar.kindActivity", emoji: "✨" },
  { value: "surprise", labelKey: "calendar.kindSurprise", emoji: "🎁" },
];

const INPUT_CLASS =
  "w-full rounded-xl border border-ivory-300 bg-white/[0.04] px-3.5 text-base outline-none transition-shadow focus-visible:border-lavender-400 focus-visible:ring-4 focus-visible:ring-lavender-200/60";

/** Jour local (WAT) au format `YYYY-MM-DD`. */
function todayKey() {
  return new Date(Date.now() + WAT_OFFSET_MS).toISOString().slice(0, 10);
}

function StatusPill({ status }: { status: EventItem["status"] }) {
  const { t } = useT();
  if (status === "fait")
    return <Pill tone="lavender">{t("calendar.statusDone")}</Pill>;
  if (status === "annule")
    return <Pill tone="neutral">{t("calendar.statusCancelled")}</Pill>;
  return <Pill tone="primary">{t("calendar.statusPlanned")}</Pill>;
}

export function Calendar() {
  const { t } = useT();
  const deviceToken = useDeviceToken();
  const agenda = useQuery(
    api.events.agenda,
    deviceToken !== undefined ? { deviceToken } : "skip",
  );
  const [planning, setPlanning] = useState(false);

  if (deviceToken === undefined || agenda === undefined) {
    return <div className="skel h-40 rounded-xl border border-ivory-200/70" />;
  }

  const empty = agenda.counts.total === 0;

  return (
    <section data-testid="calendar" data-loaded="true">
      <SectionTitle
        eyebrow="À deux, bientôt"
        title="Calendrier des moments"
        action={
          agenda.counts.upcoming > 0 ? (
            <Pill tone="neutral" data-testid="calendar-count">
              {agenda.counts.upcoming}
            </Pill>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3">
        {planning ? (
          <EventForm onClose={() => setPlanning(false)} />
        ) : (
          <button
            type="button"
            data-testid="event-add"
            onClick={() => setPlanning(true)}
            className="press flex items-center gap-3 rounded-xl border border-dashed border-ivory-300 bg-white/[0.02] p-4 text-left transition-colors hover:border-lavender-300"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.05] text-lavender-300 ring-1 ring-inset ring-white/[0.08]">
              <Plus className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-medium">
                Planifier un moment
              </span>
              <span className="block text-xs text-muted-foreground">
                Un rendez-vous, un anniversaire, une surprise.
              </span>
            </span>
          </button>
        )}

        {empty && !planning ? (
          <Card
            data-testid="calendar-empty"
            tone="ivory"
            className="flex flex-col items-center gap-2 p-6 text-center"
          >
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white/[0.08] text-lavender-700 ring-1 ring-inset ring-white/[0.10]">
              <CalendarHeart className="size-5" />
            </div>
            <p className="font-medium">{t("calendar.emptyTitle")}</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {t("calendar.emptyBody")}
            </p>
          </Card>
        ) : (
          <>
            {agenda.next && (
              <EventCard event={agenda.next} variant="next" />
            )}
            {agenda.upcoming.map((event) => (
              <EventCard key={event.id} event={event} variant="row" />
            ))}
          </>
        )}

        {agenda.past.length > 0 && (
          <div className="mt-1 flex flex-col gap-2">
            <p className="eyebrow">Moments passés</p>
            {agenda.past.map((event) => (
              <EventCard key={event.id} event={event} variant="past" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EventCard({
  event,
  variant,
}: {
  event: EventItem;
  variant: "next" | "row" | "past";
}) {
  const { t } = useT();
  const setStatus = useMutation(api.events.setStatus);
  const remove = useMutation(api.events.remove);
  const deviceToken = useDeviceToken();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function mutate(run: (token: string) => Promise<unknown>) {
    if (deviceToken === undefined) return;
    setBusy(true);
    try {
      await run(deviceToken);
    } finally {
      setBusy(false);
    }
  }

  const when = (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Clock className="size-3.5" />
      {event.relative || event.dayKey}
      {event.timeLabel ? ` · ${event.timeLabel}` : ""}
    </span>
  );

  if (variant === "past") {
    return (
      <Card
        data-testid="event-past"
        className="flex flex-col gap-2 p-4"
      >
        <div className="flex items-start gap-3">
          <EmojiTile tone="graphite" size="sm">
            {event.emoji}
          </EmojiTile>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium line-through decoration-ivory-300">
              {event.title}
            </p>
            {when}
          </div>
          <StatusPill status={event.status} />
        </div>

        {confirming ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              data-testid="event-remove-confirm"
              disabled={busy}
              onClick={() =>
                mutate((token) =>
                  remove({ deviceToken: token, eventId: event.id }),
                )
              }
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
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-testid="event-remove"
            onClick={() => setConfirming(true)}
            className="gap-1.5 self-start text-muted-foreground"
          >
            <Trash2 className="size-3.5" />
            {t("journal.remove")}
          </Button>
        )}
      </Card>
    );
  }

  const highlight = variant === "next";

  return (
    <Card
      data-testid={highlight ? "event-next" : "event-row"}
      tone={highlight ? "lavender" : "default"}
      className="flex flex-col gap-3 p-4"
    >
      <div className="flex items-start gap-3">
        <EmojiTile tone={highlight ? "lavender" : "graphite"} size="sm">
          {event.emoji}
        </EmojiTile>
        <div className="min-w-0 flex-1">
          {highlight && (
            <p className="eyebrow mb-0.5">Prochain moment</p>
          )}
          <p className="truncate font-medium">{event.title}</p>
          {when}
        </div>
        <Pill tone="neutral" className="shrink-0">
          {event.kindLabel}
        </Pill>
      </div>

      {event.note && (
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {event.note}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          data-testid="event-done"
          disabled={busy}
          onClick={() =>
            mutate((token) =>
              setStatus({ deviceToken: token, eventId: event.id, status: "fait" }),
            )
          }
          className="gap-1.5"
        >
          <Check className="size-3.5" />
          {t("calendar.markDone")}
        </Button>

        {confirming ? (
          <>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              data-testid="event-remove-confirm"
              disabled={busy}
              onClick={() =>
                mutate((token) =>
                  remove({ deviceToken: token, eventId: event.id }),
                )
              }
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
            data-testid="event-remove"
            onClick={() => setConfirming(true)}
            className="gap-1.5 text-muted-foreground"
          >
            <Trash2 className="size-3.5" />
            {t("journal.remove")}
          </Button>
        )}
      </div>
    </Card>
  );
}

function EventForm({ onClose }: { onClose: () => void }) {
  const { t } = useT();
  const create = useMutation(api.events.create);
  const deviceToken = useDeviceToken();

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<EventItem["kind"]>("rendez-vous");
  const [day, setDay] = useState(todayKey());
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (deviceToken === undefined) return;
    if (!title.trim()) {
      setError(t("calendar.errorName"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await create({
        deviceToken,
        authorName: getPlayerName() || undefined,
        title: title.trim(),
        kind,
        day,
        time: time || undefined,
        note: note.trim() || undefined,
      });
      onClose();
    } catch {
      setError(t("calendar.errorSave"));
      setSaving(false);
    }
  }

  return (
    <form
      data-testid="event-form"
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-xl border border-ivory-200/80 bg-card p-4"
    >
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">{t("calendar.whatLabel")}</span>
        <input
          data-testid="event-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={90}
          placeholder={t("calendar.titlePlaceholder")}
          className={cn(INPUT_CLASS, "h-11")}
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">
          {t("calendar.kindLabel")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {KINDS.map((item) => (
            <button
              key={item.value}
              type="button"
              data-testid={`event-kind-${item.value}`}
              aria-pressed={kind === item.value}
              onClick={() => setKind(item.value)}
              className={cn(
                "press inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors",
                kind === item.value
                  ? "border-lavender-400 bg-lavender-100 text-lavender-700"
                  : "border-ivory-300 text-muted-foreground hover:border-lavender-300",
              )}
            >
              <span aria-hidden="true">{item.emoji}</span>
              {t(item.labelKey)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="font-medium">{t("calendar.whenLabel")}</span>
          <input
            type="date"
            data-testid="event-day"
            value={day}
            min={todayKey()}
            onChange={(event) => setDay(event.target.value)}
            className={cn(INPUT_CLASS, "h-11")}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="font-medium">
            {t("calendar.timeLabel")}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              {t("journal.optional")}
            </span>
          </span>
          <input
            type="time"
            data-testid="event-time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className={cn(INPUT_CLASS, "h-11")}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">
          {t("calendar.wordLabel")}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            {t("journal.optional")}
          </span>
        </span>
        <textarea
          data-testid="event-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={500}
          rows={2}
          placeholder={t("calendar.notePlaceholder")}
          className={cn(INPUT_CLASS, "resize-none py-2.5")}
        />
      </label>

      {error && (
        <p data-testid="event-error" className="text-xs text-coral-600">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          size="sm"
          data-testid="event-submit"
          disabled={saving}
          className="gap-1.5"
        >
          <Check className="size-4" />
          {t("calendar.submit")}
        </Button>
        <button
          type="button"
          data-testid="event-cancel"
          onClick={onClose}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <X className="size-3.5" />
          {t("journal.cancel")}
        </button>
      </div>
    </form>
  );
}
