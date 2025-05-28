// Loading button with smooth transitions
import React from 'react';

const LoadingButton = ({ 
  children, 
  loading, 
  disabled, 
  onClick, 
  className = '', 
  type = 'button',
  ...props 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        relative inline-flex items-center justify-center
        px-6 py-3 font-semibold rounded-lg
        transition-all duration-200
        ${loading || disabled ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'}
        ${className}
      `}
      {...props}
    >
      {/* Loading spinner overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Button content */}
      <span className={`${loading ? 'invisible' : ''} flex items-center`}>
        {children}
      </span>
    </button>
  );
};

export default LoadingButton;