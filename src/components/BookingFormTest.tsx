/**
 * BookingFormTest - Test version of the booking form with new TypeScript components
 * This version demonstrates the new architecture and components working together
 */

import React, { useState } from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';

// Import our new TypeScript components
import InputField from './forms/InputField';
import SelectField from './forms/SelectField';
import TextareaField from './forms/TextareaField';
import ContactDetailsSection from './sections/ContactDetailsSection';
import BookingReviewSection from './sections/BookingReviewSection';
import ThemeToggle from './ui/ThemeToggle';
import AnimatedButton from './ui/AnimatedButton';
import ProgressIndicator from './ui/ProgressIndicator';

// Import services
import BookingService from '../services/BookingService';
import { FormData } from '../types/booking';

const BookingFormTest: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(BookingService.createInitialFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const totalSteps = 3;
  const stepNames = ['Service Selection', 'Additional Services', 'Contact & Review'];

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    alert('Form submitted! Check console for form data.');
    console.log('Form Data:', formData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Service Selection</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Property Type"
                name="propertyType"
                value={formData.propertyType}
                onChange={(e) => handleFieldChange('propertyType', e.target.value)}
                onBlur={() => handleFieldBlur('propertyType')}
                options={[
                  { value: 'flat', label: 'Flat/Apartment' },
                  { value: 'terraced', label: 'Terraced House' },
                  { value: 'semi-detached', label: 'Semi-Detached House' },
                  { value: 'detached', label: 'Detached House' },
                  { value: 'bungalow', label: 'Bungalow' }
                ]}
                required
                error={errors.propertyType}
                touched={touched.propertyType}
              />

              <SelectField
                label="Number of Bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={(e) => handleFieldChange('bedrooms', e.target.value)}
                onBlur={() => handleFieldBlur('bedrooms')}
                options={[
                  { value: '1', label: '1 Bedroom' },
                  { value: '2', label: '2 Bedrooms' },
                  { value: '3', label: '3 Bedrooms' },
                  { value: '4', label: '4 Bedrooms' },
                  { value: '5+', label: '5+ Bedrooms' }
                ]}
                required
                error={errors.bedrooms}
                touched={touched.bedrooms}
              />
            </div>

            <SelectField
              label="Cleaning Frequency"
              name="selectedFrequency"
              value={formData.selectedFrequency}
              onChange={(e) => handleFieldChange('selectedFrequency', e.target.value)}
              onBlur={() => handleFieldBlur('selectedFrequency')}
              options={[
                { value: '4-weekly', label: 'Every 4 Weeks' },
                { value: '8-weekly', label: 'Every 8 Weeks (Popular)' },
                { value: '12-weekly', label: 'Every 12 Weeks' },
                { value: 'one-off', label: 'One-off Clean' }
              ]}
              required
              error={errors.selectedFrequency}
              touched={touched.selectedFrequency}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Additional Services</h2>
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Optional Add-ons</h3>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.hasConservatory}
                    onChange={(e) => handleFieldChange('hasConservatory', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-white">Conservatory cleaning (+£5)</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.hasExtension}
                    onChange={(e) => handleFieldChange('hasExtension', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-white">Extension cleaning (+£5)</span>
                </label>
              </div>
            </div>

            <TextareaField
              label="Special Instructions"
              name="accessNotes"
              value={formData.accessNotes}
              onChange={(e) => handleFieldChange('accessNotes', e.target.value)}
              onBlur={() => handleFieldBlur('accessNotes')}
              placeholder="Any special access instructions or requirements..."
              rows={3}
              maxLength={500}
              showCharCount
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <ContactDetailsSection
              values={formData}
              errors={errors}
              touched={touched}
              onFieldChange={handleFieldChange}
              onFieldBlur={handleFieldBlur}
            />

            <BookingReviewSection
              values={formData}
              isStandardResidential={formData.isResidential}
              isCommercial={formData.isCommercial}
              isGeneralEnquiry={formData.isGeneralEnquiry}
              isCustomQuote={formData.isCustomQuote}
            />
          </div>
        );

      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 transition-colors duration-300">
        {/* Header with theme toggle */}
        <div className="bg-gray-800/50 border-b border-gray-700">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Window Cleaning Booking System</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">TypeScript + Vite Demo</span>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Progress Indicator */}
          <div className="mb-8">
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={totalSteps}
              stepNames={stepNames}
            />
          </div>

          {/* Form Content */}
          <div className="bg-gray-800/30 rounded-xl p-8 border border-gray-700 backdrop-blur">
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
              <AnimatedButton
                onClick={prevStep}
                disabled={currentStep === 1}
                variant="outline"
                className={currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}
              >
                ← Previous
              </AnimatedButton>

              {currentStep === totalSteps ? (
                <AnimatedButton
                  onClick={handleSubmit}
                  variant="primary"
                  size="lg"
                >
                  Submit Booking 🚀
                </AnimatedButton>
              ) : (
                <AnimatedButton
                  onClick={nextStep}
                  variant="primary"
                >
                  Next →
                </AnimatedButton>
              )}
            </div>
          </div>

          {/* Demo Information */}
          <div className="mt-8 bg-blue-900/30 border border-blue-600 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-blue-300 text-sm">
                <p className="font-medium mb-1">Demo Mode</p>
                <p>This demonstrates the new TypeScript architecture with optimized components, dark mode support, accessibility features, and performance enhancements.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default BookingFormTest;