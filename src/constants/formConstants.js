// src/constants/formConstants.js

// Property Types & Service IDs (from WindowCleaningPricing.js)
export const SERVICE_ID_SDH_2_3_BED = 'sdh23';
export const SERVICE_ID_DH_2_3_BED = 'dh23';
export const SERVICE_ID_SDH_4_BED = 'sdh4';
export const SERVICE_ID_DH_4_BED = 'dh4';
export const SERVICE_ID_SDH_5_BED = 'sdh5';
export const SERVICE_ID_DH_5_BED = 'dh5';
export const SERVICE_ID_CUSTOM_6_PLUS_BEDS = 'custom6plus';
export const SERVICE_ID_COMMERCIAL = 'commercial';
export const SERVICE_ID_OTHER_SERVICES_ENQUIRY = 'other_services_enquiry';

// Frequency IDs (from WindowCleaningPricing.js)
export const FREQUENCY_ID_4_WEEKLY = '4-weekly';
export const FREQUENCY_ID_8_WEEKLY = '8-weekly';
export const FREQUENCY_ID_12_WEEKLY = '12-weekly';
export const FREQUENCY_ID_ADHOC = 'adhoc';
export const FREQUENCY_ID_BUSINESS_ENQUIRY = 'business_enquiry'; // Used in WindowCleaningPricing
export const FREQUENCY_ID_CUSTOM_QUOTE = 'custom_quote'; // Used in WindowCleaningPricing

// Additional Service IDs (primarily from AdditionalServicesForm.js)
export const ADDON_ID_CONSERVATORY_ROOF = 'conservatoryRoof'; // also in generalServiceOptionsList
export const ADDON_ID_FASCIA_SOFFIT_GUTTER = 'fasciaSoffitGutter'; // also in generalServiceOptionsList
export const ADDON_ID_GUTTER_CLEARING = 'gutterClearing'; // also in generalServiceOptionsList

// General Enquiry Service IDs (from AdditionalServicesForm.js generalServiceOptionsList)
export const GEN_ENQ_SERVICE_WINDOW_CLEANING = 'windowCleaning';
export const GEN_ENQ_SERVICE_CONSERVATORY_WINDOWS = 'conservatoryWindows';
// ADDON_ID_CONSERVATORY_ROOF is used here
// ADDON_ID_GUTTER_CLEARING is used here
// ADDON_ID_FASCIA_SOFFIT_GUTTER is used here
export const GEN_ENQ_SERVICE_SOLAR_PANELS = 'solarPanels';
export const GEN_ENQ_SERVICE_OTHER = 'other'; // Generic 'other'

// General Enquiry Frequency IDs (from AdditionalServicesForm.js enquiryFrequencyOptionsList)
export const GEN_ENQ_FREQ_ONE_OFF = 'oneOff';
export const GEN_ENQ_FREQ_4_WEEKLY = '4weekly'; // Note: different from standard 4-weekly
export const GEN_ENQ_FREQ_8_WEEKLY = '8weekly'; // Note: different from standard 8-weekly
export const GEN_ENQ_FREQ_12_WEEKLY = '12weekly'; // Note: different from standard 12-weekly
export const GEN_ENQ_FREQ_AS_REQUIRED = 'asRequired';

// Property Style IDs (from PropertyDetailsForm.js - Custom Residential)
export const PROP_STYLE_DETACHED_LARGE_UNIQUE = 'detached';
export const PROP_STYLE_SEMI_DETACHED_LARGE_EXTENDED = 'semiDetachedLarge';
export const PROP_STYLE_TERRACED_MULTI_LARGE = 'terracedMulti';
export const PROP_STYLE_BUNGALOW_LARGE_COMPLEX = 'bungalowLarge';
export const PROP_STYLE_APARTMENT_BLOCK = 'apartmentBlock';
export const PROP_STYLE_OTHER_CUSTOM = 'otherCustomProperty';

