import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from '../utils/stateUtils';

/**
 * Enhanced field validation hook with debouncing and real-time feedback
 */
export const useFieldValidation = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValidating, setIsValidating] = useState({});
  const validationTimeouts = useRef({});

  // Validation rules
  const validators = {
    customerName: (value) => {
      if (!value || value.trim().length < 2) {
        return 'Name must be at least 2 characters';
      }
      if (value.length > 100) {
        return 'Name must be less than 100 characters';
      }
      if (!/^[a-zA-Z\s\-']+$/.test(value)) {
        return 'Name can only contain letters, spaces, hyphens and apostrophes';
      }
      return null;
    },

    email: (value) => {
      if (!value) return 'Email is required';
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
      
      if (value.length > 254) {
        return 'Email address is too long';
      }
      
      return null;
    },

    mobile: (value) => {
      if (!value) return 'Mobile number is required';
      
      // Remove spaces and non-numeric characters for validation
      const cleaned = value.replace(/\D/g, '');
      
      // UK mobile number patterns
      const ukMobileRegex = /^(07\d{9}|447\d{9})$/;
      const ukLandlineRegex = /^(0[1-9]\d{8,9})$/;
      
      if (!ukMobileRegex.test(cleaned) && !ukLandlineRegex.test(cleaned)) {
        return 'Please enter a valid UK phone number';
      }
      
      return null;
    },

    addressLine1: (value) => {
      if (!value || value.trim().length < 3) {
        return 'Address is required (minimum 3 characters)';
      }
      if (value.length > 100) {
        return 'Address is too long';
      }
      return null;
    },

    townCity: (value) => {
      if (!value || value.trim().length < 2) {
        return 'Town/City is required';
      }
      if (value.length > 50) {
        return 'Town/City name is too long';
      }
      if (!/^[a-zA-Z\s\-]+$/.test(value)) {
        return 'Town/City can only contain letters, spaces and hyphens';
      }
      return null;
    },

    postcode: (value) => {
      if (!value) return 'Postcode is required';
      
      // UK postcode regex (flexible format)
      const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
      
      if (!postcodeRegex.test(value.trim())) {
        return 'Please enter a valid UK postcode';
      }
      
      return null;
    },

    bookingNotes: (value) => {
      if (value && value.length > 500) {
        return 'Notes must be less than 500 characters';
      }
      return null;
    }
  };

  /**
   * Validates a single field
   */
  const validateField = useCallback((name, value) => {
    const validator = validators[name];
    if (!validator) return null;
    
    return validator(value);
  }, []);

  /**
   * Validates all fields
   */
  const validateAll = useCallback(() => {
    const newErrors = {};
    let hasErrors = false;

    Object.keys(values).forEach(field => {
      if (validators[field]) {
        const error = validateField(field, values[field]);
        if (error) {
          newErrors[field] = error;
          hasErrors = true;
        }
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  }, [values, validateField]);

  /**
   * Handles field change with debounced validation
   */
  const handleChange = useCallback((name, value) => {
    // Update value immediately
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear previous validation timeout
    if (validationTimeouts.current[name]) {
      clearTimeout(validationTimeouts.current[name]);
    }
    
    // Set validating state
    setIsValidating(prev => ({ ...prev, [name]: true }));
    
    // Debounced validation
    validationTimeouts.current[name] = setTimeout(() => {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
      setIsValidating(prev => ({ ...prev, [name]: false }));
    }, 300);
  }, [validateField]);

  /**
   * Handles field blur
   */
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Immediate validation on blur
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField, values]);

  /**
   * Resets form state
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsValidating({});
    
    // Clear all timeouts
    Object.values(validationTimeouts.current).forEach(clearTimeout);
    validationTimeouts.current = {};
  }, [initialValues]);

  /**
   * Sets multiple values at once
   */
  const setMultipleValues = useCallback((newValues) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  /**
   * Gets error for a field (only if touched)
   */
  const getFieldError = useCallback((name) => {
    return touched[name] ? errors[name] : null;
  }, [touched, errors]);

  /**
   * Checks if form is valid
   */
  const isValid = useCallback(() => {
    return Object.keys(errors).length === 0 && 
           Object.keys(validators).every(field => 
             values[field] !== undefined && values[field] !== ''
           );
  }, [errors, values]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(validationTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  return {
    values,
    errors,
    touched,
    isValidating,
    handleChange,
    handleBlur,
    validateAll,
    validateField,
    reset,
    setMultipleValues,
    getFieldError,
    isValid: isValid(),
    setFieldValue: (name, value) => handleChange(name, value),
    setFieldTouched: (name) => setTouched(prev => ({ ...prev, [name]: true }))
  };
};

/**
 * Hook for form submission with validation
 */
export const useFormSubmit = (onSubmit) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSubmit = useCallback(async (values, validateFn) => {
    setSubmitError(null);
    
    // Validate first
    if (validateFn && !validateFn()) {
      setSubmitError('Please fix the errors in the form');
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(values);
      
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
      return true;
    } catch (error) {
      if (isMountedRef.current) {
        setIsSubmitting(false);
        setSubmitError(error.message || 'An error occurred while submitting');
      }
      return false;
    }
  }, [onSubmit]);

  return {
    isSubmitting,
    submitError,
    handleSubmit,
    clearError: () => setSubmitError(null)
  };
};