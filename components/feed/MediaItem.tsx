"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import { MediaItem as MediaItemType } from "@/types";
import { AdaptiveVideoPlayer } from "@/components/feed/AdaptiveVideoPlayer";
import { EngagementButton } from "@/components/feed/EngagementButton";
import { motion, AnimatePresence } from "framer-motion";
import { useIntersection } from "@/lib/hooks/useIntersection";

interface MediaItemProps {
  item: MediaItemType;
  onLike: (id: string) => void;
  // Mark items near the top as priority to speed up LCP
  priority?: boolean;
}

export function MediaItem({ item, onLike, priority = false }: MediaItemProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { isVisible, ref } = useIntersection<HTMLDivElement>({
    threshold: 0.6,
  });
  const [showHeart, setShowHeart] = useState(false);
  const [scale, setScale] = useState(1);
  const pointers = useRef<Map<number, PointerEvent>>(new Map());

  const handleDoubleTap = useCallback(() => {
    onLike(item.id);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  }, [item.id, onLike]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Do not capture pointer to avoid blocking vertical scroll.
    pointers.current.set(event.pointerId, event.nativeEvent);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, event.nativeEvent);
    if (pointers.current.size === 2) {
      const [first, second] = Array.from(pointers.current.values());
      const distance = Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
      const initial = Number(containerRef.current?.dataset.initialDistance ?? distance);
      if (!containerRef.current?.dataset.initialDistance) {
        if (containerRef.current) containerRef.current.dataset.initialDistance = String(distance);
        return;
      }
      const ratio = distance / initial;
      setScale(Math.min(2.5, Math.max(1, ratio)));
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) {
      setScale(1);
      if (containerRef.current) delete containerRef.current.dataset.initialDistance;
    }
  };

  return (
    <div ref={ref} className="relative min-h-[100svh] w-full snap-start snap-always overflow-hidden pb-[env(safe-area-inset-bottom)]">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/30 to-black" />
      <div className="flex h-full items-center justify-center px-3 md:px-0">
        <div
          ref={containerRef}
          className="relative flex h-[78svh] w-full max-w-[420px] flex-col justify-end overflow-hidden rounded-[24px] md:h-[85vh] md:rounded-[32px]"
          onDoubleClick={handleDoubleTap}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: "pan-y pinch-zoom" }}
        >
          {item.type === "video" ? (
            <AdaptiveVideoPlayer 
              src={item.url} 
              poster={item.thumbnail} 
              isActive={isVisible} 
              onProgress={() => {
                // Progress updates can be handled here if needed in the future
              }}
            />
          ) : (
            <motion.div
              animate={{ scale }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              className="relative h-full w-full"
            >
              <Image
                src={item.url}
                alt={item.title}
                fill
                className="object-cover"
                sizes="420px"
                priority={priority}
                fetchPriority={priority ? "high" : "auto"}
                quality={75}
              />
            </motion.div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

          <div className="absolute bottom-16 left-3 right-20 space-y-3 text-white md:bottom-20 md:left-4 md:right-24 md:space-y-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--brand-secondary)] md:text-sm">{item.eventType}</p>
              <h3 className="mt-1 text-xl font-semibold md:mt-2 md:text-2xl">{item.title}</h3>
              <p className="mt-2 text-xs text-white/80 md:text-sm">{item.description}</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-white/60 md:gap-4 md:text-xs">
              <span>{new Date(item.date).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="absolute bottom-20 right-3 flex flex-col items-center gap-3 md:bottom-24 md:right-4 md:gap-4">
            <EngagementButton icon={Heart} label="Like" count={item.likes} onClick={handleDoubleTap} />
          </div>

          <AnimatePresence>
            {showHeart ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center text-[var(--brand-secondary)]"
              >
                <Heart className="h-20 w-20 fill-[var(--brand-secondary)] md:h-24 md:w-24" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
