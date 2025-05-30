import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Action types
const FORM_ACTIONS = {
  UPDATE_FIELD: 'UPDATE_FIELD',
  UPDATE_NESTED_FIELD: 'UPDATE_NESTED_FIELD',
  SET_STEP: 'SET_STEP',
  RESET_FORM: 'RESET_FORM',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CALCULATE_PRICING: 'CALCULATE_PRICING'
};

// Initial state
const initialState = {
  currentStep: 1,
  isLoading: false,
  error: null,
  formData: {
    // Step 1: Service Selection
    propertyType: '',
    bedrooms: '',
    selectedFrequency: '',
    initialWindowPrice: 0,
    
    // Step 2: Additional Services
    hasConservatory: false,
    hasExtension: false,
    additionalServices: {},
    
    // Step 3: Contact Details
    customerName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    townCity: '',
    postcode: '',
    preferredContactMethod: 'email',
    selectedDate: null,
    
    // Pricing
    subTotalBeforeDiscount: 0,
    conservatorySurcharge: 0,
    extensionSurcharge: 0,
    windowCleaningDiscount: 0,
    grandTotal: 0,
    
    // Form type flags
    isCustomQuote: false,
    isCommercial: false,
    isResidential: false,
    isGeneralEnquiry: false
  }
};

// Reducer
function formReducer(state, action) {
  switch (action.type) {
    case FORM_ACTIONS.UPDATE_FIELD:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value
        }
      };
      
    case FORM_ACTIONS.UPDATE_NESTED_FIELD:
      const keys = action.field.split('.');
      let newFormData = { ...state.formData };
      let current = newFormData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = action.value;
      
      return { ...state, formData: newFormData };
      
    case FORM_ACTIONS.SET_STEP:
      return { ...state, currentStep: action.step };
      
    case FORM_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.isLoading };
      
    case FORM_ACTIONS.SET_ERROR:
      return { ...state, error: action.error };
      
    case FORM_ACTIONS.CALCULATE_PRICING:
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.pricingData
        }
      };
      
    case FORM_ACTIONS.RESET_FORM:
      return initialState;
      
    default:
      return state;
  }
}

// Create context
const FormContext = createContext();

// Provider component
export function FormProvider({ children }) {
  const [state, dispatch] = useReducer(formReducer, initialState);
  
  // Actions
  const updateField = useCallback((field, value) => {
    dispatch({ type: FORM_ACTIONS.UPDATE_FIELD, field, value });
  }, []);
  
  const updateNestedField = useCallback((field, value) => {
    dispatch({ type: FORM_ACTIONS.UPDATE_NESTED_FIELD, field, value });
  }, []);
  
  const setStep = useCallback((step) => {
    dispatch({ type: FORM_ACTIONS.SET_STEP, step });
    window.scrollTo(0, 0);
  }, []);
  
  const setLoading = useCallback((isLoading) => {
    dispatch({ type: FORM_ACTIONS.SET_LOADING, isLoading });
  }, []);
  
  const setError = useCallback((error) => {
    dispatch({ type: FORM_ACTIONS.SET_ERROR, error });
  }, []);
  
  const calculatePricing = useCallback((pricingData) => {
    dispatch({ type: FORM_ACTIONS.CALCULATE_PRICING, pricingData });
  }, []);
  
  const resetForm = useCallback(() => {
    dispatch({ type: FORM_ACTIONS.RESET_FORM });
  }, []);
  
  const nextStep = useCallback(() => {
    setStep(state.currentStep + 1);
  }, [state.currentStep, setStep]);
  
  const prevStep = useCallback(() => {
    setStep(state.currentStep - 1);
  }, [state.currentStep, setStep]);
  
  const value = {
    ...state,
    updateField,
    updateNestedField,
    setStep,
    nextStep,
    prevStep,
    setLoading,
    setError,
    calculatePricing,
    resetForm
  };
  
  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
}

// Hook to use form context
export function useForm() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within FormProvider');
  }
  return context;
}

// Export action types for use in other components
export { FORM_ACTIONS };