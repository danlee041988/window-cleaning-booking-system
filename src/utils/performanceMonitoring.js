// Performance monitoring utilities
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      renderCounts: {},
      apiCallDurations: [],
      memoryUsage: [],
      longTasks: []
    };
    this.setupObservers();
  }

  setupObservers() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.metrics.longTasks.push({
                duration: entry.duration,
                startTime: entry.startTime,
                timestamp: new Date().toISOString()
              });
              
              // Log warning for very long tasks
              if (entry.duration > 100) {
                console.warn(`Long task detected: ${entry.duration}ms`);
              }
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.log('Long task monitoring not supported');
      }
    }

    // Monitor memory usage
    if (performance.memory) {
      setInterval(() => {
        this.metrics.memoryUsage.push({
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          timestamp: new Date().toISOString()
        });

        // Keep only last 100 entries
        if (this.metrics.memoryUsage.length > 100) {
          this.metrics.memoryUsage.shift();
        }
      }, 10000); // Check every 10 seconds
    }
  }

  // Track component render
  trackRender(componentName) {
    if (!this.metrics.renderCounts[componentName]) {
      this.metrics.renderCounts[componentName] = 0;
    }
    this.metrics.renderCounts[componentName]++;
  }

  // Track API call duration
  trackApiCall(endpoint, duration) {
    this.metrics.apiCallDurations.push({
      endpoint,
      duration,
      timestamp: new Date().toISOString()
    });

    // Keep only last 100 calls
    if (this.metrics.apiCallDurations.length > 100) {
      this.metrics.apiCallDurations.shift();
    }

    // Log slow API calls
    if (duration > 1000) {
      console.warn(`Slow API call to ${endpoint}: ${duration}ms`);
    }
  }

  // Get performance report
  getReport() {
    const avgApiDuration = this.metrics.apiCallDurations.length > 0
      ? this.metrics.apiCallDurations.reduce((sum, call) => sum + call.duration, 0) / this.metrics.apiCallDurations.length
      : 0;

    const memoryUsage = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
    
    return {
      renderCounts: this.metrics.renderCounts,
      avgApiDuration: Math.round(avgApiDuration),
      slowApiCalls: this.metrics.apiCallDurations.filter(call => call.duration > 1000).length,
      longTasksCount: this.metrics.longTasks.length,
      memoryUsageMB: memoryUsage ? Math.round(memoryUsage.usedJSHeapSize / 1048576) : 0,
      timestamp: new Date().toISOString()
    };
  }

  // Clear metrics
  reset() {
    this.metrics.renderCounts = {};
    this.metrics.apiCallDurations = [];
    this.metrics.longTasks = [];
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// React component wrapper for tracking renders
export const withPerformanceTracking = (Component, componentName) => {
  return React.memo((props) => {
    React.useEffect(() => {
      performanceMonitor.trackRender(componentName);
    });

    return <Component {...props} />;
  });
};

// API wrapper for tracking call duration
export const trackApiPerformance = async (apiCall, endpoint) => {
  const startTime = performance.now();
  try {
    const result = await apiCall();
    const duration = performance.now() - startTime;
    performanceMonitor.trackApiCall(endpoint, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceMonitor.trackApiCall(endpoint, duration);
    throw error;
  }
};

// Hook for monitoring performance in components
export const usePerformanceMonitor = (componentName) => {
  React.useEffect(() => {
    performanceMonitor.trackRender(componentName);
  }, [componentName]);

  return {
    getReport: () => performanceMonitor.getReport(),
    reset: () => performanceMonitor.reset()
  };
};

// Export singleton instance
export default performanceMonitor;