// Custom Residential Service IDs (from PropertyDetailsForm.js)
export const CUSTOM_RES_SERVICE_WINDOW_CLEANING = 'windowCleaning';
export const CUSTOM_RES_SERVICE_GUTTER_CLEANING = 'gutterCleaning';
export const CUSTOM_RES_SERVICE_FASCIA_SOFFIT_CLEANING = 'fasciaSoffitCleaning';
export const CUSTOM_RES_SERVICE_CONSERVATORY_WINDOW_CLEANING = 'conservatoryWindowCleaning';
export const CUSTOM_RES_SERVICE_CONSERVATORY_ROOF_CLEANING = 'conservatoryRoofCleaning';
export const CUSTOM_RES_SERVICE_OTHER = 'other'; // Generic 'other' for custom residential

// Custom Residential Frequency IDs (from PropertyDetailsForm.js)
// Note: These overlap with FREQUENCY_IDs from WindowCleaningPricing, consider aliasing or careful usage
export const CUSTOM_RES_FREQ_4_WEEKLY = '4-weekly';
export const CUSTOM_RES_FREQ_8_WEEKLY = '8-weekly';
export const CUSTOM_RES_FREQ_12_WEEKLY = '12-weekly';
export const CUSTOM_RES_FREQ_ONE_OFF = 'one-off'; // Note: different from adhoc
export const CUSTOM_RES_FREQ_OTHER = 'other'; // Generic 'other'

// Commercial Property Types (from PropertyDetailsForm.js)
export const COMM_PROP_TYPE_OFFICE = 'office';
export const COMM_PROP_TYPE_RETAIL = 'retail';
export const COMM_PROP_TYPE_RESTAURANT = 'restaurant';
export const COMM_PROP_TYPE_WAREHOUSE = 'warehouse';
export const COMM_PROP_TYPE_MEDICAL = 'medical';
export const COMM_PROP_TYPE_SCHOOL = 'school';
export const COMM_PROP_TYPE_HOTEL = 'hotel';
export const COMM_PROP_TYPE_OTHER = 'other'; // Generic 'other'

// Commercial Approx Size (from PropertyDetailsForm.js)
export const COMM_SIZE_SMALL = 'small';
export const COMM_SIZE_MEDIUM = 'medium';
export const COMM_SIZE_LARGE = 'large';
export const COMM_SIZE_MULTI_STOREY = 'multi-storey';
export const COMM_SIZE_COMPLEX = 'complex';

// Commercial Service IDs (from ReviewSubmitForm.js - these might need to be defined based on where they are SET)
// It appears commercial services are more free-text or not explicitly chosen with IDs in PropertyDetailsForm
// For now, I will list what was in ReviewSubmitForm's labels. These might originate from `commercialDetails.servicesRequested` in `initialFormData`.
export const COMM_SERVICE_WINDOW_CLEANING = 'windowCleaning';
export const COMM_SERVICE_GUTTER_CLEANING = 'gutterCleaning';
export const COMM_SERVICE_FASCIA_SOFFIT_CLEANING = 'fasciaSoffitCleaning';
export const COMM_SERVICE_CLADDING_CLEANING = 'claddingCleaning';
export const COMM_SERVICE_SIGNAGE_CLEANING = 'signageCleaning';
export const COMM_SERVICE_OTHER = 'other';

// Commercial Frequency IDs (from ReviewSubmitForm.js)
export const COMM_FREQ_WEEKLY = 'weekly';
export const COMM_FREQ_FORTNIGHTLY = 'fortnightly';
export const COMM_FREQ_MONTHLY = 'monthly';
export const COMM_FREQ_QUARTERLY = 'quarterly';
export const COMM_FREQ_BI_ANNUALLY = 'bi-annually';
export const COMM_FREQ_ANNUALLY = 'annually';
export const COMM_FREQ_ONE_OFF = 'one-off';
export const COMM_FREQ_OTHER = 'other';

// Addon Service IDs used in initialFormData and AdditionalServicesForm
export const ADDON_GUTTER_CLEARING = 'gutterClearing';
export const ADDON_FASCIA_SOFFIT_GUTTER = 'fasciaSoffitGutter';
export const ADDON_CONSERVATORY_ROOF = 'conservatoryRoof'; // This is also a quote request

// Quote Request Service IDs (from initialFormData and AdditionalServicesForm)
export const QUOTE_REQUEST_SOLAR_PANEL_CLEANING = 'solarPanelCleaning';
export const QUOTE_REQUEST_CONSERVATORY_ROOF_CLEANING = 'conservatoryRoofCleaning'; 