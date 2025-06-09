/**
 * BookingService - Handles business logic for booking operations (TypeScript)
 * Type-safe version with comprehensive interfaces
 */

import * as FORM_CONSTANTS from '../constants/formConstants';
import { APP_CONFIG, VALIDATION_RULES, DEFAULT_FORM_VALUES } from '../shared/constants';
import { 
  FormData, 
  PricingCalculation, 
  ValidationResult, 
  BookingServiceInterface 
} from '../types/booking';

export class BookingService implements BookingServiceInterface {
  public readonly CONSERVATORY_SURCHARGE: number;
  public readonly EXTENSION_SURCHARGE_AMOUNT: number;

  constructor() {
    this.CONSERVATORY_SURCHARGE = APP_CONFIG.conservatorySurcharge;
    this.EXTENSION_SURCHARGE_AMOUNT = APP_CONFIG.extensionSurcharge;
  }

  /**
   * Creates initial form data structure
   */
  createInitialFormData(): FormData {
    return {
      ...DEFAULT_FORM_VALUES,
      // Property details
      propertyType: '',
      bedrooms: '',
      selectedFrequency: '',
      initialWindowPrice: 0,
      selectedWindowService: null,

      // Booking type flags
      isCustomQuote: false,
      isCommercial: false,
      isResidential: false,
      isGeneralEnquiry: false,

      // Property features
      hasConservatory: false,
      hasExtension: false,

      // Additional services
      additionalServices: {
        [FORM_CONSTANTS.ADDON_CONSERVATORY_ROOF]: false,
        [FORM_CONSTANTS.ADDON_FASCIA_SOFFIT_GUTTER]: false,
        [FORM_CONSTANTS.ADDON_GUTTER_CLEARING]: false,
      },

      // Pricing
      gutterClearingServicePrice: 0,
      fasciaSoffitGutterServicePrice: 0,
      windowCleaningDiscount: 0,
      subTotalBeforeDiscount: 0,
      conservatorySurcharge: 0,
      extensionSurcharge: 0,
      grandTotal: 0,

      // Contact information
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

      // Notes
      accessNotes: '',
      bookingNotes: '',
      recaptchaToken: '',

      // Submission state
      isSubmitted: false,
      submittedAt: null,
      bookingReference: '',

      // Complex nested objects
      commercialDetails: {
        companyName: '',
        businessType: '',
        vatNumber: '',
        accountsContact: '',
        billingAddress: '',
        servicesRequested: {
          windowCleaning: false,
          gutterCleaning: false,
          fasciaSoffitCleaning: false,
          solarPanelCleaning: false,
          pressureWashing: false,
          claddingCleaning: false,
          signageCleaning: false,
          other: false,
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
        otherServiceText: '',
        frequencyPreference: '',
        otherFrequencyText: '',
        otherNotes: ''
      },

      generalEnquiryDetails: {
        requestedServices: {
          windowCleaning: false,
          conservatoryWindows: false,
          conservatoryRoof: false,
          gutterClearing: false,
          fasciaSoffitGutter: false,
          solarPanels: false,
          other: false,
        },
        otherServiceText: '',
        requestedFrequency: '',
        enquiryComments: '',
        customerStatus: ''
      },

      quoteRequests: {
        solarPanelCleaning: false,
        conservatoryRoofCleaning: false
      }
    };
  }

  /**
   * Determines the step name for analytics
   */
  getStepName(step: number): string {
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
  calculatePricing(formData: FormData): PricingCalculation {
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
  validateFormData(formData: FormData): ValidationResult {
    const errors: string[] = [];

    // Required fields
    if (!formData.customerName?.trim()) {
      errors.push('Customer name is required');
    } else if (formData.customerName.length < VALIDATION_RULES.customerName.minLength) {
      errors.push(`Customer name must be at least ${VALIDATION_RULES.customerName.minLength} characters`);
    }

    if (!formData.email?.trim()) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!formData.mobile?.trim()) {
      errors.push('Mobile number is required');
    } else if (!VALIDATION_RULES.mobile.pattern.test(formData.mobile)) {
      errors.push('Please enter a valid UK mobile number');
    }

    if (!formData.addressLine1?.trim()) {
      errors.push('Address is required');
    } else if (formData.addressLine1.length < VALIDATION_RULES.address.minLength) {
      errors.push('Address must be more detailed');
    }

    if (!formData.postcode?.trim()) {
      errors.push('Postcode is required');
    } else if (!VALIDATION_RULES.postcode.pattern.test(formData.postcode)) {
      errors.push('Please enter a valid UK postcode');
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
  isValidEmail(email: string): boolean {
    return VALIDATION_RULES.email.pattern.test(email);
  }

  /**
   * Determines booking type for display
   */
  getBookingTypeDisplay(formData: FormData): string {
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
  generateBookingReference(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `SWC-${timestamp}-${random}`;
  }
}

export default new BookingService();