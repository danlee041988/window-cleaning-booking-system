// Example of how to refactor WindowCleaningPricing.js to use the new FormContext
// This shows the pattern for updating your existing components

import React, { useEffect, useMemo } from 'react';
import { useForm } from '../contexts/FormContext';
import { validateStep } from '../utils/validation';
import { LoadingButton } from './common/LoadingSpinner';
import * as FORM_CONSTANTS from '../constants/formConstants';

// Pricing data (move to config file in production)
const WINDOW_CLEANING_OPTIONS = [
  {
    id: FORM_CONSTANTS.SERVICE_ID_SDH_2_3_BED,
    propertyType: 'Semi-Detached House',
    bedrooms: '2-3 Bed',
    prices: {
      [FORM_CONSTANTS.FREQUENCY_ID_4_WEEKLY]: 20,
      [FORM_CONSTANTS.FREQUENCY_ID_8_WEEKLY]: 23,
      [FORM_CONSTANTS.FREQUENCY_ID_12_WEEKLY]: 25,
      [FORM_CONSTANTS.FREQUENCY_ID_ADHOC]: 40
    }
  },
  // ... rest of options
];

function WindowCleaningPricing() {
  // Use context instead of props
  const {
    formData,
    updateField,
    nextStep,
    setError,
    isLoading
  } = useForm();

  // Memoize price calculations
  const currentPrice = useMemo(() => {
    if (!formData.propertyType || !formData.selectedFrequency) return 0;
    
    const option = WINDOW_CLEANING_OPTIONS.find(
      opt => opt.propertyType === formData.propertyType && 
             opt.bedrooms === formData.bedrooms
    );
    
    return option?.prices[formData.selectedFrequency] || 0;
  }, [formData.propertyType, formData.bedrooms, formData.selectedFrequency]);

  // Update price when it changes
  useEffect(() => {
    if (currentPrice !== formData.initialWindowPrice) {
      updateField('initialWindowPrice', currentPrice);
    }
  }, [currentPrice, formData.initialWindowPrice, updateField]);

  // Handle property selection
  const handlePropertySelection = (propertyType, bedrooms) => {
    updateField('propertyType', propertyType);
    updateField('bedrooms', bedrooms);
    
    // Set form type flags
    if (propertyType === 'Commercial Property') {
      updateField('isCommercial', true);
      updateField('isResidential', false);
    } else if (bedrooms === '6+ Beds') {
      updateField('isCustomQuote', true);
      updateField('isResidential', true);
    } else {
      updateField('isResidential', true);
      updateField('isCustomQuote', false);
      updateField('isCommercial', false);
    }
  };

  // Handle form progression
  const handleNext = () => {
    // Validate current step
    const validation = validateStep(1, formData);
    
    if (!validation.isValid) {
      setError(Object.values(validation.errors).flat().join('. '));
      return;
    }
    
    // Clear any errors
    setError(null);
    
    // Move to next step
    nextStep();
  };

  // Render property options
  const renderPropertyOptions = () => {
    const groupedOptions = WINDOW_CLEANING_OPTIONS.reduce((acc, option) => {
      if (!acc[option.propertyType]) {
        acc[option.propertyType] = [];
      }
      acc[option.propertyType].push(option);
      return acc;
    }, {});

    return Object.entries(groupedOptions).map(([propertyType, options]) => (
      <div key={propertyType} className="property-group mb-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-3">
          {propertyType}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options.map(option => (
            <button
              key={option.id}
              onClick={() => handlePropertySelection(option.propertyType, option.bedrooms)}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                ${
                  formData.propertyType === option.propertyType && 
                  formData.bedrooms === option.bedrooms
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-600 hover:border-gray-500'
                }
              `}
              aria-pressed={
                formData.propertyType === option.propertyType && 
                formData.bedrooms === option.bedrooms
              }
            >
              <div className="text-left">
                <p className="font-medium text-white">{option.bedrooms}</p>
                <p className="text-sm text-gray-400 mt-1">
                  From £{Math.min(...Object.values(option.prices))}/clean
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    ));
  };

  // Render frequency options
  const renderFrequencyOptions = () => {
    if (!formData.isResidential || formData.isCustomQuote) {
      return null;
    }

    const frequencies = [
      { id: FORM_CONSTANTS.FREQUENCY_ID_4_WEEKLY, label: 'Every 4 Weeks', popular: true },
      { id: FORM_CONSTANTS.FREQUENCY_ID_8_WEEKLY, label: 'Every 8 Weeks' },
      { id: FORM_CONSTANTS.FREQUENCY_ID_12_WEEKLY, label: 'Every 12 Weeks' },
      { id: FORM_CONSTANTS.FREQUENCY_ID_ADHOC, label: 'One-off Clean' }
    ];

    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-white mb-4">
          How often would you like your windows cleaned?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {frequencies.map(freq => (
            <button
              key={freq.id}
              onClick={() => updateField('selectedFrequency', freq.id)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                ${
                  formData.selectedFrequency === freq.id
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-600 hover:border-gray-500'
                }
              `}
            >
              {freq.popular && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Popular
                </span>
              )}
              <p className="font-medium text-white">{freq.label}</p>
              {currentPrice > 0 && formData.propertyType && (
                <p className="text-sm text-gray-400 mt-1">
                  £{WINDOW_CLEANING_OPTIONS.find(
                    opt => opt.propertyType === formData.propertyType && 
                           opt.bedrooms === formData.bedrooms
                  )?.prices[freq.id] || 0} per clean
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Step 1 of 4</span>
            <span className="text-sm text-gray-400">Service Selection</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }} />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-3">
            Let's Get Your Windows Sparkling Clean!
          </h2>
          <p className="text-gray-300">
            Select your property type to get started with your quote
          </p>
        </div>

        {/* Property selection */}
        {renderPropertyOptions()}

        {/* Special service options */}
        <div className="mt-8 space-y-3">
          <button
            onClick={() => {
              updateField('propertyType', 'Commercial');
              updateField('isCommercial', true);
              updateField('isResidential', false);
            }}
            className={`
              w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${
                formData.isCommercial
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-gray-600 hover:border-gray-500'
              }
            `}
          >
            <p className="font-medium text-white">Commercial Property</p>
            <p className="text-sm text-gray-400">Get a custom quote for your business</p>
          </button>

          <button
            onClick={() => {
              updateField('propertyType', 'General Enquiry');
              updateField('isGeneralEnquiry', true);
              updateField('isResidential', false);
            }}
            className={`
              w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${
                formData.isGeneralEnquiry
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-gray-600 hover:border-gray-500'
              }
            `}
          >
            <p className="font-medium text-white">Other Services / General Enquiry</p>
            <p className="text-sm text-gray-400">
              Solar panels, one-off cleans, or other services
            </p>
          </button>
        </div>

        {/* Frequency selection */}
        {renderFrequencyOptions()}

        {/* Price display */}
        {currentPrice > 0 && formData.selectedFrequency && (
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-900/30 to-blue-800/30 rounded-lg border border-blue-600">
            <div className="text-center">
              <p className="text-gray-300 mb-2">Your regular price</p>
              <p className="text-4xl font-bold text-white">
                £{currentPrice}
                <span className="text-lg font-normal text-gray-300"> per clean</span>
              </p>
              {formData.selectedFrequency !== FORM_CONSTANTS.FREQUENCY_ID_ADHOC && (
                <p className="text-sm text-gray-400 mt-2">
                  Cancel or pause anytime with no fees
                </p>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button
            disabled
            className="px-6 py-3 text-gray-500 cursor-not-allowed"
          >
            Previous
          </button>
          
          <LoadingButton
            onClick={handleNext}
            loading={isLoading}
            disabled={!formData.propertyType}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
          >
            Next Step →
          </LoadingButton>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Fully Insured</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>100% Satisfaction</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span>3000+ Happy Customers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WindowCleaningPricing;