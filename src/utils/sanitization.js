/**
 * Input sanitization utilities to prevent XSS attacks
 * Removes potentially dangerous HTML/script content while preserving safe text
 */

/**
 * Sanitize text input by removing HTML tags and dangerous characters
 * @param {string} input - The user input to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} - Sanitized string safe for display
 */
export function sanitizeTextInput(input, options = {}) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const {
    allowNewlines = true,
    maxLength = 5000,
    trimWhitespace = true
  } = options;

  let sanitized = input;

  // Remove any HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove any script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous attributes that could execute JavaScript
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Escape special HTML characters
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  sanitized = sanitized.replace(/[&<>"'`=\/]/g, (match) => escapeMap[match]);
  
  // Handle newlines based on options
  if (!allowNewlines) {
    sanitized = sanitized.replace(/\r?\n/g, ' ');
  }
  
  // Trim whitespace if requested
  if (trimWhitespace) {
    sanitized = sanitized.trim();
  }
  
  // Enforce maximum length
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitize form data object
 * @param {Object} formData - Form data object to sanitize
 * @param {Array} fieldsToSanitize - Array of field names to sanitize
 * @returns {Object} - New object with sanitized values
 */
export function sanitizeFormData(formData, fieldsToSanitize = []) {
  const defaultFieldsToSanitize = [
    'bookingNotes',
    'enquiryComments',
    'otherNotes',
    'specificRequirements',
    'customAdditionalComments',
    'otherServiceText',
    'otherFrequencyText',
    'accessIssues'
  ];
  
  const fields = fieldsToSanitize.length > 0 ? fieldsToSanitize : defaultFieldsToSanitize;
  const sanitized = { ...formData };
  
  fields.forEach(field => {
    // Handle nested fields (e.g., 'commercialDetails.otherNotes')
    const keys = field.split('.');
    let current = sanitized;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (current[keys[i]]) {
        current = current[keys[i]];
      } else {
        return; // Field doesn't exist, skip
      }
    }
    
    const lastKey = keys[keys.length - 1];
    if (current[lastKey] && typeof current[lastKey] === 'string') {
      current[lastKey] = sanitizeTextInput(current[lastKey]);
    }
  });
  
  return sanitized;
}

/**
 * Validate and sanitize email addresses
 * @param {string} email - Email address to validate and sanitize
 * @returns {Object} - { isValid: boolean, sanitized: string }
 */
export function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, sanitized: '' };
  }
  
  // Remove whitespace and convert to lowercase
  let sanitized = email.trim().toLowerCase();
  
  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Remove any potentially dangerous characters
  sanitized = sanitized.replace(/[<>'"]/g, '');
  
  const isValid = emailRegex.test(sanitized);
  
  return { isValid, sanitized };
}

/**
 * Sanitize phone numbers
 * @param {string} phone - Phone number to sanitize
 * @returns {string} - Sanitized phone number
 */
export function sanitizePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  
  // Keep only numbers, spaces, dashes, parentheses, and plus sign
  return phone.replace(/[^0-9\s\-\(\)\+]/g, '');
}

/**
 * Create a sanitized error message safe for display
 * @param {Error|string} error - Error object or message
 * @returns {string} - Safe error message
 */
export function sanitizeErrorMessage(error) {
  const defaultMessage = 'An error occurred. Please try again.';
  
  if (!error) {
    return defaultMessage;
  }
  
  const message = typeof error === 'string' ? error : error.message || defaultMessage;
  
  // Sanitize the error message to prevent XSS
  return sanitizeTextInput(message, { 
    allowNewlines: false, 
    maxLength: 200 
  });
}