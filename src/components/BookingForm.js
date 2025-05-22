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
        conservatoryRoof: false,
        fasciaSoffitGutter: false,
        gutterClearing: false,
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
            windowCleaning: false,
            gutterCleaning: false,
            fasciaSoffitCleaning: false,
            conservatoryWindowCleaning: false,
            conservatoryRoofCleaning: false,
            other: false,
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
            windowCleaning: false,
            gutterCleaning: false,
            fasciaSoffitCleaning: false,
            claddingCleaning: false,
            signageCleaning: false,
            other: false,
        },
        otherServiceText: '',
        frequencyPreference: '',
        otherFrequencyText: '',
        otherNotes: ''
    },
    // For General Enquiry
    generalEnquiryDetails: {
        requestedServices: {
            windowCleaning: false,
            conservatoryWindows: false,
            conservatoryRoof: false,
            gutterClearing: false,
            fasciaSoffitGutter: false,
            solarPanels: false,
            other: false,
        },
        otherServiceText: '',
        requestedFrequency: '',
        enquiryComments: ''
    },
    bookingNotes: '',
    recaptchaToken: ''
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
    hasFasciaSoffitGutterServiceSelected: false, // Default
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
    params.additionalServices = formData.additionalServices || { conservatoryRoof: false, fasciaSoffitGutter: false, gutterClearing: false };
    params.hasGutterClearingServiceSelected = !!formData.additionalServices?.gutterClearing;
    params.gutterClearingServicePriceToFixed2 = formatPrice(formData.gutterClearingServicePrice);
    params.hasFasciaSoffitGutterServiceSelected = !!formData.additionalServices?.fasciaSoffitGutter;
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
                    setFormData(initialFormData); // Use the constant for reset
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
