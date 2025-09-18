"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MEDIA_FILTERS } from "@/lib/constants";
import type { EventCategory, MediaItem as MediaItemType } from "@/types";
import { useMediaFeed } from "@/lib/hooks/useMediaFeed";
import { MediaItem } from "@/components/feed/MediaItem";
import { StoriesBar } from "@/components/feed/StoriesBar";
import { FilterPills } from "@/components/mosque/FilterPills";

export function MediaFeed() {
  const [category, setCategory] = useState<EventCategory | "all">("all");
  const { mediaItems, hasMore, loadMore, likeMedia, isLoading } = useMediaFeed({ category });
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [attemptedLoadMore, setAttemptedLoadMore] = useState(false);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setAttemptedLoadMore(true);
        void loadMore();
      }
    }, { threshold: 0.6 });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  const combinedItems = useMemo<MediaItemType[]>(() => mediaItems, [mediaItems]);

  return (
    <div className="flex h-screen flex-col bg-black text-white pb-[env(safe-area-inset-bottom)]">
      <div className="px-4 pt-4 md:px-6 md:pt-8">
        <h1 className="text-2xl font-semibold md:text-3xl">PAU Media Moments</h1>
        <p className="mt-2 text-xs text-white/70 md:text-sm">
          Swipe through reflections from recent programmes, student initiatives, and joyful gatherings.
        </p>
        <div className="mt-4 md:mt-6">
          <StoriesBar />
        </div>
        <div className="mt-3 md:mt-4">
          <FilterPills filters={MEDIA_FILTERS} active={category} onChange={setCategory} />
        </div>
      </div>

      <div className="relative mt-4 flex-1 overflow-y-auto snap-y snap-mandatory pb-24 [padding-bottom:env(safe-area-inset-bottom)]">
        <div className="flex flex-col">
          {isLoading && combinedItems.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-white/70">Loading media…</div>
          ) : combinedItems.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-white/70">No media found for this category.</div>
          ) : (
            <>
              {combinedItems.map((item) => (
                <MediaItem key={item.id} item={item} onLike={likeMedia} />
              ))}
              <div ref={sentinelRef} className="h-24" />
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
