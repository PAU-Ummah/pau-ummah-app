import { useState, useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';

export interface QualityLevel {
  width: number;
  height: number;
  bitrate: number;
  name: string;
  url: string;
}

export function useVideoOptimization(
  src: string,
  isActive: boolean,
  onError?: (error: Error) => void
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');
  const [progress, setProgress] = useState(0);

  // Clean up HLS instance
  const destroyPlayer = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  // Initialize HLS.js player
  const initPlayer = useCallback(() => {
    if (!videoRef.current) return;

    // Clean up previous instance if it exists
    if (hlsRef.current) {
      destroyPlayer();
    }

    // If HLS is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000, // 60MB
        maxBufferHole: 0.5,
      });

      hlsRef.current = hls;

      // Load the source
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
              const error = new Error(`HLS Error: ${data.details}`);
              setError(error);
              onError?.(error);
              destroyPlayer();
              break;
          }
        }
      });

      // Handle fragment loading for progress tracking
      hls.on(Hls.Events.FRAG_LOADING, () => {
        setIsLoading(true);
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        setIsLoading(false);
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari on iOS
      videoRef.current.src = src;
      videoRef.current.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
      });
      
      videoRef.current.addEventListener('error', () => {
        const error = new Error('Failed to load video');
        setError(error);
        onError?.(error);
      });
    } else {
      const error = new Error('HLS is not supported in this browser');
      setError(error);
      onError?.(error);
    }
  }, [src, onError, destroyPlayer]);

  // Handle quality change
  const handleQualityChange = useCallback((quality: string) => {
    if (!hlsRef.current) return;
    
    if (quality === 'Auto') {
      hlsRef.current.currentLevel = -1; // Auto quality
    } else {
      const level = qualityLevels.findIndex(l => l.name === quality);
      if (level !== -1) {
        hlsRef.current.currentLevel = level - 1; // -1 because we added 'Auto' as first item
      }
    }
    
    setCurrentQuality(quality);
  }, [qualityLevels]);

  // Handle time updates
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const ratio = video.currentTime / video.duration;
    const value = Number.isFinite(ratio) ? ratio : 0;
    setProgress(value);
  }, []);

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
      video.play().catch(err => {
        console.error('Playback failed:', err);
        const error = new Error('Playback failed. Please try again.');
        setError(error);
        onError?.(error);
      });
    } else {
      video.pause();
      if (!video.paused) {
        video.currentTime = 0;
      }
    }
  }, [isActive, onError]);

  return {
    videoRef,
    isLoading,
    error,
    progress,
    qualityLevels,
    currentQuality,
    setQuality: handleQualityChange,
    onTimeUpdate: handleTimeUpdate,
  };
}
