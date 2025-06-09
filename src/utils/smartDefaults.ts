// Smart defaults for common form selections

interface SmartDefaults {
  propertyType: string;
  bedrooms: string;
  selectedFrequency: string;
  preferredContactMethod: string;
  additionalServices: {
    gutterClearing: boolean;
    fasciaSoffitGutter: boolean;
    conservatoryRoof: boolean;
  };
}

interface FieldHints {
  [key: string]: string;
  propertyType: string;
  bedrooms: string;
  frequency: string;
  conservatory: string;
  extension: string;
  gutterClearing: string;
  fasciaSoffitGutter: string;
  postcode: string;
  selectedDate: string;
  email: string;
  mobile: string;
  bookingNotes: string;
}

interface ErrorMessages {
  [key: string]: string;
  customerName: string;
  email: string;
  mobile: string;
  addressLine1: string;
  townCity: string;
  postcode: string;
  selectedDate: string;
  propertyType: string;
  bedrooms: string;
  selectedFrequency: string;
  recaptcha: string;
}

export const getSmartDefaults = (): SmartDefaults => {
  return {
    // Most common property type
    propertyType: 'Semi-detached',
    
    // Most common bedroom count
    bedrooms: '3 Bedrooms',
    
    // Most popular frequency
    selectedFrequency: '8-weekly',
    
    // Default contact preference
    preferredContactMethod: 'email',
    
    // Common add-ons preselected
    additionalServices: {
      gutterClearing: false, // Let users opt-in
      fasciaSoffitGutter: false, // Let users opt-in
      conservatoryRoof: false // Let users opt-in
    }
  };
};

// Get recommended frequency based on property type
export const getRecommendedFrequency = (propertyType?: string, bedrooms?: string): string => {
  // Larger properties might benefit from more frequent cleaning
  if (bedrooms && (bedrooms.includes('5') || bedrooms.includes('6+'))) {
    return '4-weekly';
  }
  
  // Standard recommendation
  return '8-weekly';
};

// Get helpful hints for each field
export const getFieldHints = (): FieldHints => {
  return {
    propertyType: "Select your property type for accurate pricing",
    bedrooms: "Include all bedrooms for the most accurate quote",
    frequency: "8-weekly is our most popular choice for regular maintenance",
    conservatory: "Add £5 per clean for conservatory windows",
    extension: "Large extensions add £5 per clean",
    gutterClearing: "Annual gutter clearing helps prevent water damage",
    fasciaSoffitGutter: "Keep your property looking fresh with external cleaning",
    postcode: "Enter at least 3 characters to check service availability",
    selectedDate: "Choose your preferred start date - we'll confirm availability",
    email: "We'll send your booking confirmation here",
    mobile: "We'll text you the day before your clean",
    bookingNotes: "Any special access instructions or requests?"
  };
};

// Get better error messages
export const getErrorMessages = (): ErrorMessages => {
  return {
    customerName: "Please enter your name so we know who to contact",
    email: "Please check your email address format (e.g., name@example.com)",
    mobile: "Please enter a valid UK mobile number (e.g., 07123 456789)",
    addressLine1: "Please enter your street address",
    townCity: "Please enter your town or city",
    postcode: "Please enter a valid UK postcode (e.g., BS1 4DJ)",
    selectedDate: "Please select your preferred start date",
    propertyType: "Please select your property type for accurate pricing",
    bedrooms: "Please select the number of bedrooms",
    selectedFrequency: "Please choose how often you'd like us to clean",
    recaptcha: "Please complete the security check to submit your booking"
  };
};