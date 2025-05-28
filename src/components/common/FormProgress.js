// Progress indicator for multi-step form
import React from 'react';

const FormProgress = ({ currentStep, totalSteps, stepLabels = [] }) => {
  const defaultLabels = [
    'Service Selection',
    'Additional Services', 
    'Contact Details',
    'Review & Submit',
    'Confirmation'
  ];

  const labels = stepLabels.length === totalSteps ? stepLabels : defaultLabels.slice(0, totalSteps);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {labels.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={stepNumber} className="flex items-center">
              {/* Step Circle */}
              <div className="flex items-center flex-col">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                  ${isCompleted 
                    ? 'bg-green-600 text-white' 
                    : isCurrent 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-300' 
                      : 'bg-gray-600 text-gray-300'
                  }
                  transition-all duration-300
                `}>
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                
                {/* Step Label */}
                <div className={`
                  mt-2 text-xs text-center max-w-20
                  ${isCurrent ? 'text-blue-300 font-medium' : 'text-gray-400'}
                `}>
                  {label}
                </div>
              </div>

              {/* Progress Line */}
              {index < labels.length - 1 && (
                <div className={`
                  flex-1 h-1 mx-4 rounded-full transition-all duration-300
                  ${isCompleted ? 'bg-green-600' : 'bg-gray-600'}
                `} />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default FormProgress;