/**
 * Shared Constants for Window Cleaning Booking System
 * Centralized configuration values used across components
 */

// Application Configuration
export const APP_CONFIG = {
  name: 'Somerset Window Cleaning',
  version: '2.0.0',
  contactPhone: '01234 567890',
  contactEmail: 'info@somersetwindowcleaning.co.uk',
  website: 'https://somersetwindowcleaning.co.uk',
  
  // Form Configuration
  maxSteps: 3,
  autoSaveInterval: 30000, // 30 seconds
  sessionTimeout: 1800000, // 30 minutes
  
  // Pricing Configuration
  conservatorySurcharge: 5,
  extensionSurcharge: 5,
  minimumBookingValue: 10,
  
  // API Configuration
  apiTimeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000 // 1 second
};

// Validation Rules
export const VALIDATION_RULES = {
  customerName: {
    minLength: 2,
    maxLength: 100,
    required: true
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: true
  },
  mobile: {
    pattern: /^(\+44|0)[7-9]\d{8,9}$/,
    required: true
  },
  postcode: {
    pattern: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
    required: true
  },
  address: {
    minLength: 5,
    maxLength: 200,
    required: true
  }
};

// UI Constants
export const UI_CONSTANTS = {
  // Colors
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  },
  
  // Breakpoints (matching Tailwind)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  },
  
  // Animation Durations
  animations: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms'
  },
  
  // Z-Index Scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060
  }
};

// Step Definitions
export const STEPS = {
  SERVICE_SELECTION: {
    number: 1,
    name: 'service_selection',
    title: 'Service Selection',
    description: 'Choose your cleaning service and property details'
  },
  ADDITIONAL_SERVICES: {
    number: 2,
    name: 'additional_services',
    title: 'Additional Services',
    description: 'Select any additional services you need'
  },
  CONTACT_DETAILS: {
    number: 3,
    name: 'contact_details',
    title: 'Contact Details',
    description: 'Provide your contact information and review your booking'
  },
  CONFIRMATION: {
    number: 4,
    name: 'confirmation',
    title: 'Confirmation',
    description: 'Booking confirmation and next steps'
  }
};

// Property Types with Display Names
export const PROPERTY_TYPES = {
  FLAT: { value: 'flat', label: 'Flat/Apartment' },
  TERRACED: { value: 'terraced', label: 'Terraced House' },
  SEMI_DETACHED: { value: 'semi-detached', label: 'Semi-Detached House' },
  DETACHED: { value: 'detached', label: 'Detached House' },
  BUNGALOW: { value: 'bungalow', label: 'Bungalow' }
};

// Bedroom Options
export const BEDROOM_OPTIONS = [
  { value: '1', label: '1 Bedroom' },
  { value: '2', label: '2 Bedrooms' },
  { value: '3', label: '3 Bedrooms' },
  { value: '4', label: '4 Bedrooms' },
  { value: '5', label: '5+ Bedrooms' }
];

// Frequency Options
export const FREQUENCY_OPTIONS = {
  WEEKLY: { value: 'weekly', label: 'Weekly', discount: 0.15 },
  FORTNIGHTLY: { value: 'fortnightly', label: 'Fortnightly', discount: 0.10 },
  MONTHLY: { value: 'monthly', label: 'Monthly', discount: 0.05 },
  QUARTERLY: { value: 'quarterly', label: 'Quarterly', discount: 0 },
  ONE_OFF: { value: 'one-off', label: 'One-off Clean', discount: 0 }
};

// Contact Method Options
export const CONTACT_METHODS = {
  PHONE: { value: 'phone', label: 'Phone Call', icon: '📞' },
  EMAIL: { value: 'email', label: 'Email', icon: '✉️' },
  TEXT: { value: 'text', label: 'Text Message', icon: '💬' }
};

// Time Preferences
export const TIME_PREFERENCES = [
  { value: 'morning', label: 'Morning (8am - 12pm)' },
  { value: 'afternoon', label: 'Afternoon (12pm - 5pm)' },
  { value: 'evening', label: 'Evening (5pm - 8pm)' },
  { value: 'flexible', label: 'Flexible' },
  { value: 'weekends', label: 'Weekends Only' }
];

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid UK mobile number',
  INVALID_POSTCODE: 'Please enter a valid UK postcode',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SUBMISSION_FAILED: 'Submission failed. Please try again.',
  VALIDATION_FAILED: 'Please correct the errors below',
  SESSION_EXPIRED: 'Your session has expired. Please refresh and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  FORM_SAVED: 'Your progress has been saved',
  SUBMISSION_SUCCESS: 'Your booking has been submitted successfully',
  STEP_COMPLETED: 'Step completed successfully'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  FORM_DATA: 'bookingFormData',
  USER_PREFERENCES: 'userPreferences',
  SESSION_ID: 'sessionId',
  LAST_SAVE: 'lastSave'
};

// Analytics Events
export const ANALYTICS_EVENTS = {
  FORM_STARTED: 'form_started',
  STEP_COMPLETED: 'step_completed',
  FORM_SUBMITTED: 'form_submitted',
  FORM_ABANDONED: 'form_abandoned',
  ERROR_ENCOUNTERED: 'error_encountered',
  SERVICE_SELECTED: 'service_selected',
  ADDON_SELECTED: 'addon_selected'
};

// Feature Flags
export const FEATURES = {
  DARK_MODE: true,
  AUTO_SAVE: true,
  ANALYTICS: true,
  RECAPTCHA: true,
  PROGRESS_PERSISTENCE: true,
  REAL_TIME_VALIDATION: true,
  ACCESSIBILITY_MODE: true
};

// Service Categories
export const SERVICE_CATEGORIES = {
  RESIDENTIAL: {
    name: 'Residential',
    description: 'Services for homes and residential properties',
    icon: '🏠'
  },
  COMMERCIAL: {
    name: 'Commercial',
    description: 'Services for businesses and commercial properties',
    icon: '🏢'
  },
  SPECIALIZED: {
    name: 'Specialized',
    description: 'Specialist cleaning services',
    icon: '⭐'
  }
};

// Default Form Values
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
  addressLine2: '',
  townCity: '',
  county: '',
  postcode: '',
  preferredContactMethod: 'phone',
  preferredContactTime: '',
  bestTimeToCall: '',
  accessNotes: '',
  bookingNotes: '',
  isSubmitted: false,
  submittedAt: null,
  bookingReference: ''
};

// Export all constants as default
export default {
  APP_CONFIG,
  VALIDATION_RULES,
  UI_CONSTANTS,
  STEPS,
  PROPERTY_TYPES,
  BEDROOM_OPTIONS,
  FREQUENCY_OPTIONS,
  CONTACT_METHODS,
  TIME_PREFERENCES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  ANALYTICS_EVENTS,
  FEATURES,
  SERVICE_CATEGORIES,
  DEFAULT_FORM_VALUES
};