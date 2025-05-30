// Utility functions for formatting services data

export const formatServicesRequested = (servicesRequested: any): string => {
  if (!servicesRequested) return 'N/A';
  
  const services = [];
  
  // Standard residential services
  if (servicesRequested.windowCleaning) services.push('Window Cleaning');
  if (servicesRequested.conservatoryWindows) services.push('Conservatory Windows');
  if (servicesRequested.conservatoryRoof) services.push('Conservatory Roof');
  if (servicesRequested.gutterClearing) services.push('Gutter Clearing');
  if (servicesRequested.fasciaSoffitGutter) services.push('Fascia/Soffit/Gutter');
  if (servicesRequested.fasciaSoffit) services.push('Fascia & Soffit');
  if (servicesRequested.fasciaSoffitCleaning) services.push('Fascia/Soffit Cleaning');
  if (servicesRequested.solarPanels) services.push('Solar Panels');
  if (servicesRequested.solarPanelCleaning) services.push('Solar Panel Cleaning');
  
  // Commercial services
  if (servicesRequested.claddingCleaning) services.push('Cladding Cleaning');
  if (servicesRequested.signageCleaning) services.push('Signage Cleaning');
  if (servicesRequested.pressureWashing) services.push('Pressure Washing');
  
  // Other services
  if (servicesRequested.other && servicesRequested.otherServiceText) {
    services.push(servicesRequested.otherServiceText);
  }
  
  return services.length > 0 ? services.join(', ') : 'Window Cleaning';
};

export const formatFrequency = (frequency?: string): string => {
  if (!frequency) return 'One-off';
  
  const frequencyMap: Record<string, string> = {
    '4-weekly': '4 Weekly',
    '4weekly': '4 Weekly',
    '4 Weekly': '4 Weekly',
    '8-weekly': '8 Weekly',
    '8weekly': '8 Weekly',
    '8 Weekly': '8 Weekly',
    '12-weekly': '12 Weekly',
    '12weekly': '12 Weekly',
    '12 Weekly': '12 Weekly',
    'one-off': 'One-off',
    'oneOff': 'One-off',
    'One-off': 'One-off',
    'monthly': 'Monthly',
    'fortnightly': 'Fortnightly',
    'weekly': 'Weekly',
    'asRequired': 'As Required'
  };
  
  return frequencyMap[frequency] || frequency;
};

export const formatPropertyType = (propertyType?: string, propertySize?: string): string => {
  if (!propertyType && !propertySize) return 'N/A';
  
  const parts = [];
  if (propertySize) parts.push(propertySize);
  if (propertyType) parts.push(propertyType);
  
  return parts.join(' ') || 'N/A';
};

export const getBookingType = (lead: any): string => {
  // Check for commercial booking
  if (lead.commercialDetails) {
    return 'Commercial Enquiry';
  }
  
  // Check for custom quote (6+ beds)
  if (lead.customResidentialDetails) {
    return 'Custom Quote (6+ Beds)';
  }
  
  // Check for general enquiry
  if (lead.generalEnquiryDetails) {
    return 'General Enquiry';
  }
  
  // Default to standard residential
  return 'Standard Residential';
};

export const formatQuoteRequests = (quoteRequests: any): string[] => {
  const requests = [];
  
  if (quoteRequests?.solarPanelCleaning) {
    requests.push('Solar Panel Cleaning Quote');
  }
  
  if (quoteRequests?.conservatoryRoofCleaning) {
    requests.push('Conservatory Roof Cleaning Quote');
  }
  
  return requests;
};