/**
 * usePerformanceMonitoring - Hook for monitoring component performance
 * Tracks render times and provides performance insights
 */

import React, { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
}

interface UsePerformanceMonitoringOptions {
  componentName?: string;
  enabled?: boolean;
  threshold?: number; // Log warning if render time exceeds this (ms)
}

export const usePerformanceMonitoring = (
  options: UsePerformanceMonitoringOptions = {}
) => {
  const {
    componentName = 'UnknownComponent',
    enabled = import.meta.env.DEV,
    threshold = 16 // 16ms = 60fps threshold
  } = options;

  const renderCountRef = useRef(0);
  const totalRenderTimeRef = useRef(0);
  const renderStartTimeRef = useRef<number | null>(null);
  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0
  });

  // Start performance measurement
  const startRender = useCallback(() => {
    if (!enabled) return;
    renderStartTimeRef.current = performance.now();
  }, [enabled]);

  // End performance measurement
  const endRender = useCallback(() => {
    if (!enabled || renderStartTimeRef.current === null) return;

    const renderTime = performance.now() - renderStartTimeRef.current;
    renderCountRef.current += 1;
    totalRenderTimeRef.current += renderTime;

    const metrics: PerformanceMetrics = {
      renderCount: renderCountRef.current,
      averageRenderTime: totalRenderTimeRef.current / renderCountRef.current,
      lastRenderTime: renderTime
    };

    metricsRef.current = metrics;

    // Log warning if render time exceeds threshold
    if (renderTime > threshold) {
      console.warn(
        `🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms (threshold: ${threshold}ms)`
      );
    }

    // Log metrics every 10 renders in development
    if (renderCountRef.current % 10 === 0) {
      console.log(`📊 Performance metrics for ${componentName}:`, metrics);
    }

    renderStartTimeRef.current = null;
  }, [enabled, componentName, threshold]);

  // Get current metrics
  const getMetrics = useCallback((): PerformanceMetrics => {
    return { ...metricsRef.current };
  }, []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    renderCountRef.current = 0;
    totalRenderTimeRef.current = 0;
    metricsRef.current = {
      renderCount: 0,
      averageRenderTime: 0,
      lastRenderTime: 0
    };
  }, []);

  // Auto-start measurement on component mount/update
  useEffect(() => {
    startRender();
    return () => {
      endRender();
    };
  });

  return {
    startRender,
    endRender,
    getMetrics,
    resetMetrics,
    metrics: metricsRef.current
  };
};

// HOC for automatic performance monitoring
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = (props: P) => {
    usePerformanceMonitoring({ componentName: componentName || Component.name });
    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName || Component.name})`;
  return WrappedComponent;
};