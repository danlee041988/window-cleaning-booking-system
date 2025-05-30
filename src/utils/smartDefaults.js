// Smart defaults for common form selections
export const getSmartDefaults = () => {
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
export const getRecommendedFrequency = (propertyType, bedrooms) => {
  // Larger properties might benefit from more frequent cleaning
  if (bedrooms && (bedrooms.includes('5') || bedrooms.includes('6+'))) {
    return '4-weekly';
  }
  
  // Standard recommendation
  return '8-weekly';
};

// Get helpful hints for each field
export const getFieldHints = () => {
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
export const getErrorMessages = () => {
  return {
    customerName: {
      required: "Please enter your name so we know who to contact",
      invalid: "Please enter a valid name (letters only)"
    },
    email: {
      required: "We need your email to send booking confirmation",
      invalid: "Please check your email address format (e.g., name@example.com)"
    },
    mobile: {
      required: "We need your mobile to confirm appointments",
      invalid: "Please enter a valid UK mobile number (e.g., 07123 456789)"
    },
    addressLine1: {
      required: "Please enter your street address",
      invalid: "Please enter a complete address"
    },
    postcode: {
      required: "We need your postcode to schedule your service",
      invalid: "Please enter a valid UK postcode (e.g., BS1 4DJ)",
      notCovered: "Sorry, we don't currently service this area. Try a general enquiry instead?"
    },
    selectedDate: {
      required: "Please select your preferred start date",
      invalid: "Please select a valid date from the available options"
    },
    propertyType: {
      required: "Please select your property type for accurate pricing"
    },
    bedrooms: {
      required: "Please select the number of bedrooms"
    },
    selectedFrequency: {
      required: "Please choose how often you'd like us to clean"
    },
    recaptcha: {
      required: "Please complete the security check to submit your booking"
    }
  };
};