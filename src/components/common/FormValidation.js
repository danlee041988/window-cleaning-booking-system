// Comprehensive form validation utilities
import * as FORM_CONSTANTS from '../../constants/formConstants';

export class FormValidation {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return { isValid: false, error: 'Email is required' };
    if (!emailRegex.test(email)) return { isValid: false, error: 'Please enter a valid email address' };
    return { isValid: true };
  }

  static validatePhone(phone) {
    // UK phone number validation
    const phoneRegex = /^(?:(?:\+44)|(?:0))(?:\d{2}\s?\d{4}\s?\d{4}|\d{3}\s?\d{3}\s?\d{4}|\d{4}\s?\d{3}\s?\d{3}|\d{5}\s?\d{6}|\d{10})$/;
    if (!phone) return { isValid: false, error: 'Phone number is required' };
    
    // Remove spaces and format
    const cleanPhone = phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return { isValid: false, error: 'Please enter a valid UK phone number' };
    }
    return { isValid: true };
  }

  static validatePostcode(postcode) {
    // UK postcode validation
    const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
    if (!postcode) return { isValid: false, error: 'Postcode is required' };
    if (!postcodeRegex.test(postcode.trim())) {
      return { isValid: false, error: 'Please enter a valid UK postcode' };
    }
    return { isValid: true };
  }

  static validateRequired(value, fieldName) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    return { isValid: true };
  }

  static validateName(name) {
    if (!name) return { isValid: false, error: 'Name is required' };
    if (name.length < 2) return { isValid: false, error: 'Name must be at least 2 characters' };
    if (name.length > 50) return { isValid: false, error: 'Name must be less than 50 characters' };
    
    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(name)) {
      return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    return { isValid: true };
  }

  static validateAddress(address) {
    if (!address) return { isValid: false, error: 'Address is required' };
    if (address.length < 5) return { isValid: false, error: 'Please enter a complete address' };
    if (address.length > 100) return { isValid: false, error: 'Address must be less than 100 characters' };
    return { isValid: true };
  }

  static validateStandardResidentialBooking(formData) {
    const errors = {};

    // Basic contact validation
    const nameValidation = this.validateName(formData.customerName);
    if (!nameValidation.isValid) errors.customerName = nameValidation.error;

    const emailValidation = this.validateEmail(formData.email);
    if (!emailValidation.isValid) errors.email = emailValidation.error;

    const phoneValidation = this.validatePhone(formData.mobile);
    if (!phoneValidation.isValid) errors.mobile = phoneValidation.error;

    const addressValidation = this.validateAddress(formData.addressLine1);
    if (!addressValidation.isValid) errors.addressLine1 = addressValidation.error;

    const postcodeValidation = this.validatePostcode(formData.postcode);
    if (!postcodeValidation.isValid) errors.postcode = postcodeValidation.error;

    // Service-specific validation
    if (!formData.propertyType) errors.propertyType = 'Property type is required';
    if (!formData.bedrooms) errors.bedrooms = 'Number of bedrooms is required';
    if (!formData.selectedFrequency) errors.selectedFrequency = 'Cleaning frequency is required';
    if (!formData.selectedDate) errors.selectedDate = 'Please select a preferred date';

    // reCAPTCHA validation
    if (!formData.recaptchaToken) errors.recaptcha = 'Please complete the reCAPTCHA verification';

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static validateCustomQuote(formData) {
    const errors = {};

    // Basic contact validation (reuse from standard)
    const standardValidation = this.validateStandardResidentialBooking(formData);
    Object.assign(errors, standardValidation.errors);

    // Custom quote specific validation
    const customDetails = formData.customResidentialDetails || {};
    
    if (!customDetails.exactBedrooms) errors.exactBedrooms = 'Number of bedrooms is required';
    if (!customDetails.approxWindows) errors.approxWindows = 'Approximate number of windows is required';
    if (!customDetails.propertyStyle) errors.propertyStyle = 'Property style is required';
    if (!customDetails.frequencyPreference) errors.frequencyPreference = 'Frequency preference is required';

    // Validate at least one service is selected
    const servicesSelected = Object.values(customDetails.servicesRequested || {}).some(service => service);
    if (!servicesSelected) errors.servicesRequested = 'Please select at least one service';

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static validateCommercialEnquiry(formData) {
    const errors = {};

    // Basic contact validation
    const nameValidation = this.validateName(formData.customerName);
    if (!nameValidation.isValid) errors.customerName = nameValidation.error;

    const emailValidation = this.validateEmail(formData.email);
    if (!emailValidation.isValid) errors.email = emailValidation.error;

    const phoneValidation = this.validatePhone(formData.mobile);
    if (!phoneValidation.isValid) errors.mobile = phoneValidation.error;

    // Commercial specific validation
    const commercialDetails = formData.commercialDetails || {};
    
    if (!commercialDetails.businessName) errors.businessName = 'Business name is required';
    if (!commercialDetails.propertyType) errors.commercialPropertyType = 'Property type is required';
    if (!commercialDetails.approxSizeOrWindows) errors.approxSizeOrWindows = 'Property size information is required';

    // Validate at least one service is selected
    const servicesSelected = Object.values(commercialDetails.servicesRequested || {}).some(service => service);
    if (!servicesSelected) errors.commercialServicesRequested = 'Please select at least one service';

    if (!formData.recaptchaToken) errors.recaptcha = 'Please complete the reCAPTCHA verification';

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static validateGeneralEnquiry(formData) {
    const errors = {};

    // Basic contact validation
    const nameValidation = this.validateName(formData.customerName);
    if (!nameValidation.isValid) errors.customerName = nameValidation.error;

    const emailValidation = this.validateEmail(formData.email);
    if (!emailValidation.isValid) errors.email = emailValidation.error;

    const phoneValidation = this.validatePhone(formData.mobile);
    if (!phoneValidation.isValid) errors.mobile = phoneValidation.error;

    // General enquiry specific validation
    const generalDetails = formData.generalEnquiryDetails || {};
    
    // Validate at least one service is selected
    const servicesSelected = Object.values(generalDetails.requestedServices || {}).some(service => service);
    if (!servicesSelected) errors.requestedServices = 'Please select at least one service of interest';

    if (!generalDetails.requestedFrequency) errors.requestedFrequency = 'Please specify your frequency preference';

    if (!formData.recaptchaToken) errors.recaptcha = 'Please complete the reCAPTCHA verification';

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static validateFormData(formData) {
    if (formData.isCommercial) {
      return this.validateCommercialEnquiry(formData);
    } else if (formData.isCustomQuote) {
      return this.validateCustomQuote(formData);
    } else if (formData.isGeneralEnquiry) {
      return this.validateGeneralEnquiry(formData);
    } else {
      return this.validateStandardResidentialBooking(formData);
    }
  }

  // Real-time validation helpers
  static validateFieldOnBlur(fieldName, value, formData = {}) {
    switch (fieldName) {
      case 'customerName':
        return this.validateName(value);
      case 'email':
        return this.validateEmail(value);
      case 'mobile':
        return this.validatePhone(value);
      case 'postcode':
        return this.validatePostcode(value);
      case 'addressLine1':
        return this.validateAddress(value);
      default:
        return this.validateRequired(value, fieldName);
    }
  }
}

export default FormValidation;