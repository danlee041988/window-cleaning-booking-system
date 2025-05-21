// Step 4: Review & Submit
import React from 'react';
import { formatDateForDisplay } from '../utils/scheduleUtils';
import ReCAPTCHA from "react-google-recaptcha"; // Import ReCAPTCHA
// import { db } from '../firebaseConfig'; // We'll use this later to submit data
// import { collection, addDoc } from "firebase/firestore"; 

// Helper function to calculate Gutter Clearing Price (mirrored from AdditionalServicesForm or move to utils)
const calculateGutterClearingPrice = (propertyType, bedrooms) => {
    let price = 80; // Default for 2-3 Bed Semi-Detached / Other / or if details unknown
    if (propertyType && bedrooms) {
        const isDetached = propertyType.toLowerCase().includes('detached');
        if (bedrooms === '2-3 Bed') {
            price = isDetached ? 100 : 80;
        } else if (bedrooms === '4 Bed') {
            price = isDetached ? 120 : 100;
        } else if (bedrooms === '5 Bed') {
            price = isDetached ? 140 : 120;
        }
    }
    return price;
};

const ReviewSection = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-3">{title}</h3>
        <div className="space-y-1 text-sm text-gray-600">{children}</div>
    </div>
);

const ReviewItem = ({ label, value, isList = false }) => {
    if (isList && Array.isArray(value) && value.length > 0) {
        return (
            <div>
                <span className="font-medium text-gray-800">{label}:</span>
                <ul className="list-disc list-inside ml-4 mt-1">
                    {value.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </div>
        );
    }
    return <p><span className="font-medium text-gray-800">{label}:</span> {value || 'N/A'}</p>;
};

// For mapping general enquiry service IDs to labels
const generalServiceDisplayLabels = {
    windowCleaning: 'Window Cleaning',
    conservatoryWindows: 'Conservatory Windows Only',
    conservatoryRoof: 'Conservatory Roof Cleaning',
    gutterClearing: 'Gutter Clearing (Interior)',
    fasciaSoffitGutter: 'Fascia, Soffit & Gutter Exterior Clean',
    solarPanels: 'Solar Panel Cleaning',
    other: 'Other',
};

// For mapping commercial service IDs to labels
const commercialServiceDisplayLabels = {
    windowCleaning: 'Window Cleaning',
    gutterCleaning: 'Gutter Cleaning',
    fasciaSoffitCleaning: 'Fascia & Soffit Cleaning',
    claddingCleaning: 'Cladding Cleaning',
    signageCleaning: 'Signage Cleaning',
    other: 'Other',
};

// For mapping commercial frequency IDs to labels
const commercialFrequencyDisplayLabels = {
    weekly: 'Weekly',
    fortnightly: 'Fortnightly (Every 2 Weeks)',
    monthly: 'Monthly (Every 4 Weeks)',
    quarterly: 'Quarterly (Every 12 Weeks)',
    'bi-annually': 'Bi-Annually (Every 6 Months)',
    annually: 'Annually',
    'one-off': 'One-off',
    other: 'Other',
};

// For mapping custom residential property style IDs to labels
const customPropertyStyleDisplayLabels = {
    detached: 'Detached House (Large/Unique)',
    semiDetachedLarge: 'Semi-Detached House (Large/Extended)',
    terracedMulti: 'Terraced House (Multiple/Large)',
    bungalowLarge: 'Bungalow (Large/Complex)',
    apartmentBlock: 'Apartment Block',
    otherCustomProperty: 'Other',
};

// For mapping custom residential service IDs to labels
const customResidentialServiceDisplayLabels = {
    windowCleaning: 'Window Cleaning (Exterior)',
    gutterCleaning: 'Gutter Clearing (Interior)',
    fasciaSoffitCleaning: 'Fascia & Soffit Cleaning (Exterior)',
    conservatoryWindowCleaning: 'Conservatory Window Cleaning (Sides)',
    conservatoryRoofCleaning: 'Conservatory Roof Cleaning',
    other: 'Other',
};

// For mapping custom residential frequency IDs to labels (can reuse/adapt)
const customResidentialFrequencyDisplayLabels = {
    '4-weekly': '4 Weekly',
    '8-weekly': '8 Weekly',
    '12-weekly': '12 Weekly',
    'one-off': 'One-off Clean',
    other: 'Other',
};

const enquiryFrequencyDisplayLabels = {
    oneOff: 'One-off',
    '4weekly': '4 Weekly',
    '8weekly': '8 Weekly',
    '12weekly': '12 Weekly',
    asRequired: 'As Required / Not Sure',
};

const ReviewSubmitForm = ({ prevStep, values, handleSubmit, setFormData, isLoading, submissionError }) => {
    const { 
        propertyType, bedrooms, selectedFrequency, 
        initialWindowPrice,
        conservatorySurcharge,
        extensionSurcharge,
        hasConservatory,
        hasExtension,
        additionalServices,
        windowCleaningDiscount,
        subTotalBeforeDiscount,
        grandTotal,
        customerName, addressLine1, addressLine2, townCity, postcode, mobile, email, preferredContactMethod,
        isCustomQuote, isCommercial, isResidential, isGeneralEnquiry,
        customResidentialDetails,
        commercialDetails,
        selectedDate,
        generalEnquiryDetails,
        bookingNotes,
        recaptchaToken
    } = values;

    const handleRecaptchaChange = (token) => {
        setFormData(prev => ({ ...prev, recaptchaToken: token }));
    };

    const handleActualSubmit = () => {
        if (!recaptchaToken && !process.env.REACT_APP_RECAPTCHA_SITE_KEY?.includes("testkey")) { // only enforce if not a known test key and not yet set
            // This check can be made more sophisticated, e.g. by also checking if it has expired.
            // For now, primarily relying on the disabled state of the button.
            alert("Please complete the reCAPTCHA verification before submitting.");
            return;
        }
        handleSubmit(values); // Pass all current form values
    };

    // Define additional service labels for fixed-price addons (if any added in future)
    // For now, gutter and fascia are dynamic.
    const fixedAddonServiceDefinitions = [
        // Example: { id: 'conservatoryRoof', label: 'Conservatory Roof Cleaning', price: 75 },
    ];

    // Get display info for selected fixed-price addons
    const selectedFixedAddonsToDisplay = fixedAddonServiceDefinitions
        .filter(def => additionalServices && additionalServices[def.id])
        .map(def => ({ name: def.label, price: def.price }));

    // Calculate dynamic prices for gutter-related services if selected
    const gutterClearingSelected = additionalServices && additionalServices.gutterClearing;
    const fasciaSoffitGutterSelected = additionalServices && additionalServices.fasciaSoffitGutter;

    let gutterClearingReviewPrice = 0;
    let fasciaSoffitGutterReviewPrice = 0;
    const canDisplayGutterServicePrices = propertyType && bedrooms && (isResidential || initialWindowPrice === 0);

    if (gutterClearingSelected && canDisplayGutterServicePrices) {
        gutterClearingReviewPrice = calculateGutterClearingPrice(propertyType, bedrooms);
    }
    if (fasciaSoffitGutterSelected && canDisplayGutterServicePrices) {
        const baseForFascia = gutterClearingSelected ? gutterClearingReviewPrice : calculateGutterClearingPrice(propertyType, bedrooms);
        fasciaSoffitGutterReviewPrice = baseForFascia + 20;
    }

    let requestedServicesDisplay = [];
    if (isGeneralEnquiry && generalEnquiryDetails?.requestedServices) {
        requestedServicesDisplay = Object.entries(generalEnquiryDetails.requestedServices)
            .filter(([, checked]) => checked)
            .map(([key]) => generalServiceDisplayLabels[key] || key);
    }

    let commercialServicesDisplay = [];
    if (isCommercial && commercialDetails?.servicesRequested) {
        commercialServicesDisplay = Object.entries(commercialDetails.servicesRequested)
            .filter(([, checked]) => checked)
            .map(([key]) => commercialServiceDisplayLabels[key] || key);
    }

    let customResidentialServicesDisplay = [];
    if (isCustomQuote && customResidentialDetails?.servicesRequested) {
        customResidentialServicesDisplay = Object.entries(customResidentialDetails.servicesRequested)
            .filter(([, checked]) => checked)
            .map(([key]) => customResidentialServiceDisplayLabels[key] || key);
    }

    // Determine if we are in a quote/enquiry scenario or a standard booking
    const isQuoteOrEnquiry = isCustomQuote || isCommercial || isGeneralEnquiry;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl bg-white shadow-xl rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
                {isGeneralEnquiry 
                    ? "Review General Enquiry" 
                    : isCommercial 
                        ? "Review Commercial Enquiry" 
                        : isCustomQuote 
                            ? "Review Custom Quote Request" 
                            : "Review Your Booking"}
            </h2>

            {/* Main Service Details for Standard Residential */}
            {!isGeneralEnquiry && isResidential && !isCustomQuote && !isCommercial && propertyType && bedrooms && (
                <ReviewSection title="Window Cleaning Service">
                    <ReviewItem label="Property" value={`${propertyType} - ${bedrooms}`} />
                    <ReviewItem label="Frequency" value={selectedFrequency} />
                    <ReviewItem 
                        label="Selected Date"
                        value={selectedDate === "ASAP" 
                                ? "As soon as possible"
                                : selectedDate ? formatDateForDisplay(new Date(selectedDate)) : 'N/A'
                              }
                    />
                    <ReviewItem label="Base Window Cleaning Price" value={`£${(initialWindowPrice || 0).toFixed(2)}`} /> 
                </ReviewSection>
            )}
            
            {/* Enquiry Type for Commercial/Custom if no standard service was selected first */}
            {!isGeneralEnquiry && (isCommercial && (!propertyType || !bedrooms)) && (
                 <ReviewSection title="Enquiry Type">
                    <ReviewItem label="Type" value="Commercial Property Enquiry" />
                </ReviewSection>
            )}
            {!isGeneralEnquiry && (isCustomQuote && (!propertyType || !bedrooms)) && (
                 <ReviewSection title="Enquiry Type">
                    <ReviewItem label="Type" value={`Custom Quote for ${bedrooms || 'Property with 6+ Beds'}`} />
                    {initialWindowPrice > 0 && <ReviewItem label="Indicated Base Price" value={`£${initialWindowPrice.toFixed(2)}`} />}
                </ReviewSection>
            )}

            {/* Contact Details */}
            <ReviewSection title={isCommercial ? "Business & Contact Details" : "Contact Details"}>
                {isCommercial && commercialDetails?.businessName && (
                    <ReviewItem label="Business Name" value={commercialDetails.businessName} />
                )}
                <ReviewItem label={isCommercial ? "Contact Name" : "Name"} value={customerName} />
                <ReviewItem label="Address" value={`${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}, ${townCity}, ${postcode}`} />
                <ReviewItem label="Mobile" value={mobile} />
                <ReviewItem label="Email" value={email} />
                <ReviewItem label="Preferred Contact" value={preferredContactMethod} />
            </ReviewSection>

            {/* Display general enquiry details */}
            {isGeneralEnquiry && generalEnquiryDetails && (
                <ReviewSection title="Enquiry Details">
                    {requestedServicesDisplay.length > 0 && (
                        <ReviewItem label="Requested Services" value={requestedServicesDisplay} isList={true} />
                    )}
                    {generalEnquiryDetails.requestedServices?.other && generalEnquiryDetails.otherServiceText && (
                        <ReviewItem label="Other Service Specified" value={generalEnquiryDetails.otherServiceText} />
                    )}
                    <ReviewItem label="Preferred Frequency" value={enquiryFrequencyDisplayLabels[generalEnquiryDetails.requestedFrequency] || generalEnquiryDetails.requestedFrequency} />
                    <ReviewItem label="Additional Comments" value={generalEnquiryDetails.enquiryComments} />
                </ReviewSection>
            )}

            {/* Custom Residential Quote Details */}
            {!isGeneralEnquiry && isCustomQuote && isResidential && customResidentialDetails && (
                <ReviewSection title="Custom Quote Specifics (6+ Beds / Bespoke)">
                    <ReviewItem 
                        label="Property Style" 
                        value={customPropertyStyleDisplayLabels[customResidentialDetails.propertyStyle] || customResidentialDetails.propertyStyle} 
                    />
                    {customResidentialDetails.propertyStyle === 'otherCustomProperty' && customResidentialDetails.otherPropertyStyleText && (
                        <ReviewItem label="Other Property Style Specified" value={customResidentialDetails.otherPropertyStyleText} />
                    )}
                    <ReviewItem label="Number of Bedrooms" value={customResidentialDetails.exactBedrooms} /> 
                    
                    {customResidentialServicesDisplay.length > 0 && (
                        <ReviewItem label="Services Requested" value={customResidentialServicesDisplay} isList={true} />
                    )}
                    {customResidentialDetails.servicesRequested?.other && customResidentialDetails.otherServiceText && (
                        <ReviewItem label="Other Service Specified" value={customResidentialDetails.otherServiceText} />
                    )}

                    {customResidentialDetails.servicesRequested?.windowCleaning && (
                        <>
                            <ReviewItem 
                                label="Preferred Window Cleaning Frequency" 
                                value={customResidentialFrequencyDisplayLabels[customResidentialDetails.frequencyPreference] || customResidentialDetails.frequencyPreference} 
                            />
                            {customResidentialDetails.frequencyPreference === 'other' && customResidentialDetails.otherFrequencyText && (
                                <ReviewItem label="Other Frequency Specified" value={customResidentialDetails.otherFrequencyText} />
                            )}
                        </>
                    )}

                    <ReviewItem label="Approx. Windows" value={customResidentialDetails.approxWindows} />
                    <ReviewItem label="Access/Requirements" value={customResidentialDetails.accessIssues} />
                    <ReviewItem label="Other Notes for Quote" value={customResidentialDetails.otherNotes} />
                    {customResidentialDetails.customAdditionalComments && (
                        <ReviewItem label="Additional Comments" value={customResidentialDetails.customAdditionalComments} />
                    )}
                </ReviewSection>
            )}

            {/* Commercial Enquiry Details */}
            {!isGeneralEnquiry && isCommercial && commercialDetails && (
                <ReviewSection title="Commercial Property Details">
                    <ReviewItem label="Property Type" value={commercialDetails.propertyType} />
                    <ReviewItem label="Size/Windows" value={commercialDetails.approxSizeOrWindows} />
                    
                    {commercialServicesDisplay.length > 0 && (
                        <ReviewItem label="Services Requested" value={commercialServicesDisplay} isList={true} />
                    )}
                    {commercialDetails.servicesRequested?.other && commercialDetails.otherServiceText && (
                        <ReviewItem label="Other Service Specified" value={commercialDetails.otherServiceText} />
                    )}
                    
                    <ReviewItem 
                        label="Preferred Frequency" 
                        value={commercialFrequencyDisplayLabels[commercialDetails.frequencyPreference] || commercialDetails.frequencyPreference} 
                    />
                    {commercialDetails.frequencyPreference === 'other' && commercialDetails.otherFrequencyText && (
                        <ReviewItem label="Other Frequency Specified" value={commercialDetails.otherFrequencyText} />
                    )}
                    
                    <ReviewItem label="Requirements" value={commercialDetails.specificRequirements} />
                    <ReviewItem label="Other Notes" value={commercialDetails.otherNotes} />
                </ReviewSection>
            )}

            {/* Additional Booking Notes (NOT for general enquiry, and if notes exist) */}
            {!isGeneralEnquiry && bookingNotes && (
                <ReviewSection title="Additional Requests/Notes">
                    <ReviewItem label="Your Notes" value={bookingNotes} />
                </ReviewSection>
            )}

            {/* Additional Services & Price Breakdown - For Standard Residential Bookings */} 
            {!isQuoteOrEnquiry && isResidential && !isCustomQuote && !isCommercial && (
                <ReviewSection title="Price Breakdown">
                    <ReviewItem label="Window Cleaning" value={`£${(initialWindowPrice || 0).toFixed(2)}`} />
                    {hasConservatory && conservatorySurcharge > 0 && (
                        <ReviewItem label="Conservatory Surcharge" value={`+ £${conservatorySurcharge.toFixed(2)}`} />
                    )}
                    {hasExtension && extensionSurcharge > 0 && (
                        <ReviewItem label="Extension Surcharge" value={`+ £${extensionSurcharge.toFixed(2)}`} />
                    )}
                    
                    {gutterClearingSelected && canDisplayGutterServicePrices && (
                        <ReviewItem label="Gutter Clearing (Interior)" value={`+ £${gutterClearingReviewPrice.toFixed(2)}`} />
                    )}
                    {fasciaSoffitGutterSelected && canDisplayGutterServicePrices && (
                        <ReviewItem label="Fascia, Soffit & Gutter Exterior Clean" value={`+ £${fasciaSoffitGutterReviewPrice.toFixed(2)}`} />
                    )}
                    
                    {selectedFixedAddonsToDisplay.map(addon => (
                        <ReviewItem key={addon.name} label={addon.name} value={`+ £${addon.price.toFixed(2)}`} />
                    ))}
                    {windowCleaningDiscount > 0 && (
                        <div className="mt-1 pt-1 border-t border-dashed">
                            <ReviewItem label="Gutter Bundle Discount (Free Window Cleaning)" value={`- £${windowCleaningDiscount.toFixed(2)}`} />
                        </div>
                    )}
                    <div className="mt-2 pt-2 border-t font-semibold text-gray-800">
                        <ReviewItem label="Total Before Discount" value={`£${((initialWindowPrice || 0) + (conservatorySurcharge || 0) + (extensionSurcharge || 0) + gutterClearingReviewPrice + fasciaSoffitGutterReviewPrice /* + other fixed addons */).toFixed(2)}`} />
                        {windowCleaningDiscount > 0 && 
                            <ReviewItem label="Discount Applied" value={`- £${windowCleaningDiscount.toFixed(2)}`} />
                        }
                        <ReviewItem label="Grand Total" value={`£${(grandTotal || 0).toFixed(2)}`} />
                    </div>
                </ReviewSection>
            )}

            {/* Total Price or Quote Message based on isSubmitted prop from BookingForm */}
            <div className="mt-6 pt-4 border-t border-gray-300">
                {isQuoteOrEnquiry ? (
                    // For Quotes/Enquiries - message changes based on submission status
                    !values.isSubmitted ? (
                        <p className="text-md text-center text-gray-700 italic">
                            Please review your details. If everything is correct, click 'Submit Enquiry' to send us your information. We will then contact you.
                        </p>
                    ) : (
                        // This part will likely not be shown as BookingForm moves to step 5 on successful submission
                        <p className="text-lg text-center text-green-600 italic">
                            Thank you for your enquiry! We have received your details and will contact you shortly.
                        </p>
                    )
                ) : (
                    // For Standard Bookings - message changes based on submission status
                    !values.isSubmitted ? (
                        <div className="text-right">
                            <p className="text-2xl font-bold text-indigo-700">Total to Pay: £{(grandTotal || 0).toFixed(2)}</p>
                            <p className="text-xs text-gray-500">Please review your booking details before submitting.</p>
                        </div>
                    ) : (
                        // This part will likely not be shown as BookingForm moves to step 5
                        <p className="text-lg text-center text-green-600 italic">
                           Thank you for your booking! We will be in touch to confirm.
                        </p>
                    )
                )}
            </div>

            {/* Submission Error Message */}
            {submissionError && (
                <p className="mt-4 text-sm text-center text-red-600 p-3 bg-red-50 border border-red-200 rounded-md">Error: {submissionError}</p>
            )}

            {/* Buttons - only show if not yet submitted (BookingForm handles display after submission by moving to step 5) */}
            {!values.isSubmitted && (
                <div className="mt-8 p-6 border border-gray-300 rounded-lg bg-gray-50 shadow">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Almost Done!</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Please complete the reCAPTCHA below to submit your {isGeneralEnquiry ? "General Enquiry" : isCommercial ? "Commercial Enquiry" : isCustomQuote ? "Custom Quote Request" : "Booking"}.
                    </p>

                    {/* Booking Notes Textarea */}
                    <div className="mb-6">
                        <label htmlFor="bookingNotes" className="block text-sm font-medium text-gray-700 mb-1">
                            Additional Notes / Special Instructions (Optional)
                        </label>
                        <textarea
                            id="bookingNotes"
                            name="bookingNotes"
                            rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                            placeholder="E.g., gate codes, access issues, specific requests..."
                            value={bookingNotes || ''} // Ensure it handles undefined by defaulting to empty string
                            onChange={(e) => setFormData(prev => ({ ...prev, bookingNotes: e.target.value }))}
                        />
                    </div>

                    <div className="flex justify-center mb-6">
                        <ReCAPTCHA
                            sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || "YOUR_FALLBACK_SITE_KEY"}
                            onChange={handleRecaptchaChange}
                        />
                    </div>
                    {submissionError && (
                        <p className="text-sm text-red-600 mb-4 text-center">Error: {submissionError}</p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <button
                            type="button"
                            onClick={prevStep} // Call the prevStep function passed via props
                            className="w-full sm:w-auto flex-grow sm:flex-grow-0 text-gray-700 bg-gray-200 hover:bg-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                        >
                            Back
                        </button>
                        <button 
                            type="button" 
                            onClick={handleActualSubmit} 
                            disabled={isLoading || !recaptchaToken} // Disable if loading or reCAPTCHA not passed
                            className={`w-full sm:w-auto flex-grow text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 
                                        ${isLoading || !recaptchaToken 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'}`}
                        >
                            {isLoading ? 'Submitting...' : `Submit ${isGeneralEnquiry ? "General Enquiry" : isCommercial ? "Commercial Enquiry" : isCustomQuote ? "Custom Quote Request" : "Booking"}`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReviewSubmitForm;
