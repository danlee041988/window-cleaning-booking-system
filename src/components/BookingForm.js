// Main parent component for the multi-step booking form
import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import * as FORM_CONSTANTS from '../constants/formConstants'; // Import constants
import WindowCleaningPricing from './WindowCleaningPricing';
import AdditionalServicesForm from './AdditionalServicesForm';
import PropertyDetailsAndReview from './PropertyDetailsAndReview';
import SimpleProgressBar from './SimpleProgressBar';
import useFormPersistence from '../hooks/useFormPersistence';
import { sanitizeFormData } from '../utils/sanitization';

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

// Comprehensive version with all form data as simple strings/booleans
export const mapFormDataToTemplateParamsSimple = (formData) => {
  const formatPrice = (price) => (price !== undefined && price !== null ? price.toFixed(2) : '0.00');
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return 'N/A';
    }
  };

  // Determine booking type
  let bookingTypeDisplay = 'Unknown Booking Type';
  const isStandardResidential = (
    formData.isResidential &&
    !formData.isCustomQuote &&
    !formData.isCommercial &&
    !formData.isGeneralEnquiry
  );

  if (isStandardResidential) {
    bookingTypeDisplay = 'Standard Residential Booking';
  } else if (formData.isGeneralEnquiry) {
    bookingTypeDisplay = 'General Enquiry';
  } else if (formData.isCommercial) {
    bookingTypeDisplay = 'Commercial Enquiry';
  } else if (formData.isCustomQuote && formData.isResidential) {
    bookingTypeDisplay = 'Custom Residential Quote Request';
  }

  // Debug logging removed for production (H004 fix)

  return {
    // EmailJS specific fields
    to_email: 'info@somersetwindowcleaning.co.uk', // Business email to receive notifications
    
    // Email subject and booking type
    emailSubject: `New ${bookingTypeDisplay} from ${formData.customerName || 'Customer'}`,
    bookingTypeDisplay: bookingTypeDisplay,
    
    // Customer Information - Using underscore naming to match email template
    customer_name: formData.customerName || 'N/A',
    customer_email: formData.email || 'N/A',
    customer_phone: formData.mobile || 'N/A',
    customer_address: formData.addressLine1 || '',
    customer_city: formData.townCity || '',
    customer_postcode: formData.postcode || '',
    
    // Keep legacy names for backward compatibility
    customerName: formData.customerName || 'N/A',
    email: formData.email || 'N/A',
    mobile: formData.mobile || 'N/A',
    addressLine1: formData.addressLine1 || '',
    addressLine2: formData.addressLine2 || '',
    townCity: formData.townCity || '',
    postcode: formData.postcode || '',
    preferredContactMethod: formData.preferredContactMethod || 'N/A',
    bookingNotes: formData.bookingNotes || 'N/A',

    // Booking type flags - Convert booleans to strings for EmailJS
    isStandardResidential: isStandardResidential ? 'true' : '',
    isCustomQuote: (formData.isCustomQuote || false) ? 'true' : '',
    isCommercial: (formData.isCommercial || false) ? 'true' : '',
    isGeneralEnquiry: (formData.isGeneralEnquiry || false) ? 'true' : '',
    
    // Debug variables
    debugIsStandardResidential: isStandardResidential ? 'TRUE' : 'FALSE',
    debugFormFlags: `isRes:${!!formData.isResidential} isCustom:${!!formData.isCustomQuote} isComm:${!!formData.isCommercial} isGen:${!!formData.isGeneralEnquiry}`,

    // Standard Residential Details
    propertyType: isStandardResidential ? (formData.propertyType || 'N/A') : 'N/A',
    bedrooms: isStandardResidential ? (formData.bedrooms || 'N/A') : 'N/A',
    frequency: isStandardResidential ? (formData.selectedFrequency || 'N/A') : 'N/A',
    selectedFrequency: isStandardResidential ? (formData.selectedFrequency || 'N/A') : 'N/A',
    initialWindowPrice: isStandardResidential ? formatPrice(formData.initialWindowPrice) : '0.00',
    selectedWindowServiceName: isStandardResidential ? (formData.selectedWindowService?.name || 'N/A') : 'N/A',
    selectedWindowServiceType: isStandardResidential ? (formData.selectedWindowService?.type || 'N/A') : 'N/A',
    
    // Property Features - Convert booleans to strings for EmailJS
    hasConservatory: isStandardResidential && formData.hasConservatory ? 'true' : '',
    conservatorySurcharge: isStandardResidential ? formatPrice(formData.conservatorySurcharge) : '0.00',
    hasExtension: isStandardResidential && formData.hasExtension ? 'true' : '',
    extensionSurcharge: isStandardResidential ? formatPrice(formData.extensionSurcharge) : '0.00',
    
    // Additional Services - Convert booleans to strings for EmailJS
    hasConservatoryRoof: isStandardResidential && formData.additionalServices?.[FORM_CONSTANTS.ADDON_CONSERVATORY_ROOF] ? 'true' : '',
    hasFasciaSoffit: isStandardResidential && formData.additionalServices?.[FORM_CONSTANTS.ADDON_FASCIA_SOFFIT_GUTTER] ? 'true' : '',
    hasGutterClearing: isStandardResidential && formData.additionalServices?.[FORM_CONSTANTS.ADDON_GUTTER_CLEARING] ? 'true' : '',
    fasciaSoffitGutterPrice: isStandardResidential ? formatPrice(formData.fasciaSoffitGutterServicePrice) : '0.00',
    gutterClearingPrice: isStandardResidential ? formatPrice(formData.gutterClearingServicePrice) : '0.00',
    
    // Pricing
    subTotalBeforeDiscount: isStandardResidential ? formatPrice(formData.subTotalBeforeDiscount) : '0.00',
    windowCleaningDiscount: isStandardResidential ? formatPrice(formData.windowCleaningDiscount) : '0.00',
    grandTotal: formatPrice(formData.grandTotal) || '0.00',
    totalPrice: formatPrice(formData.grandTotal) || '0.00',
    selectedDate: isStandardResidential ? formatDate(formData.selectedDate) : 'N/A',
    
    // Schedule Information
    scheduledDate: formData.selectedDate ? formatDate(formData.selectedDate) : '',
    scheduledTime: formData.selectedTimeSlot || '',

    // Custom Residential Quote Details
    customBedrooms: formData.isCustomQuote ? (formData.customResidentialDetails?.exactBedrooms || 'N/A') : 'N/A',
    customApproxWindows: formData.isCustomQuote ? (formData.customResidentialDetails?.approxWindows || 'N/A') : 'N/A',
    customPropertyStyle: formData.isCustomQuote ? (formData.customResidentialDetails?.propertyStyle || 'N/A') : 'N/A',
    customOtherPropertyStyle: formData.isCustomQuote ? (formData.customResidentialDetails?.otherPropertyStyleText || '') : '',
    customAccessIssues: formData.isCustomQuote ? (formData.customResidentialDetails?.accessIssues || 'N/A') : 'N/A',
    customFrequencyPreference: formData.isCustomQuote ? (formData.customResidentialDetails?.frequencyPreference || 'N/A') : 'N/A',
    customOtherFrequency: formData.isCustomQuote ? (formData.customResidentialDetails?.otherFrequencyText || '') : '',
    customOtherNotes: formData.isCustomQuote ? (formData.customResidentialDetails?.otherNotes || 'N/A') : 'N/A',
    customOtherServiceText: formData.isCustomQuote ? (formData.customResidentialDetails?.otherServiceText || '') : '',
    
    // Custom Residential Services - Convert booleans to strings for EmailJS
    customWindowCleaning: formData.isCustomQuote && formData.customResidentialDetails?.servicesRequested?.windowCleaning ? 'true' : '',
    customGutterCleaning: formData.isCustomQuote && formData.customResidentialDetails?.servicesRequested?.gutterCleaning ? 'true' : '',
    customFasciaSoffit: formData.isCustomQuote && formData.customResidentialDetails?.servicesRequested?.fasciaSoffitCleaning ? 'true' : '',
    customConservatoryWindows: formData.isCustomQuote && formData.customResidentialDetails?.servicesRequested?.conservatoryWindowCleaning ? 'true' : '',
    customConservatoryRoof: formData.isCustomQuote && formData.customResidentialDetails?.servicesRequested?.conservatoryRoofCleaning ? 'true' : '',
    customOtherService: formData.isCustomQuote && formData.customResidentialDetails?.servicesRequested?.other ? 'true' : '',

    // Commercial Details
    businessName: formData.isCommercial ? (formData.commercialDetails?.businessName || '') : '',
    businessType: formData.isCommercial ? (formData.commercialDetails?.propertyType || '') : '',
    buildingDetails: formData.isCommercial ? (formData.commercialDetails?.approxSizeOrWindows || '') : '',
    commercialBusinessName: formData.isCommercial ? (formData.commercialDetails?.businessName || 'N/A') : 'N/A',
    commercialPropertyType: formData.isCommercial ? (formData.commercialDetails?.propertyType || 'N/A') : 'N/A',
    commercialSizeWindows: formData.isCommercial ? (formData.commercialDetails?.approxSizeOrWindows || 'N/A') : 'N/A',
    commercialFrequency: formData.isCommercial ? (formData.commercialDetails?.frequencyPreference || 'N/A') : 'N/A',
    commercialOtherFrequency: formData.isCommercial ? (formData.commercialDetails?.otherFrequencyText || '') : '',
    commercialRequirements: formData.isCommercial ? (formData.commercialDetails?.specificRequirements || 'N/A') : 'N/A',
    commercialOtherNotes: formData.isCommercial ? (formData.commercialDetails?.otherNotes || 'N/A') : 'N/A',
    commercialOtherServiceText: formData.isCommercial ? (formData.commercialDetails?.otherServiceText || '') : '',
    
    // Commercial Services - Convert booleans to strings for EmailJS
    commercialWindowCleaning: formData.isCommercial && formData.commercialDetails?.servicesRequested?.windowCleaning ? 'true' : '',
    commercialGutterCleaning: formData.isCommercial && formData.commercialDetails?.servicesRequested?.gutterCleaning ? 'true' : '',
    commercialFasciaSoffit: formData.isCommercial && formData.commercialDetails?.servicesRequested?.fasciaSoffitCleaning ? 'true' : '',
    commercialCladding: formData.isCommercial && formData.commercialDetails?.servicesRequested?.claddingCleaning ? 'true' : '',
    commercialSignage: formData.isCommercial && formData.commercialDetails?.servicesRequested?.signageCleaning ? 'true' : '',
    commercialOther: formData.isCommercial && formData.commercialDetails?.servicesRequested?.other ? 'true' : '',

    // General Enquiry Details
    enquiryType: formData.isGeneralEnquiry ? 'General Enquiry' : '',
    enquiryMessage: formData.isGeneralEnquiry ? (formData.generalEnquiryDetails?.enquiryComments || '') : '',
    generalFrequency: formData.isGeneralEnquiry ? (formData.generalEnquiryDetails?.requestedFrequency || 'N/A') : 'N/A',
    generalComments: formData.isGeneralEnquiry ? (formData.generalEnquiryDetails?.enquiryComments || 'N/A') : 'N/A',
    generalCustomerStatus: formData.isGeneralEnquiry ? (formData.generalEnquiryDetails?.customerStatus || 'N/A') : 'N/A',
    generalOtherServiceText: formData.isGeneralEnquiry ? (formData.generalEnquiryDetails?.otherServiceText || '') : '',
    
    // General Enquiry Services - Convert booleans to strings for EmailJS
    generalWindowCleaning: formData.isGeneralEnquiry && formData.generalEnquiryDetails?.requestedServices?.windowCleaning ? 'true' : '',
    generalConservatoryWindows: formData.isGeneralEnquiry && formData.generalEnquiryDetails?.requestedServices?.conservatoryWindows ? 'true' : '',
    generalConservatoryRoof: formData.isGeneralEnquiry && formData.generalEnquiryDetails?.requestedServices?.conservatoryRoof ? 'true' : '',
    generalGutterClearing: formData.isGeneralEnquiry && formData.generalEnquiryDetails?.requestedServices?.gutterClearing ? 'true' : '',
    generalFasciaSoffit: formData.isGeneralEnquiry && formData.generalEnquiryDetails?.requestedServices?.fasciaSoffitGutter ? 'true' : '',
    generalSolarPanels: formData.isGeneralEnquiry && formData.generalEnquiryDetails?.requestedServices?.solarPanels ? 'true' : '',
    generalOtherService: formData.isGeneralEnquiry && formData.generalEnquiryDetails?.requestedServices?.other ? 'true' : '',

    // Quote Requests - Convert booleans to strings for EmailJS
    quoteSolarPanels: formData.quoteRequests?.solarPanelCleaning ? 'true' : '',
    quoteConservatoryRoof: formData.quoteRequests?.conservatoryRoofCleaning ? 'true' : '',
    
    // Custom Quote Details
    customDetails: formData.isCustomQuote ? (formData.customResidentialDetails?.otherNotes || '') : '',
    customBudget: formData.isCustomQuote ? (formData.customResidentialDetails?.budget || '') : '',
    
    // reCAPTCHA - EmailJS expects this exact parameter name
    'g-recaptcha-response': formData.recaptchaToken || ''
  };
};

