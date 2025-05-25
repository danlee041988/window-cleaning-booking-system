// Main parent component for the multi-step booking form
import React, { useState } from 'react';
import emailjs from '@emailjs/browser'; // Added import for emailjs
import * as FORM_CONSTANTS from '../constants/formConstants'; // Import constants
import WindowCleaningPricing from './WindowCleaningPricing';
import PropertyDetailsForm from './PropertyDetailsForm';
import AdditionalServicesForm from './AdditionalServicesForm';
import ReviewSubmitForm from './ReviewSubmitForm';

// Define the conservatory surcharge globally or pass as prop if it can vary
const CONSERVATORY_SURCHARGE = 5;
const EXTENSION_SURCHARGE_AMOUNT = 5; // New constant for extension surcharge

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
        enquiryComments: ''
    },
    bookingNotes: '',
    recaptchaToken: '',
    
    // Quote requests for services requiring physical assessment
    quoteRequests: {
        [FORM_CONSTANTS.QUOTE_REQUEST_SOLAR_PANEL_CLEANING]: false,
        [FORM_CONSTANTS.QUOTE_REQUEST_CONSERVATORY_ROOF_CLEANING]: false
    }
};

// Placeholder: Implement this function to map your formData to EmailJS template params
const mapFormDataToTemplateParams = (formData) => {
  let bookingTypeDisplay = 'Unknown Booking Type';
  const is_standard_residential_booking_bool = (
    formData.isResidential &&
    !formData.isCustomQuote &&
    !formData.isCommercial &&
    !formData.isGeneralEnquiry
  );

  if (is_standard_residential_booking_bool) {
    bookingTypeDisplay = 'Standard Residential Booking';
  } else if (formData.isGeneralEnquiry) {
    bookingTypeDisplay = 'General Enquiry';
  } else if (formData.isCommercial) {
    bookingTypeDisplay = 'Commercial Enquiry';
  } else if (formData.isCustomQuote && formData.isResidential) {
    bookingTypeDisplay = 'Custom Residential Quote Request';
  }

  const formatPrice = (price) => (price !== undefined && price !== null ? price.toFixed(2) : '0.00');
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Basic format, adjust if you need a more specific one e.g. using date-fns
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return 'N/A';
    }
  };

  const params = {
    // Core Info
    emailSubject: `New ${bookingTypeDisplay} from ${formData.customerName || 'Customer'}`,
    customerName: formData.customerName || 'N/A',
    email: formData.email || 'N/A',
    mobile: formData.mobile || 'N/A',
    addressLine1: formData.addressLine1 || '',
    addressLine2: formData.addressLine2 || '',
    townCity: formData.townCity || '',
    postcode: formData.postcode || '',
    preferredContactMethod: formData.preferredContactMethod || 'N/A',
    bookingTypeDisplay: bookingTypeDisplay,
    bookingNotes: formData.bookingNotes || 'N/A',

    // Boolean flags for template sections
    is_standard_residential_booking_bool: is_standard_residential_booking_bool,
    isCustomQuote: formData.isCustomQuote || false,
    isCommercial: formData.isCommercial || false,
    isGeneralEnquiry: formData.isGeneralEnquiry || false,

    // Standard Residential Booking Details
    propertyType: 'N/A', // Default
    bedrooms: 'N/A', // Default
    selectedFrequency: 'N/A', // Default
    initialWindowPricetoFixed2: '0.00',
    selectedWindowService: null, // Default
    hasConservatory: false, // Default
    conservatorySurchargetoFixed2: '0.00',
    hasExtension: false, // Default
    extensionSurchargetoFixed2: '0.00',
    additionalServices: { conservatoryRoof: false, fasciaSoffitGutter: false, gutterClearing: false }, // Default
    hasGutterClearingServiceSelected: false, // Default
    gutterClearingServicePriceToFixed2: '0.00', // Default
    hasFasciaSoffitGutterServiceSelected: !!formData.additionalServices?.[FORM_CONSTANTS.ADDON_FASCIA_SOFFIT_GUTTER], // Corrected key
    fasciaSoffitGutterServicePriceToFixed2: '0.00', // Default
    subTotalBeforeDiscounttoFixed2: '0.00',
    windowCleaningDiscounttoFixed2: '0.00',
    grandTotaltoFixed2: '0.00',
    selectedDateFormatted: 'N/A', // Default

    // Placeholders for annual value and recurring price per visit
    estimatedAnnualValueToFixed2: '0.00',
    recurringPricePerVisitToFixed2: '0.00', // Price for one recurring visit
    showAnnualValue: false, // Flag to show annual value section

    // Custom Residential Quote Details
    customResidentialDetails: formData.isCustomQuote ? {
        exactBedrooms: formData.customResidentialDetails?.exactBedrooms || 'N/A',
        approxWindows: formData.customResidentialDetails?.approxWindows || 'N/A',
        accessIssues: formData.customResidentialDetails?.accessIssues || 'N/A',
        propertyStyle: formData.customResidentialDetails?.propertyStyle || 'N/A',
        otherPropertyStyleText: formData.customResidentialDetails?.otherPropertyStyleText || '',
        servicesRequested: formData.customResidentialDetails?.servicesRequested || {},
        otherServiceText: formData.customResidentialDetails?.otherServiceText || '',
        frequencyPreference: formData.customResidentialDetails?.frequencyPreference || 'N/A',
        otherFrequencyText: formData.customResidentialDetails?.otherFrequencyText || '',
        otherNotes: formData.customResidentialDetails?.otherNotes || 'N/A',
        customAdditionalComments: formData.customResidentialDetails?.customAdditionalComments || 'N/A'
    } : null,

    // Commercial Enquiry Details
    commercialDetails: formData.isCommercial ? {
        businessName: formData.commercialDetails?.businessName || 'N/A',
        propertyType: formData.commercialDetails?.propertyType || 'N/A',
        approxSizeOrWindows: formData.commercialDetails?.approxSizeOrWindows || 'N/A',
        servicesRequested: formData.commercialDetails?.servicesRequested || {},
        otherServiceText: formData.commercialDetails?.otherServiceText || '',
        frequencyPreference: formData.commercialDetails?.frequencyPreference || 'N/A',
        otherFrequencyText: formData.commercialDetails?.otherFrequencyText || '',
        specificRequirements: formData.commercialDetails?.specificRequirements || 'N/A',
        otherNotes: formData.commercialDetails?.otherNotes || 'N/A'
    } : null,

    // General Enquiry Details
    generalEnquiryDetails: formData.isGeneralEnquiry ? {
        requestedServices: formData.generalEnquiryDetails?.requestedServices || {},
        otherServiceText: formData.generalEnquiryDetails?.otherServiceText || '',
        requestedFrequency: formData.generalEnquiryDetails?.requestedFrequency || 'N/A',
        enquiryComments: formData.generalEnquiryDetails?.enquiryComments || 'N/A'
    } : null,

    // reCAPTCHA
    'g-recaptcha-response': formData.recaptchaToken || '',

    // Quote requests
    quoteRequests: formData.quoteRequests || { solarPanelCleaning: false, conservatoryRoofCleaning: false },

    // Add a flag for non-zero grand total for template logic
    grandTotal_not_zero: formData.grandTotal > 0
  };

  // Populate standard residential details if applicable
  if (is_standard_residential_booking_bool) {
    params.propertyType = formData.propertyType || 'N/A';
    params.bedrooms = formData.bedrooms || 'N/A';
    params.selectedFrequency = formData.selectedFrequency || 'N/A';
    params.initialWindowPricetoFixed2 = formatPrice(formData.initialWindowPrice);
    params.selectedWindowService = formData.selectedWindowService || null; // Pass the object directly
    params.hasConservatory = formData.hasConservatory || false;
    params.conservatorySurchargetoFixed2 = formatPrice(formData.conservatorySurcharge);
    params.hasExtension = formData.hasExtension || false;
    params.extensionSurchargetoFixed2 = formatPrice(formData.extensionSurcharge);
    // No need to re-assign params.additionalServices here if additionalServicesForTemplate is used by the email template
    // If the email template *directly* uses a field named additionalServices and expects string keys:
    // params.additionalServices = { 
    //     conservatoryRoof: formData.additionalServices?.[FORM_CONSTANTS.ADDON_CONSERVATORY_ROOF] || false,
    //     fasciaSoffitGutter: formData.additionalServices?.[FORM_CONSTANTS.ADDON_FASCIA_SOFFIT_GUTTER] || false,
    //     gutterClearing: formData.additionalServices?.[FORM_CONSTANTS.ADDON_GUTTER_CLEARING] || false
    // };
    // The above params.additionalServicesForTemplate should suffice if the template can use that.
    // The boolean flags below are correctly derived now.
    params.hasGutterClearingServiceSelected = !!formData.additionalServices?.[FORM_CONSTANTS.ADDON_GUTTER_CLEARING];
    params.gutterClearingServicePriceToFixed2 = formatPrice(formData.gutterClearingServicePrice);
    params.hasFasciaSoffitGutterServiceSelected = !!formData.additionalServices?.[FORM_CONSTANTS.ADDON_FASCIA_SOFFIT_GUTTER];
    params.fasciaSoffitGutterServicePriceToFixed2 = formatPrice(formData.fasciaSoffitGutterServicePrice);
    params.subTotalBeforeDiscounttoFixed2 = formatPrice(formData.subTotalBeforeDiscount);
    params.windowCleaningDiscounttoFixed2 = formatPrice(formData.windowCleaningDiscount);
    params.grandTotaltoFixed2 = formatPrice(formData.grandTotal);
    params.selectedDateFormatted = formatDate(formData.selectedDate);
  }
  
  // Calculate base price for annual calculation (recurring services only for standard residential)
  let frequencyForAnnualCalc = '';
  let basePriceForAnnualCalc = 0;

  if (is_standard_residential_booking_bool) {
    frequencyForAnnualCalc = formData.selectedFrequency ? formData.selectedFrequency.toLowerCase() : '';
    // Start with the price of the window cleaning service for the selected frequency
    if (formData.selectedWindowService && typeof formData.selectedWindowService.price === 'number') {
      basePriceForAnnualCalc = formData.selectedWindowService.price;
    }
    // Add recurring surcharges (assuming conservatory/extension surcharges are recurring)
    if (formData.hasConservatory && typeof formData.conservatorySurcharge === 'number' && formData.conservatorySurcharge > 0) {
      basePriceForAnnualCalc += formData.conservatorySurcharge;
    }
    if (formData.hasExtension && typeof formData.extensionSurcharge === 'number' && formData.extensionSurcharge > 0) {
      basePriceForAnnualCalc += formData.extensionSurcharge;
    }
  }
  // For Custom Quotes & Commercial Enquiries, basePriceForAnnualCalc remains 0, so annual value is not shown.

  // Determine yearly multiplier based on frequency
  let yearlyMultiplier = 0; // Initialize with a default value
  if (frequencyForAnnualCalc.includes('4 weekly') || frequencyForAnnualCalc.includes('4weekly')) { yearlyMultiplier = 52 / 4; }
  else if (frequencyForAnnualCalc.includes('8 weekly') || frequencyForAnnualCalc.includes('8weekly')) { yearlyMultiplier = 52 / 8; }
  else if (frequencyForAnnualCalc.includes('12 weekly') || frequencyForAnnualCalc.includes('12weekly')) { yearlyMultiplier = 52 / 12; }
  else if (frequencyForAnnualCalc.includes('monthly')) { yearlyMultiplier = 12; }
  else if (frequencyForAnnualCalc.includes('bi-monthly') || frequencyForAnnualCalc.includes('bimonthly')) { yearlyMultiplier = 6; }
  else if (frequencyForAnnualCalc.includes('quarterly')) { yearlyMultiplier = 4; }
  else if (frequencyForAnnualCalc.includes('annually') || frequencyForAnnualCalc.includes('yearly')) { yearlyMultiplier = 1; }
  
  if (frequencyForAnnualCalc.includes('one-off') || frequencyForAnnualCalc.includes('oneoff') || 
      frequencyForAnnualCalc.includes('adhoc') || frequencyForAnnualCalc.includes('asrequired') || 
      frequencyForAnnualCalc.includes('as required') || frequencyForAnnualCalc === '') {
    yearlyMultiplier = 0; // Ensures no annual calc for one-off or unspecified frequency
  }

  if (basePriceForAnnualCalc > 0 && yearlyMultiplier > 0) {
    const estimatedAnnualValue = basePriceForAnnualCalc * yearlyMultiplier;
    params.estimatedAnnualValueToFixed2 = formatPrice(estimatedAnnualValue);
    params.recurringPricePerVisitToFixed2 = formatPrice(basePriceForAnnualCalc);
    params.showAnnualValue = true;
  } else {
    params.estimatedAnnualValueToFixed2 = '0.00';
    params.recurringPricePerVisitToFixed2 = '0.00';
    params.showAnnualValue = false; // Explicitly set to false
  }
  
  // This was already here and is correct for the template
  params.grandTotal_not_zero = !!(formData.grandTotal && parseFloat(formData.grandTotal) > 0);

  return params;
};

