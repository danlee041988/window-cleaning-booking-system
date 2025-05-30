// Smooth transition wrapper for step changes
import React from 'react';

const SmoothTransition = ({ children, isVisible = true }) => {
  return (
    <div className={`
      transition-all duration-300 ease-in-out
      ${isVisible 
        ? 'opacity-100 transform translate-y-0' 
        : 'opacity-0 transform translate-y-4'
      }
    `}>
      {children}
    </div>
  );
};

export default SmoothTransition;