// Export for use in improved component
export const mapFormDataToTemplateParams = (formData) => {
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
    // Additional Services - Individual boolean flags for template
    additionalServiceConservatoryRoof: false, // Default
    additionalServiceFasciaSoffitGutter: false, // Default  
    additionalServiceGutterClearing: false, // Default
    selectedWindowServiceName: 'N/A', // Default
    selectedWindowServiceType: 'N/A', // Default
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

    // Custom Residential Quote Details - Flattened for EmailJS
    customResidentialExactBedrooms: formData.isCustomQuote ? (formData.customResidentialDetails?.exactBedrooms || 'N/A') : 'N/A',
    customResidentialApproxWindows: formData.isCustomQuote ? (formData.customResidentialDetails?.approxWindows || 'N/A') : 'N/A',
    customResidentialAccessIssues: formData.isCustomQuote ? (formData.customResidentialDetails?.accessIssues || 'N/A') : 'N/A',
    customResidentialPropertyStyle: formData.isCustomQuote ? (formData.customResidentialDetails?.propertyStyle || 'N/A') : 'N/A',
    customResidentialOtherPropertyStyleText: formData.isCustomQuote ? (formData.customResidentialDetails?.otherPropertyStyleText || '') : '',
    customResidentialOtherServiceText: formData.isCustomQuote ? (formData.customResidentialDetails?.otherServiceText || '') : '',
    customResidentialFrequencyPreference: formData.isCustomQuote ? (formData.customResidentialDetails?.frequencyPreference || 'N/A') : 'N/A',
    customResidentialOtherFrequencyText: formData.isCustomQuote ? (formData.customResidentialDetails?.otherFrequencyText || '') : '',
    customResidentialOtherNotes: formData.isCustomQuote ? (formData.customResidentialDetails?.otherNotes || 'N/A') : 'N/A',
    customResidentialAdditionalComments: formData.isCustomQuote ? (formData.customResidentialDetails?.customAdditionalComments || 'N/A') : 'N/A',
    
    // Custom Residential Services - Individual boolean flags
    customResidentialWindowCleaning: formData.isCustomQuote ? !!(formData.customResidentialDetails?.servicesRequested?.windowCleaning) : false,
    customResidentialGutterCleaning: formData.isCustomQuote ? !!(formData.customResidentialDetails?.servicesRequested?.gutterCleaning) : false,
    customResidentialFasciaSoffitCleaning: formData.isCustomQuote ? !!(formData.customResidentialDetails?.servicesRequested?.fasciaSoffitCleaning) : false,
    customResidentialConservatoryWindowCleaning: formData.isCustomQuote ? !!(formData.customResidentialDetails?.servicesRequested?.conservatoryWindowCleaning) : false,
    customResidentialConservatoryRoofCleaning: formData.isCustomQuote ? !!(formData.customResidentialDetails?.servicesRequested?.conservatoryRoofCleaning) : false,
    customResidentialOtherService: formData.isCustomQuote ? !!(formData.customResidentialDetails?.servicesRequested?.other) : false,

    // Commercial Enquiry Details - Flattened for EmailJS
    commercialBusinessName: formData.isCommercial ? (formData.commercialDetails?.businessName || 'N/A') : 'N/A',
    commercialPropertyType: formData.isCommercial ? (formData.commercialDetails?.propertyType || 'N/A') : 'N/A',
    commercialApproxSizeOrWindows: formData.isCommercial ? (formData.commercialDetails?.approxSizeOrWindows || 'N/A') : 'N/A',
    commercialOtherServiceDetails: formData.isCommercial ? (formData.commercialDetails?.otherServiceDetails || '') : '',
    commercialSpecificRequirements: formData.isCommercial ? (formData.commercialDetails?.specificRequirements || 'N/A') : 'N/A',
    commercialOtherServiceText: formData.isCommercial ? (formData.commercialDetails?.otherServiceText || '') : '',
    commercialFrequencyPreference: formData.isCommercial ? (formData.commercialDetails?.frequencyPreference || 'N/A') : 'N/A',
    commercialOtherFrequencyText: formData.isCommercial ? (formData.commercialDetails?.otherFrequencyText || '') : '',
    commercialOtherNotes: formData.isCommercial ? (formData.commercialDetails?.otherNotes || 'N/A') : 'N/A',
    
    // Commercial Services - Individual boolean flags
    commercialWindowCleaning: formData.isCommercial ? !!(formData.commercialDetails?.services?.windowCleaning || formData.commercialDetails?.servicesRequested?.windowCleaning) : false,
    commercialGutterClearing: formData.isCommercial ? !!(formData.commercialDetails?.services?.gutterClearing || formData.commercialDetails?.servicesRequested?.gutterClearing) : false,
    commercialFasciaSoffit: formData.isCommercial ? !!(formData.commercialDetails?.services?.fasciaSoffit || formData.commercialDetails?.servicesRequested?.fasciaSoffitCleaning) : false,
    commercialSolarPanels: formData.isCommercial ? !!(formData.commercialDetails?.services?.solarPanels) : false,
    commercialPressureWashing: formData.isCommercial ? !!(formData.commercialDetails?.services?.pressureWashing) : false,
    commercialCladdingCleaning: formData.isCommercial ? !!(formData.commercialDetails?.servicesRequested?.claddingCleaning) : false,
    commercialSignageCleaning: formData.isCommercial ? !!(formData.commercialDetails?.servicesRequested?.signageCleaning) : false,
    commercialOtherService: formData.isCommercial ? !!(formData.commercialDetails?.services?.other || formData.commercialDetails?.servicesRequested?.other) : false,
    
    // Commercial Services Formatted String
    commercialServicesRequestedFormatted: formData.isCommercial ? (() => {
        const services = formData.commercialDetails?.services || {};
        const frequencies = formData.commercialDetails?.frequencies || {};
        const legacyServices = formData.commercialDetails?.servicesRequested || {};
        const selectedServices = [];
        
        if (services.windowCleaning || legacyServices.windowCleaning) {
            selectedServices.push(`Window Cleaning${frequencies.windowCleaning ? ` (${frequencies.windowCleaning})` : ''}`);
        }
        if (services.gutterClearing || legacyServices.gutterCleaning) {
            selectedServices.push(`Gutter Clearing${frequencies.gutterClearing ? ` (${frequencies.gutterClearing})` : ''}`);
        }
        if (services.fasciaSoffit || legacyServices.fasciaSoffitCleaning) {
            selectedServices.push(`Fascia & Soffit Cleaning${frequencies.fasciaSoffit ? ` (${frequencies.fasciaSoffit})` : ''}`);
        }
        if (legacyServices.claddingCleaning) {
            selectedServices.push(`Cladding Cleaning`);
        }
        if (legacyServices.signageCleaning) {
            selectedServices.push(`Signage Cleaning`);
        }
        if (services.solarPanels) {
            selectedServices.push(`Solar Panel Cleaning${frequencies.solarPanels ? ` (${frequencies.solarPanels})` : ''}`);
        }
        if (services.pressureWashing) {
            selectedServices.push(`Pressure Washing${frequencies.pressureWashing ? ` (${frequencies.pressureWashing})` : ''}`);
        }
        if (services.other || legacyServices.other) {
            const otherDetails = formData.commercialDetails?.otherServiceDetails || formData.commercialDetails?.otherServiceText || 'Other services';
            const otherFreq = frequencies.other || '';
            selectedServices.push(`${otherDetails}${otherFreq ? ` (${otherFreq})` : ''}`);
        }
        
        return selectedServices.length > 0 ? selectedServices.join(', ') : 'None selected';
    })() : 'N/A',

    // General Enquiry Details - Flattened for EmailJS
    generalEnquiryOtherServiceText: formData.isGeneralEnquiry ? (formData.generalEnquiryDetails?.otherServiceText || '') : '',
    generalEnquiryRequestedFrequency: formData.isGeneralEnquiry ? (formData.generalEnquiryDetails?.requestedFrequency || 'N/A') : 'N/A',
    generalEnquiryComments: formData.isGeneralEnquiry ? (formData.generalEnquiryDetails?.enquiryComments || 'N/A') : 'N/A',
    generalEnquiryCustomerStatus: formData.isGeneralEnquiry ? (formData.generalEnquiryDetails?.customerStatus || 'N/A') : 'N/A',
    
    // General Enquiry Services - Individual boolean flags
    generalEnquiryWindowCleaning: formData.isGeneralEnquiry ? !!(formData.generalEnquiryDetails?.requestedServices?.windowCleaning) : false,
    generalEnquiryConservatoryWindows: formData.isGeneralEnquiry ? !!(formData.generalEnquiryDetails?.requestedServices?.conservatoryWindows) : false,
    generalEnquiryConservatoryRoof: formData.isGeneralEnquiry ? !!(formData.generalEnquiryDetails?.requestedServices?.conservatoryRoof) : false,
    generalEnquiryGutterClearing: formData.isGeneralEnquiry ? !!(formData.generalEnquiryDetails?.requestedServices?.gutterClearing) : false,
    generalEnquiryFasciaSoffitGutter: formData.isGeneralEnquiry ? !!(formData.generalEnquiryDetails?.requestedServices?.fasciaSoffitGutter) : false,
    generalEnquirySolarPanels: formData.isGeneralEnquiry ? !!(formData.generalEnquiryDetails?.requestedServices?.solarPanels) : false,
    generalEnquiryOtherService: formData.isGeneralEnquiry ? !!(formData.generalEnquiryDetails?.requestedServices?.other) : false,

    // reCAPTCHA
    'g-recaptcha-response': formData.recaptchaToken || '',

    // Quote requests - Individual boolean flags
    quoteRequestSolarPanelCleaning: !!(formData.quoteRequests?.solarPanelCleaning),
    quoteRequestConservatoryRoofCleaning: !!(formData.quoteRequests?.conservatoryRoofCleaning),

    // Add a flag for non-zero grand total for template logic
    grandTotal_not_zero: formData.grandTotal > 0
  };

  // Populate standard residential details if applicable
  if (is_standard_residential_booking_bool) {
    params.propertyType = formData.propertyType || 'N/A';
    params.bedrooms = formData.bedrooms || 'N/A';
    params.selectedFrequency = formData.selectedFrequency || 'N/A';
    params.initialWindowPricetoFixed2 = formatPrice(formData.initialWindowPrice);
    params.selectedWindowServiceName = formData.selectedWindowService?.name || 'N/A';
    params.selectedWindowServiceType = formData.selectedWindowService?.type || 'N/A';
    params.hasConservatory = formData.hasConservatory || false;
    params.conservatorySurchargetoFixed2 = formatPrice(formData.conservatorySurcharge);
    params.hasExtension = formData.hasExtension || false;
    params.extensionSurchargetoFixed2 = formatPrice(formData.extensionSurcharge);
    
    // Additional Services for Standard Residential
    params.additionalServiceConservatoryRoof = !!formData.additionalServices?.[FORM_CONSTANTS.ADDON_CONSERVATORY_ROOF];
    params.additionalServiceFasciaSoffitGutter = !!formData.additionalServices?.[FORM_CONSTANTS.ADDON_FASCIA_SOFFIT_GUTTER];
    params.additionalServiceGutterClearing = !!formData.additionalServices?.[FORM_CONSTANTS.ADDON_GUTTER_CLEARING];
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
  
  // Add form persistence to prevent data loss
  const { clearSavedData } = useFormPersistence(formData, setFormData);

  // Generic handleChange for simple inputs, used by PropertyDetailsAndReview
  const genericHandleChange = (input) => (e) => {
    const { value, type, checked } = e.target;
    let inputValue = type === 'checkbox' ? checked : value;
    
    // Uppercase postcode for proper matching with schedule data
    if (input === 'postcode' && typeof inputValue === 'string') {
        inputValue = inputValue.toUpperCase().trim();
    }

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

  // Simplified handleSubmit using EmailJS only
  const handleSubmit = async (formDataToSubmit) => {
    if (!formDataToSubmit.recaptchaToken) { 
      setSubmissionError("Please complete the reCAPTCHA verification.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setSubmissionError(null);

    try {
      // Sanitize form data before submission
      const sanitizedFormData = sanitizeFormData(formDataToSubmit);
      
      // Send email using EmailJS
      const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
      const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
      const userId = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

      // Remove console.log for production (H004 fix)
      
      if (serviceId && templateId && userId) {
        const templateParams = mapFormDataToTemplateParamsSimple(sanitizedFormData);
        
        // Generate a simple booking reference
        const bookingRef = `SWC${Date.now().toString(36).toUpperCase().slice(-6)}`;
        templateParams.bookingReference = bookingRef;
        templateParams.timestamp = new Date().toLocaleString('en-GB', { 
          dateStyle: 'full', 
          timeStyle: 'short' 
        });
        
        await emailjs.send(serviceId, templateId, templateParams, userId);
        // Remove console.log for production (H004 fix)
        
        // Store booking reference for confirmation page
        setFormData(prev => ({ ...prev, bookingReference: bookingRef, isSubmitted: true }));
        setCurrentStep(4); // Go to thank you page
        clearSavedData();
        
      } else {
        throw new Error('Email service not configured. Please check environment variables.');
      }
      
    } catch (error) {
      // Use proper error handling instead of console.error (H004 fix)
      const errorMessage = error.message || 'Unknown error occurred';
      const typeOfSubmission = formDataToSubmit.isCommercial || formDataToSubmit.isCustomQuote || formDataToSubmit.isGeneralEnquiry;
      setSubmissionError(`An error occurred while submitting your ${getEnquiryOrBookingText(typeOfSubmission)}. ${errorMessage}. Please try again or contact us directly.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Render steps based on currentStep
  // Pass CONSERVATORY_SURCHARGE to AdditionalServicesForm
  return (
    <>
      {/* Screen reader announcement for form title */}
      <h1 className="sr-only">Somerset Window Cleaning Booking Form</h1>
      
      {/* Add progress bar for steps 1-3 */}
      {currentStep <= 3 && (
        <div className="container mx-auto px-6 py-4">
          <SimpleProgressBar currentStep={currentStep} totalSteps={3} />
        </div>
      )}
      
      
      {/* Render current step */}
      {(() => {
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
    case 3: // Combined Property Details and Review
      return <PropertyDetailsAndReview 
                prevStep={prevStep} 
                handleChange={genericHandleChange}
                values={formData} 
                setFormData={setFormData}
                handleSubmit={handleSubmit}
                isLoading={isLoading} 
                submissionError={submissionError} 
             />;
    case 4: // Thank You / Confirmation page
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
                    onClick={() => { setCurrentStep(3); setSubmissionError(null); }} 
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
      })()}
    </>
  );
}

export default BookingForm;
