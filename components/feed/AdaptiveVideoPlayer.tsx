"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Hls from 'hls.js';
import { Volume2, VolumeX, Maximize2, Loader2, Settings } from "lucide-react";
import { useMobileOptimization } from "@/lib/hooks/useMobileOptimization";

interface QualityLevel {
  width: number;
  height: number;
  bitrate: number;
  name: string;
  url: string;
}

interface AdaptiveVideoPlayerProps {
  src: string;
  poster: string;
  isActive: boolean;
  onProgress?: (progress: number) => void;
}

export function AdaptiveVideoPlayer({ src, poster, isActive, onProgress }: AdaptiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [muted, setMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use mobile optimization hook
  const { 
    isMobile, 
    connectionType, 
    isLowEndDevice,
    getPreloadStrategy,
    getQualitySettings 
  } = useMobileOptimization();

  const qualitySettings = getQualitySettings();

  // Clean up HLS instance
  const destroyPlayer = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    // Also pause and reset the video element
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  // Check if the video source is HLS format
  const isHLS = useCallback((url: string) => {
    return url.includes('.m3u8') || url.includes('application/vnd.apple.mpegurl');
  }, []);

  // Initialize video player (HLS or regular MP4)
  const initPlayer = useCallback(() => {
    if (!videoRef.current) return;

    // Clean up previous instance if it exists
    if (hlsRef.current) {
      destroyPlayer();
    }

    // Check if this is an HLS stream
    if (isHLS(src) && Hls.isSupported()) {
      // Use HLS.js for HLS streams
      console.log('Using HLS.js for HLS stream:', src);
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: !isMobile && connectionType !== 'slow', // Disable low latency on mobile/slow connections
        backBufferLength: isLowEndDevice ? 5 : (isMobile ? 10 : 30), // Smaller buffer on mobile/low-end devices
        maxBufferLength: isLowEndDevice ? 15 : (isMobile ? 30 : 60),
        maxMaxBufferLength: isLowEndDevice ? 30 : (isMobile ? 60 : 120),
        maxBufferSize: isLowEndDevice ? 15 * 1000 * 1000 : (isMobile ? 30 * 1000 * 1000 : 60 * 1000 * 1000),
        maxBufferHole: isLowEndDevice ? 0.05 : (isMobile ? 0.1 : 0.5),
        startLevel: isMobile ? -1 : -1, // Auto quality selection
        capLevelToPlayerSize: isMobile, // Cap quality to player size on mobile
        maxLoadingDelay: isLowEndDevice ? 2 : 4, // Faster timeout on low-end devices
      });

      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const levels = data.levels.map((level, index) => ({
          width: level.width || 0,
          height: level.height || 0,
          bitrate: level.bitrate || 0,
          name: level.name || `Quality ${index + 1} (${Math.round(level.bitrate / 1000)}kbps)`,
          url: src,
        }));

        setQualityLevels([
          { width: 0, height: 0, bitrate: 0, name: 'Auto', url: 'auto' },
          ...levels,
        ]);
        
        setIsLoading(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              destroyPlayer();
              setError(new Error('Failed to load video'));
              break;
          }
        }
      });
    } else if (isHLS(src) && videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari on iOS with HLS
      videoRef.current.src = src;
      videoRef.current.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
      });
    } else {
      // Regular MP4 video - use native HTML5 video
      console.log('Using native HTML5 video player for:', src);
      videoRef.current.src = src;
      videoRef.current.addEventListener('loadedmetadata', () => {
        console.log('Video metadata loaded successfully');
        setIsLoading(false);
      });
      videoRef.current.addEventListener('error', (e) => {
        console.error('Video error:', e);
        setError(new Error('Failed to load video. Please check your connection.'));
        setIsLoading(false);
      });
    }
  }, [src, destroyPlayer, isHLS]);

  // Handle quality change (only for HLS streams)
  const handleQualityChange = useCallback((quality: string) => {
    if (!hlsRef.current || !isHLS(src)) return;
    
    if (quality === 'Auto') {
      hlsRef.current.currentLevel = -1; // Auto quality
    } else {
      const level = qualityLevels.findIndex(l => l.name === quality);
      if (level !== -1) {
        hlsRef.current.currentLevel = level - 1; // -1 because we added 'Auto' as first item
      }
    }
    
    setCurrentQuality(quality);
    setShowQualityMenu(false);
  }, [qualityLevels, isHLS, src]);

  // Initialize/cleanup on mount/unmount
  useEffect(() => {
    if (isActive && src) {
      initPlayer();
    }

    return () => {
      destroyPlayer();
    };
  }, [src, isActive, initPlayer, destroyPlayer]);

  // Handle play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      // Use a small delay to avoid race conditions
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          // Ignore AbortError as it's expected when switching videos
          if (err.name !== 'AbortError') {
            console.error('Playback failed:', err);
            setError(new Error('Playback failed. Please try again.'));
          }
        });
      }
    } else {
      // Pause immediately without waiting
      video.pause();
      if (!video.paused) {
        video.currentTime = 0;
      }
    }
  }, [isActive]);

  // Handle time updates
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const ratio = video.currentTime / video.duration;
    const value = Number.isFinite(ratio) ? ratio : 0;
    setProgress(value);
    onProgress?.(value);
  }, [onProgress]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    } else {
      containerRef.current.requestFullscreen().catch(console.error);
    }
  }, []);

  // Handle click outside quality menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowQualityMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        No video source available
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden rounded-3xl bg-black">
      <video
        ref={videoRef}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={(e) => {
          console.error('Video error:', e);
          setError(new Error('Failed to load video. Please check your connection.'));
          setIsLoading(false);
        }}
        className="h-full w-full object-cover"
        playsInline
        muted={muted}
        preload={getPreloadStrategy()}
        poster={poster}
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
          <p className="mb-4 text-sm text-white/80">{error.message}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              initPlayer();
            }}
            className="rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        {/* Progress bar */}
        <div className="mb-2 h-1 w-full bg-gray-600">
          <div 
            className="h-full bg-[var(--brand-secondary)] transition-all duration-300" 
            style={{ width: `${progress * 100}%` }} 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            onClick={toggleMute}
            className="flex h-10 w-10 items-center justify-center text-white"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          
          {qualityLevels.length > 1 && isHLS(src) && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQualityMenu(!showQualityMenu);
                }}
                className="flex h-10 items-center justify-center rounded px-3 text-sm text-white hover:bg-white/20"
              >
                <Settings className="mr-1 h-4 w-4" />
                {currentQuality}
              </button>
              
              {showQualityMenu && (
                <div className="absolute bottom-12 left-0 w-40 rounded bg-black/90 p-2 shadow-lg">
                  {qualityLevels.map((level) => (
                    <button
                      key={level.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQualityChange(level.name);
                      }}
                      className={`block w-full px-3 py-2 text-left text-sm ${
                        currentQuality === level.name ? 'text-[var(--brand-secondary)]' : 'text-white'
                      } hover:bg-white/10`}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={toggleFullscreen}
            className="flex h-10 w-10 items-center justify-center text-white"
            aria-label="Fullscreen"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
