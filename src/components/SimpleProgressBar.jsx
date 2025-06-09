// Minimal progress bar that won't interfere with existing functionality
import React from 'react';
import PropTypes from 'prop-types';

const SimpleProgressBar = ({ currentStep, totalSteps = 3 }) => {
  const percentage = (currentStep / totalSteps) * 100;
  
  return (
    <div className="w-full mb-6">
      {/* Step indicator text */}
      <div className="flex justify-between text-xs text-gray-400 mb-2">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{percentage.toFixed(0)}% Complete</span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-600 to-blue-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Step labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span className={currentStep >= 1 ? 'text-blue-400' : ''}>Service</span>
        <span className={currentStep >= 2 ? 'text-blue-400' : ''}>Add-ons</span>
        <span className={currentStep >= 3 ? 'text-blue-400' : ''}>Details & Review</span>
      </div>
    </div>
  );
};

SimpleProgressBar.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number
};

SimpleProgressBar.defaultProps = {
  totalSteps: 3
};

export default SimpleProgressBar;