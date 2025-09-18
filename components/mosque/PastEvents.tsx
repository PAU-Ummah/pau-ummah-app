"use client";

import Image from "next/image";
import { AnimatedCard } from "@/components/mosque/AnimatedCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMemo } from "react";
import { useMediaFeed } from "@/lib/hooks/useMediaFeed";
import type { MediaItem } from "@/types";

export function PastEvents() {
  const { mediaItems, isLoading } = useMediaFeed({ category: "all" });
  const itemsToShow = useMemo(() => mediaItems.slice(0, 6), [mediaItems]);
  return (
    <section id="past-events" className="bg-white py-16 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="flex flex-col gap-4 text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand-secondary)]">Past highlights</p>
          <h2 className="text-3xl font-bold text-[var(--brand-primary)] sm:text-4xl">
            Moments that shaped our community
          </h2>
          <p className="max-w-2xl text-base text-slate-600">
            Relive powerful gatherings filled with dua, learning, and service. Each event strengthens the bonds of our Ummah on
            campus.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:mt-12 md:gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index: number) => (
                <AnimatedCard key={index} delay={index * 120} loading>
                  <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-100" />
                </AnimatedCard>
              ))
            : itemsToShow.map((item: MediaItem, index: number) => (
                <AnimatedCard key={item.id ?? index} delay={index * 120} loading={false}>
                  <div className="flex h-full flex-col">
                    <div className="relative h-48 w-full overflow-hidden rounded-2xl">
                      <Image
                        src={item.thumbnail || item.url}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                    <div className="mt-4 flex flex-1 flex-col">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--brand-secondary)]">
                        {item.eventType}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-[var(--brand-primary)]">{item.title}</h3>
                      <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                      <div className="mt-auto flex items-center justify-between pt-4 text-sm text-slate-500">
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                        <span>{item.type.toUpperCase()}</span>
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
