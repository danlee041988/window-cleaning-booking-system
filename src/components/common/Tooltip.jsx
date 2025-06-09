// Tooltip component for helpful hints
import React, { useState } from 'react';

const Tooltip = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {isVisible && (
        <div className={`absolute z-50 ${getPositionClasses()} pointer-events-none`}>
          <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 max-w-xs shadow-xl border border-gray-700">
            {content}
            <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 border border-gray-700 ${
              position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-t-0 border-l-0' :
              position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-b-0 border-r-0' :
              position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-l-0 border-b-0' :
              'left-[-5px] top-1/2 -translate-y-1/2 border-r-0 border-t-0'
            }`}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;