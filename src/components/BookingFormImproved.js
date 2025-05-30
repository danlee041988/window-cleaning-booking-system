// Improved, refactored BookingForm component with better architecture
import React, { useState } from 'react';
import { BookingFormProvider, useBookingForm } from '../contexts/BookingFormContext';
import { ToastProvider, useToast } from './common/Toast';
import FormProgress from './common/FormProgress';
import { LoadingSpinner } from './common/LoadingSpinner';
import FormValidation from './common/FormValidation';
import emailService from '../services/emailService';

// Import step components
import WindowCleaningPricing from './WindowCleaningPricing';
import AdditionalServicesForm from './AdditionalServicesForm';
import PropertyDetailsForm from './PropertyDetailsForm';
import ReviewSubmitForm from './ReviewSubmitForm';

// Import mapping function from original component
import { mapFormDataToTemplateParams } from './BookingForm';

// Constants
const CONSERVATORY_SURCHARGE = 5;
const EXTENSION_SURCHARGE_AMOUNT = 5;
const TOTAL_STEPS = 5;

// Success/Confirmation page component
const ConfirmationPage = ({ onNewBooking, formData, submissionError, onRetry }) => {
  const toast = useToast();

  const getEnquiryOrBookingText = (isQuoteOrEnquiry) => {
    return isQuoteOrEnquiry ? "enquiry" : "booking";
  };

  const isQuoteOrEnquiry = formData.isCommercial || formData.isCustomQuote || formData.isGeneralEnquiry;

  if (submissionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl p-8 border border-gray-700 text-center">
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
              onClick={onRetry}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Try Again
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl p-8 border border-gray-700 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-6">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h2 className="text-4xl font-bold text-green-400 mb-4">Thank You!</h2>
          
          <div className="mb-8">
            <p className="text-gray-200 text-xl mb-4 leading-relaxed">
              Your <span className="text-blue-300 font-semibold">{getEnquiryOrBookingText(isQuoteOrEnquiry)}</span> has been submitted successfully.
            </p>
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
                <p>We'll review your {getEnquiryOrBookingText(isQuoteOrEnquiry)}</p>
              </div>
              <div className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full mr-3 mt-0.5 flex-shrink-0">2</span>
                <p>We'll contact you via your preferred method to confirm details</p>
              </div>
              <div className="flex items-start">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full mr-3 mt-0.5 flex-shrink-0">3</span>
                <p>
                  {isQuoteOrEnquiry 
                    ? "We'll provide you with a detailed, personalized quote"
                    : "We'll confirm your booking and provide service details"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Direct Debit Signup Option - Only show for confirmed bookings with pricing */}
          {!isQuoteOrEnquiry && formData.grandTotal > 0 && (
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
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg mb-3"
                  onClick={() => toast.info('Opening Direct Debit setup page...')}
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
            onClick={onNewBooking}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Make Another Enquiry
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Main form controller component
const BookingFormController = () => {
  const { formData, setFormData, resetForm } = useBookingForm();
  const toast = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Navigation functions
  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const goToStep = (stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= TOTAL_STEPS) {
      setCurrentStep(stepNumber);
      window.scrollTo(0, 0);
    }
  };

  // Enhanced form submission with better error handling
  const handleSubmit = async (formDataToSubmit) => {
    setIsLoading(true);
    setSubmissionError(null);

    try {
      // Validate form data
      const validation = FormValidation.validateFormData(formDataToSubmit);
      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors).join(', ');
        throw new Error(`Please correct the following: ${errorMessages}`);
      }

      // Prepare template parameters
      const templateParams = mapFormDataToTemplateParams(formDataToSubmit);

      // Submit via email service
      const result = await emailService.sendBooking(formDataToSubmit, templateParams);

      if (result.success) {
        setIsSubmitted(true);
        setCurrentStep(5);
        toast.success('Your booking has been submitted successfully!');
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmissionError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle retry after submission failure
  const handleRetry = () => {
    setSubmissionError(null);
    setCurrentStep(4);
  };

  // Handle new booking
  const handleNewBooking = () => {
    resetForm();
    setCurrentStep(1);
    setIsSubmitted(false);
    setSubmissionError(null);
    toast.info('Starting a new booking...');
  };

  // Enhanced generic change handler with validation
  const genericHandleChange = (input) => (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;

    setFormData(prevFormData => {
      const keys = input.split('.');
      if (keys.length === 1) {
        return { ...prevFormData, [input]: inputValue };
      }

      // Handle nested properties
      let updatedState = { ...prevFormData };
      let currentLevel = updatedState;

      for (let i = 0; i < keys.length - 1; i++) {
        currentLevel[keys[i]] = { ...currentLevel[keys[i]] };
        currentLevel = currentLevel[keys[i]];
      }
      currentLevel[keys[keys.length - 1]] = inputValue;
      return updatedState;
    });
  };

  // Step labels for progress indicator
  const stepLabels = [
    'Service Selection',
    'Additional Services',
    'Contact Details', 
    'Review & Submit',
    'Confirmation'
  ];

  // Render current step
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
            conservatorySurchargeAmount={CONSERVATORY_SURCHARGE} 
            extensionSurchargeAmount={EXTENSION_SURCHARGE_AMOUNT}
          />
        );
        
      case 3:
        return (
          <PropertyDetailsForm 
            nextStep={nextStep} 
            prevStep={prevStep} 
            handleChange={genericHandleChange} 
            values={formData} 
            setFormData={setFormData} 
            goToStep={goToStep}
          />
        );
        
      case 4:
        return (
          <ReviewSubmitForm 
            prevStep={prevStep} 
            values={formData} 
            handleSubmit={handleSubmit} 
            setFormData={setFormData}
            isLoading={isLoading} 
            submissionError={submissionError}
          />
        );
        
      case 5:
        return (
          <ConfirmationPage
            onNewBooking={handleNewBooking}
            formData={formData}
            submissionError={submissionError}
            onRetry={handleRetry}
          />
        );
        
      default:
        return (
          <WindowCleaningPricing 
            goToStep={goToStep} 
            onFormChange={setFormData} 
            values={formData} 
          />
        );
    }
  };

  // Show loading overlay for full-page loading states
  if (isLoading && currentStep === 4) {
    return (
      <LoadingSpinner 
        message="Submitting your booking..." 
        fullScreen={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="container mx-auto px-6 py-8">
        {/* Only show progress on steps 1-4 */}
        {currentStep <= 4 && (
          <FormProgress 
            currentStep={currentStep} 
            totalSteps={4} 
            stepLabels={stepLabels.slice(0, 4)} 
          />
        )}
        
        {/* Render current step */}
        {renderCurrentStep()}
      </div>
    </div>
  );
};

// Main component with providers
const BookingFormImproved = () => {
  return (
    <ToastProvider>
      <BookingFormProvider>
        <BookingFormController />
      </BookingFormProvider>
    </ToastProvider>
  );
};

export default BookingFormImproved;