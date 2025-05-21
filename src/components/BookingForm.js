// Main parent component for the multi-step booking form
import React, { useState } from 'react';
import WindowCleaningPricing from './WindowCleaningPricing';
import PropertyDetailsForm from './PropertyDetailsForm';
import AdditionalServicesForm from './AdditionalServicesForm';
import ReviewSubmitForm from './ReviewSubmitForm';

// Define the conservatory surcharge globally or pass as prop if it can vary
const CONSERVATORY_SURCHARGE = 5;

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
        exactBedrooms: '',
        approxWindows: '',
        accessIssues: '',
        otherNotes: '',
        customAdditionalComments: '' // ADDED for 6+ Beds / Bespoke
    },

    // For Commercial Enquiry (collected in PropertyDetailsForm)
    commercialDetails: {
        businessName: '',
        propertyType: '',
        approxSizeOrWindows: '',
        specificRequirements: '',
        otherNotes: ''
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
    bookingNotes: '' // ADDED: General notes for standard/custom/commercial bookings
  });

  // Generic handleChange for simple inputs, used by PropertyDetailsForm
  const genericHandleChange = (input) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    if (input.includes('.')) {
      const [objectKey, nestedKey] = input.split('.');
      setFormData(prevFormData => ({
        ...prevFormData,
        [objectKey]: {
          ...prevFormData[objectKey],
          [nestedKey]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [input]: value }));
    }
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);
  const goToStep = (stepNumber) => setCurrentStep(stepNumber);

  // Render steps based on currentStep
  // Pass CONSERVATORY_SURCHARGE to AdditionalServicesForm
  switch (currentStep) {
    case 1:
      return <WindowCleaningPricing goToStep={goToStep} onFormChange={setFormData} values={formData} />;
    case 2: // New: Additional Services (standard residential path only)
      return <AdditionalServicesForm nextStep={nextStep} prevStep={prevStep} values={formData} setFormData={setFormData} conservatorySurcharge={CONSERVATORY_SURCHARGE} />;
    case 3: // New: Property Details (contact, date for standard, quote specifics for custom/commercial)
      return <PropertyDetailsForm nextStep={nextStep} prevStep={prevStep} handleChange={genericHandleChange} values={formData} setFormData={setFormData} goToStep={goToStep} conservatorySurcharge={CONSERVATORY_SURCHARGE} />;
    case 4: // New: Review & Submit
      return <ReviewSubmitForm prevStep={prevStep} values={formData} handleSubmit={submitBooking} conservatorySurcharge={CONSERVATORY_SURCHARGE}/>;
    default:
      return <WindowCleaningPricing goToStep={goToStep} onFormChange={setFormData} values={formData} />;
  }
}

// Placeholder for actual submission logic
const submitBooking = (formData) => {
  console.log("Form Submitted! Data:", formData);
  alert("Booking Submitted Successfully! Check console for data."); 
};

export default BookingForm;
