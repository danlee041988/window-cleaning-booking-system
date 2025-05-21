// Step 4: Review & Submit
import React from 'react';
import { formatDateForDisplay } from '../utils/scheduleUtils';
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

const enquiryFrequencyDisplayLabels = {
    oneOff: 'One-off',
    '4weekly': '4 Weekly',
    '8weekly': '8 Weekly',
    '12weekly': '12 Weekly',
    asRequired: 'As Required / Not Sure',
};

const ReviewSubmitForm = ({ prevStep, values, handleSubmit, conservatorySurcharge }) => {
    const { 
        propertyType, bedrooms, selectedFrequency, 
        initialWindowPrice,
        hasConservatory,
        additionalServices,
        windowCleaningDiscount,
        grandTotal,
        customerName, addressLine1, addressLine2, townCity, postcode, mobile, email, preferredContactMethod,
        isCustomQuote, isCommercial, isResidential, isGeneralEnquiry,
        customResidentialDetails,
        commercialDetails,
        selectedDate,
        generalEnquiryDetails,
        bookingNotes
    } = values;

    const onSubmit = (e) => {
        e.preventDefault();
        handleSubmit(values);
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
        // If gutter clearing was also selected, its price is already calculated.
        // If not, calculate it to base fascia price off it.
        const baseForFascia = gutterClearingSelected ? gutterClearingReviewPrice : calculateGutterClearingPrice(propertyType, bedrooms);
        fasciaSoffitGutterReviewPrice = baseForFascia + 20;
    }

    let requestedServicesDisplay = [];
    if (isGeneralEnquiry && generalEnquiryDetails?.requestedServices) {
        requestedServicesDisplay = Object.entries(generalEnquiryDetails.requestedServices)
            .filter(([, checked]) => checked)
            .map(([key]) => generalServiceDisplayLabels[key] || key);
    }

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
                <ReviewSection title="Custom Quote Specifics (6+ Beds)">
                    <ReviewItem label="Exact Bedrooms" value={customResidentialDetails.exactBedrooms} />
                    <ReviewItem label="Approx. Windows" value={customResidentialDetails.approxWindows} />
                    <ReviewItem label="Access/Requirements" value={customResidentialDetails.accessIssues} />
                    <ReviewItem label="Other Notes" value={customResidentialDetails.otherNotes} />
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
            {!isGeneralEnquiry && isResidential && !isCustomQuote && !isCommercial && (
                <ReviewSection title="Price Breakdown">
                    <ReviewItem label="Window Cleaning" value={`£${(initialWindowPrice || 0).toFixed(2)}`} />
                    {hasConservatory && conservatorySurcharge > 0 && (
                        <ReviewItem label="Conservatory Surcharge" value={`+ £${conservatorySurcharge.toFixed(2)}`} />
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
                </ReviewSection>
            )}

            {/* Total Price or Quote Message */}
            <div className="mt-6 pt-4 border-t border-gray-300">
                {isCustomQuote || isCommercial || isGeneralEnquiry ? (
                    <p className="text-lg text-center text-gray-700 italic">
                        Thank you for your enquiry. We will contact you shortly to discuss your requirements { (isCustomQuote || isCommercial) && "and provide a full quotation" }.
                    </p>
                ) : (
                    <>
                        <h3 className="text-xl font-semibold text-gray-800 text-center mb-1">Total Estimated Price:</h3>
                        <p className="text-3xl font-bold text-indigo-600 text-center">£{(grandTotal || 0).toFixed(2)}</p>
                        {/* Disclaimer Text for Standard Bookings */} 
                        <p className="text-xs text-gray-500 text-center mt-2">
                            All prices shown are based on standard property sizes and conditions. For properties with unusual access, extensive dirt/build-up, or significantly larger than average sizes for their type, we may need to adjust the quote. Any potential changes will be discussed and agreed with you before any work commences. VAT may apply if applicable. Subject to final confirmation.
                        </p>
                    </>
                )}
                 {/* Disclaimer Text for Quotes - slightly different wording perhaps or combined */} 
                 {(isCustomQuote || isCommercial || isGeneralEnquiry) && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                        Note: Any indicative prices discussed are for standard services. Full quotation will be provided after assessing detailed requirements where applicable.
                    </p>
                 )}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
                <button
                    onClick={prevStep}
                    className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Back
                </button>
                <button
                    onClick={onSubmit}
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    {isCommercial || isCustomQuote || isGeneralEnquiry ? "Submit Enquiry" : "Confirm & Book Now"}
                </button>
            </div>
        </div>
    );
}

export default ReviewSubmitForm;
