/**
 * Shared Types and Interfaces for Window Cleaning Booking System
 * Central type definitions for consistency across the application
 */

import PropTypes from 'prop-types';
import * as FORM_CONSTANTS from '../constants/formConstants';

// Form Data Shape
export const FormDataShape = PropTypes.shape({
  // Basic booking info
  propertyType: PropTypes.string,
  bedrooms: PropTypes.string,
  selectedFrequency: PropTypes.string,
  initialWindowPrice: PropTypes.number,
  selectedWindowService: PropTypes.shape({
    name: PropTypes.string,
    price: PropTypes.number,
    frequency: PropTypes.string
  }),

  // Booking type flags
  isCustomQuote: PropTypes.bool,
  isCommercial: PropTypes.bool,
  isResidential: PropTypes.bool,
  isGeneralEnquiry: PropTypes.bool,

  // Property features
  hasConservatory: PropTypes.bool,
  hasExtension: PropTypes.bool,

  // Additional services
  additionalServices: PropTypes.shape({
    [FORM_CONSTANTS.ADDON_CONSERVATORY_ROOF]: PropTypes.bool,
    [FORM_CONSTANTS.ADDON_FASCIA_SOFFIT_GUTTER]: PropTypes.bool,
    [FORM_CONSTANTS.ADDON_GUTTER_CLEARING]: PropTypes.bool,
  }),

  // Pricing
  gutterClearingServicePrice: PropTypes.number,
  fasciaSoffitGutterServicePrice: PropTypes.number,
  windowCleaningDiscount: PropTypes.number,
  subTotalBeforeDiscount: PropTypes.number,
  conservatorySurcharge: PropTypes.number,
  extensionSurcharge: PropTypes.number,
  grandTotal: PropTypes.number,

  // Customer information
  customerName: PropTypes.string,
  addressLine1: PropTypes.string,
  addressLine2: PropTypes.string,
  townCity: PropTypes.string,
  county: PropTypes.string,
  postcode: PropTypes.string,
  email: PropTypes.string,
  mobile: PropTypes.string,
  landline: PropTypes.string,
  preferredContactMethod: PropTypes.oneOf(['phone', 'email', 'text']),
  preferredContactTime: PropTypes.string,
  bestTimeToCall: PropTypes.string,

  // Notes and special requirements
  accessNotes: PropTypes.string,
  bookingNotes: PropTypes.string,
  recaptchaToken: PropTypes.string,

  // Submission state
  isSubmitted: PropTypes.bool,
  submittedAt: PropTypes.string,
  bookingReference: PropTypes.string,

  // Commercial details
  commercialDetails: PropTypes.shape({
    companyName: PropTypes.string,
    businessType: PropTypes.string,
    vatNumber: PropTypes.string,
    accountsContact: PropTypes.string,
    billingAddress: PropTypes.string,
    
    servicesRequested: PropTypes.shape({
      [FORM_CONSTANTS.COMM_SERVICE_WINDOW_CLEANING]: PropTypes.bool,
      [FORM_CONSTANTS.COMM_SERVICE_GUTTER_CLEANING]: PropTypes.bool,
      [FORM_CONSTANTS.COMM_SERVICE_FASCIA_SOFFIT_CLEANING]: PropTypes.bool,
      [FORM_CONSTANTS.COMM_SERVICE_SOLAR_PANEL_CLEANING]: PropTypes.bool,
      [FORM_CONSTANTS.COMM_SERVICE_PRESSURE_WASHING]: PropTypes.bool,
      [FORM_CONSTANTS.COMM_SERVICE_CLADDING_CLEANING]: PropTypes.bool,
      [FORM_CONSTANTS.COMM_SERVICE_SIGNAGE_CLEANING]: PropTypes.bool,
      [FORM_CONSTANTS.COMM_SERVICE_OTHER]: PropTypes.bool,
    }),
    
    frequencies: PropTypes.shape({
      windowCleaningExternal: PropTypes.string,
      windowCleaningInternal: PropTypes.string,
      gutterClearing: PropTypes.string,
      fasciaSoffit: PropTypes.string,
      solarPanels: PropTypes.string,
      pressureWashing: PropTypes.string,
      claddingCleaning: PropTypes.string,
      signageCleaning: PropTypes.string,
      other: PropTypes.string
    }),
    
    numberOfFloors: PropTypes.string,
    preferredCleaningTimes: PropTypes.string,
    accessRequirements: PropTypes.string,
    healthSafetyRequirements: PropTypes.string,
    parkingAvailable: PropTypes.string,
    contactPerson: PropTypes.string,
    contactRole: PropTypes.string,
    otherServiceDetails: PropTypes.string,
    otherServiceText: PropTypes.string,
    frequencyPreference: PropTypes.string,
    otherFrequencyText: PropTypes.string,
    otherNotes: PropTypes.string
  }),

  // General enquiry details
  generalEnquiryDetails: PropTypes.shape({
    requestedServices: PropTypes.shape({
      [FORM_CONSTANTS.GEN_ENQ_SERVICE_WINDOW_CLEANING]: PropTypes.bool,
      [FORM_CONSTANTS.GEN_ENQ_SERVICE_CONSERVATORY_WINDOWS]: PropTypes.bool,
      [FORM_CONSTANTS.ADDON_CONSERVATORY_ROOF]: PropTypes.bool,
      [FORM_CONSTANTS.ADDON_GUTTER_CLEARING]: PropTypes.bool,
      [FORM_CONSTANTS.ADDON_FASCIA_SOFFIT_GUTTER]: PropTypes.bool,
      [FORM_CONSTANTS.GEN_ENQ_SERVICE_SOLAR_PANELS]: PropTypes.bool,
      [FORM_CONSTANTS.GEN_ENQ_SERVICE_OTHER]: PropTypes.bool,
    }),
    otherServiceText: PropTypes.string,
    requestedFrequency: PropTypes.string,
    enquiryComments: PropTypes.string,
    customerStatus: PropTypes.string
  }),

  // Quote requests
  quoteRequests: PropTypes.shape({
    [FORM_CONSTANTS.QUOTE_REQUEST_SOLAR_PANEL_CLEANING]: PropTypes.bool,
    [FORM_CONSTANTS.QUOTE_REQUEST_CONSERVATORY_ROOF_CLEANING]: PropTypes.bool
  })
});

