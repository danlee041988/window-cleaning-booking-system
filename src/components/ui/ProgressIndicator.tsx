/**
 * ProgressIndicator - Animated progress indicator with smooth transitions
 * Shows form completion progress with enhanced visual feedback
 */

import React, { memo, useEffect, useState } from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepNames?: string[];
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepNames = [],
  className = ''
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const progress = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  // Animate progress changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Progress bar */}
      <div className="relative mb-8">
        {/* Background track */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          {/* Animated progress fill */}
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out transform origin-left"
            style={{ width: `${animatedProgress}%` }}
          >
            {/* Shimmer effect */}
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Progress percentage */}
        <div className="absolute right-0 -top-6 text-sm font-medium text-gray-600 dark:text-gray-400">
          {Math.round(animatedProgress)}% Complete
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex justify-between relative">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const status = getStepStatus(stepNumber);
          const stepName = stepNames[index] || `Step ${stepNumber}`;

          return (
            <div
              key={index}
              className="flex flex-col items-center relative"
              style={{ width: `${100 / totalSteps}%` }}
            >
              {/* Step circle */}
              <div
                className={`
                  relative z-10 w-8 h-8 rounded-full flex items-center justify-center
                  transition-all duration-300 ease-in-out transform
                  ${status === 'completed'
                    ? 'bg-green-500 text-white scale-110 shadow-lg'
                    : status === 'current'
                    ? 'bg-blue-500 text-white scale-125 shadow-xl animate-pulse'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }
                `}
              >
                {status === 'completed' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">{stepNumber}</span>
                )}

                {/* Pulsing ring for current step */}
                {status === 'current' && (
                  <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping" />
                )}
              </div>

              {/* Step name */}
              <div
                className={`
                  mt-2 text-xs text-center transition-all duration-300
                  ${status === 'current'
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : status === 'completed'
                    ? 'text-green-600 dark:text-green-400 font-medium'
                    : 'text-gray-500 dark:text-gray-400'
                  }
                `}
              >
                {stepName}
              </div>

              {/* Connecting line to next step */}
              {index < totalSteps - 1 && (
                <div
                  className={`
                    absolute top-4 left-1/2 w-full h-0.5 -z-10
                    transition-all duration-500 ease-in-out
                    ${status === 'completed'
                      ? 'bg-green-400'
                      : 'bg-gray-300 dark:bg-gray-600'
                    }
                  `}
                  style={{
                    transform: 'translateX(50%)',
                    width: `calc(100% - 2rem)`
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Motivational text */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {currentStep === totalSteps
            ? "🎉 Almost done! Review your information and submit."
            : currentStep === 1
            ? "👋 Welcome! Let's get started with your booking."
            : `📝 Step ${currentStep} of ${totalSteps} - You're doing great!`
          }
        </p>
      </div>
    </div>
  );
};

export default memo(ProgressIndicator);