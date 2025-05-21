import React, { useState, useEffect } from 'react';
import {
    scheduleData,
    getNextOccurrence,
    findFirstWorkingDayFrom,
    formatDateForDisplay,
    formatDateForStorage
} from '../utils/scheduleUtils';

// Helper function to calculate Gutter Clearing Price (mirrored)
const calculateGutterClearingPrice = (propertyType, bedrooms) => {
    let price = 80; // Default
    if (propertyType && bedrooms) {
        const isDetached = propertyType.toLowerCase().includes('detached');
        if (bedrooms === '2-3 Bed') price = isDetached ? 100 : 80;
        else if (bedrooms === '4 Bed') price = isDetached ? 120 : 100;
        else if (bedrooms === '5 Bed') price = isDetached ? 140 : 120;
    }
    return price;
};

// Reusable Input Field Component
const InputField = ({ label, name, value, onChange, type = 'text', placeholder, required = false }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
    </div>
);

// Reusable Textarea Field Component
const TextAreaField = ({ label, name, value, onChange, placeholder, rows = 3 }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
    </div>
);

const PropertyDetailsForm = ({ nextStep, prevStep, handleChange, values, setFormData, setCurrentStep, conservatorySurcharge }) => {

    const { 
        customerName, addressLine1, addressLine2, townCity, postcode, mobile, email, preferredContactMethod,
        propertyType, bedrooms, selectedFrequency, 
        initialWindowPrice,
        isCustomQuote, isCommercial, isResidential, isGeneralEnquiry,
        hasConservatory, additionalServices, windowCleaningDiscount, grandTotal,
        selectedDate
    } = values;

    const [availableDates, setAvailableDates] = useState([]);
    const [isLoadingDates, setIsLoadingDates] = useState(false);
    const [postcodeError, setPostcodeError] = useState('');
    const [dateSelectionError, setDateSelectionError] = useState('');

    useEffect(() => {
        // Only run date calculation for standard residential bookings that are NOT general enquiries
        const isResidentialStandardBooking = !isCommercial && !isCustomQuote && isResidential && !isGeneralEnquiry;

        if (isResidentialStandardBooking) {
            const trimmedPostcode = postcode ? postcode.trim() : "";
            if (trimmedPostcode.length > 0) {
                calculateAndSetAvailableDates();
            } else {
                // Postcode input is empty for residential standard
                setAvailableDates([]);
                setPostcodeError(''); // Clear any existing error
                setIsLoadingDates(false);
            }
        } else {
            // Not a standard residential booking, clear dates and errors
            setAvailableDates([]);
            setPostcodeError('');
            setIsLoadingDates(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postcode, addressLine1, isCommercial, isCustomQuote, isResidential, isGeneralEnquiry]); // addressLine1 for Meare logic

    const calculateAndSetAvailableDates = () => {
        const rawPostcode = postcode.trim().toUpperCase(); // postcode is guaranteed to be non-empty here by the useEffect condition

        if (rawPostcode.length < 2) { // Handles 1-character postcode specifically
            setIsLoadingDates(false);
            setPostcodeError('Please enter a more complete postcode.');
            setAvailableDates([]);
            return;
        }
        // From here, rawPostcode.length >= 2

        setIsLoadingDates(true);
        setAvailableDates([]); // Clear previous dates
        setPostcodeError('');   // Clear previous postcode error

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const sixWeeksFromNow = new Date(today);
            sixWeeksFromNow.setDate(today.getDate() + 42); // 6 weeks

            const isMeare = rawPostcode.startsWith('BA6') && addressLine1.toLowerCase().includes('meare');
            
            let matchingScheduleEntries = [];

            if (isMeare) {
                const meareEntry = scheduleData.find(entry => entry.postcodes.includes('BA6-MEARE'));
                if (meareEntry) {
                    matchingScheduleEntries.push(meareEntry);
                }
            } else {
                matchingScheduleEntries = scheduleData.filter(entry =>
                    entry.postcodes.some(prefix => rawPostcode.startsWith(prefix) && prefix !== 'BA6-MEARE')
                );
            }

            console.log(`[DEBUG] Postcode: ${rawPostcode}, Found ${matchingScheduleEntries.length} schedule entr(ies):`, JSON.stringify(matchingScheduleEntries));

            if (matchingScheduleEntries.length > 0) {
                const allValidDates = [];
                matchingScheduleEntries.forEach(scheduleEntry => {
                    const datesToProcess = scheduleEntry.dates;
                    console.log(`[DEBUG] Processing scheduleEntry for postcodes: ${scheduleEntry.postcodes.join(', ')}, base dates:`, JSON.stringify(datesToProcess));
                    
                    datesToProcess.forEach(dateStr => {
                        console.log(`[DEBUG] Processing dateStr: ${dateStr}, with recurrence: ${scheduleEntry.recurrence}`);
                        let nextOccurrenceDate = getNextOccurrence(dateStr, scheduleEntry.recurrence);
                        console.log(`[DEBUG] Next occurrence for ${dateStr}:`, nextOccurrenceDate);
                        
                        if (!nextOccurrenceDate || isNaN(nextOccurrenceDate.getTime())) {
                            console.warn(`[DEBUG] Invalid or null nextOccurrenceDate for ${dateStr}`);
                            return; 
                        }

                        let adjustedDate = findFirstWorkingDayFrom(nextOccurrenceDate);
                        console.log(`[DEBUG] Adjusted working day for ${dateStr}:`, adjustedDate);
                        
                        // Ensure comparison dates are fresh for each check to avoid issues with object mutation if any
                        const currentTomorrow = new Date(); currentTomorrow.setHours(0,0,0,0); currentTomorrow.setDate(new Date().getDate()+1);
                        const currentSixWeeksFromNow = new Date(); currentSixWeeksFromNow.setHours(0,0,0,0); currentSixWeeksFromNow.setDate(new Date().getDate()+42);

                        if (adjustedDate >= currentTomorrow && adjustedDate <= currentSixWeeksFromNow) {
                            console.log(`[DEBUG]    VALID and within 6 weeks: ${formatDateForDisplay(adjustedDate)}`);
                            allValidDates.push(adjustedDate);
                        } else {
                            console.log(`[DEBUG]    INVALID or outside 6 weeks: ${formatDateForDisplay(adjustedDate)} (Tomorrow: ${formatDateForDisplay(currentTomorrow)}, SixWeeks: ${formatDateForDisplay(currentSixWeeksFromNow)})`);
                        }
                    });
                });

                const uniqueSortedDates = [...new Set(allValidDates.map(d => d.getTime()))]
                    .map(time => new Date(time))
                    .sort((a, b) => a - b);
                
                setAvailableDates(uniqueSortedDates);

                if (uniqueSortedDates.length === 0) {
                    setPostcodeError('No scheduled dates found in the next 6 weeks for your postcode area.');
                } else {
                    setPostcodeError(''); // Clear error if dates are found
                }
            } else { // No matchingScheduleEntries found (for postcode length >= 2)
                setAvailableDates([]); // Ensure dates are cleared
                if (rawPostcode.length >= 3) {
                    setPostcodeError('Sorry, we may not cover your specific postcode area. Please contact us.');
                } else { // This means rawPostcode.length is exactly 2
                    setPostcodeError('Please enter more of your postcode to check for available dates.');
                }
            }
        } catch (error) {
            console.error("Error calculating dates:", error);
            setPostcodeError("An error occurred while calculating dates.");
            setAvailableDates([]); // Ensure dates are cleared on error
        } finally {
            setIsLoadingDates(false);
        }
    };

    const handleDateSelect = (dateOrASAP) => {
        if (dateOrASAP === "ASAP") {
            setFormData(prev => ({ ...prev, selectedDate: "ASAP" }));
        } else {
            const dateValue = formatDateForStorage(dateOrASAP);
            setFormData(prev => ({ ...prev, selectedDate: dateValue }));
        }
        setDateSelectionError(''); // Clear error on any selection
    };

    const continueStep = (e) => {
        e.preventDefault();
        setDateSelectionError('');
        // Validation: date is required for standard residential UNLESS "ASAP" is selected, and NOT for general enquiries
        if (!isCommercial && !isCustomQuote && isResidential && !isGeneralEnquiry && !selectedDate) { 
            setDateSelectionError('Please select an available date or choose ASAP.');
            document.getElementById('date-selection-heading')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        // For custom/commercial OR general enquiries, go to step 4 (ReviewSubmitForm)
        // Standard residential bookings also go to step 4 from here.
        if (isCustomQuote || isCommercial || isGeneralEnquiry) {
            if (setCurrentStep) setCurrentStep(4); 
            else nextStep();
        } else {
            nextStep(); 
        }
    };

    const backStep = (e) => {
        e.preventDefault();
        // If it's a general enquiry, going back should lead to AdditionalServicesForm (Step 2)
        if (isGeneralEnquiry) {
            prevStep(); 
            return;
        }
        if (isCustomQuote || isCommercial) {
            if (setCurrentStep) {
                setCurrentStep(1);
            } else {
                console.warn("setCurrentStep not provided to PropertyDetailsForm, attempting prevStep as fallback for custom/commercial.");
                prevStep(); 
            }
        } else {
            prevStep();
        }
    };

    const handleContactPreference = (e) => {
        setFormData(prev => ({ ...prev, preferredContactMethod: e.target.value }));
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl bg-white shadow-xl rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
                {isGeneralEnquiry 
                    ? "Your Contact Details for Enquiry"
                    : isCommercial 
                        ? "Commercial Enquiry Details" 
                        : isCustomQuote 
                            ? "Custom Quote Details (6+ Beds)" 
                            : "Your Contact & Property Details"}
            </h2>

            {/* Display selected service for standard bookings using correct price field - HIDE for general enquiry */}
            {!isGeneralEnquiry && !isCommercial && !isCustomQuote && isResidential && propertyType && bedrooms && (
                <div className="mb-6 p-4 border border-indigo-200 rounded-md bg-indigo-50">
                    <h3 className="text-lg font-medium text-indigo-700 mb-1">Selected Window Cleaning:</h3>
                    <p className="text-sm text-gray-700">{`${propertyType} - ${bedrooms}`}</p>
                    <p className="text-sm text-gray-700">Frequency: {selectedFrequency}</p>
                    <p className="text-sm text-gray-700 font-semibold">Base Price: £{initialWindowPrice ? initialWindowPrice.toFixed(2) : '0.00'}</p>
                </div>
            )}
            
            {/* Current Order Summary for Standard Residential - HIDE for general enquiry */}
            {!isGeneralEnquiry && !isCommercial && !isCustomQuote && isResidential && (
                <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Current Order Summary:</h3>
                    <div className="space-y-1 text-sm">
                        {initialWindowPrice > 0 && (
                            <div className="flex justify-between">
                                <span>Window Cleaning ({selectedFrequency}):</span>
                                <span>£{initialWindowPrice.toFixed(2)}</span>
                            </div>
                        )}
                        {hasConservatory && conservatorySurcharge > 0 && (
                            <div className="flex justify-between">
                                <span>Conservatory Surcharge:</span>
                                <span>+ £{conservatorySurcharge.toFixed(2)}</span>
                            </div>
                        )}
                        {additionalServices?.gutterClearing && (
                            <div className="flex justify-between">
                                <span>Gutter Clearing (Interior):</span>
                                <span>+ £{calculateGutterClearingPrice(propertyType, bedrooms).toFixed(2)}</span>
                            </div>
                        )}
                        {additionalServices?.fasciaSoffitGutter && (
                            <div className="flex justify-between">
                                <span>Fascia, Soffit & Gutter Exterior Clean:</span>
                                <span>+ £{(calculateGutterClearingPrice(propertyType, bedrooms) + 20).toFixed(2)}</span>
                            </div>
                        )}
                        {windowCleaningDiscount > 0 && (
                             <div className="flex justify-between text-green-600 font-semibold">
                                <span>Gutter Bundle Discount (Free Window Cleaning):</span>
                                <span>- £{windowCleaningDiscount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-base font-bold pt-2 mt-1 border-t">
                            <span>Estimated Total:</span>
                            <span>£{(grandTotal || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Section for Commercial Property Name (if applicable) */}
            {isCommercial && (
                <InputField
                    label="Business Name"
                    name="commercialDetails.businessName"
                    value={values.commercialDetails?.businessName || ''}
                    onChange={handleChange('commercialDetails.businessName')}
                    placeholder="e.g., Your Company Ltd"
                />
            )}

            {/* For general enquiry, if commercial details were somehow set, don't show them here unless explicitly decided */}

            <h3 className="text-xl font-medium text-gray-800 mb-4 border-b pb-2">Contact Information</h3>
            <InputField
                label={isCommercial ? "Contact Person Name" : "Full Name"}
                name="customerName"
                value={customerName}
                onChange={handleChange('customerName')}
                placeholder={isCommercial ? "e.g., Jane Doe" : "e.g., John Smith"}
                required
            />
            <InputField label="Address Line 1" name="addressLine1" value={addressLine1} onChange={handleChange('addressLine1')} placeholder="e.g., 123 Main Street" required />
            <InputField label="Address Line 2 (Optional)" name="addressLine2" value={addressLine2} onChange={handleChange('addressLine2')} placeholder="e.g., Apartment, suite, or floor" />
            <InputField label="Town/City" name="townCity" value={townCity} onChange={handleChange('townCity')} placeholder="e.g., Anytown" required />
            <InputField label="Postcode" name="postcode" value={postcode} onChange={handleChange('postcode')} placeholder="e.g., AB1 2CD" required />
            <InputField label="Mobile Number" name="mobile" value={mobile} onChange={handleChange('mobile')} placeholder="e.g., 07123456789" type="tel" required />
            <InputField label="Email Address" name="email" value={email} onChange={handleChange('email')} placeholder="e.g., you@example.com" type="email" required />

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact Method <span className="text-red-500">*</span></label>
                <div className="mt-2 flex items-center space-x-4">
                    <label className="inline-flex items-center">
                        <input type="radio" className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out" name="preferredContactMethod" value="email" checked={preferredContactMethod === 'email'} onChange={handleContactPreference} />
                        <span className="ml-2 text-gray-700">Email</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input type="radio" className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out" name="preferredContactMethod" value="mobile" checked={preferredContactMethod === 'mobile'} onChange={handleContactPreference} />
                        <span className="ml-2 text-gray-700">Mobile Phone</span>
                    </label>
                </div>
            </div>

            {/* Date Selection UI - Only for Standard Residential Bookings (NOT commercial, custom quote, or general enquiry) */}
            {!isCommercial && !isCustomQuote && isResidential && !isGeneralEnquiry && (
                <div className="mt-6 pt-4 border-t">
                    <h3 id="date-selection-heading" className="text-xl font-medium text-gray-800 mb-1">Select Date for First Clean <span className="text-red-500">*</span></h3>
                    <p className="text-xs text-gray-500 mb-3">Available dates are shown for the next 6 weeks based on your postcode.</p>
                    
                    {isLoadingDates && <p className="text-blue-600">Loading available dates...</p>}
                    
                    {!isLoadingDates && postcodeError && 
                        <p className="text-red-600 p-3 border border-red-200 rounded-md bg-red-50 text-sm">{postcodeError}</p>
                    }
                    
                    {dateSelectionError && 
                        <p className="text-red-600 text-sm mt-1">{dateSelectionError}</p>
                    }

                    {!isLoadingDates && !postcodeError && availableDates.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                            {availableDates.map(date => {
                                const dateValueStr = formatDateForStorage(date);
                                const isSelected = selectedDate === dateValueStr;
                                return (
                                    <button
                                        type="button"
                                        key={dateValueStr}
                                        onClick={() => handleDateSelect(date)}
                                        className={`p-3 border rounded-lg text-center cursor-pointer transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500
                                            ${isSelected 
                                                ? 'bg-indigo-600 border-indigo-700 text-white shadow-md' 
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-indigo-50 hover:border-indigo-400'}`}
                                    >
                                        <span className={`block text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                            {formatDateForDisplay(date)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    
                    {!isLoadingDates && !postcodeError && ( 
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={() => handleDateSelect("ASAP")}
                                className={`w-full p-3 border rounded-lg text-center cursor-pointer transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1
                                            ${selectedDate === "ASAP"
                                                ? 'bg-green-500 border-green-600 text-white shadow-md hover:bg-green-600 focus:ring-green-400'
                                                : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400 focus:ring-indigo-500'}`}
                            >
                                <span className={`block text-sm font-medium ${selectedDate === "ASAP" ? 'text-white' : 'text-gray-900'}`}>
                                    Request First Clean ASAP
                                </span>
                                <span className="block text-xs text-gray-500 mt-1">We'll contact you to arrange the soonest possible slot if available.</span>
                            </button>
                        </div>
                    )}
                    
                    {!isLoadingDates && !postcodeError && availableDates.length === 0 && (!postcode || postcode.trim().length === 0) && (
                        <p className="text-gray-500 p-3 border border-gray-200 rounded-md bg-gray-50 text-sm">Please enter your postcode above to see available dates.</p>
                    )}
                </div>
            )}

            {/* ADDED: Additional Comments for Standard Residential Bookings */}
            {!isCommercial && !isCustomQuote && isResidential && !isGeneralEnquiry && (
                <div className="mt-6 pt-4 border-t">
                    <TextAreaField
                        label="Additional Comments or Requests (Optional)"
                        name="bookingNotes"
                        value={values.bookingNotes || ''}
                        onChange={handleChange('bookingNotes')}
                        placeholder="e.g., Gate code: 1234. Side gate unlocked."
                        rows={3}
                    />
                </div>
            )}

            {/* Conditional Fields for Custom Residential Quote (6+ beds) */}
            {isCustomQuote && isResidential && (
                <div className="mt-6 pt-4 border-t">
                    <h3 className="text-xl font-medium text-gray-800 mb-4">Property Specifics (6+ Beds)</h3>
                    <InputField
                        label="Exact Number of Bedrooms (if known)"
                        name="customResidentialDetails.exactBedrooms"
                        value={values.customResidentialDetails?.exactBedrooms || ''}
                        onChange={handleChange('customResidentialDetails.exactBedrooms')}
                        placeholder="e.g., 7"
                        type="number"
                    />
                    <InputField
                        label="Approximate Number of Windows"
                        name="customResidentialDetails.approxWindows"
                        value={values.customResidentialDetails?.approxWindows || ''}
                        onChange={handleChange('customResidentialDetails.approxWindows')}
                        placeholder="e.g., 25"
                        type="number"
                    />
                    <TextAreaField
                        label="Any Access Issues or Specific Requirements?"
                        name="customResidentialDetails.accessIssues"
                        value={values.customResidentialDetails?.accessIssues || ''}
                        onChange={handleChange('customResidentialDetails.accessIssues')}
                        placeholder="e.g., hard to reach windows, conservatory, etc."
                    />
                    <TextAreaField
                        label="Other Notes"
                        name="customResidentialDetails.otherNotes"
                        value={values.customResidentialDetails?.otherNotes || ''}
                        onChange={handleChange('customResidentialDetails.otherNotes')}
                        placeholder="Anything else we should know?"
                    />
                    <TextAreaField
                        label="Additional Comments (Optional)"
                        name="customResidentialDetails.customAdditionalComments"
                        value={values.customResidentialDetails?.customAdditionalComments || ''}
                        onChange={handleChange('customResidentialDetails.customAdditionalComments')}
                        placeholder="Further details or specific requests..."
                        rows={3}
                    />
                </div>
            )}

            {/* Conditional Fields for Commercial Enquiry */}
            {isCommercial && (
                <div className="mt-6 pt-4 border-t">
                     <h3 className="text-xl font-medium text-gray-800 mb-4">Commercial Property Details</h3>
                    <InputField
                        label="Type of Commercial Property"
                        name="commercialDetails.propertyType"
                        value={values.commercialDetails?.propertyType || ''}
                        onChange={handleChange('commercialDetails.propertyType')}
                        placeholder="e.g., Office, Shop, Restaurant, Warehouse"
                    />
                    <InputField
                        label="Approximate Size or Number of Windows"
                        name="commercialDetails.approxSizeOrWindows"
                        value={values.commercialDetails?.approxSizeOrWindows || ''}
                        onChange={handleChange('commercialDetails.approxSizeOrWindows')}
                        placeholder="e.g., 50 windows, 2000 sq ft"
                    />
                    <TextAreaField
                        label="Specific Requirements or Services Needed"
                        name="commercialDetails.specificRequirements"
                        value={values.commercialDetails?.specificRequirements || ''}
                        onChange={handleChange('commercialDetails.specificRequirements')}
                        placeholder="e.g., Internal window cleaning, high-level access needed"
                    />
                     <TextAreaField
                        label="Other Notes for Commercial Enquiry"
                        name="commercialDetails.otherNotes"
                        value={values.commercialDetails?.otherNotes || ''}
                        onChange={handleChange('commercialDetails.otherNotes')}
                        placeholder="e.g., Preferred times for cleaning, contract length interest"
                    />
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
                <button
                    onClick={backStep}
                    className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Back
                </button>
                <button
                    onClick={continueStep}
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {isGeneralEnquiry 
                        ? "Submit Enquiry" 
                        : isCustomQuote || isCommercial 
                            ? "Next: Review Enquiry" 
                            : "Next: Review Booking"}
                </button>
            </div>
        </div>
    );
}

export default PropertyDetailsForm;