// Service Selection Shape
export const ServiceShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  frequency: PropTypes.string.isRequired,
  description: PropTypes.string
});

// Pricing Calculation Shape
export const PricingShape = PropTypes.shape({
  subTotalBeforeDiscount: PropTypes.number.isRequired,
  conservatorySurcharge: PropTypes.number.isRequired,
  extensionSurcharge: PropTypes.number.isRequired,
  grandTotal: PropTypes.number.isRequired,
  windowCleaningDiscount: PropTypes.number.isRequired
});

// Validation Result Shape
export const ValidationResultShape = PropTypes.shape({
  isValid: PropTypes.bool.isRequired,
  errors: PropTypes.arrayOf(PropTypes.string)
});

// Email Template Parameters Shape
export const EmailTemplateParamsShape = PropTypes.shape({
  booking_type: PropTypes.string,
  booking_reference: PropTypes.string,
  submitted_date: PropTypes.string,
  customer_name: PropTypes.string,
  email: PropTypes.string,
  mobile: PropTypes.string,
  address_line1: PropTypes.string,
  postcode: PropTypes.string,
  selected_window_service: PropTypes.string,
  grand_total: PropTypes.string
});

// Step Navigation Props
export const StepNavigationProps = {
  currentStep: PropTypes.number.isRequired,
  nextStep: PropTypes.func,
  prevStep: PropTypes.func,
  goToStep: PropTypes.func,
  totalSteps: PropTypes.number
};

// Form Component Props
export const FormComponentProps = {
  values: FormDataShape.isRequired,
  setFormData: PropTypes.func.isRequired,
  handleChange: PropTypes.func,
  ...StepNavigationProps
};

// Loading and Error Props
export const LoadingErrorProps = {
  isLoading: PropTypes.bool,
  submissionError: PropTypes.string,
  handleSubmit: PropTypes.func
};

// Constants for booking types
export const BOOKING_TYPES = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
  GENERAL_ENQUIRY: 'general_enquiry',
  CUSTOM_QUOTE: 'custom_quote'
};

// Constants for contact methods
export const CONTACT_METHODS = {
  PHONE: 'phone',
  EMAIL: 'email',
  TEXT: 'text'
};

// Constants for property types
export const PROPERTY_TYPES = {
  FLAT: 'flat',
  TERRACED: 'terraced',
  SEMI_DETACHED: 'semi-detached',
  DETACHED: 'detached',
  BUNGALOW: 'bungalow'
};

// Constants for frequencies
export const FREQUENCIES = {
  WEEKLY: 'weekly',
  FORTNIGHTLY: 'fortnightly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  ONE_OFF: 'one-off'
};

// API Response Shapes
export const ApiResponseShape = PropTypes.shape({
  success: PropTypes.bool.isRequired,
  data: PropTypes.any,
  error: PropTypes.string,
  message: PropTypes.string
});

export const BookingSubmissionResponseShape = PropTypes.shape({
  success: PropTypes.bool.isRequired,
  bookingReference: PropTypes.string,
  submittedAt: PropTypes.string,
  error: PropTypes.string
});

// Component State Shapes
export const FormStateShape = PropTypes.shape({
  currentStep: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
  submissionError: PropTypes.string,
  validationErrors: PropTypes.arrayOf(PropTypes.string)
});

// Default values for form initialization
export const DEFAULT_FORM_VALUES = {
  propertyType: '',
  bedrooms: '',
  selectedFrequency: '',
  initialWindowPrice: 0,
  selectedWindowService: null,
  isCustomQuote: false,
  isCommercial: false,
  isResidential: false,
  isGeneralEnquiry: false,
  hasConservatory: false,
  hasExtension: false,
  customerName: '',
  email: '',
  mobile: '',
  addressLine1: '',
  postcode: '',
  preferredContactMethod: 'phone',
  isSubmitted: false
};

// Export all types for easy importing
export default {
  FormDataShape,
  ServiceShape,
  PricingShape,
  ValidationResultShape,
  EmailTemplateParamsShape,
  StepNavigationProps,
  FormComponentProps,
  LoadingErrorProps,
  ApiResponseShape,
  BookingSubmissionResponseShape,
  FormStateShape,
  BOOKING_TYPES,
  CONTACT_METHODS,
  PROPERTY_TYPES,
  FREQUENCIES,
  DEFAULT_FORM_VALUES
};