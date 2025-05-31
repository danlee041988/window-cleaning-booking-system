import React from 'react';

/**
 * Skeleton loader component for better loading states
 */
export const SkeletonLoader = ({ className = '', variant = 'text', width, height, count = 1 }) => {
  const baseClass = 'animate-pulse bg-gray-700 rounded';
  
  const getVariantClass = () => {
    switch (variant) {
      case 'text':
        return 'h-4 w-full';
      case 'title':
        return 'h-8 w-3/4';
      case 'button':
        return 'h-12 w-32';
      case 'card':
        return 'h-24 w-full';
      case 'circle':
        return 'rounded-full';
      case 'rectangular':
      default:
        return '';
    }
  };
  
  const style = {
    width: width || undefined,
    height: height || undefined
  };
  
  if (count > 1) {
    return (
      <div className="space-y-2">
        {[...Array(count)].map((_, index) => (
          <div 
            key={index}
            className={`${baseClass} ${getVariantClass()} ${className}`}
            style={style}
          />
        ))}
      </div>
    );
  }
  
  return (
    <div 
      className={`${baseClass} ${getVariantClass()} ${className}`}
      style={style}
    />
  );
};

/**
 * Form skeleton loader
 */
export const FormSkeleton = () => (
  <div className="space-y-6">
    <SkeletonLoader variant="title" />
    <div className="space-y-4">
      <div>
        <SkeletonLoader className="h-3 w-24 mb-2" />
        <SkeletonLoader className="h-10" />
      </div>
      <div>
        <SkeletonLoader className="h-3 w-24 mb-2" />
        <SkeletonLoader className="h-10" />
      </div>
      <div>
        <SkeletonLoader className="h-3 w-24 mb-2" />
        <SkeletonLoader className="h-10" />
      </div>
    </div>
    <div className="flex gap-4">
      <SkeletonLoader variant="button" />
      <SkeletonLoader variant="button" />
    </div>
  </div>
);

/**
 * Card skeleton loader
 */
export const CardSkeleton = () => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
    <div className="flex items-center mb-4">
      <SkeletonLoader variant="circle" width={40} height={40} className="mr-3" />
      <SkeletonLoader className="h-6 w-32" />
    </div>
    <SkeletonLoader count={3} />
    <div className="mt-4">
      <SkeletonLoader className="h-8 w-24" />
    </div>
  </div>
);

/**
 * Date picker skeleton
 */
export const DatePickerSkeleton = () => (
  <div className="space-y-4">
    <SkeletonLoader className="h-6 w-48" />
    <div className="grid grid-cols-3 gap-3">
      {[...Array(6)].map((_, i) => (
        <SkeletonLoader key={i} className="h-16" />
      ))}
    </div>
    <SkeletonLoader className="h-16" />
  </div>
);

/**
 * Service card skeleton
 */
export const ServiceCardSkeleton = () => (
  <div className="border-2 border-gray-700 rounded-xl p-6">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <SkeletonLoader className="h-6 w-32 mb-2" />
        <SkeletonLoader className="h-4 w-full" />
      </div>
      <SkeletonLoader className="h-8 w-20 ml-4" />
    </div>
    <SkeletonLoader variant="button" className="w-full" />
  </div>
);

/**
 * Loading overlay with skeleton
 */
export const LoadingOverlay = ({ children, isLoading, skeleton = <FormSkeleton /> }) => {
  if (isLoading) {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700 max-w-md w-full">
            {skeleton}
          </div>
        </div>
      </div>
    );
  }
  
  return children;
};

export default SkeletonLoader;