import { useState, useEffect, useCallback } from 'react';

interface MobileOptimizationConfig {
  isMobile: boolean;
  connectionType: 'slow' | 'fast' | 'unknown';
  prefersReducedMotion: boolean;
  isLowEndDevice: boolean;
}

export function useMobileOptimization() {
  const [config, setConfig] = useState<MobileOptimizationConfig>({
    isMobile: false,
    connectionType: 'unknown',
    prefersReducedMotion: false,
    isLowEndDevice: false,
  });

  useEffect(() => {
    // Detect mobile devices
    const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    // Detect connection type
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    let connectionType: 'slow' | 'fast' | 'unknown' = 'unknown';
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        connectionType = 'slow';
      } else if (effectiveType === '3g' || effectiveType === '4g') {
        connectionType = 'fast';
      }
    }

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Detect low-end device (basic heuristic)
    const isLowEndDevice = isMobile && (
      navigator.hardwareConcurrency <= 2 || // Low CPU cores
      (navigator as any).deviceMemory <= 2 || // Low RAM (if available)
      /Android.*Chrome\/[0-5][0-9]/.test(userAgent) // Old Android Chrome
    );

    setConfig({
      isMobile,
      connectionType,
      prefersReducedMotion,
      isLowEndDevice,
    });
  }, []);

  // Get optimized image parameters
  const getImageParams = useCallback((baseUrl: string) => {
    const separator = baseUrl.includes('?') ? '&' : '?';
    
    if (config.isMobile) {
      if (config.connectionType === 'slow' || config.isLowEndDevice) {
        // Very aggressive optimization for slow connections
        return `${baseUrl}${separator}w=320&h=480&q=60&f=webp`;
      } else {
        // Standard mobile optimization
        return `${baseUrl}${separator}w=420&h=600&q=75&f=webp`;
      }
    }
    
    return baseUrl;
  }, [config]);

  // Get optimized video parameters
  const getVideoParams = useCallback((baseUrl: string) => {
    if (config.isMobile) {
      if (config.connectionType === 'slow' || config.isLowEndDevice) {
        return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}quality=mobile&low=1`;
      } else {
        return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}quality=mobile`;
      }
    }
    
    return baseUrl;
  }, [config]);

  // Get optimized preload strategy
  const getPreloadStrategy = useCallback(() => {
    if (config.connectionType === 'slow' || config.isLowEndDevice) {
      return 'none';
    } else if (config.isMobile) {
      return 'metadata';
    } else {
      return 'auto';
    }
  }, [config]);

  // Get optimized quality settings
  const getQualitySettings = useCallback(() => {
    if (config.connectionType === 'slow' || config.isLowEndDevice) {
      return {
        imageQuality: 60,
        videoQuality: 'low',
        enableAnimations: false,
        enableHDR: false,
      };
    } else if (config.isMobile) {
      return {
        imageQuality: 75,
        videoQuality: 'medium',
        enableAnimations: !config.prefersReducedMotion,
        enableHDR: false,
      };
    } else {
      return {
        imageQuality: 85,
        videoQuality: 'high',
        enableAnimations: !config.prefersReducedMotion,
        enableHDR: true,
      };
    }
  }, [config]);

  return {
    ...config,
    getImageParams,
    getVideoParams,
    getPreloadStrategy,
    getQualitySettings,
  };
}
