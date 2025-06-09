/**
 * AnimatedButton - Enhanced button component with micro-interactions
 * Provides visual feedback and improved user experience
 */

import React, { memo, useState } from 'react';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  'aria-label'?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = `
    relative inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 ease-in-out transform-gpu
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95 select-none
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-700 text-white
      hover:from-blue-700 hover:to-blue-800 hover:shadow-lg
      focus:ring-blue-500 focus:ring-offset-blue-50
      dark:focus:ring-offset-gray-900
    `,
    secondary: `
      bg-gradient-to-r from-gray-600 to-gray-700 text-white
      hover:from-gray-700 hover:to-gray-800 hover:shadow-lg
      focus:ring-gray-500 focus:ring-offset-gray-50
      dark:focus:ring-offset-gray-900
    `,
    outline: `
      border-2 border-blue-600 text-blue-600 bg-transparent
      hover:bg-blue-600 hover:text-white hover:shadow-lg
      dark:border-blue-400 dark:text-blue-400
      dark:hover:bg-blue-400 dark:hover:text-gray-900
      focus:ring-blue-500
    `,
    ghost: `
      text-gray-700 bg-transparent hover:bg-gray-100
      dark:text-gray-300 dark:hover:bg-gray-800
      focus:ring-gray-500
    `
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    // Create ripple effect
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.4s ease-out;
      pointer-events: none;
    `;

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 400);

    onClick?.(e);
  };

  return (
    <>
      <style>
        {`
          @keyframes ripple {
            to {
              transform: scale(2);
              opacity: 0;
            }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
      
      <button
        type={type}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${isPressed ? 'scale-95' : 'hover:scale-105'}
          ${loading ? 'cursor-wait' : ''}
          ${className}
        `}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Content with fade effect during loading */}
        <span className={`transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
          {children}
        </span>
        
        {/* Shine effect on hover */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transform -skew-x-12 -translate-x-full hover:translate-x-full transition-all duration-700 ease-out" />
      </button>
    </>
  );
};

export default memo(AnimatedButton);