import React, { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Wrapper component for lazy-loaded components
 * Provides a consistent loading experience
 */
const LazyLoadWrapper = ({ 
  children, 
  fallback = <LoadingSpinner />,
  minHeight = '400px' 
}) => {
  return (
    <Suspense 
      fallback={
        <div 
          className="flex items-center justify-center" 
          style={{ minHeight }}
        >
          {fallback}
        </div>
      }
    >
      {children}
    </Suspense>
  );
};

export default LazyLoadWrapper;