// Enhanced BookingForm with all improvements implemented
import React, { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import emailjs from '@emailjs/browser';
import * as FORM_CONSTANTS from '../constants/formConstants';

// Components
import WindowCleaningPricing from './WindowCleaningPricing';
import AdditionalServicesForm from './AdditionalServicesForm';
import SimpleProgressBar from './SimpleProgressBar';
import ErrorBoundary from './common/ErrorBoundary';
import { FormSkeleton, LoadingOverlay } from './common/SkeletonLoader';

// Enhanced hooks
import { useSafeState, useAsyncSafeState, useSafeTimeout } from '../hooks/useSafeState';
import useFormPersistenceEnhanced from '../hooks/useFormPersistenceEnhanced';
import { useFieldValidation, useFormSubmit } from '../hooks/useFieldValidation';

// Utilities
import { deepClone, updateNestedState, debounce } from '../utils/stateUtils';

// Lazy load heavy components
const PropertyDetailsAndReview = lazy(() => import('./PropertyDetailsAndReview'));

// Constants
const CONSERVATORY_SURCHARGE = 5;
const EXTENSION_SURCHARGE_AMOUNT = 5;

const initialFormData = {
    // From WindowCleaningPricing (Step 1)
    propertyType: '',
    bedrooms: '',
    selectedFrequency: '',
    initialWindowPrice: 0,
    selectedWindowService: null,

    isCustomQuote: false,
    isCommercial: false,
    isResidential: false,
    isGeneralEnquiry: false,

    // From AdditionalServicesForm (New Step 2)
    hasConservatory: false,
    hasExtension: false,
    additionalServices: {
        [FORM_CONSTANTS.ADDON_CONSERVATORY_ROOF]: false,
        [FORM_CONSTANTS.ADDON_FASCIA_SOFFIT_GUTTER]: false,
        [FORM_CONSTANTS.ADDON_GUTTER_CLEARING]: false,
    },
    gutterClearingServicePrice: 0,
    fasciaSoffitGutterServicePrice: 0,
    windowCleaningDiscount: 0,

    // Calculated totals
    subTotalBeforeDiscount: 0,
    conservatorySurcharge: 0,
    extensionSurcharge: 0,
    grandTotal: 0,

    // Contact & Quote Details (Step 3 - PropertyDetailsForm)
    customerName: '',
    addressLine1: '',
    addressLine2: '',
    townCity: '',
    postcode: '',
    mobile: '',
    email: '',
    preferredContactMethod: 'email',
    selectedDate: null,

    // For Custom Residential Quote
    customResidentialDetails: {
        exactBedrooms: '',
        approxWindows: '',
        accessIssues: '',
        propertyStyle: '',
        otherPropertyStyleText: '',
        servicesRequested: {
            [FORM_CONSTANTS.CUSTOM_RES_SERVICE_WINDOW_CLEANING]: false,
            [FORM_CONSTANTS.CUSTOM_RES_SERVICE_GUTTER_CLEANING]: false,
            [FORM_CONSTANTS.CUSTOM_RES_SERVICE_FASCIA_SOFFIT_CLEANING]: false,
            [FORM_CONSTANTS.CUSTOM_RES_SERVICE_CONSERVATORY_WINDOW_CLEANING]: false,
            [FORM_CONSTANTS.CUSTOM_RES_SERVICE_CONSERVATORY_ROOF_CLEANING]: false,
            [FORM_CONSTANTS.CUSTOM_RES_SERVICE_OTHER]: false,
        },
        otherServiceText: '',
        frequencyPreference: '',
        otherFrequencyText: '',
        otherNotes: '',
        customAdditionalComments: ''
    },

    // For Commercial Enquiry
    commercialDetails: {
        businessName: '',
        propertyType: '',
        approxSizeOrWindows: '',
        specificRequirements: '',
        
        // New services structure with individual services
        services: {
            windowCleaning: false,
            gutterClearing: false,
            fasciaSoffit: false,
            solarPanels: false,
            pressureWashing: false,
            other: false
        },
        
        // Individual frequencies for each service
        frequencies: {
            windowCleaning: '',
            gutterClearing: '',
            fasciaSoffit: '',
            solarPanels: '',
            pressureWashing: '',
            other: ''
        },
        
        // Details for other services
        otherServiceDetails: '',
        
        // Legacy fields for backward compatibility
        servicesRequested: {
            [FORM_CONSTANTS.COMM_SERVICE_WINDOW_CLEANING]: false,
            [FORM_CONSTANTS.COMM_SERVICE_GUTTER_CLEANING]: false,
            [FORM_CONSTANTS.COMM_SERVICE_FASCIA_SOFFIT_CLEANING]: false,
            [FORM_CONSTANTS.COMM_SERVICE_CLADDING_CLEANING]: false,
            [FORM_CONSTANTS.COMM_SERVICE_SIGNAGE_CLEANING]: false,
            [FORM_CONSTANTS.COMM_SERVICE_OTHER]: false,
        },
        otherServiceText: '',
        frequencyPreference: '',
        otherFrequencyText: '',
        otherNotes: ''
    },
    // For General Enquiry
    generalEnquiryDetails: {
        requestedServices: {
            [FORM_CONSTANTS.GEN_ENQ_SERVICE_WINDOW_CLEANING]: false,
            [FORM_CONSTANTS.GEN_ENQ_SERVICE_CONSERVATORY_WINDOWS]: false,
            [FORM_CONSTANTS.ADDON_CONSERVATORY_ROOF]: false,
            [FORM_CONSTANTS.ADDON_GUTTER_CLEARING]: false,
            [FORM_CONSTANTS.ADDON_FASCIA_SOFFIT_GUTTER]: false,
            [FORM_CONSTANTS.GEN_ENQ_SERVICE_SOLAR_PANELS]: false,
            [FORM_CONSTANTS.GEN_ENQ_SERVICE_OTHER]: false,
        },
        otherServiceText: '',
        requestedFrequency: '',
        enquiryComments: '',
        customerStatus: ''
    },
    bookingNotes: '',
    recaptchaToken: '',
    
    // Quote requests for services requiring physical assessment
    quoteRequests: {
        [FORM_CONSTANTS.QUOTE_REQUEST_SOLAR_PANEL_CLEANING]: false,
        [FORM_CONSTANTS.QUOTE_REQUEST_CONSERVATORY_ROOF_CLEANING]: false
    }
};

// Import template mapping functions from original
import { mapFormDataToTemplateParamsSimple, mapFormDataToTemplateParams } from './BookingForm';

// Helper function for booking type
const getEnquiryOrBookingText = (isQuoteOrEnquiry) => {
  return isQuoteOrEnquiry ? "enquiry" : "booking";
};

// Analytics tracking helper
const trackFormEvent = (eventName, data = {}) => {
  try {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'BookingForm',
        ...data
      });
    }
    
    // Custom analytics endpoint (if available)
    if (process.env.REACT_APP_ANALYTICS_ENDPOINT) {
      fetch(process.env.REACT_APP_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventName,
          data,
          timestamp: Date.now(),
          session_id: sessionStorage.getItem('booking_session_id') || 'unknown'
        })
      }).catch(err => console.error('Analytics error:', err));
    }
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

