// Validation rules and utilities

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// UK postcode regex (comprehensive)
const UK_POSTCODE_REGEX = /^([A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}|GIR\s?0AA)$/i;

// UK mobile phone regex
const UK_MOBILE_REGEX = /^(\+44|0)7\d{9}$/;

// Validation rules for each field
export const validationRules = {
  // Contact Information
  customerName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: 'Please enter a valid name (letters, spaces, hyphens, and apostrophes only)'
  },
  
  email: {
    required: true,
    pattern: EMAIL_REGEX,
    message: 'Please enter a valid email address'
  },
  
  phone: {
    required: true,
    pattern: UK_MOBILE_REGEX,
    transform: (value) => value.replace(/\s/g, ''), // Remove spaces before validation
    message: 'Please enter a valid UK mobile number'
  },
  
  addressLine1: {
    required: true,
    minLength: 3,
    maxLength: 100,
    message: 'Please enter your street address'
  },
  
  townCity: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: 'Please enter a valid town or city name'
  },
  
  postcode: {
    required: true,
    pattern: UK_POSTCODE_REGEX,
    transform: (value) => value.toUpperCase().replace(/\s/g, ''), // Normalize postcode
    message: 'Please enter a valid UK postcode'
  },
  
  // Service Selection
  propertyType: {
    required: true,
    message: 'Please select a property type'
  },
  
  bedrooms: {
    required: (formData) => formData.isResidential && !formData.isCustomQuote,
    message: 'Please select the number of bedrooms'
  },
  
  selectedFrequency: {
    required: (formData) => formData.isResidential && !formData.isCustomQuote,
    message: 'Please select a cleaning frequency'
  },
  
  // Additional validation for text areas
  bookingNotes: {
    maxLength: 500,
    sanitize: true, // Flag to sanitize HTML
    message: 'Notes must be less than 500 characters'
  },
  
  // Business fields
  businessName: {
    required: (formData) => formData.isCommercial,
    minLength: 2,
    maxLength: 100,
    message: 'Please enter your business name'
  },
  
  // Terms agreement
  termsAgreed: {
    required: true,
    equals: true,
    message: 'You must agree to the terms and conditions'
  }
};

// Validation functions
export const validators = {
  required: (value) => {
    if (typeof value === 'boolean') return value !== undefined;
    if (typeof value === 'number') return !isNaN(value);
    return value && value.toString().trim().length > 0;
  },
  
  minLength: (value, length) => {
    return value && value.toString().trim().length >= length;
  },
  
  maxLength: (value, length) => {
    return !value || value.toString().trim().length <= length;
  },
  
  pattern: (value, regex) => {
    return !value || regex.test(value.toString().trim());
  },
  
  equals: (value, expected) => {
    return value === expected;
  },
  
  custom: (value, validatorFn, formData) => {
    return validatorFn(value, formData);
  }
};

// Main validation function
export function validateField(fieldName, value, formData = {}) {
  const rules = validationRules[fieldName];
  if (!rules) return { isValid: true };
  
  const errors = [];
  
  // Apply transformation if needed
  if (rules.transform) {
    value = rules.transform(value);
  }
  
  // Check if field is required
  if (rules.required) {
    const isRequired = typeof rules.required === 'function' 
      ? rules.required(formData) 
      : rules.required;
      
    if (isRequired && !validators.required(value)) {
      errors.push(rules.message || `${fieldName} is required`);
    }
  }
  
  // Only validate further if value exists or field is required
  if (value || rules.required) {
    // Min length validation
    if (rules.minLength && !validators.minLength(value, rules.minLength)) {
      errors.push(rules.message || `${fieldName} must be at least ${rules.minLength} characters`);
    }
    
    // Max length validation
    if (rules.maxLength && !validators.maxLength(value, rules.maxLength)) {
      errors.push(rules.message || `${fieldName} must be less than ${rules.maxLength} characters`);
    }
    
    // Pattern validation
    if (rules.pattern && !validators.pattern(value, rules.pattern)) {
      errors.push(rules.message || `${fieldName} format is invalid`);
    }
    
    // Equals validation
    if (rules.equals !== undefined && !validators.equals(value, rules.equals)) {
      errors.push(rules.message || `${fieldName} must equal ${rules.equals}`);
    }
    
    // Custom validation
    if (rules.custom && !validators.custom(value, rules.custom, formData)) {
      errors.push(rules.message || `${fieldName} is invalid`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    transformedValue: rules.transform ? rules.transform(value) : value
  };
}

// Validate multiple fields
export function validateForm(formData, fieldsToValidate = null) {
  const errors = {};
  const transformedData = {};
  let isValid = true;
  
  const fields = fieldsToValidate || Object.keys(validationRules);
  
  fields.forEach(fieldName => {
    const value = getNestedValue(formData, fieldName);
    const validation = validateField(fieldName, value, formData);
    
    if (!validation.isValid) {
      errors[fieldName] = validation.errors;
      isValid = false;
    }
    
    if (validation.transformedValue !== undefined) {
      setNestedValue(transformedData, fieldName, validation.transformedValue);
    }
  });
  
  return { isValid, errors, transformedData };
}

// Helper to get nested object values
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Helper to set nested object values
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

// Sanitize HTML input
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove any HTML tags
  return input.replace(/<[^>]*>/g, '')
    // Remove any script tags specifically
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Escape special characters
    .replace(/[&<>"']/g, (match) => {
      const escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return escapeMap[match];
    });
}

// Validate step in the form wizard
export function validateStep(step, formData) {
  let fieldsToValidate = [];
  
  switch (step) {
    case 1:
      if (formData.isResidential && !formData.isCustomQuote) {
        fieldsToValidate = ['propertyType', 'bedrooms', 'selectedFrequency'];
      } else {
        fieldsToValidate = ['propertyType'];
      }
      break;
      
    case 2:
      // Additional services are optional, no required validation
      break;
      
    case 3:
      fieldsToValidate = [
        'customerName', 'email', 'phone',
        'addressLine1', 'townCity', 'postcode'
      ];
      if (formData.isCommercial) {
        fieldsToValidate.push('businessName');
      }
      break;
      
    case 4:
      fieldsToValidate = ['termsAgreed'];
      break;
  }
  
  return validateForm(formData, fieldsToValidate);
}

// Format validation errors for display
export function formatValidationErrors(errors) {
  const formattedErrors = {};
  
  Object.entries(errors).forEach(([field, fieldErrors]) => {
    formattedErrors[field] = Array.isArray(fieldErrors) 
      ? fieldErrors.join('. ') 
      : fieldErrors;
  });
  
  return formattedErrors;
}