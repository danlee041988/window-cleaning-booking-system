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
    <div className="mb-6">
        <label htmlFor={name} className="block text-sm font-semibold text-gray-200 mb-2">{label}{required && <span className="text-red-400">*</span>}</label>
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500"
        />
    </div>
);

// Reusable Textarea Field Component
const TextAreaField = ({ label, name, value, onChange, placeholder, rows = 3 }) => (
    <div className="mb-6">
        <label htmlFor={name} className="block text-sm font-semibold text-gray-200 mb-2">{label}</label>
        <textarea
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500 resize-vertical"
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
            if (trimmedPostcode.length >= 3) { // Wait for at least 3 characters before processing
                // Add a small delay to avoid triggering on every keystroke
                const timer = setTimeout(() => {
                    calculateAndSetAvailableDates();
                }, 300);
                return () => clearTimeout(timer);
            } else {
                // Less than 3 characters, clear everything but don't show errors
                setAvailableDates([]);
                setPostcodeError('');
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
        const rawPostcode = postcode.trim().toUpperCase();

        if (rawPostcode.length < 3) { // Wait for at least 3 characters
            setIsLoadingDates(false);
            setAvailableDates([]);
            setPostcodeError('');
            return;
        }

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



            if (matchingScheduleEntries.length > 0) {
                const allValidDates = [];
                matchingScheduleEntries.forEach(scheduleEntry => {
                    const datesToProcess = scheduleEntry.dates;
                    
                    datesToProcess.forEach(dateStr => {
                        let nextOccurrenceDate = getNextOccurrence(dateStr, scheduleEntry.recurrence);
                        
                        if (!nextOccurrenceDate || isNaN(nextOccurrenceDate.getTime())) {
                            return; 
                        }

                        let adjustedDate = findFirstWorkingDayFrom(nextOccurrenceDate);
                        
                        // Ensure comparison dates are fresh for each check to avoid issues with object mutation if any
                        const currentTomorrow = new Date(); currentTomorrow.setHours(0,0,0,0); currentTomorrow.setDate(new Date().getDate()+1);
                        const currentSixWeeksFromNow = new Date(); currentSixWeeksFromNow.setHours(0,0,0,0); currentSixWeeksFromNow.setDate(new Date().getDate()+42);

                        if (adjustedDate >= currentTomorrow && adjustedDate <= currentSixWeeksFromNow) {
                            allValidDates.push(adjustedDate);
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
            } else { // No matchingScheduleEntries found
                setAvailableDates([]); // Ensure dates are cleared
                if (rawPostcode.length >= 4) { // Only show "not covered" error for more complete postcodes
                    setPostcodeError('Sorry, we may not cover your specific postcode area. Please contact us.');
                } else {
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
        // TEMP: Bypass validation for testing
        /*
        if (!validateForm()) {
            // Errors will be displayed by the validateForm function by calling setFormErrors
            // Optionally, scroll to the first error or show a general message
            const firstErrorKey = Object.keys(formErrors).find(key => formErrors[key]);
            if (firstErrorKey) {
                const errorElement = document.getElementsByName(firstErrorKey)[0];
                if (errorElement) {
                    errorElement.focus();
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            return; // Stop if validation fails
        }
        */
        // If validation passes (or is bypassed)
        setFormErrors({}); // Clear any previous errors
        setDateSelectionError(''); // Clear specific date error if any
        nextStep();
    };

    const handleContactPreference = (e) => {
        setFormData(prev => ({ ...prev, preferredContactMethod: e.target.value }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
            <div className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl p-8 border border-gray-700">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            {isGeneralEnquiry 
                                ? "Your Contact Details for Enquiry"
                                : isCommercial 
                                    ? "Business Enquiry Details" 
                                    : isCustomQuote 
                                        ? `Custom Quote: ${values.selectedWindowService?.bedrooms || 'Bespoke Property'}`
                                        : "Your Details & Preferred Date"}
                        </h2>
                        <p className="text-blue-300 text-lg">
                            {isCommercial 
                                ? "Professional window cleaning services for your business"
                                : "Complete your details to secure your booking"}
                        </p>
                        
                        {/* Decorative divider */}
                        <div className="flex items-center justify-center mt-6">
                            <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent w-32"></div>
                            <div className="mx-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent w-32"></div>
                        </div>
                    </div>

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
                {formErrors.customerName && <p className="text-sm text-red-400 -mt-3 mb-1 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.customerName}</p>}

                {/* Address fields always shown */}
                <InputField label="Address Line 1" name="addressLine1" value={addressLine1} onChange={handleChange('addressLine1')} placeholder="e.g., 123 High Street" required />
                {formErrors.addressLine1 && <p className="text-sm text-red-400 -mt-3 mb-1 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.addressLine1}</p>}
                <InputField label="Address Line 2 (Optional)" name="addressLine2" value={addressLine2} onChange={handleChange('addressLine2')} placeholder="e.g., The Old Mill, Suite B" />
                <InputField label="Town/City" name="townCity" value={townCity} onChange={handleChange('townCity')} placeholder="e.g., Market Harborough" required />
                {formErrors.townCity && <p className="text-sm text-red-400 -mt-3 mb-1 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.townCity}</p>}
                <InputField label="Postcode" name="postcode" value={postcode} onChange={handleChange('postcode')} placeholder="e.g., BA16 0AA" required />
                {formErrors.postcode && <p className="text-sm text-red-400 -mt-3 mb-1 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.postcode}</p>}

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
                        {formErrors.mobile && <p className="text-sm text-red-400 -mt-3 mb-1 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.mobile}</p>}
                    </div>
                    <div>
                        <InputField label="Email Address" name="email" type="email" value={email} onChange={handleChange('email')} placeholder="e.g., john.doe@example.com" required />
                        {formErrors.email && <p className="text-sm text-red-400 -mt-3 mb-1 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.email}</p>}
                    </div>
                </div>

                {/* Preferred Contact Method - Shown for all types including General Enquiry */}
                <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-200 mb-3">Preferred Contact Method <span className="text-red-400">*</span></label>
                    <div className="mt-2 flex items-center space-x-6">
                        <label className="inline-flex items-center cursor-pointer group">
                            <input 
                                type="radio" 
                                className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2 transition duration-150 ease-in-out" 
                                name="preferredContactMethod" 
                                value="email" 
                                checked={preferredContactMethod === 'email'} 
                                onChange={handleContactPreference} 
                            />
                            <span className="ml-3 text-gray-200 group-hover:text-blue-300 transition-colors">Email</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer group">
                            <input 
                                type="radio" 
                                className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2 transition duration-150 ease-in-out" 
                                name="preferredContactMethod" 
                                value="mobile" 
                                checked={preferredContactMethod === 'mobile'} 
                                onChange={handleContactPreference} 
                            />
                            <span className="ml-3 text-gray-200 group-hover:text-blue-300 transition-colors">{isCommercial ? "Contact Number" : "Mobile Phone"}</span>
                        </label>
                    </div>
                    {formErrors.preferredContactMethod && <p className="text-sm text-red-400 mt-2 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.preferredContactMethod}</p>}
                </div>

                {/* Enhanced Date Selection UI - Only for Standard Residential Bookings and when postcode is entered */}
                {!isCommercial && !isCustomQuote && isResidential && !isGeneralEnquiry && postcode && postcode.trim().length >= 2 && (
                    <div className="mt-6 pt-4 border-t animate-pop-in">
                        <h3 id="date-selection-heading" className="text-xl font-medium text-gray-800 mb-2">
                            Select Date for First Clean <span className="text-red-500">*</span>
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Choose from available dates or request ASAP service
                        </p>
                        
                        {/* Loading State */}
                        {isLoadingDates && (
                            <div className="flex items-center justify-center p-6 border border-blue-200 rounded-lg bg-blue-50">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                                <span className="text-blue-700 font-medium">Loading available dates...</span>
                            </div>
                        )}
                        
                        {/* Error State */}
                        {!isLoadingDates && postcodeError && (
                            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-800">{postcodeError}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Form Validation Errors */}
                        {dateSelectionError && (
                            <p className="text-red-600 text-sm mb-3">{dateSelectionError}</p>
                        )}
                        {formErrors.selectedDate && !dateSelectionError && (
                            <p className="text-red-600 text-sm mb-3">{formErrors.selectedDate}</p>
                        )}

                        {/* Main Selection Area */}
                        {!isLoadingDates && !postcodeError && (
                            <div className="space-y-4">
                                {/* Available Dates Section */}
                                {availableDates.length > 0 ? (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Available Dates (Next 6 Weeks)</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                                            {availableDates.map(date => {
                                                const dateValueStr = formatDateForStorage(date);
                                                const isSelected = selectedDate === dateValueStr;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={dateValueStr}
                                                        onClick={() => handleDateSelect(date)}
                                                        className={`p-3 border rounded-lg text-center cursor-pointer transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transform hover:scale-105
                                                            ${isSelected 
                                                                ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg scale-105' 
                                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md'}`}
                                                    >
                                                        <span className={`block text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                            {formatDateForDisplay(date)}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        
                                        {/* Divider */}
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-300" />
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="px-2 bg-white text-gray-500">or</span>
                                            </div>
                                        </div>
                                    </div>
                                                                 ) : null}
                                
                                {/* ASAP Option - now more compact and integrated */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Need service urgently?</h4>
                                    <button
                                        type="button"
                                        onClick={() => handleDateSelect("ASAP")}
                                        className={`w-full p-4 border-2 rounded-lg text-center cursor-pointer transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 transform hover:scale-[1.02]
                                                    ${selectedDate === "ASAP"
                                                        ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-600 text-white shadow-lg scale-[1.02]'
                                                        : 'bg-white border-green-300 text-gray-700 hover:bg-green-50 hover:border-green-400 hover:shadow-md focus:ring-green-400'}`}
                                    >
                                        <div className="flex items-center justify-center">
                                            <svg className={`h-5 w-5 mr-2 ${selectedDate === "ASAP" ? 'text-white' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <div>
                                                <span className={`block font-semibold ${selectedDate === "ASAP" ? 'text-white' : 'text-gray-900'}`}>
                                                    Request First Clean ASAP
                                                </span>
                                                <span className={`block text-xs mt-1 ${selectedDate === "ASAP" ? 'text-green-100' : 'text-gray-500'}`}>
                                                    We'll contact you within 24 hours to arrange the earliest available slot
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
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

                {/* Enhanced Additional Comments Section */}
                <div className="mt-8 pt-6 border-t border-gray-600">
                    <div className="mb-6">
                        <label className="block text-lg font-semibold text-gray-200 mb-3">
                            Additional Comments or Special Requests (Optional)
                        </label>
                        <p className="text-sm text-gray-400 mb-4">
                            Help us provide the best service by sharing any relevant details:
                        </p>
                        
                        {/* Helpful hints based on booking type */}
                        <div className="mb-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                            <p className="text-sm text-blue-300 font-semibold mb-3">💡 Helpful information to include:</p>
                            <ul className="text-sm text-blue-200 space-y-2">
                                {isGeneralEnquiry ? (
                                    <>
                                        <li>• Describe your property type and size</li>
                                        <li>• Specific areas needing attention</li>
                                        <li>• Preferred contact times</li>
                                        <li>• Any urgent cleaning needs</li>
                                    </>
                                ) : isCommercial ? (
                                    <>
                                        <li>• Operating hours for cleaning access</li>
                                        <li>• Health & safety requirements</li>
                                        <li>• Parking arrangements</li>
                                        <li>• Key contact person details</li>
                                    </>
                                ) : isCustomQuote ? (
                                    <>
                                        <li>• Unique architectural features</li>
                                        <li>• Previous cleaning history</li>
                                        <li>• Budget considerations</li>
                                        <li>• Timeline requirements</li>
                                    </>
                                ) : (
                                    <>
                                        <li>• Access codes (gate, parking, etc.)</li>
                                        <li>• Pet information</li>
                                        <li>• Preferred time of day</li>
                                        <li>• Any areas requiring special attention</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        <textarea
                            name={isGeneralEnquiry ? "generalEnquiryComments" : "bookingNotes"}
                            value={isGeneralEnquiry ? values.generalEnquiryComments || '' : values.bookingNotes || ''}
                            onChange={handleChange}
                            placeholder={
                                isGeneralEnquiry 
                                    ? "Example: I have a 4-bedroom detached house with conservatory. Interested in monthly window cleaning and occasional gutter clearing. Property has side gate access but 2 friendly dogs in garden. Best contact time is weekday mornings."
                                    : isCommercial
                                        ? "Example: Office building with 40+ windows across 3 floors. Require monthly cleaning during business hours (9-5). Parking available on-site. Health & safety induction required for all contractors."
                                        : isCustomQuote
                                            ? "Example: Large Victorian property with original sash windows, some requiring ladder access. Previous cleaner mentioned difficulty with rear bay windows. Looking for experienced team for quarterly deep clean."
                                            : "Example: Gate code is 1234*. Side gate is usually unlocked. We have 2 small dogs (friendly but excitable). Please avoid parking in marked visitor spaces. Best time is weekday mornings before 2pm."
                            }
                            rows={5}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500 resize-vertical"
                            style={{ minHeight: '120px' }}
                        />
                        
                        <p className="text-sm text-gray-400 mt-3">
                            The more detail you provide, the better we can prepare for your service and provide an accurate quote.
                        </p>
                    </div>
                </div>

                {/* Services Requested Section */}
                {isCommercial && (
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-200 mb-4">Services Required</h3>
                        <div className="space-y-3">
                            {[
                                { id: 'windowCleaning', label: 'Window Cleaning' },
                                { id: 'gutterCleaning', label: 'Gutter Cleaning' },
                                { id: 'fasciaSoffitCleaning', label: 'Fascia & Soffit Cleaning' },
                                { id: 'claddingCleaning', label: 'Cladding Cleaning' },
                                { id: 'signageCleaning', label: 'Signage Cleaning' },
                                { id: 'other', label: 'Other (Please specify)' }
                            ].map(service => (
                                <div key={service.id} className="flex items-center group">
                                    <input
                                        type="checkbox"
                                        id={`commercialService-${service.id}`}
                                        name={`commercialDetails.servicesRequested.${service.id}`}
                                        checked={commercialDetails?.servicesRequested?.[service.id] || false}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 transition duration-150 ease-in-out"
                                    />
                                    <label htmlFor={`commercialService-${service.id}`} className="ml-3 block text-sm text-gray-200 group-hover:text-blue-300 transition-colors cursor-pointer">
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
                        {formErrors.commercialServices && <p className="text-sm text-red-400 mt-2 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.commercialServices}</p>}
                    </div>
                )}

                {/* Preferred Frequency Section - Conditional on Window Cleaning Service */}
                {commercialDetails?.servicesRequested?.windowCleaning && (
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-200 mb-4">Preferred Frequency (for Window Cleaning)</h3>
                        <div className="space-y-3">
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
                                <div key={freq.id} className="flex items-center group">
                                    <input
                                        type="radio"
                                        id={`commercialFreq-${freq.id}`}
                                        name="commercialDetails.frequencyPreference"
                                        value={freq.id}
                                        checked={commercialDetails?.frequencyPreference === freq.id}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2 transition duration-150 ease-in-out"
                                    />
                                    <label htmlFor={`commercialFreq-${freq.id}`} className="ml-3 block text-sm text-gray-200 group-hover:text-blue-300 transition-colors cursor-pointer">
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
                <div className="mt-12 flex justify-between items-center">
                    <button
                        type="button"
                        onClick={backStep}
                        className="px-8 py-3 border-2 border-gray-600 rounded-lg text-sm font-semibold text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                        <span className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Back
                        </span>
                    </button>
                    <button
                        type="submit"
                        className="px-8 py-3 border-2 border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                    >
                        <span className="flex items-center">
                            {isGeneralEnquiry 
                                ? "Submit Enquiry" 
                                : isCustomQuote || isCommercial 
                                    ? "Next: Review Enquiry" 
                                    : "Next: Review Booking"}
                            <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </span>
                    </button>
                </div>
            </form>
                </div>
            </div>
        </div>
    );
}

export default PropertyDetailsForm;