"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import {
  ArrowLeft,
  Compass,
  RefreshCw,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { AiBrief } from "@/convex/ai/content";
import {
  AiButton,
  AiCard,
  AiEmpty,
  AiNotice,
  AiSectionTitle,
  AiSkeleton,
} from "@/components/ai/ai-ui";

export function AiSearch({
  deviceToken,
  initialQuery,
  onBack,
  onCompose,
}: {
  deviceToken: string;
  initialQuery: string;
  onBack: () => void;
  onCompose: (preset?: Partial<AiBrief>) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(initialQuery);
  const result = useQuery(api.ai.search, {
    deviceToken,
    query: submitted,
  });

  const filters = result?.filters;
  const preset: Partial<AiBrief> = {
    durationMinutes: filters?.durationMinutes,
    mode: filters?.mode,
    level: filters?.level,
    exclusions: filters?.exclusions,
  };

  return (
    <div className="flex flex-col gap-5 pb-16">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] text-[#d9cbbf]/70 hover:text-[#f6efe7]"
        >
          <ArrowLeft className="size-4" />
          DuoPlay AI
        </button>
        <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[#d9a7c9]/65">
          <Compass className="size-3.5" />
          Recherche
        </span>
      </div>

      <div>
        <h1 className="font-display text-[2rem] leading-tight text-[#f6efe7]">
          Chercher en langage naturel
        </h1>
        <p className="mt-1 text-[13px] text-[#d9cbbf]/65">
          Dites-le comme vous le diriez à voix haute. Les filtres compris
          s’affichent, et restent modifiables.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && query.trim()) setSubmitted(query.trim());
          }}
          aria-label="Votre demande"
          className="ai-input"
          maxLength={300}
          placeholder="Ex. : trouve une expérience romantique de 10 minutes à distance."
        />
        <AiButton
          variant="primary"
          onClick={() => query.trim() && setSubmitted(query.trim())}
          disabled={!query.trim() || query.trim() === submitted}
          className="shrink-0"
        >
          <Search className="size-4" />
          Chercher
        </AiButton>
      </div>

      {result === undefined ? (
        <AiCard className="p-5">
          <AiSkeleton lines={4} />
          <p className="sr-only">Recherche en cours</p>
        </AiCard>
      ) : result.blocked ? (
        <AiNotice tone="safety" title="Je ne peux pas traiter cette recherche">
          <p>{result.message}</p>
          <p className="mt-2 opacity-90">{result.alternative}</p>
        </AiNotice>
      ) : (
        <>
          <AiCard className="p-4" soft>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d9a7c9]/70">
              Filtres compris
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {result.filters.understood.map((label: string) => (
                <span
                  key={label}
                  className="rounded-full border border-[#d9a7c9]/22 bg-[#d9a7c9]/8 px-2.5 py-1 text-[11px] text-[#e8d6e2]"
                >
                  {label}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-[#d9cbbf]/50">
              Une limite enregistrée dans vos préférences ne peut pas être
              retirée par la recherche.
            </p>
          </AiCard>

          {result.experiences.length === 0 &&
          result.journeys.length === 0 &&
          result.cards.length === 0 ? (
            <AiEmpty
              icon={<Compass className="size-6" />}
              title="Aucun résultat avec ces filtres"
            >
              Essayez une durée plus souple, ou retirez une exclusion. Vous
              pouvez aussi générer une session avec ces critères.
            </AiEmpty>
          ) : null}

          {result.experiences.length > 0 ? (
            <section>
              <AiSectionTitle
                eyebrow="Expériences"
                title={`${result.experiences.length} proposition${result.experiences.length > 1 ? "s" : ""}`}
              />
              <div className="grid gap-2.5">
                {result.experiences.map((item: any) => (
                  <AiCard key={item.slug} soft className="p-4">
                    <div className="flex items-start gap-3">
                      <span aria-hidden="true" className="text-xl">
                        {item.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="font-display text-lg leading-tight text-[#f6efe7]">
                            {item.title}
                          </p>
                          <span className="text-[11px] text-[#d9cbbf]/50">
                            {item.category} · {item.durationMinutes} min
                          </span>
                        </div>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-[#d9cbbf]/65">
                          {item.description}
                        </p>
                        <ul className="mt-2 space-y-1">
                          {item.reasons.map((reason: string) => (
                            <li
                              key={reason}
                              className="flex gap-1.5 text-[11.5px] leading-snug text-[#e8d6e2]/75"
                            >
                              <Sparkles className="mt-0.5 size-3 shrink-0 text-[#d9a7c9]" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 flex items-center gap-3">
                          {item.source === "catalogue" ? (
                            <Link
                              href={`/nouvelle/${item.slug}`}
                              className="text-[12px] font-medium text-[#f6efe7] underline-offset-4 hover:underline"
                            >
                              Voir l’expérience
                            </Link>
                          ) : null}
                          <button
                            type="button"
                            onClick={() =>
                              onCompose({
                                ...preset,
                                mood: item.mood,
                                durationMinutes: item.durationMinutes,
                                level: item.depth as AiBrief["level"],
                              })
                            }
                            className="text-[12px] font-medium text-[#f6efe7] underline-offset-4 hover:underline"
                          >
                            Créer une session
                          </button>
                        </div>
                      </div>
                    </div>
                  </AiCard>
                ))}
              </div>
            </section>
          ) : null}

          {result.journeys.length > 0 ? (
            <section>
              <AiSectionTitle eyebrow="Parcours" title="Sur plusieurs jours" />
              <div className="grid gap-2.5 sm:grid-cols-2">
                {result.journeys.map((journey) => (
                  <AiCard key={journey.slug} soft className="p-4">
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true">{journey.emoji}</span>
                      <span className="text-[11px] text-[#d9cbbf]/50">
                        {journey.lengthDays} jours
                      </span>
                    </div>
                    <p className="mt-1.5 font-display text-lg text-[#f6efe7]">
                      {journey.title}
                    </p>
                    <p className="mt-1 text-[12px] text-[#d9cbbf]/65">
                      {journey.tagline}
                    </p>
                    <p className="mt-2 text-[11px] text-[#e8d6e2]/70">
                      {journey.reason}
                    </p>
                    <Link
                      href={`/parcours/${journey.slug}`}
                      className="mt-3 inline-block text-[12px] font-medium text-[#f6efe7] underline-offset-4 hover:underline"
                    >
                      Voir le parcours
                    </Link>
                  </AiCard>
                ))}
              </div>
            </section>
          ) : null}

          {result.cards.length > 0 ? (
            <section>
              <AiSectionTitle eyebrow="Cartes" title="À piocher ensemble" />
              <div className="grid gap-2.5 sm:grid-cols-2">
                {result.cards.map((card) => (
                  <AiCard key={card.id} soft className="p-4">
                    <p className="text-[10.5px] uppercase tracking-[0.14em] text-[#d9a7c9]/60">
                      {card.experienceTitle}
                    </p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[#f6efe7]">
                      {card.prompt}
                    </p>
                    <p className="mt-2 text-[11px] text-[#d9cbbf]/50">
                      {card.reason}
                    </p>
                  </AiCard>
                ))}
              </div>
            </section>
          ) : null}

          <AiCard className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg text-[#f6efe7]">
                Aucune de ces idées ne vous convient ?
              </p>
              <p className="text-[12px] text-[#d9cbbf]/60">
                Générez une session inédite avec les mêmes filtres.
              </p>
            </div>
            <AiButton variant="primary" onClick={() => onCompose(preset)}>
              <Wand2 className="size-4" />
              Générer une session
            </AiButton>
          </AiCard>

          <button
            type="button"
            onClick={() => {
              setSubmitted(query.trim());
            }}
            className="inline-flex items-center gap-1.5 self-center text-[11.5px] text-[#d9cbbf]/45 hover:text-[#d9cbbf]/75"
          >
            <RefreshCw className="size-3" />
            Relancer la recherche
          </button>
        </>
      )}
    </div>
  );
}
