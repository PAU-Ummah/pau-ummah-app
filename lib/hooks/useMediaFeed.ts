"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import useSWRInfinite from "swr/infinite";
import type { MediaFeedResponse, MediaItem } from "@/types";
import { wait } from "@/lib/utils";

const PAGE_SIZE = 20;

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-cache",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch media feed");
  }

  return (await response.json()) as MediaFeedResponse;
};

interface UseMediaFeedOptions {
  category?: string;
}

export function useMediaFeed({ category }: UseMediaFeedOptions = {}) {
  const getKey = useCallback(
    (pageIndex: number, previousPageData: MediaFeedResponse | null) => {
      if (previousPageData && !previousPageData.nextPageToken) return null;

      const pageToken = previousPageData?.nextPageToken;
      const params = new URLSearchParams({
        limit: PAGE_SIZE.toString(),
      });

      if (pageToken) params.set("pageToken", pageToken);
      if (category && category !== "all") params.set("category", category);

      return `/api/media?${params.toString()}`;
    },
    [category],
  );

  const {
    data,
    error,
    isLoading,
    isValidating,
    size,
    setSize,
    mutate,
  } = useSWRInfinite<MediaFeedResponse>(getKey, fetcher, {
    dedupingInterval: 5 * 60 * 1000,
    revalidateOnFocus: false,
    revalidateIfStale: true,
    persistSize: true,
  });

  const mediaItems = useMemo<MediaItem[]>(
    () => data?.flatMap((page) => page.items) ?? [],
    [data],
  );

  const hasMore = Boolean(data?.[data.length - 1]?.nextPageToken);
  const prefetchedTokens = useRef<Set<string>>(new Set());

  useEffect(() => {
    prefetchedTokens.current.clear();
  }, [category]);

  const loadMore = useCallback(async () => {
    if (isLoading || isValidating || !hasMore) return;
    await setSize(size + 1);
  }, [hasMore, isLoading, isValidating, setSize, size]);

  const prefetchNext = useCallback(async () => {
    if (!hasMore) return;
    const lastPage = data?.[data.length - 1];
    if (!lastPage?.nextPageToken) return;
    if (prefetchedTokens.current.has(lastPage.nextPageToken)) return;

    const nextKey = getKey(size, lastPage);
    if (!nextKey) return;

    try {
      await mutate(async (current) => {
        if (!current) return current;
        const nextPage = await fetcher(nextKey);
        prefetchedTokens.current.add(lastPage.nextPageToken as string);
        return [...current, nextPage];
      }, { revalidate: false });
    } catch (prefetchError) {
      console.error("Prefetch failed", prefetchError);
    }
  }, [data, getKey, hasMore, mutate, size]);

  useEffect(() => {
    if (!hasMore) return;
    const timeout = setTimeout(() => {
      prefetchNext().catch(() => undefined);
    }, 1200);

    return () => clearTimeout(timeout);
  }, [hasMore, prefetchNext, size]);

  const optimisticUpdate = useCallback(
    async (id: string, update: (item: MediaItem) => MediaItem) => {
      await mutate(
        async (pages) => {
          if (!pages) return pages;
          return pages.map((page) => ({
            ...page,
            items: page.items.map((item) => (item.id === id ? update(item) : item)),
          }));
        },
        { revalidate: false, rollbackOnError: true },
      );
    },
    [mutate],
  );

  const likeMedia = useCallback(
    async (id: string) => {
      await optimisticUpdate(id, (item) => ({
        ...item,
        likes: item.likes + 1,
      }));
      await wait(400);
    },
    [optimisticUpdate],
  );

  return {
    mediaItems,
    isLoading,
    error,
    hasMore,
    loadMore,
    likeMedia,
    mutate,
    isValidating,
    size,
  };
}
