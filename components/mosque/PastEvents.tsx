"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { MEDIA_FILTERS } from "@/lib/constants";
import type { EventCategory, MediaItem as MediaItemType } from "@/types";
import { FilterPills } from "@/components/mosque/FilterPills";
import { AnimatedCard } from "@/components/mosque/AnimatedCard";
import { Button } from "@/components/ui/button";
import { useMediaFeed } from "@/lib/hooks/useMediaFeed";
import { MediaItem } from "@/components/feed/MediaItem";


export function CombinedFeedAndHighlights() {
  const [activeCategory, setActiveCategory] = useState<EventCategory | "all">("all");
  const { mediaItems, hasMore, loadMore, likeMedia, isLoading } = useMediaFeed({ category: activeCategory });
  
  // Show only 4 items for the highlights section
  const highlightsItems = useMemo(() => mediaItems.slice(0, 4), [mediaItems]);
  
  // Show remaining items for the feed
  const feedItems = useMemo(() => mediaItems.slice(4), [mediaItems]);

  return (
    <section id="past-events" className="bg-slate-50/30 pt-16 pb-12 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-4 sm:gap-5 sm:flex-row sm:items-end sm:justify-between md:gap-6">
          <div className="space-y-3 md:space-y-4">
            <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand-secondary)]">Past highlights</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--brand-primary)]">
              Moments that shaped our community
            </h2>
            <p className="max-w-2xl text-sm md:text-base text-slate-600">
              Relive powerful gatherings filled with dua, learning, and service. Each event strengthens the bonds of our Ummah on
              campus.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <FilterPills filters={MEDIA_FILTERS} active={activeCategory} onChange={setActiveCategory} />
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:gap-8 lg:grid-cols-2 md:mt-12">
          {/* Feed Section - Left Side */}
          <div className="order-2 lg:order-1">
            <div className="mb-4 lg:mb-6">
              <h3 className="text-lg lg:text-xl font-semibold text-[var(--brand-primary)] mb-2">Live Feed</h3>
              <p className="text-xs lg:text-sm text-slate-600">Browse through our latest moments and memories</p>
            </div>
            
            <div className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[850px] overflow-y-auto snap-y snap-mandatory rounded-xl lg:rounded-2xl border border-slate-200 bg-black shadow-sm">
              {isLoading && feedItems.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent mx-auto mb-2"></div>
                    <p className="text-sm text-white/70">Loading feed...</p>
                  </div>
                </div>
              ) : feedItems.length === 0 ? (
                <div className="flex h-full items-center justify-center text-white/70">
                  <p>No additional content found for this category.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {feedItems.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[850px] snap-start snap-always flex-shrink-0">
                      <MediaItem item={item} onLike={likeMedia} priority={idx < 2} />
                    </div>
                  ))}
                  {hasMore && (
                    <div className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[850px] snap-start snap-always flex-shrink-0 flex items-center justify-center bg-gradient-to-b from-black to-slate-900">
                      <Button 
                        variant="outline" 
                        onClick={() => loadMore()}
                        className="text-sm border-white/20 text-white hover:bg-white/10"
                      >
                        Load More
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Highlights Section - Right Side */}
          <div className="order-1 lg:order-2">
            <div className="mb-4 lg:mb-6">
              <h3 className="text-lg lg:text-xl font-semibold text-[var(--brand-primary)] mb-2">Featured Highlights</h3>
              <p className="text-xs lg:text-sm text-slate-600">Our most memorable moments</p>
            </div>
            
            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index: number) => (
                    <AnimatedCard key={index} delay={index * 120} loading>
                      <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-100" />
                    </AnimatedCard>
                  ))
                : highlightsItems.map((item: MediaItemType, index: number) => (
                    <AnimatedCard key={item.id ?? index} delay={index * 120} loading={false}>
                      <div className="flex h-full flex-col">
                        <div className="relative h-40 sm:h-48 w-full overflow-hidden rounded-xl lg:rounded-2xl">
                          <Image
                            src={item.thumbnail || item.url}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-700 hover:scale-105"
                            sizes="(min-width: 1280px) 50vw, (min-width: 1024px) 100vw, (min-width: 640px) 50vw, 100vw"
                          />
                        </div>
                        <div className="mt-3 lg:mt-4 flex flex-1 flex-col">
                          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--brand-secondary)]">
                            {item.eventType}
                          </p>
                          <h3 className="mt-1 lg:mt-2 text-base lg:text-lg font-semibold text-[var(--brand-primary)]">{item.title}</h3>
                          <p className="mt-1 lg:mt-2 text-xs lg:text-sm text-slate-600 line-clamp-2">{item.description}</p>
                          <div className="mt-auto flex items-center justify-between pt-3 lg:pt-4 text-xs lg:text-sm text-slate-500">
                            <span>{new Date(item.date).toLocaleDateString()}</span>
                            <span>{item.type.toUpperCase()}</span>
                          </div>
                          {item.url ? (
                            <Button 
                              variant="link" 
                              className="px-0 text-[var(--brand-secondary)]"
                              onClick={() => {
                                // Open media in new tab with proper headers
                                const newWindow = window.open('', '_blank');
                                if (newWindow) {
                                  newWindow.document.write(`
                                    <html>
                                      <head>
                                        <title>${item.title}</title>
                                        <style>
                                          body { margin: 0; padding: 20px; background: #000; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                                          img, video { max-width: 100%; max-height: 100vh; object-fit: contain; }
                                        </style>
                                      </head>
                                      <body>
                                        ${item.type === 'video' 
                                          ? `<video controls autoplay><source src="${item.url}" type="video/mp4">Your browser does not support the video tag.</video>`
                                          : `<img src="${item.url}" alt="${item.title}" />`
                                        }
                                      </body>
                                    </html>
                                  `);
                                  newWindow.document.close();
                                }
                              }}
                            >
                              View media
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
