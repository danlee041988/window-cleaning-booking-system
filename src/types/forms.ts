// TypeScript type definitions for the booking form system
// This file demonstrates how the form data structure would be typed

export interface BaseFormData {
  // Core booking information
  isResidential: boolean;
  isCommercial: boolean;
  isCustomQuote: boolean;
  isGeneralEnquiry: boolean;
  
  // Property details
  propertyType: string;
  bedrooms: string;
  selectedFrequency: string;
  initialWindowPrice: number;
  
  // Customer information
  customerName: string;
  email: string;
  mobile: string;
  addressLine1: string;
  addressLine2: string;
  townCity: string;
  postcode: string;
  
  // Additional services
  hasConservatory: boolean;
  hasExtension: boolean;
  conservatorySurcharge: number;
  extensionSurcharge: number;
  
  // Pricing
  grandTotal: number;
  windowCleaningDiscount: number;
  
  // Meta
  selectedDate: string | null;
  bookingNotes: string;
  recaptchaToken: string;
  bookingReference?: string;
  isSubmitted?: boolean;
}

export interface AdditionalServices {
  [key: string]: boolean;
}

export interface CommercialDetails {
  businessName: string;
  propertyType: string;
  approxSizeOrWindows: string;
  numberOfFloors: string;
  contactPerson: string;
  contactRole: string;
  
  services: {
    windowCleaningExternal: boolean;
    windowCleaningInternal: boolean;
    gutterClearing: boolean;
    fasciaSoffit: boolean;
    solarPanels: boolean;
    pressureWashing: boolean;
    claddingCleaning: boolean;
    signageCleaning: boolean;
    other: boolean;
  };
  
  frequencies: {
    windowCleaningExternal: string;
    windowCleaningInternal: string;
    gutterClearing: string;
    fasciaSoffit: string;
    solarPanels: string;
    pressureWashing: string;
    claddingCleaning: string;
    signageCleaning: string;
    other: string;
  };
  
  preferredCleaningTimes: string;
  parkingAvailable: string;
  accessRequirements: string;
  healthSafetyRequirements: string;
  specificRequirements: string;
  otherServiceDetails: string;
}

export interface CustomResidentialDetails {
  exactBedrooms: string;
  approxWindows: string;
  accessIssues: string;
  propertyStyle: string;
  otherPropertyStyleText: string;
  
  servicesRequested: {
    [key: string]: boolean;
  };
  
  otherServiceText: string;
  frequencyPreference: string;
  otherFrequencyText: string;
  otherNotes: string;
  customAdditionalComments: string;
}

export interface GeneralEnquiryDetails {
  enquiryType: string;
  servicesOfInterest: {
    [key: string]: boolean;
  };
  otherServiceText: string;
  requestedFrequency: string;
  enquiryComments: string;
  customerStatus: string;
}

export interface FormData extends BaseFormData {
  additionalServices: AdditionalServices;
  commercialDetails: CommercialDetails;
  customResidentialDetails: CustomResidentialDetails;
  generalEnquiryDetails: GeneralEnquiryDetails;
  
  // Service pricing
  gutterClearingServicePrice: number;
  fasciaSoffitGutterServicePrice: number;
  
  // Quote requests
  quoteRequests: {
    [key: string]: boolean;
  };
}

// Component prop types
export interface StepComponentProps {
  nextStep?: () => void;
  prevStep?: () => void;
  goToStep?: (step: number) => void;
  values: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export interface WindowCleaningPricingProps {
  goToStep: (step: number) => void;
  onFormChange: (data: Partial<FormData> | ((prev: FormData) => FormData)) => void;
  values: Partial<FormData>;
}

export interface AdditionalServicesFormProps extends StepComponentProps {
  conservatorySurchargeAmount: number;
  extensionSurchargeAmount: number;
}

export interface PropertyDetailsAndReviewProps extends StepComponentProps {
  handleChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
  submissionError: string | SubmissionError | null;
}

// Error handling types
export interface SubmissionError {
  message: string;
  originalError: string;
  canRetry: boolean;
  contactInfo: {
    phone: string;
    email: string;
  };
}

// Validation types
export interface ValidationErrors {
  [fieldName: string]: string;
}

export interface TouchedFields {
  [fieldName: string]: boolean;
}

// Analytics types
export interface AnalyticsEvent {
  type: 'form_start' | 'step_start' | 'step_complete' | 'field_focus' | 'field_completion' | 
        'validation_error' | 'form_abandonment' | 'form_submission' | 'submission_error' | 'service_selection';
  timestamp: number;
  sessionId: string;
  stepNumber?: number;
  stepName?: string;
  fieldName?: string;
  [key: string]: any;
}

export interface AnalyticsData {
  sessionId: string;
  startTime: number;
  endTime: number;
  totalEvents: number;
  events: AnalyticsEvent[];
  fieldInteractions: Record<string, any>;
  summary: AnalyticsSummary;
}

export interface AnalyticsSummary {
  totalStepsCompleted: number;
  totalValidationErrors: number;
  totalSubmissionAttempts: number;
  averageTimePerStep: number;
  mostProblematicFields: Array<{ field: string; errors: number }>;
  conversionFunnelData: Record<string, number>;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type FormFieldValue = string | number | boolean | null | undefined;

export type FormChangeHandler = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;