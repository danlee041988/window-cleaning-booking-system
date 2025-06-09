/**
 * BookingService - Handles business logic for booking operations
 * Extracted from BookingForm.js for better separation of concerns
 */

import * as FORM_CONSTANTS from '../constants/formConstants';
import { APP_CONFIG, VALIDATION_RULES, DEFAULT_FORM_VALUES } from '../shared/constants';

export class BookingService {
  constructor() {
    this.CONSERVATORY_SURCHARGE = APP_CONFIG.conservatorySurcharge;
    this.EXTENSION_SURCHARGE_AMOUNT = APP_CONFIG.extensionSurcharge;
  }

  /**
   * Creates initial form data structure
   */
  createInitialFormData() {
    return {
      ...DEFAULT_FORM_VALUES,
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

      // Contact & Quote Details (Step 3)
      customerName: '',
      addressLine1: '',
      addressLine2: '',
      townCity: '',
      county: '',
      postcode: '',
      email: '',
      mobile: '',
      landline: '',
      preferredContactMethod: 'phone',
      preferredContactTime: '',
      bestTimeToCall: '',
      accessNotes: '',
      bookingNotes: '',
      recaptchaToken: '',

      // Submitted state
      isSubmitted: false,
      submittedAt: null,

      // Commercial-specific fields
      commercialDetails: {
        companyName: '',
        businessType: '',
        vatNumber: '',
        accountsContact: '',
        billingAddress: '',
        
        servicesRequested: {
          [FORM_CONSTANTS.COMM_SERVICE_WINDOW_CLEANING]: false,
          [FORM_CONSTANTS.COMM_SERVICE_GUTTER_CLEANING]: false,
          [FORM_CONSTANTS.COMM_SERVICE_FASCIA_SOFFIT_CLEANING]: false,
          [FORM_CONSTANTS.COMM_SERVICE_SOLAR_PANEL_CLEANING]: false,
          [FORM_CONSTANTS.COMM_SERVICE_PRESSURE_WASHING]: false,
          [FORM_CONSTANTS.COMM_SERVICE_CLADDING_CLEANING]: false,
          [FORM_CONSTANTS.COMM_SERVICE_SIGNAGE_CLEANING]: false,
          [FORM_CONSTANTS.COMM_SERVICE_OTHER]: false,
        },
        
        frequencies: {
          windowCleaningExternal: '',
          windowCleaningInternal: '',
          gutterClearing: '',
          fasciaSoffit: '',
          solarPanels: '',
          pressureWashing: '',
          claddingCleaning: '',
          signageCleaning: '',
          other: ''
        },
        
        numberOfFloors: '',
        preferredCleaningTimes: '',
        accessRequirements: '',
        healthSafetyRequirements: '',
        parkingAvailable: '',
        contactPerson: '',
        contactRole: '',
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

      // General Enquiry
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

      // Quote requests for services requiring physical assessment
      quoteRequests: {
        [FORM_CONSTANTS.QUOTE_REQUEST_SOLAR_PANEL_CLEANING]: false,
        [FORM_CONSTANTS.QUOTE_REQUEST_CONSERVATORY_ROOF_CLEANING]: false
      }
    };
  }

  /**
   * Determines the step name for analytics
   */
  getStepName(step) {
    switch (step) {
      case 1: return 'service_selection';
      case 2: return 'additional_services';
      case 3: return 'contact_details';
      case 4: return 'confirmation';
      default: return 'unknown';
    }
  }

  /**
   * Calculates pricing based on form data
   */
  calculatePricing(formData) {
    let subTotal = formData.initialWindowPrice || 0;
    let conservatorySurcharge = 0;
    let extensionSurcharge = 0;

    // Add conservatory surcharge
    if (formData.hasConservatory) {
      conservatorySurcharge = this.CONSERVATORY_SURCHARGE;
      subTotal += conservatorySurcharge;
    }

    // Add extension surcharge
    if (formData.hasExtension) {
      extensionSurcharge = this.EXTENSION_SURCHARGE_AMOUNT;
      subTotal += extensionSurcharge;
    }

    // Add additional services
    if (formData.additionalServices?.[FORM_CONSTANTS.ADDON_GUTTER_CLEARING]) {
      subTotal += formData.gutterClearingServicePrice || 0;
    }

    if (formData.additionalServices?.[FORM_CONSTANTS.ADDON_FASCIA_SOFFIT_GUTTER]) {
      subTotal += formData.fasciaSoffitGutterServicePrice || 0;
    }

    // Apply discount
    const discount = formData.windowCleaningDiscount || 0;
    const grandTotal = Math.max(0, subTotal - discount);

    return {
      subTotalBeforeDiscount: subTotal,
      conservatorySurcharge,
      extensionSurcharge,
      grandTotal,
      windowCleaningDiscount: discount
    };
  }

  /**
   * Validates form data for submission
   */
  validateFormData(formData) {
    const errors = [];

    // Required fields
    if (!formData.customerName?.trim()) {
      errors.push('Customer name is required');
    }

    if (!formData.email?.trim()) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!formData.mobile?.trim()) {
      errors.push('Mobile number is required');
    }

    if (!formData.addressLine1?.trim()) {
      errors.push('Address is required');
    }

    if (!formData.postcode?.trim()) {
      errors.push('Postcode is required');
    }

    // Service-specific validation
    if (formData.isResidential && !formData.isCustomQuote && !formData.selectedWindowService) {
      errors.push('Please select a window cleaning service');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Email validation helper
   */
  isValidEmail(email) {
    return VALIDATION_RULES.email.pattern.test(email);
  }

  /**
   * Determines booking type for display
   */
  getBookingTypeDisplay(formData) {
    const isStandardResidential = (
      formData.isResidential &&
      !formData.isCustomQuote &&
      !formData.isCommercial &&
      !formData.isGeneralEnquiry
    );

    if (isStandardResidential) {
      return 'Standard Residential Booking';
    } else if (formData.isGeneralEnquiry) {
      return 'General Enquiry';
    } else if (formData.isCommercial) {
      return 'Commercial Enquiry';
    } else if (formData.isCustomQuote) {
      return 'Custom Quote Request';
    }

    return 'Unknown Booking Type';
  }

  /**
   * Generates a unique booking reference
   */
  generateBookingReference() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `SWC-${timestamp}-${random}`;
  }
}

export default new BookingService();