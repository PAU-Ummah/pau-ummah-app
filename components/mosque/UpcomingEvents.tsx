"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MEDIA_FILTERS } from "@/lib/constants";
import type { EventCategory, MediaItem } from "@/types";
import { FilterPills } from "@/components/mosque/FilterPills";
import { AnimatedCard } from "@/components/mosque/AnimatedCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaFeed } from "@/lib/hooks/useMediaFeed";

export function UpcomingEvents() {
  const [activeCategory, setActiveCategory] = useState<EventCategory | "all">("all");
  const { mediaItems, isLoading } = useMediaFeed({ category: activeCategory });

  const itemsToShow = useMemo(() => mediaItems.slice(0, 2), [mediaItems]);

  return (
    <section id="upcoming-events" className="bg-slate-50 py-16 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between md:gap-6">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand-secondary)]">
              Upcoming events
            </p>
            <h2 className="text-3xl font-bold text-[var(--brand-primary)] sm:text-4xl">
              Join the next uplifting gathering
            </h2>
          </div>
          <FilterPills filters={MEDIA_FILTERS} active={activeCategory} onChange={setActiveCategory} />
        </div>

        <div className="mt-10 grid gap-5 md:mt-12 md:grid-cols-2 md:gap-6">
          {isLoading
            ? Array.from({ length: 2 }).map((_, index: number) => (
                <AnimatedCard key={index} delay={index * 140} loading>
                  <Skeleton className="h-64 w-full rounded-3xl" />
                </AnimatedCard>
              ))
            : itemsToShow.map((item: MediaItem, index: number) => (
                <AnimatedCard key={item.id ?? index} delay={index * 140} loading={false}>
                  <div className="flex h-full flex-col gap-4 sm:flex-row">
                    <div className="relative h-44 w-full overflow-hidden rounded-3xl sm:h-auto sm:w-1/2">
                      <Image
                        src={item.thumbnail || item.url}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                        sizes="(min-width: 1024px) 50vw, 100vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--brand-secondary)]">
                          {item.eventType}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-[var(--brand-primary)]">{item.title}</h3>
                        <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      {item.url ? (
                        <Button variant="link" className="px-0 text-[var(--brand-secondary)]" asChild>
                          <Link href={item.url} target="_blank" rel="noreferrer">
                            View media
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </AnimatedCard>
              ))}
        </div>
      </div>
    </section>
  );
}
