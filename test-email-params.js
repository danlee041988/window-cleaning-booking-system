// Test script to verify email template parameters
const FORM_CONSTANTS = {
  ADDON_CONSERVATORY_ROOF: 'conservatoryRoof',
  ADDON_FASCIA_SOFFIT_GUTTER: 'fasciaSoffitGutter',
  ADDON_GUTTER_CLEARING: 'gutterClearing'
};

// Sample form data
const formData = {
  quoteType: 'standard',
  email: 'test@example.com',
  phone: '01234567890',
  fullName: 'John Doe',
  address: '123 Test Street',
  city: 'Bristol',
  postcode: 'BS1 2AB',
  propertyType: 'detached',
  bedrooms: '4',
  hasConservatory: true,
  additionalServices: {
    conservatoryRoof: true,
    fasciaSoffitGutter: true,
    gutterClearing: false
  },
  frequency: 'monthly',
  totalPrice: 45.00,
  scheduledVisit: {
    date: '2024-02-15',
    timeSlot: '09:00-12:00'
  }
};

// The mapping function from BookingForm.js
function mapFormDataToTemplateParamsSimple(formData) {
  const isStandardResidential = formData.quoteType === 'standard';
  const isCustomQuote = formData.quoteType === 'custom';
  const isCommercial = formData.quoteType === 'commercial';
  const isGeneralEnquiry = formData.quoteType === 'general';

  const params = {
    // Customer Information
    to_email: formData.email || '',
    customer_name: formData.fullName || '',
    customer_email: formData.email || '',
    customer_phone: formData.phone || '',
    customer_address: formData.address || '',
    customer_city: formData.city || '',
    customer_postcode: formData.postcode || '',

    // Quote Type Flags (as strings for EmailJS)
    isStandardResidential: isStandardResidential ? 'true' : '',
    isCustomQuote: isCustomQuote ? 'true' : '',
    isCommercial: isCommercial ? 'true' : '',
    isGeneralEnquiry: isGeneralEnquiry ? 'true' : '',

    // Debug values
    debugIsStandardResidential: isStandardResidential ? 'YES' : 'NO',
    debugFormFlags: `Standard: ${isStandardResidential}, Custom: ${isCustomQuote}, Commercial: ${isCommercial}, General: ${isGeneralEnquiry}`,

    // Standard Residential Details
    propertyType: isStandardResidential ? (formData.propertyType || '') : '',
    bedrooms: isStandardResidential ? (formData.bedrooms || '') : '',
    hasConservatory: isStandardResidential && formData.hasConservatory ? 'true' : '',
    frequency: isStandardResidential ? (formData.frequency || '') : '',

    // Additional Services (using correct keys)
    hasConservatoryRoof: isStandardResidential && formData.additionalServices?.[FORM_CONSTANTS.ADDON_CONSERVATORY_ROOF] ? 'true' : '',
    hasFasciaSoffit: isStandardResidential && formData.additionalServices?.[FORM_CONSTANTS.ADDON_FASCIA_SOFFIT_GUTTER] ? 'true' : '',
    hasGutterClearing: isStandardResidential && formData.additionalServices?.[FORM_CONSTANTS.ADDON_GUTTER_CLEARING] ? 'true' : '',

    // Pricing
    totalPrice: formData.totalPrice ? `£${formData.totalPrice.toFixed(2)}` : '',

    // Schedule
    scheduledDate: formData.scheduledVisit?.date || '',
    scheduledTime: formData.scheduledVisit?.timeSlot || '',

    // Other quote types
    businessName: isCommercial ? (formData.businessName || '') : '',
    businessType: isCommercial ? (formData.businessType || '') : '',
    buildingDetails: isCommercial ? (formData.buildingDetails || '') : '',
    
    enquiryType: isGeneralEnquiry ? (formData.enquiryType || '') : '',
    enquiryMessage: isGeneralEnquiry ? (formData.message || '') : '',
    
    customDetails: isCustomQuote ? (formData.customDetails || '') : '',
    customBudget: isCustomQuote ? (formData.budget || '') : ''
  };

  return params;
}

// Test the mapping
console.log('Testing email template parameters...\n');
const templateParams = mapFormDataToTemplateParamsSimple(formData);

console.log('Generated template parameters:');
console.log(JSON.stringify(templateParams, null, 2));

console.log('\n--- Key Debug Values ---');
console.log('isStandardResidential:', templateParams.isStandardResidential);
console.log('debugIsStandardResidential:', templateParams.debugIsStandardResidential);
console.log('hasConservatory:', templateParams.hasConservatory);
console.log('hasConservatoryRoof:', templateParams.hasConservatoryRoof);
console.log('totalPrice:', templateParams.totalPrice);