function BookingFormEnhanced() {
  // Safe state management
  const [currentStep, setCurrentStep] = useSafeState(1);
  const [formData, setFormData] = useSafeState(initialFormData);
  const [isLoading, setIsLoading] = useSafeState(false);
  const [submissionError, setSubmissionError] = useSafeState(null);
  
  // Refs for cleanup
  const isMountedRef = useRef(true);
  const navigationTimeoutRef = useRef(null);
  const stepStartTimeRef = useRef(Date.now());
  
  // Enhanced hooks
  const { executeAsync } = useAsyncSafeState();
  const { setSafeTimeout, clearSafeTimeout } = useSafeTimeout();
  const { clearSavedData, getSavedDataInfo } = useFormPersistenceEnhanced(formData, setFormData, initialFormData);
  
  // Session tracking
  useEffect(() => {
    if (!sessionStorage.getItem('booking_session_id')) {
      sessionStorage.setItem('booking_session_id', Date.now().toString(36));
    }
    
    return () => {
      isMountedRef.current = false;
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  // Track step changes
  useEffect(() => {
    const timeSpent = Date.now() - stepStartTimeRef.current;
    trackFormEvent('step_viewed', {
      step: currentStep,
      previous_step: currentStep > 1 ? currentStep - 1 : null,
      time_spent: timeSpent
    });
    
    stepStartTimeRef.current = Date.now();
  }, [currentStep]);

  // Enhanced handleChange with immutable updates
  const genericHandleChange = useCallback((input) => (e) => {
    const { value, type, checked } = e.target;
    let inputValue = type === 'checkbox' ? checked : value;
    
    // Special handling for postcode
    if (input === 'postcode' && typeof inputValue === 'string') {
      inputValue = inputValue.toUpperCase().trim();
    }

    setFormData(prevFormData => {
      // Use immutable update utility
      if (input.includes('.')) {
        return updateNestedState(prevFormData, input, inputValue);
      } else {
        return { ...deepClone(prevFormData), [input]: inputValue };
      }
    });
  }, [setFormData]);

  // Safe navigation with cleanup
  const navigateToStep = useCallback((stepNumber) => {
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    
    navigationTimeoutRef.current = setSafeTimeout(() => {
      setCurrentStep(stepNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  }, [setCurrentStep, setSafeTimeout]);

  const nextStep = useCallback(() => {
    navigateToStep(currentStep + 1);
  }, [currentStep, navigateToStep]);

  const prevStep = useCallback(() => {
    navigateToStep(currentStep - 1);
  }, [currentStep, navigateToStep]);

  const goToStep = useCallback((stepNumber) => {
    navigateToStep(stepNumber);
  }, [navigateToStep]);

  // Enhanced submit handler with proper error handling
  const handleSubmit = useCallback(async (formDataToSubmit) => {
    if (!formDataToSubmit.recaptchaToken) { 
      setSubmissionError("Please complete the reCAPTCHA verification.");
      return;
    }
    
    setIsLoading(true);
    setSubmissionError(null);

    await executeAsync(
      async (signal) => {
        const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
        const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
        const userId = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

        console.log('Sending booking via EmailJS...');
        
        if (!serviceId || !templateId || !userId) {
          throw new Error('Email service not configured. Please check environment variables.');
        }

        const templateParams = mapFormDataToTemplateParamsSimple(formDataToSubmit);
        
        // Generate booking reference
        const bookingRef = `SWC${Date.now().toString(36).toUpperCase().slice(-6)}`;
        templateParams.bookingReference = bookingRef;
        templateParams.timestamp = new Date().toLocaleString('en-GB', { 
          dateStyle: 'full', 
          timeStyle: 'short' 
        });
        
        // Send with timeout
        const emailPromise = emailjs.send(serviceId, templateId, templateParams, userId);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), 30000)
        );
        
        await Promise.race([emailPromise, timeoutPromise]);
        
        console.log('Email sent successfully!');
        
        // Track successful submission
        trackFormEvent('form_submitted', {
          booking_type: templateParams.bookingTypeDisplay,
          has_pricing: formDataToSubmit.grandTotal > 0
        });
        
        return bookingRef;
      },
      (bookingRef) => {
        // Success callback
        setFormData(prev => ({ ...prev, bookingReference: bookingRef, isSubmitted: true }));
        setCurrentStep(4);
        clearSavedData();
      },
      (error) => {
        // Error callback
        console.error('Booking submission failed:', error);
        const typeOfSubmission = formDataToSubmit.isCommercial || 
                                formDataToSubmit.isCustomQuote || 
                                formDataToSubmit.isGeneralEnquiry;
        
        setSubmissionError(
          `An error occurred while submitting your ${
            getEnquiryOrBookingText(typeOfSubmission)
          }. Please try again or contact us directly.`
        );
        
        trackFormEvent('form_error', {
          error_type: 'submission_failed',
          error_message: error.message
        });
      }
    );

    setIsLoading(false);
  }, [executeAsync, setFormData, setCurrentStep, setIsLoading, setSubmissionError, clearSavedData]);

  // Check for saved data on mount
  useEffect(() => {
    const savedInfo = getSavedDataInfo();
    if (savedInfo?.hasData) {
      console.log('Found saved form data from', new Date(savedInfo.timestamp));
    }
  }, [getSavedDataInfo]);

  // Render steps with loading states
  const renderStep = () => {
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
            conservatorySurchargeAmount={CONSERVATORY_SURCHARGE} 
            extensionSurchargeAmount={EXTENSION_SURCHARGE_AMOUNT}
          />
        );
        
      case 3:
        return (
          <Suspense fallback={<FormSkeleton />}>
            <PropertyDetailsAndReview 
              prevStep={prevStep} 
              handleChange={genericHandleChange}
              values={formData} 
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              isLoading={isLoading} 
              submissionError={submissionError} 
            />
          </Suspense>
        );
        
      case 4:
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
            <div className="container mx-auto px-6 py-12">
              <div className="max-w-2xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl p-8 border border-gray-700 text-center">
                {!formData.isSubmitted && submissionError ? (
                  <>
                    {/* Error State */}
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-full mb-6">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-red-400 mb-4">Submission Failed</h2>
                    <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                      We're sorry, but there was an issue submitting your request. Please try again.
                    </p>
                    <div className="p-4 bg-red-900/30 border border-red-600 rounded-lg mb-8">
                      <p className="text-red-300 text-sm">{submissionError}</p>
                    </div>
                    <button 
                      onClick={() => { 
                        setCurrentStep(3); 
                        setSubmissionError(null); 
                      }} 
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg min-h-[44px]"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Try Again
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Success State */}
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-6">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    
                    <h2 className="text-4xl font-bold text-green-400 mb-4">Thank You!</h2>
                    
                    <div className="mb-8">
                      <p className="text-gray-200 text-xl mb-4 leading-relaxed">
                        Your <span className="text-blue-300 font-semibold">
                          {getEnquiryOrBookingText(formData.isCommercial || formData.isCustomQuote || formData.isGeneralEnquiry)}
                        </span> has been submitted successfully.
                      </p>
                      {formData.bookingReference && (
                        <p className="text-gray-300 text-lg mb-2">
                          Reference: <span className="font-mono text-blue-300">{formData.bookingReference}</span>
                        </p>
                      )}
                      <p className="text-gray-400 text-lg">
                        We will be in touch shortly to confirm the details and arrange your service.
                      </p>
                    </div>

                    {/* Decorative divider */}
                    <div className="flex items-center justify-center mb-8">
                      <div className="h-px bg-gradient-to-r from-transparent via-green-500 to-transparent w-32"></div>
                      <div className="mx-4 w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="h-px bg-gradient-to-r from-transparent via-green-500 to-transparent w-32"></div>
                    </div>

                    {/* Next Steps Info */}
                    <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-600 rounded-lg p-6 mb-8">
                      <h3 className="text-xl font-semibold text-blue-300 mb-3">What happens next?</h3>
                      <div className="text-left space-y-3 text-gray-300">
                        <div className="flex items-start">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full mr-3 mt-0.5 flex-shrink-0">1</span>
                          <p>We'll review your {getEnquiryOrBookingText(formData.isCommercial || formData.isCustomQuote || formData.isGeneralEnquiry)}</p>
                        </div>
                        <div className="flex items-start">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full mr-3 mt-0.5 flex-shrink-0">2</span>
                          <p>We'll contact you via your preferred method to confirm details</p>
                        </div>
                        <div className="flex items-start">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full mr-3 mt-0.5 flex-shrink-0">3</span>
                          <p>
                            {formData.isCommercial || formData.isCustomQuote || formData.isGeneralEnquiry 
                              ? "We'll provide you with a detailed, personalized quote"
                              : "We'll confirm your booking and provide service details"
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Direct Debit Signup Option - Only show for confirmed bookings with pricing */}
                    {!formData.isCommercial && !formData.isCustomQuote && !formData.isGeneralEnquiry && formData.grandTotal > 0 && (
                      <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-600 rounded-lg p-6 mb-8">
                        <div className="text-center mb-4">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-full mb-3">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-green-300 mb-2">Set Up Direct Debit for Easy Payments</h3>
                          <p className="text-gray-300 text-sm mb-4">Save time and never miss a payment with our secure Direct Debit service</p>
                        </div>
                        
                        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                          <h4 className="text-green-400 font-semibold mb-2">Why choose Direct Debit?</h4>
                          <ul className="text-gray-300 text-sm space-y-1">
                            <li>• Automatic payments - no need to remember due dates</li>
                            <li>• Protected by the Direct Debit Guarantee</li>
                            <li>• Easy to cancel anytime with no fees</li>
                            <li>• No more missed payments or late fees</li>
                            <li>• Secure and regulated by UK banking standards</li>
                          </ul>
                        </div>
                        
                        <div className="text-center">
                          <a 
                            href="https://pay.gocardless.com/BRT0002EH17JGWX" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={() => trackFormEvent('direct_debit_clicked')}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg mb-3 min-h-[44px]"
                          >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Set Up Direct Debit Now
                          </a>
                          <p className="text-gray-400 text-xs">
                            Optional - you can always pay manually if you prefer
                          </p>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => {
                        setCurrentStep(1);
                        setFormData(initialFormData);
                        trackFormEvent('new_booking_started');
                      }} 
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg min-h-[44px]"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Make Another Enquiry
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
        
      default:
        return <WindowCleaningPricing goToStep={goToStep} onFormChange={setFormData} values={formData} />;
    }
  };

  return (
    <ErrorBoundary>
      <LoadingOverlay isLoading={isLoading && currentStep === 3}>
        <>
          {/* Progress bar for steps 1-3 */}
          {currentStep <= 3 && (
            <div className="container mx-auto px-4 sm:px-6 py-4">
              <SimpleProgressBar currentStep={currentStep} totalSteps={3} />
            </div>
          )}
          
          {/* Render current step */}
          {renderStep()}
        </>
      </LoadingOverlay>
    </ErrorBoundary>
  );
}

export default BookingFormEnhanced;