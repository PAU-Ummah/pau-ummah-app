"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { MEDIA_FILTERS } from "@/lib/constants";
import type { EventCategory, MediaItem as MediaItemType } from "@/types";
import { useMediaFeed } from "@/lib/hooks/useMediaFeed";
import { MediaItem } from "@/components/feed/MediaItem";
import { FilterPills } from "@/components/mosque/FilterPills";
import { useMobileOptimization } from "@/lib/hooks/useMobileOptimization";
import { PerformanceMonitor } from "@/components/feed/PerformanceMonitor";
import Link from "next/link";
import Image from "next/image";

export function MediaFeed() {
  const [category, setCategory] = useState<EventCategory | "all">("all");
  const { mediaItems, hasMore, loadMore, likeMedia, isLoading } = useMediaFeed({ category });
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [attemptedLoadMore, setAttemptedLoadMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Use mobile optimization for better performance
  const { isMobile, connectionType } = useMobileOptimization();

  useEffect(() => {
    if (!sentinelRef.current) return;
    
    // Adjust intersection observer settings based on device capabilities
    const rootMargin = isMobile 
      ? (connectionType === 'slow' ? "100px 0px" : "150px 0px")
      : "200px 0px";
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setAttemptedLoadMore(true);
          void loadMore();
        }
      },
      {
        threshold: 0.25,
        rootMargin,
      },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore, isMobile, connectionType]);

  const combinedItems = useMemo<MediaItemType[]>(() => mediaItems, [mediaItems]);

  return (
    <div className="flex h-screen flex-col bg-black text-white pb-[env(safe-area-inset-bottom)]">
      <PerformanceMonitor />
      <div className="px-4 pt-4 md:px-6 md:pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
          <Link href="/" aria-label="Go to Home" className="shrink-0 hover:opacity-90 active:opacity-80">
              <Image
                src="/logo.jpg"
                alt="PAU Muslim Ummah Logo"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover md:h-10 md:w-10"
                priority={false}
              />
            </Link>
            <h1 className="text-2xl font-semibold md:text-3xl">PAU Muslim Ummah Moments</h1>
          </div>
          {/* Mobile filter trigger */}
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="md:hidden inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs text-white backdrop-blur hover:bg-white/10"
            aria-label="Open filters"
          >
            <Menu className="h-4 w-4" /> Filters
          </button>
        </div>
        <p className="mt-2 text-xs text-white/70 md:text-sm">
          Swipe through reflections from recent programmes, student initiatives, and joyful gatherings.
        </p>
        {/* Desktop/Tablet: regular filter pills */}
        <div className="mt-3 hidden md:mt-4 md:block">
          <FilterPills filters={MEDIA_FILTERS} active={category} onChange={setCategory} />
        </div>
      </div>

      {/* Mobile Filters Bottom Sheet */}
      {showFilters ? (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
            aria-hidden
          />
          <div className="fixed inset-x-0 top-0 z-50 rounded-b-2xl border border-white/10 bg-zinc-900/95 px-4 pb-4 pt-[calc(env(safe-area-inset-top)+12px)] shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-white/90">Filters</span>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10"
                aria-label="Close filters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <FilterPills
              filters={MEDIA_FILTERS}
              active={category}
              onChange={(val) => {
                setCategory(val);
                setShowFilters(false);
              }}
              variant="compact"
              className=""
            />
          </div>
        </div>
      ) : null}

      <div className="relative mt-4 flex-1 overflow-y-auto touch-pan-y snap-y snap-mandatory snap-always pb-24 [padding-bottom:env(safe-area-inset-bottom)]">
        <div className="flex flex-col">
          {isLoading && combinedItems.length === 0 ? (
            <div className="flex h-[78svh] items-center justify-center">
              <div className="relative h-full w-full max-w-[420px] overflow-hidden rounded-[24px] md:h-[85vh] md:rounded-[32px]">
                <div className="absolute inset-0 animate-pulse bg-white/5" />
              </div>
            </div>
          ) : combinedItems.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-white/70">No media found for this category.</div>
          ) : (
            <>
              {combinedItems.map((item, idx) => (
                <MediaItem 
                  key={`${item.id}-${idx}`} 
                  item={item} 
                  onLike={likeMedia} 
                  priority={idx < (isMobile ? 2 : 1)} // Load more items on mobile for smoother scrolling
                />
              ))}
              <div ref={sentinelRef} className="h-24 snap-none" />
            </>
          )}
        </div>
        {!hasMore && !isLoading && attemptedLoadMore ? (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-6 py-2 text-xs uppercase tracking-[0.3em] text-white/60 md:bottom-10">
            You have reached the end
          </div>
        ) : null}
      </div>
    </div>
  );
}
