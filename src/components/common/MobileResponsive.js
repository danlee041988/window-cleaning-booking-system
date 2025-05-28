import React from 'react';

/**
 * Mobile-responsive wrapper with common patterns
 */
export const MobileContainer = ({ children, className = '' }) => {
  return (
    <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Responsive grid that adapts to mobile screens
 */
export const ResponsiveGrid = ({ 
  children, 
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4,
  className = '' 
}) => {
  const gridCols = `grid-cols-1 ${cols.sm ? `sm:grid-cols-${cols.sm}` : ''} ${cols.md ? `md:grid-cols-${cols.md}` : ''} ${cols.lg ? `lg:grid-cols-${cols.lg}` : ''} ${cols.xl ? `xl:grid-cols-${cols.xl}` : ''}`;
  
  return (
    <div className={`grid ${gridCols} gap-${gap} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Mobile-friendly button with larger touch targets
 */
export const MobileButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 touch-manipulation';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white focus:ring-blue-500',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500',
    outline: 'border-2 border-gray-600 hover:border-blue-500 text-gray-300 hover:text-blue-300'
  };
  
  const sizeClasses = {
    small: 'px-4 py-2 text-sm min-h-[40px]',
    medium: 'px-6 py-3 text-base min-h-[48px]',
    large: 'px-8 py-4 text-lg min-h-[56px]'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Mobile-optimized form field
 */
export const MobileFormField = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  required = false,
  placeholder,
  className = '' 
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-300"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                   transition-all duration-200 min-h-[48px] text-base
                   ${error ? 'border-red-500' : 'border-gray-600'}`}
      />
      {error && (
        <p className="text-sm text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
};

/**
 * Hide element on mobile screens
 */
export const HideOnMobile = ({ children, breakpoint = 'sm' }) => {
  return (
    <div className={`hidden ${breakpoint}:block`}>
      {children}
    </div>
  );
};

/**
 * Show element only on mobile screens
 */
export const ShowOnMobile = ({ children, breakpoint = 'sm' }) => {
  return (
    <div className={`block ${breakpoint}:hidden`}>
      {children}
    </div>
  );
};

/**
 * Sticky mobile navigation bar
 */
export const MobileNavBar = ({ 
  leftAction, 
  title, 
  rightAction,
  className = '' 
}) => {
  return (
    <div className={`sticky top-0 z-40 bg-gray-900 border-b border-gray-700 ${className}`}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex-shrink-0">
          {leftAction}
        </div>
        <h1 className="text-lg font-semibold text-white text-center flex-1 mx-4">
          {title}
        </h1>
        <div className="flex-shrink-0">
          {rightAction}
        </div>
      </div>
    </div>
  );
};