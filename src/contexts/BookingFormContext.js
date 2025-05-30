// Enhanced booking form context with better state management
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import * as FORM_CONSTANTS from '../constants/formConstants';

// Initial form data
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

  // From AdditionalServicesForm (Step 2)
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

// Action types
const ACTION_TYPES = {
  UPDATE_FIELD: 'UPDATE_FIELD',
  UPDATE_NESTED_FIELD: 'UPDATE_NESTED_FIELD',
  RESET_FORM: 'RESET_FORM',
  SET_FORM_DATA: 'SET_FORM_DATA',
  UPDATE_PRICING: 'UPDATE_PRICING',
  SET_RECAPTCHA_TOKEN: 'SET_RECAPTCHA_TOKEN'
};

// Reducer function
const formReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.UPDATE_FIELD:
      return {
        ...state,
        [action.field]: action.value
      };

    case ACTION_TYPES.UPDATE_NESTED_FIELD:
      const keys = action.field.split('.');
      const updatedState = { ...state };
      let current = updatedState;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = action.value;
      
      return updatedState;

    case ACTION_TYPES.SET_FORM_DATA:
      return {
        ...state,
        ...action.data
      };

    case ACTION_TYPES.UPDATE_PRICING:
      return {
        ...state,
        ...action.pricing
      };

    case ACTION_TYPES.SET_RECAPTCHA_TOKEN:
      return {
        ...state,
        recaptchaToken: action.token
      };

    case ACTION_TYPES.RESET_FORM:
      return { ...initialFormData };

    default:
      return state;
  }
};

// Context
const BookingFormContext = createContext();

// Provider component
export const BookingFormProvider = ({ children }) => {
  const [formData, dispatch] = useReducer(formReducer, initialFormData);

  // Action creators
  const updateField = useCallback((field, value) => {
    dispatch({ type: ACTION_TYPES.UPDATE_FIELD, field, value });
  }, []);

  const updateNestedField = useCallback((field, value) => {
    dispatch({ type: ACTION_TYPES.UPDATE_NESTED_FIELD, field, value });
  }, []);

  const setFormData = useCallback((data) => {
    dispatch({ type: ACTION_TYPES.SET_FORM_DATA, data });
  }, []);

  const updatePricing = useCallback((pricing) => {
    dispatch({ type: ACTION_TYPES.UPDATE_PRICING, pricing });
  }, []);

  const setRecaptchaToken = useCallback((token) => {
    dispatch({ type: ACTION_TYPES.SET_RECAPTCHA_TOKEN, token });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: ACTION_TYPES.RESET_FORM });
  }, []);

  // Generic change handler for form inputs
  const handleChange = useCallback((field) => (e) => {
    const { value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    if (field.includes('.')) {
      updateNestedField(field, inputValue);
    } else {
      updateField(field, inputValue);
    }
  }, [updateField, updateNestedField]);

  // Utility functions
  const getBookingType = useCallback(() => {
    if (formData.isCommercial) return 'commercial';
    if (formData.isCustomQuote) return 'custom';
    if (formData.isGeneralEnquiry) return 'general';
    return 'standard';
  }, [formData.isCommercial, formData.isCustomQuote, formData.isGeneralEnquiry]);

  const isStandardResidential = useCallback(() => {
    return formData.isResidential && 
           !formData.isCustomQuote && 
           !formData.isCommercial && 
           !formData.isGeneralEnquiry;
  }, [formData.isResidential, formData.isCustomQuote, formData.isCommercial, formData.isGeneralEnquiry]);

  const hasValidPricing = useCallback(() => {
    return formData.grandTotal > 0;
  }, [formData.grandTotal]);

  const value = {
    formData,
    updateField,
    updateNestedField,
    setFormData,
    updatePricing,
    setRecaptchaToken,
    resetForm,
    handleChange,
    getBookingType,
    isStandardResidential,
    hasValidPricing,
    ACTION_TYPES
  };

  return (
    <BookingFormContext.Provider value={value}>
      {children}
    </BookingFormContext.Provider>
  );
};

// Custom hook to use the context
export const useBookingForm = () => {
  const context = useContext(BookingFormContext);
  if (!context) {
    throw new Error('useBookingForm must be used within a BookingFormProvider');
  }
  return context;
};

export default BookingFormContext;