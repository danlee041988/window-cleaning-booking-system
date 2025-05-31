/**
 * Centralized PropTypes definitions for the booking form
 * This helps maintain consistency across components
 */

import PropTypes from 'prop-types';

// Common prop type shapes
export const addressShape = PropTypes.shape({
  addressLine1: PropTypes.string,
  addressLine2: PropTypes.string,
  townCity: PropTypes.string,
  postcode: PropTypes.string
});

export const customerShape = PropTypes.shape({
  customerName: PropTypes.string,
  email: PropTypes.string,
  mobile: PropTypes.string,
  preferredContactMethod: PropTypes.oneOf(['email', 'phone', 'text'])
});

export const serviceShape = PropTypes.shape({
  name: PropTypes.string,
  price: PropTypes.number,
  type: PropTypes.string,
  frequency: PropTypes.string
});

export const additionalServicesShape = PropTypes.shape({
  conservatoryRoof: PropTypes.bool,
  fasciaSoffitGutter: PropTypes.bool,
  gutterClearing: PropTypes.bool
});

export const pricingShape = PropTypes.shape({
  initialWindowPrice: PropTypes.number,
  conservatorySurcharge: PropTypes.number,
  extensionSurcharge: PropTypes.number,
  gutterClearingServicePrice: PropTypes.number,
  fasciaSoffitGutterServicePrice: PropTypes.number,
  windowCleaningDiscount: PropTypes.number,
  subTotalBeforeDiscount: PropTypes.number,
  grandTotal: PropTypes.number
});

export const customResidentialDetailsShape = PropTypes.shape({
  exactBedrooms: PropTypes.string,
  approxWindows: PropTypes.string,
  accessIssues: PropTypes.string,
  propertyStyle: PropTypes.string,
  otherPropertyStyleText: PropTypes.string,
  servicesRequested: PropTypes.object,
  otherServiceText: PropTypes.string,
  frequencyPreference: PropTypes.string,
  otherFrequencyText: PropTypes.string,
  otherNotes: PropTypes.string,
  customAdditionalComments: PropTypes.string
});

export const commercialDetailsShape = PropTypes.shape({
  businessName: PropTypes.string,
  propertyType: PropTypes.string,
  approxSizeOrWindows: PropTypes.string,
  specificRequirements: PropTypes.string,
  services: PropTypes.object,
  frequencies: PropTypes.object,
  otherServiceDetails: PropTypes.string,
  servicesRequested: PropTypes.object,
  otherServiceText: PropTypes.string,
  frequencyPreference: PropTypes.string,
  otherFrequencyText: PropTypes.string,
  otherNotes: PropTypes.string
});

export const generalEnquiryDetailsShape = PropTypes.shape({
  requestedServices: PropTypes.object,
  otherServiceText: PropTypes.string,
  requestedFrequency: PropTypes.string,
  enquiryComments: PropTypes.string,
  customerStatus: PropTypes.string
});

// Main form data shape
export const formDataShape = PropTypes.shape({
  // Property details
  propertyType: PropTypes.string,
  bedrooms: PropTypes.string,
  selectedFrequency: PropTypes.string,
  initialWindowPrice: PropTypes.number,
  selectedWindowService: serviceShape,
  
  // Booking type flags
  isCustomQuote: PropTypes.bool,
  isCommercial: PropTypes.bool,
  isResidential: PropTypes.bool,
  isGeneralEnquiry: PropTypes.bool,
  
  // Property features
  hasConservatory: PropTypes.bool,
  hasExtension: PropTypes.bool,
  additionalServices: additionalServicesShape,
  
  // Pricing
  ...pricingShape.isRequired,
  
  // Customer details
  ...customerShape.isRequired,
  ...addressShape.isRequired,
  
  // Booking details
  selectedDate: PropTypes.string,
  bookingNotes: PropTypes.string,
  recaptchaToken: PropTypes.string,
  
  // Type-specific details
  customResidentialDetails: customResidentialDetailsShape,
  commercialDetails: commercialDetailsShape,
  generalEnquiryDetails: generalEnquiryDetailsShape,
  
  // Quote requests
  quoteRequests: PropTypes.object
});

// Common component prop types
export const inputFieldProps = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  touched: PropTypes.bool,
  hint: PropTypes.string,
  onBlur: PropTypes.func
};

export const formStepProps = {
  values: formDataShape.isRequired,
  setFormData: PropTypes.func.isRequired,
  nextStep: PropTypes.func,
  prevStep: PropTypes.func,
  goToStep: PropTypes.func,
  handleChange: PropTypes.func,
  isLoading: PropTypes.bool,
  submissionError: PropTypes.string
};

// Validation prop types
export const validationProps = {
  validationErrors: PropTypes.object,
  touchedFields: PropTypes.object,
  setValidationErrors: PropTypes.func,
  setTouchedFields: PropTypes.func
};

// Service configuration prop types
export const serviceConfigProps = {
  conservatorySurchargeAmount: PropTypes.number,
  extensionSurchargeAmount: PropTypes.number
};