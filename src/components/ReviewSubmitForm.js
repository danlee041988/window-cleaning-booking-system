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
    <div className="mb-8 bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 rounded-lg p-6">
        <h3 className="text-2xl font-semibold text-white border-b border-gray-600 pb-3 mb-4 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            {title}
        </h3>
        <div className="space-y-3 text-gray-200">{children}</div>
    </div>
);

const ReviewItem = ({ label, value, isList = false, highlight = false }) => {
    if (isList && Array.isArray(value) && value.length > 0) {
        return (
            <div className="p-3 rounded-lg bg-gray-700/50">
                <span className="font-semibold text-blue-300 block mb-2">{label}:</span>
                <ul className="list-disc list-inside ml-4 space-y-1">
                    {value.map((item, index) => (
                        <li key={index} className="text-gray-200">{item}</li>
                    ))}
                </ul>
            </div>
        );
    }
    return (
        <div className="p-3 rounded-lg bg-gray-700/50">
            <span className="font-semibold text-blue-300">{label}:</span> 
            <span className={`ml-2 ${highlight ? 'text-white font-medium' : 'text-gray-200'}`}>
                {value || 'N/A'}
            </span>
        </div>
    );
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
        if (!recaptchaToken && !process.env.REACT_APP_RECAPTCHA_SITE_KEY?.includes("testkey")) {
            alert("Please complete the reCAPTCHA verification before submitting.");
            return;
        }
        handleSubmit(values); // Pass all current form values
    };

    // Define additional service labels for fixed-price addons (if any added in future)
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
            <div className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl p-8 border border-gray-700">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            {isGeneralEnquiry 
                                ? "Review Your General Enquiry" 
                                : isCommercial 
                                    ? "Review Your Commercial Enquiry" 
                                    : isCustomQuote 
                                        ? "Review Your Custom Quote Request" 
                                        : "Review Your Booking"}
                        </h2>
                        <p className="text-blue-300 text-lg mb-6">
                            {isQuoteOrEnquiry 
                                ? "Please review your enquiry details before submission"
                                : "Please review your booking details and complete payment"}
                        </p>
                        
                        {/* Decorative divider */}
                        <div className="flex items-center justify-center">
                            <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent w-32"></div>
                            <div className="mx-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent w-32"></div>
                        </div>
                    </div>

                    {/* Main Service Details for Standard Residential */}
                    {!isGeneralEnquiry && isResidential && !isCustomQuote && !isCommercial && propertyType && bedrooms && (
                        <ReviewSection title="Window Cleaning Service">
                            <ReviewItem label="Property" value={`${propertyType} - ${bedrooms}`} highlight={true} />
                            <ReviewItem label="Frequency" value={selectedFrequency} />
                            <ReviewItem 
                                label="Selected Date"
                                value={selectedDate === "ASAP" 
                                        ? "As soon as possible"
                                        : selectedDate ? formatDateForDisplay(new Date(selectedDate)) : 'N/A'
                                      }
                            />
                            <ReviewItem label="Base Window Cleaning Price" value={`£${(initialWindowPrice || 0).toFixed(2)}`} highlight={true} /> 
                        </ReviewSection>
                    )}
                    
                    {/* Enquiry Type for Commercial/Custom if no standard service was selected first */}
                    {!isGeneralEnquiry && (isCommercial && (!propertyType || !bedrooms)) && (
                         <ReviewSection title="Enquiry Type">
                            <ReviewItem label="Type" value="Commercial Property Enquiry" highlight={true} />
                        </ReviewSection>
                    )}
                    {!isGeneralEnquiry && (isCustomQuote && (!propertyType || !bedrooms)) && (
                         <ReviewSection title="Enquiry Type">
                            <ReviewItem label="Type" value={`Custom Quote for ${bedrooms || 'Property with 6+ Beds'}`} highlight={true} />
                            {initialWindowPrice > 0 && <ReviewItem label="Indicated Base Price" value={`£${initialWindowPrice.toFixed(2)}`} />}
                        </ReviewSection>
                    )}

                    {/* Contact Details */}
                    <ReviewSection title={isCommercial ? "Business & Contact Details" : "Contact Details"}>
                        {isCommercial && commercialDetails?.businessName && (
                            <ReviewItem label="Business Name" value={commercialDetails.businessName} highlight={true} />
                        )}
                        <ReviewItem label={isCommercial ? "Contact Name" : "Name"} value={customerName} highlight={true} />
                        <ReviewItem label="Address" value={`${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}, ${townCity}, ${postcode}`} />
                        <ReviewItem label="Mobile" value={mobile} />
                        <ReviewItem label="Email" value={email} />
                        <ReviewItem label="Preferred Contact" value={preferredContactMethod} />
                    </ReviewSection>

                    {/* Display general enquiry details */}
                    {isGeneralEnquiry && generalEnquiryDetails && (
                        <ReviewSection title="Enquiry Details">
                            {requestedServicesDisplay.length > 0 && (
                                <ReviewItem label="Requested Services" value={requestedServicesDisplay} isList={true} highlight={true} />
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
                                highlight={true}
                            />
                            {customResidentialDetails.propertyStyle === 'otherCustomProperty' && customResidentialDetails.otherPropertyStyleText && (
                                <ReviewItem label="Other Property Style Specified" value={customResidentialDetails.otherPropertyStyleText} />
                            )}
                            <ReviewItem label="Number of Bedrooms" value={customResidentialDetails.exactBedrooms} highlight={true} /> 
                            
                            {customResidentialServicesDisplay.length > 0 && (
                                <ReviewItem label="Services Requested" value={customResidentialServicesDisplay} isList={true} highlight={true} />
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
                            <ReviewItem label="Property Type" value={commercialDetails.propertyType} highlight={true} />
                            <ReviewItem label="Size/Windows" value={commercialDetails.approxSizeOrWindows} />
                            
                            {commercialServicesDisplay.length > 0 && (
                                <ReviewItem label="Services Requested" value={commercialServicesDisplay} isList={true} highlight={true} />
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

                    {/* Quote Requests */}
                    {values.quoteRequests && (values.quoteRequests.solarPanelCleaning || values.quoteRequests.conservatoryRoofCleaning) && (
                        <ReviewSection title="Quote Requests">
                            <p className="text-gray-300 mb-4">You have requested quotes for the following services (requires physical assessment):</p>
                            {values.quoteRequests.solarPanelCleaning && (
                                <ReviewItem label="Solar Panel Cleaning" value="Quote requested" />
                            )}
                            {values.quoteRequests.conservatoryRoofCleaning && (
                                <ReviewItem label="Conservatory Roof Cleaning" value="Quote requested" />
                            )}
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
                            <div className="space-y-3">
                                <ReviewItem label="Window Cleaning" value={`£${(initialWindowPrice || 0).toFixed(2)}`} highlight={true} />
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
                                    <div className="mt-4 pt-4 border-t border-gray-600">
                                        <ReviewItem label="Gutter Bundle Discount (Free Window Cleaning)" value={`- £${windowCleaningDiscount.toFixed(2)}`} highlight={true} />
                                    </div>
                                )}
                                
                                <div className="mt-6 pt-6 border-t-2 border-blue-600 bg-gradient-to-r from-blue-900/40 to-blue-800/40 p-4 rounded-lg">
                                    <ReviewItem label="Total Before Discount" value={`£${((initialWindowPrice || 0) + (conservatorySurcharge || 0) + (extensionSurcharge || 0) + gutterClearingReviewPrice + fasciaSoffitGutterReviewPrice).toFixed(2)}`} />
                                    {windowCleaningDiscount > 0 && 
                                        <ReviewItem label="Discount Applied" value={`- £${windowCleaningDiscount.toFixed(2)}`} />
                                    }
                                    <div className="mt-4 p-4 bg-green-900/30 border border-green-600 rounded-lg">
                                        <div className="text-center">
                                            <span className="text-green-300 text-lg font-semibold">Grand Total: </span>
                                            <span className="text-green-400 text-3xl font-bold">£{(grandTotal || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ReviewSection>
                    )}

                    {/* Summary Message */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-600 rounded-lg text-center">
                        {isQuoteOrEnquiry ? (
                            !values.isSubmitted ? (
                                <div>
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                        </svg>
                                    </div>
                                    <p className="text-blue-200 text-lg">
                                        Please review your details. If everything is correct, complete the security check and click 'Submit Enquiry' to send us your information.
                                    </p>
                                    <p className="text-blue-300 text-sm mt-2 font-medium">
                                        We will contact you within 24 hours with a detailed quote.
                                    </p>
                                </div>
                            ) : (
                                <p className="text-lg text-green-300 italic">
                                    Thank you for your enquiry! We have received your details and will contact you shortly.
                                </p>
                            )
                        ) : (
                            !values.isSubmitted ? (
                                <div>
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <p className="text-green-300 text-2xl font-bold mb-2">Total to Pay: £{(grandTotal || 0).toFixed(2)}</p>
                                    <p className="text-blue-200">Please review your booking details before submitting</p>
                                </div>
                            ) : (
                                <p className="text-lg text-green-300 italic">
                                   Thank you for your booking! We will be in touch to confirm.
                                </p>
                            )
                        )}
                    </div>

                    {/* Submission Error Message */}
                    {submissionError && (
                        <div className="mt-6 p-4 border border-red-600 rounded-lg bg-red-900/30">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-300">Error: {submissionError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submission Section */}
                    {!values.isSubmitted && (
                        <div className="mt-8 p-6 bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 rounded-lg">
                            <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                                <svg className="w-6 h-6 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Almost Done!
                            </h3>
                            <p className="text-gray-300 mb-6">
                                Please complete the security verification below to submit your {isGeneralEnquiry ? "general enquiry" : isCommercial ? "commercial enquiry" : isCustomQuote ? "custom quote request" : "booking"}.
                            </p>



                            {/* reCAPTCHA */}
                            <div className="flex justify-center mb-6">
                                <div className="bg-white p-2 rounded-lg">
                                    <ReCAPTCHA
                                        sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || "YOUR_FALLBACK_SITE_KEY"}
                                        onChange={handleRecaptchaChange}
                                    />
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-8 py-3 border-2 border-gray-600 rounded-lg text-sm font-semibold text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                >
                                    <span className="flex items-center justify-center">
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                        </svg>
                                        Back
                                    </span>
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleActualSubmit} 
                                    disabled={isLoading || !recaptchaToken}
                                    className={`flex-1 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 text-lg transform focus:outline-none focus:ring-2 focus:ring-offset-2 
                                                ${isLoading || !recaptchaToken 
                                                    ? 'bg-gray-600 cursor-not-allowed border-gray-600' 
                                                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:scale-105 shadow-lg hover:shadow-xl focus:ring-green-500'}`}
                                >
                                    <span className="flex items-center justify-center">
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                                </svg>
                                                Submit {isGeneralEnquiry ? "General Enquiry" : isCommercial ? "Commercial Enquiry" : isCustomQuote ? "Custom Quote Request" : "Booking"}
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReviewSubmitForm;
