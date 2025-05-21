// Main parent component for the multi-step booking form
import React, { useState } from 'react';
import emailjs from '@emailjs/browser'; // Added import for emailjs
import WindowCleaningPricing from './WindowCleaningPricing';
import PropertyDetailsForm from './PropertyDetailsForm';
import AdditionalServicesForm from './AdditionalServicesForm';
import ReviewSubmitForm from './ReviewSubmitForm';

// Define the conservatory surcharge globally or pass as prop if it can vary
const CONSERVATORY_SURCHARGE = 5;
const EXTENSION_SURCHARGE_AMOUNT = 5; // New constant for extension surcharge

// Placeholder: Implement this function to map your formData to EmailJS template params
const mapFormDataToTemplateParams = (formData) => {
  console.log("Mapping formData to template params:", formData);
  // This is just an example, you need to structure this based on your EmailJS template
  return {
    from_name: formData.customerName,
    to_name: "Admin", // Or your name
    message: JSON.stringify(formData, null, 2), // Example: send all data as JSON
    reply_to: formData.email,
    // ... add other parameters your EmailJS template expects
  };
};

// Placeholder: Implement this function to return "enquiry" or "booking" text
const getEnquiryOrBookingText = (isQuoteOrEnquiry) => {
  return isQuoteOrEnquiry ? "enquiry" : "booking";
};

function BookingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // From WindowCleaningPricing (Step 1)
    propertyType: '',
    bedrooms: '',
    selectedFrequency: '',
    initialWindowPrice: 0, // Price from step 1 before any step 2 adjustments
    selectedWindowService: null, // Raw selection object from step 1, for reference

    isCustomQuote: false,
    isCommercial: false,
    isResidential: false, // True if standard residential path from step 1
    isGeneralEnquiry: false, // ADDED: True if general enquiry path from step 1

    // From AdditionalServicesForm (New Step 2)
    hasConservatory: false, // Boolean for conservatory presence
    hasExtension: false, // <-- New state for extension
    // additionalServices will store selections like { gutterClearing: true, fasciaSoffitGutter: true }
    additionalServices: { 
        // Note: conservatoryRoof is a separate service from just having a conservatory
        conservatoryRoof: false, // This was from old AdditionalServicesForm, keep for now or remove if not needed
        fasciaSoffitGutter: false,
        gutterClearing: false,
    },
    windowCleaningDiscount: 0, // Amount of discount from free window clean offer

    // Calculated totals, updated primarily by AdditionalServicesForm or at review
    subTotalBeforeDiscount: 0, 
    conservatorySurcharge: 0, // This is already calculated in AdditionalServicesForm
    extensionSurcharge: 0, // <-- New state for extension surcharge amount
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
    selectedDate: null, // For standard residential bookings

    // For Custom Residential Quote (collected in PropertyDetailsForm)
    customResidentialDetails: {
        exactBedrooms: '', // Can still be useful for context if they know it
        approxWindows: '',
        accessIssues: '',
        // New structured fields for custom residential quotes
        propertyStyle: '', // e.g., 'detached', 'semiDetached', 'terraced', 'bungalow', 'apartment', 'otherCustomProperty'
        otherPropertyStyleText: '',
        servicesRequested: { 
            windowCleaning: false,
            gutterCleaning: false,
            fasciaSoffitCleaning: false,
            conservatoryWindowCleaning: false, // NEW: For conservatory sides
            conservatoryRoofCleaning: false,   // NEW: Specifically for conservatory roof
            other: false,
        },
        otherServiceText: '',
        frequencyPreference: '', // Conditional on windowCleaning service
        otherFrequencyText: '',
        otherNotes: '', // Keep for any other details not covered
        customAdditionalComments: '' // Kept, can be used for further specific notes
    },

    // For Commercial Enquiry (collected in PropertyDetailsForm)
    commercialDetails: {
        businessName: '',
        propertyType: '', // e.g., office, shop, warehouse
        approxSizeOrWindows: '',
        specificRequirements: '', // General notes field
        // NEW fields for commercial service and frequency
        servicesRequested: {
            windowCleaning: false,
            gutterCleaning: false,
            fasciaSoffitCleaning: false, // Combined for simplicity, can be separate
            claddingCleaning: false,
            signageCleaning: false,
            other: false,
        },
        otherServiceText: '',
        frequencyPreference: '', // e.g., 'weekly', 'monthly', 'one-off', 'other'
        otherFrequencyText: '',
        otherNotes: '' // Kept existing otherNotes, can be used for general comments if specificRequirements is too narrow
    },
    generalEnquiryDetails: { // ADDED for General Enquiry Path
        requestedServices: { // Flags for common services
            windowCleaning: false,
            conservatoryWindows: false,
            conservatoryRoof: false,
            gutterClearing: false,
            fasciaSoffitGutter: false,
            solarPanels: false,
            other: false, // Flag to indicate if 'otherServiceText' is used
        },
        otherServiceText: '', // Text for "Other" service
        requestedFrequency: '', // e.g., 'oneOff', '4weekly'
        enquiryComments: ''    // General comments for the enquiry
    },
    bookingNotes: '', // ADDED: General notes for standard/custom/commercial bookings
    recaptchaToken: '' // ADDED for reCAPTCHA
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Generic handleChange for simple inputs, used by PropertyDetailsForm
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
            currentLevel[keys[i]] = { ...currentLevel[keys[i]] }; // Create new objects for each level
            currentLevel = currentLevel[keys[i]];
        }
        currentLevel[keys[keys.length - 1]] = inputValue;
        return updatedState;
    });
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);
  const goToStep = (stepNumber) => setCurrentStep(stepNumber);

  // Moved handleSubmit inside BookingForm component
  const handleSubmit = async (formDataToSubmit) => {
    if (!formDataToSubmit.recaptchaToken) { 
      setSubmissionError("Please complete the reCAPTCHA verification.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setSubmissionError(null);

    const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    const userId = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !userId) {
      console.error("EmailJS environment variables are not set correctly. Ensure SERVICE_ID, TEMPLATE_ID, and PUBLIC_KEY (formerly USER_ID) are defined.");
      setSubmissionError("Email configuration error. Please contact support.");
      setIsLoading(false);
      return;
    }
    
    const templateParams = mapFormDataToTemplateParams(formDataToSubmit);

    try {
      await emailjs.send(serviceId, templateId, templateParams, userId);
      setIsSubmitted(true);
      setCurrentStep(5); // Assuming 5 is your thank you/confirmation step
    } catch (error) {
      console.error('Email FAILED...', error);
      // Determine if it was a quote/enquiry or a booking for the error message
      const typeOfSubmission = formDataToSubmit.isCommercial || formDataToSubmit.isCustomQuote || formDataToSubmit.isGeneralEnquiry;
      setSubmissionError(`An error occurred while submitting your ${getEnquiryOrBookingText(typeOfSubmission)}. Please try again or contact us directly.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Render steps based on currentStep
  // Pass CONSERVATORY_SURCHARGE to AdditionalServicesForm
  switch (currentStep) {
    case 1:
      return <WindowCleaningPricing goToStep={goToStep} onFormChange={setFormData} values={formData} />;
    case 2: // New: Additional Services (standard residential path only)
      return <AdditionalServicesForm 
                nextStep={nextStep} 
                prevStep={prevStep} 
                values={formData} 
                setFormData={setFormData} 
                conservatorySurchargeAmount={CONSERVATORY_SURCHARGE} 
                extensionSurchargeAmount={EXTENSION_SURCHARGE_AMOUNT} // Pass new surcharge amount
             />;
    case 3: // New: Property Details (contact, date for standard, quote specifics for custom/commercial)
      return <PropertyDetailsForm nextStep={nextStep} prevStep={prevStep} handleChange={genericHandleChange} values={formData} setFormData={setFormData} goToStep={goToStep} /* conservatorySurcharge prop was here, might not be needed if not used directly by PropertyDetailsForm for display, ensure it's passed if needed */ />;
    case 4: 
      return <ReviewSubmitForm 
                prevStep={prevStep} 
                values={formData} 
                handleSubmit={handleSubmit} 
                setFormData={setFormData} // Pass setFormData for reCAPTCHA token
                isLoading={isLoading} 
                submissionError={submissionError} 
             />;
    case 5: // Placeholder for a Thank You / Confirmation page/component
      return (
        <div className="text-center p-10 bg-white shadow-lg rounded-lg">
          {submissionError ? (
            <>
              <h2 className="text-2xl font-semibold text-red-600 mb-4">Submission Failed</h2>
              <p className="text-gray-700 mb-4">{submissionError}</p>
              <button 
                onClick={() => { setCurrentStep(4); setSubmissionError(null); }} 
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-green-600 mb-4">Thank You!</h2>
              <p className="text-gray-700 mb-6">
                Your {getEnquiryOrBookingText(formData.isCommercial || formData.isCustomQuote || formData.isGeneralEnquiry)} has been submitted successfully.
                 We will be in touch shortly.
              </p>
              <button 
                onClick={() => { 
                    setCurrentStep(1); 
                    setIsSubmitted(false); 
                    setFormData({ /* TODO: Reset formData to its complete initial state here */ 
                        propertyType: '', bedrooms: '', selectedFrequency: '', initialWindowPrice: 0, selectedWindowService: null,
                        isCustomQuote: false, isCommercial: false, isResidential: false, isGeneralEnquiry: false,
                        hasConservatory: false, hasExtension: false, additionalServices: { conservatoryRoof: false, fasciaSoffitGutter: false, gutterClearing: false, solarPanels: false }, // Assuming solarPanels was part of additionalServices object
                        additionalServicesDetail: { conservatoryRoof: { selected: false, frequency: 'oneOff', price: 0, panels: 10 }, gutterClearing: { selected: false, frequency: 'oneOff', price: 0 }, fasciaSoffitGutter: { selected: false, frequency: 'oneOff', price: 0 }, solarPanels: { selected: false, frequency: 'oneOff', price: 0, count: 10 } },
                        windowCleaningDiscount: 0, subTotalBeforeDiscount: 0, conservatorySurcharge: 0, extensionSurcharge: 0, grandTotal: 0,
                        customerName: '', addressLine1: '', addressLine2: '', townCity: '', postcode: '', mobile: '', email: '', preferredContactMethod: 'email', selectedDate: null,
                        customResidentialDetails: { 
                            exactBedrooms: '', approxWindows: '', accessIssues: '', 
                            propertyStyle: '', otherPropertyStyleText: '',
                            servicesRequested: { windowCleaning: false, gutterCleaning: false, fasciaSoffitCleaning: false, conservatoryWindowCleaning: false, conservatoryRoofCleaning: false, other: false },
                            otherServiceText: '',
                            frequencyPreference: '', otherFrequencyText: '',
                            otherNotes: '', customAdditionalComments: '' 
                        },
                        commercialDetails: { 
                            businessName: '', propertyType: '', approxSizeOrWindows: '', specificRequirements: '', 
                            servicesRequested: { windowCleaning: false, gutterCleaning: false, fasciaSoffitCleaning: false, claddingCleaning: false, signageCleaning: false, other: false },
                            otherServiceText: '',
                            frequencyPreference: '',
                            otherFrequencyText: '',
                            otherNotes: '' 
                        },
                        generalEnquiryDetails: { requestedServices: { windowCleaning: false, conservatoryWindows: false, conservatoryRoof: false, gutterClearing: false, fasciaSoffitGutter: false, solarPanels: false, other: false }, otherServiceText: '', requestedFrequency: '', enquiryComments: '' },
                        bookingNotes: '',
                        recaptchaToken: ''
                    }); 
                }} 
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Make Another Enquiry
              </button>
            </>
          )}
        </div>
      );
    default:
      return <WindowCleaningPricing goToStep={goToStep} onFormChange={setFormData} values={formData} />;
  }
}

export default BookingForm;
