/**
 * TypeScript definitions for Window Cleaning Booking System
 * These will be used when migrating to TypeScript
 */

export interface WindowService {
  name: string;
  price: number;
  frequency: string;
  description?: string;
}

export interface AdditionalServices {
  [key: string]: boolean;
}

export interface CommercialServices {
  windowCleaning: boolean;
  gutterCleaning: boolean;
  fasciaSoffitCleaning: boolean;
  solarPanelCleaning: boolean;
  pressureWashing: boolean;
  claddingCleaning: boolean;
  signageCleaning: boolean;
  other: boolean;
}

export interface CommercialFrequencies {
  windowCleaningExternal: string;
  windowCleaningInternal: string;
  gutterClearing: string;
  fasciaSoffit: string;
  solarPanels: string;
  pressureWashing: string;
  claddingCleaning: string;
  signageCleaning: string;
  other: string;
}

export interface CommercialDetails {
  companyName: string;
  businessType: string;
  vatNumber: string;
  accountsContact: string;
  billingAddress: string;
  servicesRequested: CommercialServices;
  frequencies: CommercialFrequencies;
  numberOfFloors: string;
  preferredCleaningTimes: string;
  accessRequirements: string;
  healthSafetyRequirements: string;
  parkingAvailable: string;
  contactPerson: string;
  contactRole: string;
  otherServiceDetails: string;
  otherServiceText: string;
  frequencyPreference: string;
  otherFrequencyText: string;
  otherNotes: string;
}

export interface GeneralEnquiryServices {
  windowCleaning: boolean;
  conservatoryWindows: boolean;
  conservatoryRoof: boolean;
  gutterClearing: boolean;
  fasciaSoffitGutter: boolean;
  solarPanels: boolean;
  other: boolean;
}

export interface GeneralEnquiryDetails {
  requestedServices: GeneralEnquiryServices;
  otherServiceText: string;
  requestedFrequency: string;
  enquiryComments: string;
  customerStatus: string;
}

export interface QuoteRequests {
  solarPanelCleaning: boolean;
  conservatoryRoofCleaning: boolean;
}

export interface FormData {
  // Basic booking info
  propertyType: string;
  bedrooms: string;
  selectedFrequency: string;
  initialWindowPrice: number;
  selectedWindowService: WindowService | null;

  // Booking type flags
  isCustomQuote: boolean;
  isCommercial: boolean;
  isResidential: boolean;
  isGeneralEnquiry: boolean;

  // Property features
  hasConservatory: boolean;
  hasExtension: boolean;

  // Additional services
  additionalServices: AdditionalServices;

  // Pricing
  gutterClearingServicePrice: number;
  fasciaSoffitGutterServicePrice: number;
  windowCleaningDiscount: number;
  subTotalBeforeDiscount: number;
  conservatorySurcharge: number;
  extensionSurcharge: number;
  grandTotal: number;

  // Customer information
  customerName: string;
  addressLine1: string;
  addressLine2: string;
  townCity: string;
  county: string;
  postcode: string;
  email: string;
  mobile: string;
  landline: string;
  preferredContactMethod: 'phone' | 'email' | 'text';
  preferredContactTime: string;
  bestTimeToCall: string;

  // Notes and special requirements
  accessNotes: string;
  bookingNotes: string;
  recaptchaToken: string;

  // Submission state
  isSubmitted: boolean;
  submittedAt: string | null;
  bookingReference: string;

  // Complex nested objects
  commercialDetails: CommercialDetails;
  generalEnquiryDetails: GeneralEnquiryDetails;
  quoteRequests: QuoteRequests;
}

export interface PricingCalculation {
  subTotalBeforeDiscount: number;
  conservatorySurcharge: number;
  extensionSurcharge: number;
  grandTotal: number;
  windowCleaningDiscount: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface EmailTemplateParams {
  booking_type: string;
  booking_reference: string;
  submitted_date: string;
  customer_name: string;
  email: string;
  mobile: string;
  landline: string;
  preferred_contact_method: string;
  preferred_contact_time: string;
  best_time_to_call: string;
  address_line1: string;
  address_line2: string;
  town_city: string;
  county: string;
  postcode: string;
  property_type: string;
  bedrooms: string;
  selected_frequency: string;
  selected_window_service: string;
  has_conservatory: string;
  has_extension: string;
  initial_window_price: string;
  gutter_clearing_price: string;
  fascia_soffit_price: string;
  conservatory_surcharge: string;
  extension_surcharge: string;
  window_cleaning_discount: string;
  sub_total: string;
  grand_total: string;
  selected_addons: string;
  commercial_services: string;
  general_enquiry_services: string;
  company_name: string;
  business_type: string;
  vat_number: string;
  contact_person: string;
  contact_role: string;
  number_of_floors: string;
  preferred_cleaning_times: string;
  access_requirements: string;
  health_safety_requirements: string;
  parking_available: string;
  customer_status: string;
  requested_frequency: string;
  enquiry_comments: string;
  access_notes: string;
  booking_notes: string;
  other_service_details: string;
  other_service_text: string;
  other_notes: string;
  quote_requests: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BookingSubmissionResponse {
  success: boolean;
  bookingReference?: string;
  submittedAt?: string;
  error?: string;
}

export interface FormState {
  currentStep: number;
  isLoading: boolean;
  submissionError: string;
  validationErrors: string[];
}

// Component Props Interfaces
export interface StepNavigationProps {
  currentStep: number;
  nextStep?: () => void;
  prevStep?: () => void;
  goToStep?: (step: number) => void;
  totalSteps?: number;
}

export interface FormComponentProps {
  values: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  handleChange?: (field: string, value: any) => void;
}

export interface LoadingErrorProps {
  isLoading?: boolean;
  submissionError?: string;
  handleSubmit?: (e: React.FormEvent) => void;
}

// Utility Types
export type BookingType = 'residential' | 'commercial' | 'general_enquiry' | 'custom_quote';
export type ContactMethod = 'phone' | 'email' | 'text';
export type PropertyType = 'flat' | 'terraced' | 'semi-detached' | 'detached' | 'bungalow';
export type Frequency = 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'one-off';

// Service-related interfaces
export interface BookingServiceInterface {
  createInitialFormData(): FormData;
  calculatePricing(formData: FormData): PricingCalculation;
  validateFormData(formData: FormData): ValidationResult;
  getBookingTypeDisplay(formData: FormData): string;
  generateBookingReference(): string;
  getStepName(step: number): string;
}

export interface EmailTemplateServiceInterface {
  mapFormDataToTemplateParamsSimple(formData: FormData): EmailTemplateParams;
  formatPrice(price: number): string;
  formatDate(dateString: string): string;
  getSelectedAddons(formData: FormData): string;
  getSelectedCommercialServices(formData: FormData): string;
  getSelectedGeneralEnquiryServices(formData: FormData): string;
  getQuoteRequests(formData: FormData): string;
  getBookingOrEnquiryText(formData: FormData): string;
}

export interface FormNavigationServiceInterface {
  shouldSkipStep(step: number, formData: FormData): boolean;
  isStandardResidentialBooking(formData: FormData): boolean;
  getNextStep(currentStep: number, formData: FormData): number;
  getPreviousStep(currentStep: number, formData: FormData): number;
  canCompleteStep(step: number, formData: FormData): ValidationResult;
  getProgressPercentage(currentStep: number): number;
  getStepTitle(step: number): string;
  getStepDescription(step: number): string;
}