// Placeholder: Implement this function to return "enquiry" or "booking" text
const getEnquiryOrBookingText = (isQuoteOrEnquiry) => {
  return isQuoteOrEnquiry ? "enquiry" : "booking";
};

function BookingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
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

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };
  const goToStep = (stepNumber) => {
    setCurrentStep(stepNumber);
    window.scrollTo(0, 0);
  };

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
      return <PropertyDetailsForm nextStep={nextStep} prevStep={prevStep} handleChange={genericHandleChange} values={formData} setFormData={setFormData} goToStep={goToStep} />;
    case 4: 
      return <ReviewSubmitForm 
                prevStep={prevStep} 
                values={formData} 
                handleSubmit={handleSubmit} 
                setFormData={setFormData} // Pass setFormData for reCAPTCHA token
                isLoading={isLoading} 
                submissionError={submissionError} 
             />;
    case 5: // Thank You / Confirmation page
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-2xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl p-8 border border-gray-700 text-center">
              {submissionError ? (
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
                    onClick={() => { setCurrentStep(4); setSubmissionError(null); }} 
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
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
                      Your <span className="text-blue-300 font-semibold">{getEnquiryOrBookingText(formData.isCommercial || formData.isCustomQuote || formData.isGeneralEnquiry)}</span> has been submitted successfully.
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
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg mb-3"
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
                        setIsSubmitted(false);
                        setFormData(initialFormData);
                    }} 
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
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
}

export default BookingForm;
