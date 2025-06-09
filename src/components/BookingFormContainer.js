/**
 * BookingFormContainer - Main orchestrator for the booking form
 * Refactored from BookingForm.js for better separation of concerns
 */

import React, { useState, useCallback } from 'react';
import { sanitizeFormData } from '../utils/sanitization';
import formAnalytics from '../utils/analytics';
import useFormPersistence from '../hooks/useFormPersistence';

// Services
import BookingService from '../services/BookingService.ts';
import EmailTemplateService from '../services/EmailTemplateService.ts';
import FormNavigationService from '../services/FormNavigationService.ts';
import emailService from '../services/emailService';

// Components
import SimpleProgressBar from './SimpleProgressBar';
import WindowCleaningPricing from './WindowCleaningPricing';
import AdditionalServicesForm from './AdditionalServicesForm';
import PropertyDetailsAndReview from './PropertyDetailsAndReview';
import BookingConfirmation from './BookingConfirmation';

const BookingFormContainer = () => {
  // Initialize form data
  const [formData, setFormData] = useFormPersistence('bookingFormData', BookingService.createInitialFormData());
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  /**
   * Generic form change handler
   */
  const genericHandleChange = useCallback((input, inputValue) => {
    setFormData(prevFormData => {
      if (typeof input === 'object') {
        // Handle multiple inputs
        return { ...prevFormData, ...input };
      } else {
        // Handle single input
        return { ...prevFormData, [input]: inputValue };
      }
    });
  }, [setFormData]);

  /**
   * Navigation functions
   */
  const nextStep = useCallback(() => {
    const next = FormNavigationService.getNextStep(currentStep, formData);
    if (next <= 4) {
      setCurrentStep(next);
      formAnalytics.trackStepCompletion(BookingService.getStepName(currentStep), formData);
    }
  }, [currentStep, formData]);

  const prevStep = useCallback(() => {
    const prev = FormNavigationService.getPreviousStep(currentStep, formData);
    if (prev >= 1) {
      setCurrentStep(prev);
    }
  }, [currentStep, formData]);

  const goToStep = useCallback((step) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  }, []);

  /**
   * Form submission handler
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validation = BookingService.validateFormData(formData);
    if (!validation.isValid) {
      setSubmissionError(validation.errors.join(', '));
      return;
    }

    setIsLoading(true);
    setSubmissionError('');

    try {
      // Generate booking reference
      const bookingReference = BookingService.generateBookingReference();
      
      // Calculate final pricing
      const pricing = BookingService.calculatePricing(formData);
      
      // Prepare submission data
      const submissionData = {
        ...formData,
        ...pricing,
        bookingReference,
        submittedAt: new Date().toISOString(),
        isSubmitted: true
      };

      // Sanitize data
      const sanitizedData = sanitizeFormData(submissionData);

      // Map to email template format
      const templateParams = EmailTemplateService.mapFormDataToTemplateParamsSimple(sanitizedData);

      // Submit via email service
      const result = await emailService.submitBooking(templateParams);

      if (result.success) {
        // Update form data with submission details
        setFormData(submissionData);
        
        // Track successful submission
        formAnalytics.trackFormSubmission('success', sanitizedData);
        
        // Go to confirmation step
        setCurrentStep(4);
      } else {
        throw new Error(result.error || 'Submission failed');
      }

    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionError(error.message || 'An unexpected error occurred. Please try again.');
      formAnalytics.trackFormSubmission('error', formData, error.message);
    } finally {
      setIsLoading(false);
    }
  }, [formData, setFormData]);

  /**
   * Render current step
   */
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <WindowCleaningPricing 
            goToStep={goToStep} 
            onFormChange={setFormData} 
            values={formData} 
          />
        );

      case 2:
        return (
          <AdditionalServicesForm 
            nextStep={nextStep} 
            prevStep={prevStep} 
            values={formData} 
            setFormData={setFormData} 
            conservatorySurchargeAmount={BookingService.CONSERVATORY_SURCHARGE} 
            extensionSurchargeAmount={BookingService.EXTENSION_SURCHARGE_AMOUNT} 
          />
        );

      case 3:
        return (
          <PropertyDetailsAndReview 
            prevStep={prevStep} 
            handleChange={genericHandleChange}
            values={formData} 
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            isLoading={isLoading} 
            submissionError={submissionError} 
          />
        );

      case 4:
        return (
          <BookingConfirmation 
            formData={formData}
            onStartNewBooking={() => {
              setFormData(BookingService.createInitialFormData());
              setCurrentStep(1);
              setSubmissionError('');
            }}
          />
        );

      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <>
      {/* Screen reader announcement for form title */}
      <h1 className="sr-only">Somerset Window Cleaning Booking Form</h1>
      
      {/* Progress bar for steps 1-3 */}
      {currentStep <= 3 && (
        <div className="container mx-auto px-6 py-4">
          <SimpleProgressBar currentStep={currentStep} totalSteps={3} />
        </div>
      )}
      
      {/* Render current step */}
      {renderCurrentStep()}
    </>
  );
};

export default BookingFormContainer;