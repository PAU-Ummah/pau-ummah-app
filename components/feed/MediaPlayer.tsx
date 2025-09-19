"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Maximize2 } from "lucide-react";

interface MediaPlayerProps {
  src: string;
  poster: string;
  isActive: boolean;
  onProgress?: (progress: number) => void;
}

export function MediaPlayer({ src, poster, isActive, onProgress }: MediaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [isActive]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const ratio = video.currentTime / video.duration;
    const value = Number.isFinite(ratio) ? ratio : 0;
    setProgress(value);
    onProgress?.(value);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const requestFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      void video.requestFullscreen();
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-black">
      <video
        ref={videoRef}
        // Only assign src when active to avoid fetching video data offscreen
        src={isActive ? src : undefined}
        poster={poster}
        preload="metadata"
        loop
        playsInline
        muted={muted}
        onTimeUpdate={handleTimeUpdate}
        className="h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-black/40">
        <div className="h-full bg-[var(--brand-secondary)] transition-all" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="absolute bottom-4 left-4 flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMute}
        className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur"
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
        <button
          type="button"
          onClick={requestFullscreen}
        className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur"
        >
          <Maximize2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
