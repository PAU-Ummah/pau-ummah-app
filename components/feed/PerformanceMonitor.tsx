"use client";

import { useEffect, useState } from 'react';
import { useMobileOptimization } from '@/lib/hooks/useMobileOptimization';

interface PerformanceMetrics {
  imageLoadTime: number;
  videoLoadTime: number;
  totalItems: number;
  loadedItems: number;
  averageLoadTime: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    imageLoadTime: 0,
    videoLoadTime: 0,
    totalItems: 0,
    loadedItems: 0,
    averageLoadTime: 0,
  });
  
  const { isMobile, connectionType, isLowEndDevice } = useMobileOptimization();
  const [showMetrics, setShowMetrics] = useState(false);

  useEffect(() => {
    // Only show metrics in development or when explicitly enabled
    const shouldShow = process.env.NODE_ENV === 'development' || 
                      localStorage.getItem('show-performance-metrics') === 'true';
    setShowMetrics(shouldShow);

    // Listen for performance events
    const handleImageLoad = (event: CustomEvent) => {
      setMetrics(prev => ({
        ...prev,
        imageLoadTime: event.detail.loadTime,
        loadedItems: prev.loadedItems + 1,
        averageLoadTime: (prev.averageLoadTime * prev.loadedItems + event.detail.loadTime) / (prev.loadedItems + 1),
      }));
    };

    const handleVideoLoad = (event: CustomEvent) => {
      setMetrics(prev => ({
        ...prev,
        videoLoadTime: event.detail.loadTime,
        loadedItems: prev.loadedItems + 1,
        averageLoadTime: (prev.averageLoadTime * prev.loadedItems + event.detail.loadTime) / (prev.loadedItems + 1),
      }));
    };

    window.addEventListener('image-loaded', handleImageLoad as EventListener);
    window.addEventListener('video-loaded', handleVideoLoad as EventListener);

    return () => {
      window.removeEventListener('image-loaded', handleImageLoad as EventListener);
      window.removeEventListener('video-loaded', handleVideoLoad as EventListener);
    };
  }, []);

  if (!showMetrics) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono backdrop-blur">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold">Performance</span>
        <button
          onClick={() => {
            localStorage.setItem('show-performance-metrics', 'false');
            setShowMetrics(false);
          }}
          className="text-white/60 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        <div>Device: {isMobile ? 'Mobile' : 'Desktop'}</div>
        <div>Connection: {connectionType}</div>
        <div>Low-end: {isLowEndDevice ? 'Yes' : 'No'}</div>
        <div>Loaded: {metrics.loadedItems}/{metrics.totalItems}</div>
        <div>Avg Load: {metrics.averageLoadTime.toFixed(0)}ms</div>
        <div>Image: {metrics.imageLoadTime.toFixed(0)}ms</div>
        <div>Video: {metrics.videoLoadTime.toFixed(0)}ms</div>
      </div>
    </div>
  );
}

// Helper function to dispatch performance events
export function trackImageLoad(loadTime: number) {
  window.dispatchEvent(new CustomEvent('image-loaded', { detail: { loadTime } }));
}

export function trackVideoLoad(loadTime: number) {
  window.dispatchEvent(new CustomEvent('video-loaded', { detail: { loadTime } }));
}
