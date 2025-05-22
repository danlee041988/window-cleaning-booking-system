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
export const mapFormDataToTemplateParams = (formData) => {
  // Helper to calculate annual value (simplified)
  const getAnnualValue = (priceStr, freqKey) => {
    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0 || !freqKey) return 'N/A';

    if (freqKey === '4-weekly') return `£${(price * 13).toFixed(2)}`;
    if (freqKey === '8-weekly') return `£${(price * 6.5).toFixed(2)}`;
    if (freqKey === '12-weekly') return `£${(price * (52 / 12)).toFixed(2)}`;
    if (freqKey === '6-monthly') return `£${(price * 2).toFixed(2)}`;
    if (freqKey === 'annually' || freqKey === '12-monthly') return `£${(price * 1).toFixed(2)}`;
    if (freqKey === 'one-off' || freqKey === 'adhoc' || freqKey.toLowerCase().includes('one-off')) return 'One-off Service';
    return 'Frequency N/A';
  };

  let bookingTypeDisplay = 'Unknown Booking Type';
  if (formData.isGeneralEnquiry) {
    bookingTypeDisplay = 'General Enquiry';
  } else if (formData.isCommercial) {
    bookingTypeDisplay = 'Commercial Enquiry';
  } else if (formData.isCustomQuote && formData.isResidential) {
    bookingTypeDisplay = 'Custom Residential Quote Request';
  } else if (formData.isResidential) {
    bookingTypeDisplay = 'Standard Residential Booking';
  }

  const params = {
    // Common contact details
    customerName: formData.customerName || '',
    firstName: formData.customerName?.split(' ')[0] || formData.customerName || '',
    lastName: formData.customerName?.split(' ').slice(1).join(' ') || '',
    email: formData.email || '',
    mobile: formData.mobile || '',
    address: `${formData.addressLine1 || ''}${formData.addressLine2 ? ', ' + formData.addressLine2 : ''}${formData.townCity ? ', ' + formData.townCity : ''}${formData.postcode ? ', ' + formData.postcode : ''}`,
    postcode: formData.postcode || '',
    preferredContactMethod: formData.preferredContactMethod || '',
    specialInstructions: formData.bookingNotes || 'None', // For existing template field {{specialInstructions}}
    bookingNotes: formData.bookingNotes || 'None',

    // Booking Type and Subject
    bookingTypeDisplay: bookingTypeDisplay,
    emailSubject: `New ${bookingTypeDisplay} from ${formData.customerName || 'Customer'}`,

    // For reCAPTCHA verification by EmailJS if enabled
    'g-recaptcha-response': formData.recaptchaToken || '',

    // Initialize all potential fields to 'N/A' or empty to avoid template errors
    // Property Details (legacy)
    numBedrooms: 'N/A',
    propertyStyle: 'N/A', // Legacy propertyStyle
    hasExtension: 'N/A',
    hasConservatory: 'N/A',
    isBespokeOrCommercial: 'N/A', // Legacy combined flag

    // Services Booked (legacy table)
    window: 'No', windowFrequency: 'N/A', windowPrice: 'N/A', windowAnnual: 'N/A',
    gutter: 'No', gutterFrequency: 'N/A', gutterPrice: 'N/A', gutterAnnual: 'N/A',
    fascia: 'No', fasciaFrequency: 'N/A', fasciaPrice: 'N/A', fasciaAnnual: 'N/A',
    conservatoryRoof: 'No', conservatoryRoofFrequency: 'N/A', conservatoryRoofPrice: 'N/A', conservatoryRoofAnnual: 'N/A',
    solarPanels: 'No', solarPanelFrequency: 'N/A', solarPanelPrice: 'N/A', solarPanelAnnual: 'N/A',
    
    // Schedule (legacy)
    selectedDate: 'N/A',
    isAsapRequested: 'No',

    // Quote Summary (legacy)
    total: 'N/A',
    discount: 'N/A',
    subTotalBeforeDiscount: 'N/A', // New field for clarity in standard bookings

    // --- Fields for specific sections ---
    // Standard Residential
    std_property_type: 'N/A',
    std_bedrooms: 'N/A',
    std_selected_frequency: 'N/A', // Main window frequency
    std_initial_window_price: 'N/A', // Price for window clean component
    std_conservatory_surcharge: 'N/A',
    std_extension_surcharge: 'N/A',
    std_services_gutter_selected: 'No', std_services_gutter_price: 'N/A',
    std_services_fascia_selected: 'No', std_services_fascia_price: 'N/A',
    std_services_conservatory_roof_selected: 'No', std_services_conservatory_roof_price: 'N/A',
    std_services_solar_panels_selected: 'No', std_services_solar_panels_price: 'N/A',
    
    // Custom Residential Quote
    custom_property_style: 'N/A', custom_other_property_style_text: '', custom_exact_bedrooms: 'N/A',
    custom_approx_windows: 'N/A', custom_access_issues: 'N/A', custom_requested_services_list: 'N/A',
    custom_other_service_text: '', custom_frequency_preference: 'N/A', custom_other_frequency_text: '',
    custom_additional_comments: 'N/A',

    // Commercial Enquiry
    commercial_business_name: 'N/A', commercial_property_type: 'N/A', commercial_approx_size_or_windows: 'N/A',
    commercial_specific_requirements: 'N/A', commercial_requested_services_list: 'N/A', commercial_other_service_text: '',
    commercial_frequency_preference: 'N/A', commercial_other_frequency_text: '', commercial_other_notes: 'N/A',

    // General Enquiry
    general_requested_services_list: 'N/A', general_other_service_text: '', general_requested_frequency: 'N/A',
    general_enquiry_comments: 'N/A',
  };

  // Populate based on booking type
  if (formData.isResidential && !formData.isCustomQuote && !formData.isCommercial && !formData.isGeneralEnquiry) {
    // Standard Residential Booking
    params.isBespokeOrCommercial = 'No';
    params.propertyStyle = formData.propertyType || 'N/A'; // legacy
    params.numBedrooms = formData.bedrooms || 'N/A'; // legacy
    params.hasExtension = formData.hasExtension ? 'Yes' : 'No';
    params.hasConservatory = formData.hasConservatory ? 'Yes' : 'No';

    params.std_property_type = formData.propertyType || 'N/A';
    params.std_bedrooms = formData.bedrooms || 'N/A';
    params.std_selected_frequency = formData.selectedFrequency || 'N/A';
    
    // For the "Services Booked" table (legacy fields first)
    params.window = 'Yes'; // Assuming window cleaning is always included or priced
    params.windowFrequency = formData.selectedFrequency || 'N/A';
    // initialWindowPrice from formData already includes frequency adjustments and surcharges for the window part.
    params.windowPrice = formData.initialWindowPrice?.toFixed(2) || '0.00';
    params.windowAnnual = getAnnualValue(params.windowPrice, params.windowFrequency);
    params.std_initial_window_price = params.windowPrice; // More specific name

    params.std_conservatory_surcharge = formData.hasConservatory ? (formData.conservatorySurcharge?.toFixed(2) || '0.00') : 'N/A';
    params.std_extension_surcharge = formData.hasExtension ? (formData.extensionSurcharge?.toFixed(2) || '0.00') : 'N/A';

    if (formData.additionalServices?.gutterClearing) {
      params.gutter = 'Yes';
      params.std_services_gutter_selected = 'Yes';
      params.gutterPrice = formData.gutterClearingPrice?.toFixed(2) || 'N/A';
      params.std_services_gutter_price = params.gutterPrice;
      // Assuming gutter frequency is 'As per service' or not specified for standard
      params.gutterFrequency = 'As per service'; 
      params.gutterAnnual = getAnnualValue(params.gutterPrice, 'adhoc'); // Or a different default frequency if applicable
    }
    if (formData.additionalServices?.fasciaSoffitGutterCleaning) {
      params.fascia = 'Yes';
      params.std_services_fascia_selected = 'Yes';
      params.fasciaPrice = formData.fasciaSoffitGutterCleaningPrice?.toFixed(2) || 'N/A';
      params.std_services_fascia_price = params.fasciaPrice;
      params.fasciaFrequency = 'As per service';
      params.fasciaAnnual = getAnnualValue(params.fasciaPrice, 'adhoc');
    }
    if (formData.hasConservatory && formData.additionalServices?.conservatoryRoofCleaning) {
      params.conservatoryRoof = 'Yes';
      params.std_services_conservatory_roof_selected = 'Yes';
      params.conservatoryRoofPrice = formData.conservatoryRoofCleaningPrice?.toFixed(2) || 'N/A';
      params.std_services_conservatory_roof_price = params.conservatoryRoofPrice;
      params.conservatoryRoofFrequency = 'As per service';
      params.conservatoryRoofAnnual = getAnnualValue(params.conservatoryRoofPrice, 'adhoc');
    }
    if (formData.additionalServices?.solarPanelCleaning) {
      params.solarPanels = 'Yes';
      params.std_services_solar_panels_selected = 'Yes';
      params.solarPanelPrice = formData.solarPanelCleaningPrice?.toFixed(2) || 'N/A';
      params.std_services_solar_panels_price = params.solarPanelPrice;
      params.solarPanelFrequency = 'As per service';
      params.solarPanelAnnual = getAnnualValue(params.solarPanelPrice, 'adhoc');
    }

    params.selectedDate = formData.selectedDate === 'ASAP_REQUESTED' ? 'ASAP Requested' : (formData.selectedDate || 'N/A');
    params.isAsapRequested = formData.isAsapRequested ? 'Yes' : 'No';
    
    params.subTotalBeforeDiscount = formData.subTotalBeforeDiscount?.toFixed(2) || '0.00';
    params.discount = formData.windowCleaningDiscount?.toFixed(2) || '0.00';
    params.total = formData.grandTotal?.toFixed(2) || '0.00';

  } else if (formData.isResidential && formData.isCustomQuote) {
    const crd = formData.customResidentialDetails || {};
    params.isBespokeOrCommercial = 'Yes (Custom Residential)';
    params.propertyStyle = crd.propertyStyle || 'N/A'; // legacy
    params.numBedrooms = crd.exactBedrooms || 'N/A'; // legacy
    
    params.custom_property_style = crd.propertyStyle || 'N/A';
    params.custom_other_property_style_text = crd.otherPropertyStyleText || '';
    params.custom_exact_bedrooms = crd.exactBedrooms || 'N/A';
    params.custom_approx_windows = crd.approxWindows || 'N/A';
    params.custom_access_issues = crd.accessIssues || 'None';
    params.custom_requested_services_list = Object.entries(crd.servicesRequested || {})
        .filter(([, value]) => value)
        .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
        .join(', ') || 'None specified';
    params.custom_other_service_text = crd.otherServiceText || '';
    params.custom_frequency_preference = crd.frequencyPreference || 'N/A';
    params.custom_other_frequency_text = crd.otherFrequencyText || '';
    params.custom_additional_comments = crd.customAdditionalComments || 'None';
    params.total = 'Quote Requested';
    params.selectedDate = 'N/A - Quote Request';

  } else if (formData.isCommercial) {
    const cd = formData.commercialDetails || {};
    params.isBespokeOrCommercial = 'Yes (Commercial)';
    params.propertyStyle = 'Commercial'; // legacy
    params.numBedrooms = 'N/A'; // legacy

    params.commercial_business_name = cd.businessName || 'N/A';
    params.commercial_property_type = cd.propertyType || 'N/A';
    params.commercial_approx_size_or_windows = cd.approxSizeOrWindows || 'N/A';
    params.commercial_specific_requirements = cd.specificRequirements || 'None';
    params.commercial_requested_services_list = Object.entries(cd.servicesRequested || {})
        .filter(([, value]) => value)
        .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
        .join(', ') || 'None specified';
    params.commercial_other_service_text = cd.otherServiceText || '';
    params.commercial_frequency_preference = cd.frequencyPreference || 'N/A';
    params.commercial_other_frequency_text = cd.otherFrequencyText || '';
    params.commercial_other_notes = cd.otherNotes || 'None';
    params.total = 'Quote Requested';
    params.selectedDate = 'N/A - Quote Request';

  } else if (formData.isGeneralEnquiry) {
    const ged = formData.generalEnquiryDetails || {};
    params.isBespokeOrCommercial = 'N/A (General Enquiry)';
    params.propertyStyle = 'General Enquiry'; // legacy
    params.numBedrooms = 'N/A'; // legacy

    params.general_requested_services_list = Object.entries(ged.requestedServices || {})
        .filter(([, value]) => value)
        .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
        .join(', ') || 'None specified';
    params.general_other_service_text = ged.otherServiceText || '';
    params.general_requested_frequency = ged.requestedFrequency || 'N/A';
    params.general_enquiry_comments = ged.enquiryComments || 'None';
    params.total = 'Enquiry Only';
    params.selectedDate = 'N/A - Enquiry';
  }
  
  // Clean up legacy service fields if not a standard residential booking
  if (bookingTypeDisplay !== 'Standard Residential Booking') {
    const legacyServiceFields = ['window', 'windowFrequency', 'windowPrice', 'windowAnnual', 
                                 'gutter', 'gutterFrequency', 'gutterPrice', 'gutterAnnual',
                                 'fascia', 'fasciaFrequency', 'fasciaPrice', 'fasciaAnnual',
                                 'conservatoryRoof', 'conservatoryRoofFrequency', 'conservatoryRoofPrice', 'conservatoryRoofAnnual',
                                 'solarPanels', 'solarPanelFrequency', 'solarPanelPrice', 'solarPanelAnnual'];
    legacyServiceFields.forEach(field => {
        if (params[field] !== 'Yes' && params[field] !== 'No') { // Don't overwrite Yes/No for boolean flags if already set to N/A
             params[field] = 'N/A for this booking type';
        }
    });
    params.discount = 'N/A';
    params.subTotalBeforeDiscount = 'N/A';
  }

  // Add is_standard_residential_booking_bool
  params.is_standard_residential_booking_bool = 
    formData.isResidential && 
    !formData.isCustomQuote && 
    !formData.isCommercial && 
    !formData.isGeneralEnquiry;

  console.log("Mapped EmailJS template params:", params);
  return params;
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
