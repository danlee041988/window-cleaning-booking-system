import React, { useRef, useState, useEffect, useCallback } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className = ''
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook for dynamic item heights
export function useVirtualizedDynamicList<T>(
  items: T[],
  estimatedItemHeight: number,
  containerHeight: number
) {
  const [measurements, setMeasurements] = useState<Map<number, number>>(new Map());
  const measuredHeights = useRef<Map<number, number>>(new Map());

  const measureItem = useCallback((index: number, element: HTMLElement | null) => {
    if (element && !measuredHeights.current.has(index)) {
      const height = element.getBoundingClientRect().height;
      measuredHeights.current.set(index, height);
      setMeasurements(new Map(measuredHeights.current));
    }
  }, []);

  const getItemOffset = useCallback((index: number) => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += measuredHeights.current.get(i) || estimatedItemHeight;
    }
    return offset;
  }, [estimatedItemHeight]);

  const getItemHeight = useCallback((index: number) => {
    return measuredHeights.current.get(index) || estimatedItemHeight;
  }, [estimatedItemHeight]);

  return {
    measureItem,
    getItemOffset,
    getItemHeight,
    measurements
  };
}