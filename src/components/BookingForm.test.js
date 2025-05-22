import { mapFormDataToTemplateParams } from './BookingForm'; // Assuming BookingForm.js exports this function

describe('mapFormDataToTemplateParams', () => {
  const baseFormData = {
    customerName: 'John Doe',
    email: 'john.doe@example.com',
    mobile: '07123456789',
    addressLine1: '123 Main St',
    addressLine2: '',
    townCity: 'Anytown',
    postcode: 'AN1 1NY',
    preferredContactMethod: 'email',
    bookingNotes: 'Test booking notes',
    recaptchaToken: 'test-token',
    // Initialize all possible nested details objects to prevent undefined errors
    customResidentialDetails: {},
    commercialDetails: {},
    generalEnquiryDetails: {},
    additionalServices: {},
    selectedWindowService: null, // Or a default object structure if needed by the function early
    initialWindowPrice: 0,
    selectedFrequency: '',
    hasConservatory: false,
    hasExtension: false,
    conservatorySurcharge: 0,
    extensionSurcharge: 0,
    windowCleaningDiscount: 0,
    subTotalBeforeDiscount: 0,
    grandTotal: 0,
    selectedDate: null,
  };

  test('should correctly map Standard Residential Booking', () => {
    const formData = {
      ...baseFormData,
      isResidential: true,
      isCustomQuote: false,
      isCommercial: false,
      isGeneralEnquiry: false,
      propertyType: 'Detached',
      bedrooms: '3 Bed', // Ensuring this matches expected format like "X Bed"
      initialWindowPrice: 25,
      selectedFrequency: '4-weekly',
    };
    const params = mapFormDataToTemplateParams(formData);

    expect(params.is_standard_residential_booking_bool).toBe(true);
    expect(params.bookingTypeDisplay).toBe('Standard Residential Booking');
    expect(params.emailSubject).toContain('Standard Residential Booking');
    expect(params.emailSubject).toContain(formData.customerName);
    expect(params.std_property_type).toBe('Detached');
    expect(params.std_bedrooms).toBe('3 Bed'); // This should now pass
    expect(params.isBespokeOrCommercial).toBe('No');
  });

  test('should correctly map Custom Residential Quote', () => {
    const formData = {
      ...baseFormData,
      isResidential: true,
      isCustomQuote: true,
      isCommercial: false,
      isGeneralEnquiry: false,
      customResidentialDetails: {
        propertyStyle: 'Townhouse',
        exactBedrooms: '4',
        // Add other fields from customResidentialDetails as needed by the function
        approxWindows: '20',
        accessIssues: 'None',
        servicesRequested: { windowCleaning: true },
        frequencyPreference: '8-weekly',
        otherNotes: 'Custom notes here',
        customAdditionalComments: 'More custom comments'
      },
    };
    const params = mapFormDataToTemplateParams(formData);

    expect(params.is_standard_residential_booking_bool).toBe(false);
    expect(params.bookingTypeDisplay).toBe('Custom Residential Quote Request');
    expect(params.emailSubject).toContain('Custom Residential Quote Request');
    expect(params.emailSubject).toContain(formData.customerName);
    expect(params.custom_property_style).toBe('Townhouse');
    expect(params.custom_exact_bedrooms).toBe('4');
    expect(params.isBespokeOrCommercial).toBe('Yes (Custom Residential)');
    
    // Check that legacy fields are N/A or similar for non-standard bookings
    // The current logic sets them to 'N/A' if they are not boolean flags and it's not a standard booking.
    expect(params.std_property_type).toBe('N/A'); // These are initialized to N/A and not in legacyServiceFields
    expect(params.std_bedrooms).toBe('N/A');     // These are initialized to N/A and not in legacyServiceFields
    // These are in legacyServiceFields and should get the specific string
    expect(params.windowPrice).toBe('N/A for this booking type');
    expect(params.windowFrequency).toBe('N/A for this booking type');
    expect(params.gutterPrice).toBe('N/A for this booking type');
  });

  test('should correctly map Commercial Enquiry', () => {
    const formData = {
      ...baseFormData,
      isResidential: false,
      isCustomQuote: false,
      isCommercial: true,
      isGeneralEnquiry: false,
      commercialDetails: {
        businessName: 'Test Corp',
        propertyType: 'Office',
        // Add other fields from commercialDetails as needed
        approxSizeOrWindows: 'Large',
        specificRequirements: 'Needs out of hours access',
        servicesRequested: { windowCleaning: true, gutterCleaning: true },
        frequencyPreference: 'monthly',
        otherNotes: 'Commercial notes'
      },
    };
    const params = mapFormDataToTemplateParams(formData);

    expect(params.is_standard_residential_booking_bool).toBe(false);
    expect(params.bookingTypeDisplay).toBe('Commercial Enquiry');
    expect(params.emailSubject).toContain('Commercial Enquiry');
    expect(params.emailSubject).toContain(formData.customerName); // Assuming customerName is used, or businessName if logic prefers
    expect(params.commercial_business_name).toBe('Test Corp');
    expect(params.commercial_property_type).toBe('Office');
    expect(params.isBespokeOrCommercial).toBe('Yes (Commercial)');
  });

  test('should correctly map General Enquiry', () => {
    const formData = {
      ...baseFormData,
      isResidential: false,
      isCustomQuote: false,
      isCommercial: false,
      isGeneralEnquiry: true,
      generalEnquiryDetails: {
        enquiryComments: 'Just asking about services.',
        requestedServices: { gutterClearing: true },
        requestedFrequency: 'oneOff',
        otherServiceText: ''
      },
    };
    const params = mapFormDataToTemplateParams(formData);

    expect(params.is_standard_residential_booking_bool).toBe(false);
    expect(params.bookingTypeDisplay).toBe('General Enquiry');
    expect(params.emailSubject).toContain('General Enquiry');
    expect(params.emailSubject).toContain(formData.customerName);
    expect(params.general_enquiry_comments).toBe('Just asking about services.');
    expect(params.isBespokeOrCommercial).toBe('N/A (General Enquiry)');
  });

  // Test for address formatting
  test('should format address correctly', () => {
    const formData = {
      ...baseFormData,
      isResidential: true, // any booking type
      addressLine1: '1 First Street',
      addressLine2: 'Apt 2B',
      townCity: 'Testville',
      postcode: 'T1 2AB',
    };
    const params = mapFormDataToTemplateParams(formData);
    expect(params.address).toBe('1 First Street, Apt 2B, Testville, T1 2AB');
  });

  test('should format address correctly when addressLine2 is missing', () => {
    const formData = {
      ...baseFormData,
      isResidential: true,
      addressLine1: '1 First Street',
      townCity: 'Testville',
      postcode: 'T1 2AB',
    };
    const params = mapFormDataToTemplateParams(formData);
    expect(params.address).toBe('1 First Street, Testville, T1 2AB');
  });
  
  // Test for annual value calculation helper (if possible to test in isolation, or through main function)
  // This is more of an integration test for the helper via the main function.
  test('should calculate annual value correctly for standard residential', () => {
    const formData = {
      ...baseFormData,
      isResidential: true,
      isCustomQuote: false,
      isCommercial: false,
      isGeneralEnquiry: false,
      propertyType: 'Detached',
      bedrooms: '3 Bed',
      initialWindowPrice: 20, // Base price for frequency calculation
      selectedFrequency: '4-weekly', // This is the fullLabel, mapFormDataToTemplateParams might use frequencyId
      // Let's assume selectedWindowService contains the frequencyId mapFormDataToTemplateParams needs
      selectedWindowService: { frequencyId: '4-weekly' },
      additionalServices: {
        gutterClearing: true, // Price for this will be calculated
      },
      gutterClearingPrice: 80, // Assume this is pre-calculated and passed if used directly
    };
    // Manually set the frequencyId in formData as well if mapFormDataToTemplateParams reads it from there
    // For this test, we're focusing on the getAnnualValue helper's usage.
    // The mapFormDataToTemplateParams function uses `formData.selectedFrequency` (fullLabel) 
    // and `params.windowPrice` (calculated based on initialWindowPrice and frequency)
    // to call getAnnualValue.

    const params = mapFormDataToTemplateParams(formData);
    // params.windowPrice will be 20 (4-weekly adjustment is basePrice * 1)
    // params.windowFrequency will be '4-weekly'
    // Annual for 4-weekly: 20 * 13 = 260
    expect(params.windowAnnual).toBe('£260.00');

    // If gutter clearing is selected and priced at £80 (one-off)
    // This depends on how gutterFrequency is set for one-off additional services
    // mapFormDataToTemplateParams sets gutterFrequency = 'As per service' for standard addons,
    // then calls getAnnualValue(params.gutterPrice, 'adhoc')
    if (formData.additionalServices.gutterClearing) {
        expect(params.gutterAnnual).toBe('One-off Service'); // or specific pricing if logic changes
    }
  });

});
