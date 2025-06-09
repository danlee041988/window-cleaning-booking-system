/**
 * BookingFormContainer - Main orchestrator for the booking form (TypeScript)
 * Migrated from JavaScript for better type safety
 */

import React, { useState, useCallback } from 'react';
import { sanitizeFormData } from '../utils/sanitization';
import formAnalytics from '../utils/analytics';
import useFormPersistence from '../hooks/useFormPersistence';

// Services
import BookingService from '../services/BookingService';
import EmailTemplateService from '../services/EmailTemplateService';
import FormNavigationService from '../services/FormNavigationService';
import emailService from '../services/emailService';

// Components
import SimpleProgressBar from './SimpleProgressBar';
import WindowCleaningPricing from './WindowCleaningPricing';
import AdditionalServicesForm from './AdditionalServicesForm';
import PropertyDetailsAndReview from './PropertyDetailsAndReview';
import BookingConfirmation from './BookingConfirmation';

// Types
import { FormData, FormState } from '../types/booking';

const BookingFormContainer: React.FC = () => {
  // Initialize form data with proper typing
  const [formData, setFormData] = useFormPersistence<FormData>(
    'bookingFormData', 
    BookingService.createInitialFormData()
  );
  
  const [formState, setFormState] = useState<FormState>({
    currentStep: 1,
    isLoading: false,
    submissionError: '',
    validationErrors: []
  });

  /**
   * Generic form change handler with proper typing
   */
  const genericHandleChange = useCallback((input: string | Partial<FormData>, inputValue?: any) => {
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
   * Navigation functions with proper error handling
   */
  const nextStep = useCallback(() => {
    const next = FormNavigationService.getNextStep(formState.currentStep, formData);
    if (next <= 4) {
      setFormState(prev => ({ ...prev, currentStep: next }));
      formAnalytics.trackStepCompletion(BookingService.getStepName(formState.currentStep), formData);
    }
  }, [formState.currentStep, formData]);

  const prevStep = useCallback(() => {
    const prev = FormNavigationService.getPreviousStep(formState.currentStep, formData);
    if (prev >= 1) {
      setFormState(prevState => ({ ...prevState, currentStep: prev }));
    }
  }, [formState.currentStep, formData]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 4) {
      setFormState(prev => ({ ...prev, currentStep: step }));
    }
  }, []);

  /**
   * Form submission handler with comprehensive error handling
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = BookingService.validateFormData(formData);
    if (!validation.isValid) {
      setFormState(prev => ({
        ...prev,
        submissionError: validation.errors.join(', '),
        validationErrors: validation.errors
      }));
      return;
    }

    setFormState(prev => ({
      ...prev,
      isLoading: true,
      submissionError: '',
      validationErrors: []
    }));

    try {
      // Generate booking reference
      const bookingReference = BookingService.generateBookingReference();
      
      // Calculate final pricing
      const pricing = BookingService.calculatePricing(formData);
      
      // Prepare submission data
      const submissionData: FormData = {
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
        setFormState(prev => ({ ...prev, currentStep: 4, isLoading: false }));
      } else {
        throw new Error(result.error || 'Submission failed');
      }

    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      
      setFormState(prev => ({
        ...prev,
        submissionError: errorMessage,
        isLoading: false
      }));
      
      formAnalytics.trackFormSubmission('error', formData, errorMessage);
    }
  }, [formData, setFormData]);

  /**
   * Render current step with proper component typing
   */
  const renderCurrentStep = (): JSX.Element => {
    switch (formState.currentStep) {
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
            isLoading={formState.isLoading} 
            submissionError={formState.submissionError} 
          />
        );

      case 4:
        return (
          <BookingConfirmation 
            formData={formData}
            onStartNewBooking={() => {
              setFormData(BookingService.createInitialFormData());
              setFormState({
                currentStep: 1,
                isLoading: false,
                submissionError: '',
                validationErrors: []
              });
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
      {formState.currentStep <= 3 && (
        <div className="container mx-auto px-6 py-4">
          <SimpleProgressBar currentStep={formState.currentStep} totalSteps={3} />
        </div>
      )}
      
      {/* Render current step */}
      {renderCurrentStep()}
    </>
  );
};

export default BookingFormContainer;