"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX, Maximize2, Loader2 } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    setIsMobile(mobile);
  }, []);

  // Handle video playback
  const handlePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // For mobile, we'll use a lower quality version if available
      const videoSrc = isMobile && src.includes('google.com') 
        ? `${src}${src.includes('?') ? '&' : '?'}m=18` // Lower quality parameter for mobile
        : src;

      // Only set source if it's different to avoid unnecessary reloads
      if (video.src !== videoSrc) {
        video.src = videoSrc;
      }

      // Preload metadata for better UX
      await video.load();
      
      // Set video quality for smoother playback on mobile
      if ('videoTracks' in video) {
        // Type assertion for webkit-specific properties
        const videoEl = video as HTMLVideoElement & {
          webkitPlaysInline?: boolean;
          webkitRequestFullscreen?: () => Promise<void>;
        };
        
        video.playsInline = true;
        if (videoEl.webkitPlaysInline !== undefined) {
          videoEl.webkitPlaysInline = true;
        }
      }

      // For mobile, we'll use a lower playback rate for better performance
      if (isMobile) {
        video.defaultPlaybackRate = 1.0;
        video.playbackRate = 1.0;
      }

      // Start playback
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        await playPromise.catch(err => {
          console.error('Playback failed:', err);
          setError(new Error('Playback failed. Please try again.'));
        });
      }
    } catch (err) {
      console.error('Error initializing video:', err);
      setError(err instanceof Error ? err : new Error('Failed to load video'));
    } finally {
      setIsLoading(false);
    }
  }, [src, isMobile]);

  // Handle play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      void handlePlay();
    } else {
      video.pause();
      // Reset video to beginning when not active
      if (!video.paused) {
        video.currentTime = 0;
      }
    }

    return () => {
      if (!isActive) {
        video.pause();
        video.currentTime = 0;
      }
    };
  }, [isActive, handlePlay]);

  // Handle time updates
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const ratio = video.currentTime / video.duration;
    const value = Number.isFinite(ratio) ? ratio : 0;
    setProgress(value);
    onProgress?.(value);

    // Buffering state
    if (video.readyState < 3) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [onProgress]);

  // Handle errors
  const handleError = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    console.error('Video error:', video.error);
    setError(new Error('Failed to load video. Please check your connection.'));
    setIsLoading(false);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const requestFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.requestFullscreen) {
      void video.requestFullscreen();
    } else if ('webkitRequestFullscreen' in video) {
      const videoEl = video as HTMLVideoElement & { webkitRequestFullscreen?: () => Promise<void> };
      if (videoEl.webkitRequestFullscreen) {
        void videoEl.webkitRequestFullscreen();
      }
    }
  }, []);

  // Optimize for mobile devices
  const videoProps = isMobile ? {
    playsInline: true,
    preload: 'metadata',
    muted: true,
    controls: false,
    disablePictureInPicture: true,
    disableRemotePlayback: true,
  } : {
    playsInline: true,
    preload: 'metadata',
    muted,
    controls: false
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-black">
      <video
        ref={videoRef}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onError={handleError}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onEnded={() => {
          if (isActive) {
            const video = videoRef.current;
            if (video) {
              video.currentTime = 0;
              void video.play();
            }
          }
        }}
        className="h-full w-full object-cover"
        {...videoProps}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Loader2 className="h-12 w-12 animate-spin text-white/80" />
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4 text-center">
          <p className="mb-2 text-red-400">Error loading video</p>
          <p className="text-sm text-white/80">{error.message}</p>
          <button
            onClick={handlePlay}
            className="mt-4 rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
          >
            Try Again
          </button>
        </div>
      )}
      
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />
      
      {/* Progress bar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-black/40">
        <div 
          className="h-full bg-[var(--brand-secondary)] transition-all duration-300 ease-out" 
          style={{ width: `${progress * 100}%` }} 
        />
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleMute}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
        
        <button
          type="button"
          onClick={requestFullscreen}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
          aria-label="Fullscreen"
        >
          <Maximize2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
