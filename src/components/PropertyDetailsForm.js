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

const PropertyDetailsForm = ({ nextStep, prevStep, handleChange, values, setFormData, goToStep, conservatorySurcharge }) => {

    const { 
        customerName, addressLine1, addressLine2, townCity, postcode, mobile, email, preferredContactMethod,
        propertyType, bedrooms, selectedFrequency, 
        initialWindowPrice,
        isCustomQuote, isCommercial, isResidential, isGeneralEnquiry,
        hasConservatory, additionalServices, windowCleaningDiscount, grandTotal,
        selectedDate,
        commercialDetails,
        customResidentialDetails
    } = values;

    const [availableDates, setAvailableDates] = useState([]);
    const [isLoadingDates, setIsLoadingDates] = useState(false);
    const [postcodeError, setPostcodeError] = useState('');
    const [dateSelectionError, setDateSelectionError] = useState('');
    const [formErrors, setFormErrors] = useState({});

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

    const backStep = (e) => {
        e.preventDefault();
        if (isCustomQuote || isCommercial) {
            // For Custom Quotes (6+ Beds) or Commercial, always go back to Step 1 (Pricing Page)
            if (goToStep) {
                goToStep(1);
            } else {
                console.warn("goToStep function not provided to PropertyDetailsForm. Cannot go back to Step 1.");
                // As a fallback, try prevStep, though this might not be the desired step for quotes.
                prevStep(); 
            }
        } else if (isGeneralEnquiry) {
            // For General Enquiry, back from PropertyDetails (Step 3) should go to AdditionalServices (Step 2)
            // where they selected services. prevStep() correctly handles this (3 -> 2).
            prevStep();
        } else {
            // For Standard Residential, back from PropertyDetails (Step 3) should go to AdditionalServices (Step 2).
            // prevStep() correctly handles this (3 -> 2).
            prevStep();
        }
    };

    const validateForm = () => {
        const errors = {};
        // Common contact details validation
        if (!customerName.trim()) errors.customerName = 'Full Name is required.';
        if (!addressLine1.trim()) errors.addressLine1 = 'Address Line 1 is required.';
        if (!townCity.trim()) errors.townCity = 'Town/City is required.';
        if (!postcode.trim()) errors.postcode = 'Postcode is required.';
        else if (postcode.trim().length < 3) errors.postcode = 'Postcode seems too short.'; // Basic postcode check
        if (!mobile.trim()) errors.mobile = 'Mobile Number is required.';
        if (!email.trim()) errors.email = 'Email Address is required.';
        else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email address is invalid.';
        if (!preferredContactMethod) errors.preferredContactMethod = 'Preferred Contact Method is required.';

        // Path-specific validation
        if (isResidential && !isCustomQuote && !isGeneralEnquiry) { // Standard Residential Booking
            if (!selectedDate) {
                errors.selectedDate = 'Please select an available date or choose ASAP.';
                // Unlike setDateSelectionError, this won't scroll immediately but will be part of formErrors
            }
        } else if (isCustomQuote && isResidential) { // Custom Residential Quote
            if (!customResidentialDetails?.exactBedrooms) errors.exactBedrooms = 'Number of Bedrooms is required.';
            if (!customResidentialDetails?.propertyStyle) errors.propertyStyle = 'Property Style is required.';
            if (customResidentialDetails?.propertyStyle === 'otherCustomProperty' && !customResidentialDetails?.otherPropertyStyleText?.trim()) {
                errors.otherPropertyStyleText = 'Please specify the other property style.';
            }
            // Optionally, require at least one service for custom quotes
            const servicesSelected = Object.values(customResidentialDetails?.servicesRequested || {}).some(selected => selected);
            if (!servicesSelected) errors.customServices = 'Please select at least one service for the custom quote.';

        } else if (isCommercial) { // Commercial Enquiry
            if (!commercialDetails?.propertyType?.trim()) errors.commercialPropertyType = 'Type of Commercial Property is required.';
            const commServicesSelected = Object.values(commercialDetails?.servicesRequested || {}).some(selected => selected);
            if (!commServicesSelected) errors.commercialServices = 'Please select at least one service for the commercial enquiry.';
            if (commercialDetails?.servicesRequested?.windowCleaning && !commercialDetails?.frequencyPreference) {
                errors.commercialFrequency = 'Please select a preferred frequency for window cleaning.';
            }
        }
        // General Enquiry doesn't have many specific required fields beyond contact info here, mostly free text.

        return errors;
    };

    const continueStep = (e) => {
        e.preventDefault();
        setFormErrors({}); // Clear previous errors
        setDateSelectionError(''); // Clear specific date error

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            // If there's a specific date error from the old system, keep it for scrolling behavior
            if (validationErrors.selectedDate) {
                setDateSelectionError(validationErrors.selectedDate);
                document.getElementById('date-selection-heading')?.scrollIntoView({ behavior: 'smooth' });
            }
            // Scroll to the first error field if possible (basic implementation)
            const firstErrorKey = Object.keys(validationErrors)[0];
            const errorField = document.getElementsByName(firstErrorKey)[0] || document.getElementById(firstErrorKey); // try by name then id
            errorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        if (goToStep) {
            goToStep(4);
        } else {
            nextStep(); // Fallback if goToStep is not provided
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
                            ? `Custom Quote: ${values.selectedWindowService?.bedrooms || 'Bespoke Property'}`
                            : "Your Details & Preferred Date"}
            </h2>

            <form onSubmit={continueStep} className="space-y-6">
                {/* Customer Name always shown */}
                <InputField 
                    label={isCommercial ? "Business/Contact Name" : "Full Name"} 
                    name="customerName" 
                    value={customerName} 
                    onChange={handleChange('customerName')} 
                    placeholder={isCommercial ? "e.g., ACME Ltd or Jane Smith (Site Manager)" : "e.g., Jane Smith"} 
                    required 
                />
                {formErrors.customerName && <p className="text-sm text-red-600 -mt-3 mb-1">{formErrors.customerName}</p>}

                {/* Address fields always shown */}
                <InputField label="Address Line 1" name="addressLine1" value={addressLine1} onChange={handleChange('addressLine1')} placeholder="e.g., 123 High Street" required />
                {formErrors.addressLine1 && <p className="text-sm text-red-600 -mt-3 mb-1">{formErrors.addressLine1}</p>}
                <InputField label="Address Line 2 (Optional)" name="addressLine2" value={addressLine2} onChange={handleChange('addressLine2')} placeholder="e.g., The Old Mill, Suite B" />
                <InputField label="Town/City" name="townCity" value={townCity} onChange={handleChange('townCity')} placeholder="e.g., Market Harborough" required />
                {formErrors.townCity && <p className="text-sm text-red-600 -mt-3 mb-1">{formErrors.townCity}</p>}
                <InputField label="Postcode" name="postcode" value={postcode} onChange={handleChange('postcode')} placeholder="e.g., BA16 0AA" required />
                {postcodeError && <p className="text-sm text-red-600 -mt-3 mb-1">{postcodeError}</p>}
                {formErrors.postcode && <p className="text-sm text-red-600 -mt-3 mb-1">{formErrors.postcode}</p>}

                {/* Contact Info: Mobile/Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputField 
                            label={isCommercial ? "Contact Number" : "Mobile Number"} 
                            name="mobile" 
                            type="tel" 
                            value={mobile} 
                            onChange={handleChange('mobile')} 
                            placeholder={isCommercial ? "e.g., 01234 567890" : "e.g., 07123 456789"} 
                            required 
                        />
                        {formErrors.mobile && <p className="text-sm text-red-600 -mt-3 mb-1">{formErrors.mobile}</p>}
                    </div>
                    <div>
                        <InputField label="Email Address" name="email" type="email" value={email} onChange={handleChange('email')} placeholder="e.g., john.doe@example.com" required />
                        {formErrors.email && <p className="text-sm text-red-600 -mt-3 mb-1">{formErrors.email}</p>}
                    </div>
                </div>

                {/* Preferred Contact Method - Shown for all types including General Enquiry */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact Method <span className="text-red-500">*</span></label>
                    <div className="mt-2 flex items-center space-x-4">
                        <label className="inline-flex items-center">
                            <input type="radio" className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out" name="preferredContactMethod" value="email" checked={preferredContactMethod === 'email'} onChange={handleContactPreference} />
                            <span className="ml-2 text-gray-700">Email</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input type="radio" className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out" name="preferredContactMethod" value="mobile" checked={preferredContactMethod === 'mobile'} onChange={handleContactPreference} />
                            <span className="ml-2 text-gray-700">{isCommercial ? "Contact Number" : "Mobile Phone"}</span>
                        </label>
                    </div>
                    {formErrors.preferredContactMethod && <p className="text-sm text-red-600 mt-1">{formErrors.preferredContactMethod}</p>}
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
                        
                        {dateSelectionError &&  /* This is the old dateSelectionError, handled by scroll in continueStep */
                            <p className="text-red-600 text-sm mt-1">{dateSelectionError}</p>
                        }
                        {formErrors.selectedDate && !dateSelectionError && /* Show general error if not already shown by specific date error */
                             <p className="text-red-600 text-sm mt-1">{formErrors.selectedDate}</p>
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

                {/* Conditional Fields for Custom Residential Quote (6+ beds) */}
                {isCustomQuote && isResidential && (
                    <div className="mt-6 pt-4 border-t">
                        <h3 className="text-xl font-medium text-gray-800 mb-4">Property Specifics (6+ Beds / Bespoke)</h3>

                        <InputField
                            label="Number of Bedrooms"
                            name="customResidentialDetails.exactBedrooms"
                            value={values.customResidentialDetails?.exactBedrooms || ''}
                            onChange={handleChange}
                            placeholder="e.g., 6, 7, 8+"
                            type="number"
                            required
                        />
                        {formErrors.exactBedrooms && <p className="text-sm text-red-600 -mt-3 mb-1">{formErrors.exactBedrooms}</p>}

                        {/* Property Style */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Property Style <span className="text-red-500">*</span></label>
                            <div className="space-y-2">
                                {[
                                    { id: 'detached', label: 'Detached House (Large/Unique)' },
                                    { id: 'semiDetachedLarge', label: 'Semi-Detached House (Large/Extended)' },
                                    { id: 'terracedMulti', label: 'Terraced House (Multiple/Large)' },
                                    { id: 'bungalowLarge', label: 'Bungalow (Large/Complex)' },
                                    { id: 'apartmentBlock', label: 'Apartment Block (specify units if known)' },
                                    { id: 'otherCustomProperty', label: 'Other (Please specify)' }
                                ].map(style => (
                                    <div key={style.id} className="flex items-center">
                                        <input
                                            type="radio"
                                            id={`customPropertyStyle-${style.id}`}
                                            name="customResidentialDetails.propertyStyle"
                                            value={style.id}
                                            checked={values.customResidentialDetails?.propertyStyle === style.id}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                        />
                                        <label htmlFor={`customPropertyStyle-${style.id}`} className="ml-2 block text-sm text-gray-700">
                                            {style.label}
                                        </label>
                                    </div>
                                ))}
                                {values.customResidentialDetails?.propertyStyle === 'otherCustomProperty' && (
                                    <InputField
                                        label="Please specify other property style"
                                        name="customResidentialDetails.otherPropertyStyleText"
                                        value={values.customResidentialDetails?.otherPropertyStyleText || ''}
                                        onChange={handleChange}
                                        placeholder="e.g., Converted Barn, Unique Build"
                                    />
                                )}
                            </div>
                            {formErrors.propertyStyle && <p className="text-sm text-red-600 mt-1">{formErrors.propertyStyle}</p>}
                            {formErrors.otherPropertyStyleText && <p className="text-sm text-red-600 -mt-3 mb-1">{formErrors.otherPropertyStyleText}</p>}
                        </div>

                        {/* Services Requested */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Services Required</label>
                            <div className="space-y-2">
                                {[
                                    { id: 'windowCleaning', label: 'Window Cleaning (Exterior)' },
                                    { id: 'gutterCleaning', label: 'Gutter Clearing (Interior)' },
                                    { id: 'fasciaSoffitCleaning', label: 'Fascia & Soffit Cleaning (Exterior)' },
                                    { id: 'conservatoryWindowCleaning', label: 'Conservatory Window Cleaning (Sides)' },
                                    { id: 'conservatoryRoofCleaning', label: 'Conservatory Roof Cleaning' },
                                    { id: 'other', label: 'Other (Please specify)' }
                                ].map(service => (
                                    <div key={service.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`customService-${service.id}`}
                                            name={`customResidentialDetails.servicesRequested.${service.id}`}
                                            checked={values.customResidentialDetails?.servicesRequested?.[service.id] || false}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <label htmlFor={`customService-${service.id}`} className="ml-2 block text-sm text-gray-700">
                                            {service.label}
                                        </label>
                                    </div>
                                ))}
                                {values.customResidentialDetails?.servicesRequested?.other && (
                                    <InputField
                                        label="Please specify other service(s)"
                                        name="customResidentialDetails.otherServiceText"
                                        value={values.customResidentialDetails?.otherServiceText || ''}
                                        onChange={handleChange}
                                        placeholder="e.g., Solar Panel Cleaning, Driveway Cleaning"
                                    />
                                )}
                            </div>
                            {formErrors.customServices && <p className="text-sm text-red-600 mt-1">{formErrors.customServices}</p>}
                        </div>

                        {/* Preferred Frequency (Conditional on Window Cleaning) */}
                        {values.customResidentialDetails?.servicesRequested?.windowCleaning && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Window Cleaning Frequency</label>
                                <div className="space-y-2">
                                    {[
                                        { id: '4-weekly', label: '4 Weekly' },
                                        { id: '8-weekly', label: '8 Weekly' },
                                        { id: '12-weekly', label: '12 Weekly' },
                                        { id: 'one-off', label: 'One-off Clean' },
                                        { id: 'other', label: 'Other (Please specify)' }
                                    ].map(freq => (
                                        <div key={freq.id} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={`customFreq-${freq.id}`}
                                                name="customResidentialDetails.frequencyPreference"
                                                value={freq.id}
                                                checked={values.customResidentialDetails?.frequencyPreference === freq.id}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                            />
                                            <label htmlFor={`customFreq-${freq.id}`} className="ml-2 block text-sm text-gray-700">
                                                {freq.label}
                                            </label>
                                        </div>
                                    ))}
                                    {values.customResidentialDetails?.frequencyPreference === 'other' && (
                                        <InputField
                                            label="Please specify other frequency"
                                            name="customResidentialDetails.otherFrequencyText"
                                            value={values.customResidentialDetails?.otherFrequencyText || ''}
                                            onChange={handleChange}
                                            placeholder="e.g., Bi-monthly, specific dates"
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        <InputField
                            label="Approximate Number of Windows (if known)"
                            name="customResidentialDetails.approxWindows"
                            value={values.customResidentialDetails?.approxWindows || ''}
                            onChange={handleChange}
                            placeholder="e.g., 30+"
                            type="number"
                        />
                        <TextAreaField
                            label="Any Access Issues or Specific Requirements?"
                            name="customResidentialDetails.accessIssues"
                            value={values.customResidentialDetails?.accessIssues || ''}
                            onChange={handleChange}
                            placeholder="e.g., Very high windows, locked gates, pets in garden"
                        />
                        <TextAreaField
                            label="Other Notes for Quote"
                            name="customResidentialDetails.otherNotes"
                            value={values.customResidentialDetails?.otherNotes || ''}
                            onChange={handleChange}
                            placeholder="Anything else specific to your property or needs?"
                        />
                         <TextAreaField
                            label="Additional Comments (Optional)"
                            name="customResidentialDetails.customAdditionalComments"
                            value={values.customResidentialDetails?.customAdditionalComments || ''}
                            onChange={handleChange}
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
                            value={commercialDetails?.propertyType || ''}
                            onChange={handleChange}
                            placeholder="e.g., Office, Shop, Restaurant, Warehouse"
                            required
                        />
                        {formErrors.commercialPropertyType && <p className="text-sm text-red-600 -mt-3 mb-1">{formErrors.commercialPropertyType}</p>}
                        <InputField
                            label="Property Size / Key Features (e.g., No. of windows, No. of floors, specific areas)"
                            name="commercialDetails.approxSizeOrWindows"
                            value={commercialDetails?.approxSizeOrWindows || ''}
                            onChange={handleChange}
                            placeholder="e.g., Approx 50 windows, 3-storey office, large shopfront"
                        />
                        <TextAreaField
                            label="Specific Requirements or Services Needed"
                            name="commercialDetails.specificRequirements"
                            value={commercialDetails?.specificRequirements || ''}
                            onChange={handleChange}
                            placeholder="e.g., Internal window cleaning, high-level access needed"
                        />
                         <TextAreaField
                            label="Other Notes for Commercial Enquiry"
                            name="commercialDetails.otherNotes"
                            value={commercialDetails?.otherNotes || ''}
                            onChange={handleChange}
                            placeholder="e.g., Preferred times for cleaning, contract length interest"
                        />
                    </div>
                )}

                {/* ADDED: Additional Comments for Standard Residential & General Enquiry (if not custom/commercial) */}
                {((isResidential && !isCustomQuote) || isGeneralEnquiry) && (
                     <div className="mt-6 pt-4 border-t">
                        <TextAreaField
                            label="Additional Comments or Requests (Optional)"
                            name={isGeneralEnquiry ? "generalEnquiryComments" : "bookingNotes"}
                            value={isGeneralEnquiry ? values.generalEnquiryComments || '' : values.bookingNotes || ''}
                            onChange={handleChange}
                            placeholder={isGeneralEnquiry ? "Please describe what you need (e.g., gutter cleaning for a 3-bed semi)" : "e.g., Gate code: 1234. Side gate unlocked."}
                            rows={3}
                        />
                    </div>
                )}

                {/* Services Requested Section */}
                {isCommercial && (
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">Services Required</h3>
                        <div className="space-y-2">
                            {[
                                { id: 'windowCleaning', label: 'Window Cleaning' },
                                { id: 'gutterCleaning', label: 'Gutter Cleaning' },
                                { id: 'fasciaSoffitCleaning', label: 'Fascia & Soffit Cleaning' },
                                { id: 'claddingCleaning', label: 'Cladding Cleaning' },
                                { id: 'signageCleaning', label: 'Signage Cleaning' },
                                { id: 'other', label: 'Other (Please specify)' }
                            ].map(service => (
                                <div key={service.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`commercialService-${service.id}`}
                                        name={`commercialDetails.servicesRequested.${service.id}`}
                                        checked={commercialDetails?.servicesRequested?.[service.id] || false}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor={`commercialService-${service.id}`} className="ml-2 block text-sm text-gray-700">
                                        {service.label}
                                    </label>
                                </div>
                            ))}
                            {commercialDetails?.servicesRequested?.other && (
                                <InputField 
                                    label="Please specify other service(s)" 
                                    name="commercialDetails.otherServiceText" 
                                    value={commercialDetails?.otherServiceText || ''} 
                                    onChange={handleChange} 
                                    placeholder="e.g., Pressure Washing Entrance" 
                                />
                            )}
                        </div>
                        {formErrors.commercialServices && <p className="text-sm text-red-600 mt-1">{formErrors.commercialServices}</p>}
                    </div>
                )}

                {/* Preferred Frequency Section - Conditional on Window Cleaning Service */}
                {commercialDetails?.servicesRequested?.windowCleaning && (
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">Preferred Frequency (for Window Cleaning)</h3>
                        <div className="space-y-2">
                            {[
                                { id: 'weekly', label: 'Weekly' },
                                { id: 'fortnightly', label: 'Fortnightly (Every 2 Weeks)' },
                                { id: 'monthly', label: 'Monthly (Every 4 Weeks)' },
                                { id: 'quarterly', label: 'Quarterly (Every 12 Weeks)' },
                                { id: 'bi-annually', label: 'Bi-Annually (Every 6 Months)' },
                                { id: 'annually', label: 'Annually' },
                                { id: 'one-off', label: 'One-off' },
                                { id: 'other', label: 'Other (Please specify)' }
                            ].map(freq => (
                                <div key={freq.id} className="flex items-center">
                                    <input
                                        type="radio"
                                        id={`commercialFreq-${freq.id}`}
                                        name="commercialDetails.frequencyPreference"
                                        value={freq.id}
                                        checked={commercialDetails?.frequencyPreference === freq.id}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    />
                                    <label htmlFor={`commercialFreq-${freq.id}`} className="ml-2 block text-sm text-gray-700">
                                        {freq.label}
                                    </label>
                                </div>
                            ))}
                            {commercialDetails?.frequencyPreference === 'other' && (
                                <InputField 
                                    label="Please specify other frequency" 
                                    name="commercialDetails.otherFrequencyText" 
                                    value={commercialDetails?.otherFrequencyText || ''} 
                                    onChange={handleChange} 
                                    placeholder="e.g., Every 2 months" 
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-8 flex justify-between">
                    <button
                        type="button"
                        onClick={backStep}
                        className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        {isGeneralEnquiry 
                            ? "Submit Enquiry" 
                            : isCustomQuote || isCommercial 
                                ? "Next: Review Enquiry" 
                                : "Next: Review Booking"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PropertyDetailsForm;